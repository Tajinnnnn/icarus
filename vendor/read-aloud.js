// Read-aloud engine for Fleur Dashboard, ported from `literate`
// (Projects/Apps/literate/src/pages/Content/modules/{wordWrapper,ttsEngine,naturalVoiceEngine}.js).
// Adapted from Chrome-extension APIs to plain browser JS: chrome.storage.sync
// -> localStorage, ES import/export -> single IIFE (loaded via a plain
// <script> tag, same as vendor/marked.min.js). No hover toolbar, hotkeys, or
// dark mode - those are literate's page-chrome features and out of scope
// here (see add-dashboard-read-aloud/design.md Non-Goals); this file exposes
// a single `window.ReadAloud` controller that a fixed control bar in a pane
// header drives directly.
(() => {
  "use strict";

  const STORAGE_PREFIX = "fleur.readAloud.";
  const WORD_CLASS = "__ra_word";
  const ACTIVE_CLASS = "__ra_word_active";
  const IGNORE_ATTR = "data-ra-ignore";

  const MIN_RATE = 0.1;
  const MAX_RATE = 10;
  const DEFAULT_RATE = 1;

  const MIN_VOLUME = 0;
  const MAX_VOLUME = 1;
  const DEFAULT_VOLUME = 1;

  // Chrome silently stops speaking partway through a single very long
  // SpeechSynthesisUtterance - no error event, just a premature `end` - once
  // the text passes some undocumented length (see crbug.com/335907). Capping
  // each utterance and chaining to the next slice keeps long generated
  // reports readable end to end. Ported unchanged from ttsEngine.js.
  const SYSTEM_MAX_UTTERANCE_CHARS = 600;

  // Kokoro's own "speed" parameter only sounds natural over a narrower range
  // than the rate control allows, so it's clamped separately.
  const KOKORO_SPEED_MIN = 0.5;
  const KOKORO_SPEED_MAX = 2;

  // Smaller than the System Voice chunk cap since synthesis here costs real
  // wall-clock time per chunk.
  const NATURAL_MAX_CHUNK_CHARS = 400;

  const NATURAL_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
  const NATURAL_DEFAULT_VOICE = "af_heart";

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // ---- Local-only settings persistence (chrome.storage.sync -> localStorage) --

  function loadPref(key, fallback) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function savePref(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      // localStorage unavailable/full - preferences just won't persist.
    }
  }

  // ---- Word wrapping (ported from wordWrapper.js) ------------------------
  // Unlike literate (which reads a whole live webpage via getPageRoot()),
  // every caller here already has a specific container element to read -
  // the rendered output-preview pane or the notes rich-editor field - so
  // wrapping targets that container directly instead of discovering a root.

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "SVG", "CANVAS", "IFRAME"]);

  function isElementHidden(el) {
    const style = window.getComputedStyle(el);
    return style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0;
  }

  // ---- Paragraph/section boundary detection (for rewind) -----------------
  // A "boundary" is the word index where a new block-level ancestor begins.
  // Computed-style detection (not a tag whitelist) so this works uniformly
  // whether the container is our own rendered Markdown (<p>, <li>, <h2>, ...)
  // or an arbitrary live web page's div-heavy layout (literate's case).
  const BLOCK_DISPLAYS = new Set(["block", "list-item", "table-row", "table-cell", "flex", "grid"]);

  function getBlockAncestor(node, root) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== root) {
      if (BLOCK_DISPLAYS.has(window.getComputedStyle(el).display)) return el;
      el = el.parentElement;
    }
    return root;
  }

  // `data-ra-ignore` is the escape hatch for content that shouldn't be read
  // even though it has visible text - e.g. a note's inline image-embed chip,
  // whose delete button ("×") is a real text node but not reading content.
  function isSkippableAncestor(node, root) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.hasAttribute && el.hasAttribute(IGNORE_ATTR)) return true;
      if (isElementHidden(el)) return true;
      if (el === root) break;
      el = el.parentElement;
    }
    return false;
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (isSkippableAncestor(node, root)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let n = walker.nextNode();
    while (n) {
      nodes.push(n);
      n = walker.nextNode();
    }
    return nodes;
  }

  function wrapTextNode(textNode, words, spans) {
    const text = textNode.nodeValue;
    const regex = /\S+/g;
    let lastIndex = 0;
    let match = regex.exec(text);
    if (!match) return;

    const frag = document.createDocumentFragment();
    while (match) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const span = document.createElement("span");
      span.className = WORD_CLASS;
      span.textContent = match[0];
      frag.appendChild(span);
      words.push(match[0]);
      spans.push(span);
      lastIndex = match.index + match[0].length;
      match = regex.exec(text);
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function wrapContainerWords(root) {
    const nodes = collectTextNodes(root);
    const words = [];
    const spans = [];
    const boundaries = [];
    let lastBlock = null;
    nodes.forEach((node) => {
      const block = getBlockAncestor(node, root);
      if (block !== lastBlock) {
        boundaries.push(words.length);
        lastBlock = block;
      }
      wrapTextNode(node, words, spans);
    });
    return { words, spans, boundaries, root };
  }

  function unwrapWords(spans) {
    const parents = new Set();
    spans.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      parents.add(parent);
      parent.replaceChild(document.createTextNode(span.textContent), span);
    });
    parents.forEach((p) => p.normalize());
  }

  // Shared by both engines' chunking: the end of the word slice starting at
  // indexBase that fits under maxChars, preferring to break right after a
  // sentence-ending word near the limit so the gap lands on a natural pause.
  function findChunkEnd(words, indexBase, maxChars) {
    let cursor = 0;
    let end = indexBase;
    let lastSentenceEnd = -1;
    while (end < words.length) {
      const nextCursor = cursor + words[end].length + 1;
      if (end > indexBase && nextCursor > maxChars) break;
      cursor = nextCursor;
      end++;
      if (/[.!?]$/.test(words[end - 1])) lastSentenceEnd = end;
    }
    if (lastSentenceEnd > indexBase && lastSentenceEnd < end) return lastSentenceEnd;
    return end;
  }

  // Finds the boundary of the paragraph containing currentIndex (the last
  // boundary <= currentIndex).
  function currentBoundaryIndex(boundaries, currentIndex) {
    let i = -1;
    for (let b = 0; b < boundaries.length; b++) {
      if (boundaries[b] <= currentIndex) i = b;
      else break;
    }
    return i;
  }

  // Always steps to the previous paragraph's first word (not a restart of
  // the current one) - clamps to the very first word once already in the
  // first paragraph.
  function computeRewindIndex(boundaries, currentIndex) {
    if (!boundaries || !boundaries.length) return 0;
    const i = currentBoundaryIndex(boundaries, currentIndex);
    if (i <= 0) return 0;
    return boundaries[i - 1];
  }

  // Steps to the next paragraph's first word - no-op (returns null) once
  // already in the last paragraph, so the caller can leave playback alone
  // rather than jumping past the end of the content.
  function computeForwardIndex(boundaries, currentIndex) {
    if (!boundaries || !boundaries.length) return null;
    const i = currentBoundaryIndex(boundaries, currentIndex);
    const next = i + 1;
    return next < boundaries.length ? boundaries[next] : null;
  }

  // ---- System Voice engine (ported from ttsEngine.js) --------------------
  // Highlight-color customization, voice picker, and follow-lock toggle are
  // dropped - literate's hover-toolbar features, not reading itself. The
  // highlighted word uses a fixed CSS class instead (dashboard.css).

  class SystemVoiceEngine {
    constructor({ onWordChange, onDone }) {
      this.words = [];
      this.spans = [];
      this.boundaries = [];
      this.currentIndex = -1;
      this.currentSpan = null;
      this.rate = DEFAULT_RATE;
      this.volume = DEFAULT_VOLUME;
      this.utterance = null;
      this.active = false;
      // Tracked explicitly rather than read live off window.speechSynthesis.paused:
      // Chrome can leave that flag stuck true after a cancel()+speak() cycle (the
      // cancel()/pause() interaction is a known Web Speech API rough edge), which
      // both mislabels the pause/resume control AND - since onboundary below
      // bails out while "paused" - silently freezes word highlighting while
      // audio keeps playing. A locally-owned flag can't drift from what we
      // actually told the engine to do.
      this._paused = false;
      this.onWordChange = onWordChange;
      this.onDone = onDone;
    }

    isPaused() {
      return this._paused;
    }

    begin(result, rate, volume, startIndex = 0) {
      this.words = result.words;
      this.spans = result.spans;
      this.boundaries = result.boundaries || [];
      this.rate = rate;
      this.volume = volume;
      this.currentIndex = -1;
      this.currentSpan = null;
      this.active = true;
      this._paused = false;
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] begin (system)", { wordCount: this.words.length, boundaries: this.boundaries });
      this._speakFrom(startIndex);
      return { ok: true };
    }

    // Chrome can leave speechSynthesis.speaking/pending true for a beat after
    // onend actually fires; calling speak() while either is still true is
    // what silently drops the next chunk. Poll for a true idle state instead
    // of guessing a fixed delay (capped so a wedged synth can't hang forever).
    _scheduleNextChunk(chunkEnd, prevUtterance, attempt = 0) {
      if (this.utterance !== prevUtterance) return;
      const synth = window.speechSynthesis;
      if ((synth.speaking || synth.pending) && attempt < 40) {
        setTimeout(() => this._scheduleNextChunk(chunkEnd, prevUtterance, attempt + 1), 50);
        return;
      }
      this._speakFrom(chunkEnd);
    }

    _speakFrom(indexBase) {
      if (indexBase >= this.words.length) {
        this.stop();
        return;
      }
      const chunkEnd = findChunkEnd(this.words, indexBase, SYSTEM_MAX_UTTERANCE_CHARS);
      const slice = this.words.slice(indexBase, chunkEnd);
      const text = slice.join(" ");

      const offsets = [];
      let cursor = 0;
      slice.forEach((w) => {
        offsets.push(cursor);
        cursor += w.length + 1;
      });

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.volume = this.volume;

      utterance.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        // Chrome can deliver a stray/late boundary event right as pause()
        // takes effect, or replay one after resume(); ignore those so the
        // highlight doesn't jump away from the word actually being spoken.
        // Uses the tracked flag, not the live API, so a stuck browser-side
        // paused flag can't also freeze highlighting while audio keeps going.
        if (this._paused) return;

        let localIndex = 0;
        for (let i = offsets.length - 1; i >= 0; i--) {
          if (offsets[i] <= e.charIndex) {
            localIndex = i;
            break;
          }
        }
        const globalIndex = indexBase + localIndex;
        if (globalIndex < this.currentIndex) return; // stale/duplicate event
        this._setCurrentWord(globalIndex);
      };
      utterance.onend = () => {
        if (this.utterance !== utterance) return;
        if (chunkEnd < this.words.length) this._scheduleNextChunk(chunkEnd, utterance);
        else this.stop();
      };
      utterance.onerror = (e) => {
        if (this.utterance !== utterance) return;
        if (e.error === "interrupted" || e.error === "canceled") return;
        this.stop();
      };

      this.utterance = utterance;
      window.speechSynthesis.speak(utterance);
      // Any new utterance - initial start, next chunk, or a cancel+respeak
      // from rewind/fast-forward/rate change - must re-honor an existing
      // pause request, since cancel() clears the browser's own paused state.
      if (this._paused) window.speechSynthesis.pause();
    }

    _setCurrentWord(i) {
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] _setCurrentWord (system)", { from: this.currentIndex, to: i });
      if (this.currentSpan) this.currentSpan.classList.remove(ACTIVE_CLASS);
      this.currentIndex = i;
      this.currentSpan = this.spans[i] || null;
      if (this.currentSpan) {
        this.currentSpan.classList.add(ACTIVE_CLASS);
        this.currentSpan.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (this.onWordChange) this.onWordChange(i);
    }

    togglePause() {
      if (!this.active) return;
      const synth = window.speechSynthesis;
      this._paused = !this._paused;
      if (this._paused) {
        if (synth.speaking) synth.pause();
      } else if (synth.paused) {
        synth.resume();
      }
    }

    // Web Speech utterances lock in rate (and volume) at speak() time, so a
    // change requires cancelling and re-speaking from the current word.
    // Pause state isn't handled here - _speakFrom re-honors this._paused for
    // every new utterance, including this one.
    _restartFromCurrent() {
      if (!this.active || this.currentIndex < 0) return;
      const resumeIndex = this.currentIndex;
      window.speechSynthesis.cancel();
      this._speakFrom(resumeIndex);
    }

    // Jumps to a specific index: cancels current speech, immediately moves
    // currentIndex/highlight there (so a rapid repeat press computes its
    // next target from the just-requested position, not a stale one still
    // waiting on an async boundary event that this same cancel() may have
    // wiped out before it ever fired), then kicks off speech from there.
    _jumpTo(target) {
      window.speechSynthesis.cancel();
      this._setCurrentWord(target);
      this._speakFrom(target);
    }

    // Jumps to the previous paragraph's first word (or word 0, once already
    // in the first paragraph).
    rewind() {
      if (!this.active) return;
      const target = computeRewindIndex(this.boundaries, this.currentIndex);
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] rewind (system)", { currentIndex: this.currentIndex, boundaries: this.boundaries, target });
      this._jumpTo(target);
    }

    // Jumps to the next paragraph's first word; no-ops once already in the
    // last paragraph rather than jumping past the end of the content.
    fastForward() {
      if (!this.active) return;
      const target = computeForwardIndex(this.boundaries, this.currentIndex);
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] fastForward (system)", { currentIndex: this.currentIndex, boundaries: this.boundaries, target });
      if (target === null) return;
      this._jumpTo(target);
    }

    setRate(rate) {
      this.rate = clamp(Math.round(rate * 10) / 10, MIN_RATE, MAX_RATE);
      this._restartFromCurrent();
    }

    setVolume(volume) {
      this.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
      this._restartFromCurrent();
    }

    stop() {
      if (this.utterance) {
        this.utterance.onend = null;
        this.utterance.onerror = null;
        this.utterance.onboundary = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (this.currentSpan) this.currentSpan.classList.remove(ACTIVE_CLASS);

      unwrapWords(this.spans);

      const wasActive = this.active;
      this.words = [];
      this.spans = [];
      this.boundaries = [];
      this.currentIndex = -1;
      this.currentSpan = null;
      this.utterance = null;
      this.active = false;
      this._paused = false;
      if (wasActive && this.onDone) this.onDone();
    }
  }

  // ---- Natural Voice engine (ported from naturalVoiceEngine.js) ----------
  // Uses window.KokoroTTS, set by a small <script type="module"> loader in
  // dashboard.html that imports it from vendor/kokoro/kokoro.web.js - this
  // file itself stays a plain classic script (no ES import/export), matching
  // every other file in the dashboard's frontend.

  class NaturalVoiceEngine {
    constructor({ onWordChange, onDone, onModelStatusChange }) {
      this.words = [];
      this.spans = [];
      this.boundaries = [];
      this.currentIndex = -1;
      this.currentSpan = null;
      this.rate = DEFAULT_RATE;
      this.volume = DEFAULT_VOLUME;
      this.voiceId = NATURAL_DEFAULT_VOICE;
      this.active = false;

      this.tts = null;
      this.modelStatus = "idle"; // 'idle' | 'loading' | 'ready' | 'error'
      this.modelProgress = null;
      this.modelError = null;
      this._modelLoadPromise = null;

      this.audioContext = null;
      this.gainNode = null;
      this.currentSource = null;
      this.currentChunk = null; // { indexBase, chunkEnd, thresholds }
      this._chunkStartContextTime = 0;
      this._pendingNextChunk = null;
      this._rafHandle = null;
      this._generation = 0;
      // Persistent, explicitly-owned pause state - checked by _playChunk for
      // every newly scheduled chunk (start, continuation, or a restart from
      // rewind/fast-forward/rate-change) so a chunk boundary never silently
      // resumes playback the user paused, and isPaused()/the UI label can't
      // drift from what was actually last requested.
      this._paused = false;

      this.onWordChange = onWordChange;
      this.onDone = onDone;
      this.onModelStatusChange = onModelStatusChange;
    }

    isPaused() {
      return this._paused;
    }

    getModelMeta() {
      return { status: this.modelStatus, progress: this.modelProgress, error: this.modelError };
    }

    _notifyModelStatus() {
      if (this.onModelStatusChange) this.onModelStatusChange(this.getModelMeta());
    }

    ensureModelLoaded() {
      if (this.modelStatus === "ready") return Promise.resolve();
      if (this._modelLoadPromise) return this._modelLoadPromise;

      if (!window.KokoroTTS) {
        this.modelStatus = "error";
        this.modelError = "Natural Voice engine failed to load (kokoro-js module missing)";
        this._notifyModelStatus();
        return Promise.reject(new Error(this.modelError));
      }

      this.modelStatus = "loading";
      this.modelProgress = 0;
      this.modelError = null;
      this._notifyModelStatus();

      this._modelLoadPromise = (async () => {
        try {
          this.tts = await window.KokoroTTS.from_pretrained(NATURAL_MODEL_ID, {
            dtype: "q8",
            device: "wasm",
            progress_callback: (info) => {
              if (info && typeof info.progress === "number") {
                this.modelProgress = Math.round(info.progress);
                this._notifyModelStatus();
              }
            },
          });
          this.modelStatus = "ready";
          this.modelProgress = 100;
        } catch (err) {
          this.modelStatus = "error";
          this.modelError = (err && err.message) || "Failed to load voice model";
          this._modelLoadPromise = null;
          throw err;
        } finally {
          this._notifyModelStatus();
        }
      })();

      return this._modelLoadPromise;
    }

    async begin(result, rate, volume, startIndex = 0) {
      this.words = result.words;
      this.spans = result.spans;
      this.boundaries = result.boundaries || [];
      this.rate = rate;
      this.volume = volume;
      this.currentIndex = -1;
      this.currentSpan = null;
      this.active = true;
      this._paused = false;
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] begin (natural)", { wordCount: this.words.length, boundaries: this.boundaries });

      try {
        await this.ensureModelLoaded();
      } catch {
        // modelStatus/modelError already set by ensureModelLoaded; unwind
        // the in-progress read so the UI doesn't show a stuck "active" state.
        this.active = false;
        unwrapWords(this.spans);
        this.words = [];
        this.spans = [];
        return { ok: false, reason: "model-error" };
      }

      this._playFrom(startIndex);
      return { ok: true };
    }

    async _synthesizeChunk(indexBase, chunkEnd) {
      const text = this.words.slice(indexBase, chunkEnd).join(" ");
      const speed = clamp(this.rate, KOKORO_SPEED_MIN, KOKORO_SPEED_MAX);
      const rawAudio = await this.tts.generate(text, { voice: this.voiceId, speed });
      return { indexBase, chunkEnd, audio: rawAudio.audio, samplingRate: rawAudio.sampling_rate };
    }

    _buildWordThresholds(indexBase, chunkEnd, durationSeconds) {
      const slice = this.words.slice(indexBase, chunkEnd);
      const totalChars = slice.reduce((sum, w) => sum + w.length, 0) || 1;
      let cumulative = 0;
      return slice.map((w) => {
        const start = (cumulative / totalChars) * durationSeconds;
        cumulative += w.length;
        return start;
      });
    }

    async _playFrom(indexBase) {
      if (indexBase >= this.words.length) {
        this.stop();
        return;
      }
      const generation = this._generation;
      const chunkEnd = findChunkEnd(this.words, indexBase, NATURAL_MAX_CHUNK_CHARS);

      let chunk;
      try {
        chunk = await this._synthesizeChunk(indexBase, chunkEnd);
      } catch {
        if (generation === this._generation) this.stop();
        return;
      }
      if (generation !== this._generation) return; // stopped/restarted meanwhile

      this._playChunk(chunk);
    }

    _playChunk({ indexBase, chunkEnd, audio, samplingRate }) {
      if (!this.audioContext) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextCtor();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);
      }
      // Every newly scheduled chunk re-checks this._paused (rather than
      // assuming "not suspended" from the previous chunk) so a chunk
      // boundary, a rewind/fast-forward jump, or a rate-change restart can
      // never silently resume playback the user paused.
      if (this._paused) {
        if (this.audioContext.state !== "suspended") this.audioContext.suspend().catch(() => {});
      } else if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }

      const buffer = this.audioContext.createBuffer(1, audio.length, samplingRate);
      buffer.copyToChannel(audio, 0);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);

      const durationSeconds = audio.length / samplingRate;
      const thresholds = this._buildWordThresholds(indexBase, chunkEnd, durationSeconds);

      const generation = this._generation;
      source.onended = () => {
        if (this.currentSource !== source || generation !== this._generation) return;
        if (chunkEnd < this.words.length) {
          const pending = this._pendingNextChunk;
          this._pendingNextChunk = null;
          if (pending && pending.indexBase === chunkEnd) this._playChunk(pending);
          else this._playFrom(chunkEnd);
        } else {
          this.stop();
        }
      };

      this.currentSource = source;
      this.currentChunk = { indexBase, chunkEnd, thresholds };
      this._chunkStartContextTime = this.audioContext.currentTime;
      source.start();
      if (this._paused) this._setCurrentWord(indexBase);
      else this._startHighlightLoop();
      this._prefetchNextChunk(chunkEnd);
    }

    _prefetchNextChunk(afterIndex) {
      if (afterIndex >= this.words.length) return;
      const chunkEnd = findChunkEnd(this.words, afterIndex, NATURAL_MAX_CHUNK_CHARS);
      const generation = this._generation;
      this._synthesizeChunk(afterIndex, chunkEnd)
        .then((result) => {
          if (generation === this._generation) this._pendingNextChunk = result;
        })
        .catch(() => {
          // Leave it null; onended falls back to synthesizing on demand.
        });
    }

    _startHighlightLoop() {
      const tick = () => {
        if (!this.active || !this.currentChunk || !this.audioContext) return;
        const elapsed = this.audioContext.currentTime - this._chunkStartContextTime;
        const { indexBase, thresholds } = this.currentChunk;
        let localIndex = 0;
        for (let i = thresholds.length - 1; i >= 0; i--) {
          if (thresholds[i] <= elapsed) {
            localIndex = i;
            break;
          }
        }
        this._setCurrentWord(indexBase + localIndex);
        this._rafHandle = requestAnimationFrame(tick);
      };
      if (this._rafHandle) cancelAnimationFrame(this._rafHandle);
      this._rafHandle = requestAnimationFrame(tick);
    }

    _setCurrentWord(i) {
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      // Guarded to only log on an actual change - this is called every rAF
      // tick while playing and would otherwise flood the console.
      if (i !== this.currentIndex) console.log("[read-aloud DEBUG] _setCurrentWord (natural)", { from: this.currentIndex, to: i });
      if (this.currentSpan) this.currentSpan.classList.remove(ACTIVE_CLASS);
      this.currentIndex = i;
      this.currentSpan = this.spans[i] || null;
      if (this.currentSpan) {
        this.currentSpan.classList.add(ACTIVE_CLASS);
        this.currentSpan.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (this.onWordChange) this.onWordChange(i);
    }

    togglePause() {
      if (!this.active || !this.audioContext) return;
      this._paused = !this._paused;
      if (!this._paused) {
        this.audioContext.resume().catch(() => {});
        this._startHighlightLoop();
      } else {
        this.audioContext.suspend();
        if (this._rafHandle) cancelAnimationFrame(this._rafHandle);
      }
    }

    // Shared cancel-current-chunk-and-restart-from-index mechanics, used by
    // rate changes, rewind, and fast-forward. Pause state isn't handled here
    // - _playChunk re-checks this._paused for the newly scheduled chunk.
    _restartFrom(index) {
      if (!this.active) return;
      this._generation++;
      if (this.currentSource) {
        this.currentSource.onended = null;
        try {
          this.currentSource.stop();
        } catch {
          // already stopped
        }
        this.currentSource = null;
      }
      if (this._rafHandle) cancelAnimationFrame(this._rafHandle);
      this._pendingNextChunk = null;
      this._playFrom(index);
    }

    // Kokoro bakes speed into the audio itself, so a rate change needs a
    // resynthesis - restarts from the current word rather than applying
    // live to already-rendered audio.
    _restartFromCurrent() {
      if (this.currentIndex < 0) return;
      this._restartFrom(this.currentIndex);
    }

    // Jumps to the previous paragraph's first word (or word 0, once already
    // in the first paragraph). Moves currentIndex/highlight there
    // synchronously before kicking off the (async) resynthesis, so a rapid
    // repeat press computes its next target from the just-requested
    // position rather than a stale one still waiting on the highlight loop
    // to catch up to audio that may get cancelled before it ever plays.
    rewind() {
      if (!this.active) return;
      const target = computeRewindIndex(this.boundaries, this.currentIndex);
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] rewind (natural)", { currentIndex: this.currentIndex, boundaries: this.boundaries, target });
      this._setCurrentWord(target);
      this._restartFrom(target);
    }

    // Jumps to the next paragraph's first word; no-ops once already in the
    // last paragraph rather than jumping past the end of the content.
    fastForward() {
      if (!this.active) return;
      const target = computeForwardIndex(this.boundaries, this.currentIndex);
      // TEMP DIAGNOSTIC - remove once rewind is fixed.
      console.log("[read-aloud DEBUG] fastForward (natural)", { currentIndex: this.currentIndex, boundaries: this.boundaries, target });
      if (target === null) return;
      this._setCurrentWord(target);
      this._restartFrom(target);
    }

    setRate(rate) {
      this.rate = clamp(Math.round(rate * 10) / 10, MIN_RATE, MAX_RATE);
      this._restartFromCurrent();
    }

    // Unlike rate, volume is a live gain-node value, not baked into the
    // synthesized audio - applies instantly, no resynthesis/restart needed.
    setVolume(volume) {
      this.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
      if (this.gainNode) this.gainNode.gain.value = this.volume;
    }

    stop() {
      this._generation++;
      if (this.currentSource) {
        this.currentSource.onended = null;
        try {
          this.currentSource.stop();
        } catch {
          // already stopped
        }
        this.currentSource = null;
      }
      if (this._rafHandle) {
        cancelAnimationFrame(this._rafHandle);
        this._rafHandle = null;
      }
      this._pendingNextChunk = null;
      this.currentChunk = null;

      if (this.currentSpan) this.currentSpan.classList.remove(ACTIVE_CLASS);
      unwrapWords(this.spans);

      const wasActive = this.active;
      this.words = [];
      this.spans = [];
      this.boundaries = [];
      this.currentIndex = -1;
      this.currentSpan = null;
      this.active = false;
      this._paused = false;
      if (wasActive && this.onDone) this.onDone();
    }
  }

  // ---- Controller: single active read across the whole app, mirrors ------
  // ttsEngine.js's own single-active-utterance assumption but scoped per
  // dashboard pane/file/note-switch instead of per-tab.

  function createReadAloudController() {
    let engineChoice = loadPref("engine", "system");
    let rate = loadPref("rate", DEFAULT_RATE);
    let volume = loadPref("volume", DEFAULT_VOLUME);
    let activeEngine = null;
    const listeners = new Set();

    function notify() {
      const state = getState();
      listeners.forEach((fn) => {
        try {
          fn(state);
        } catch (err) {
          console.error("[ReadAloud] listener error", err);
        }
      });
    }

    function onWordChange() {
      // Word highlighting is applied directly to the span by the engine;
      // no state broadcast needed per word (that would be a render() per
      // word). Kept as an extension point.
    }

    function onDone() {
      activeEngine = null;
      notify();
    }

    const systemEngine = new SystemVoiceEngine({ onWordChange, onDone });
    const naturalEngine = new NaturalVoiceEngine({
      onWordChange,
      onDone,
      onModelStatusChange: () => notify(),
    });

    function engineFor(choice) {
      return choice === "natural" ? naturalEngine : systemEngine;
    }

    function getState() {
      return {
        active: !!activeEngine && activeEngine.active,
        paused: !!activeEngine && activeEngine.isPaused(),
        engineChoice,
        rate,
        volume,
        natural: naturalEngine.getModelMeta(),
      };
    }

    function stop() {
      if (activeEngine) activeEngine.stop(); // routes through onDone -> notify
      else notify();
    }

    async function start(container) {
      stop();
      if (!container) return { ok: false, reason: "no-container" };
      const result = wrapContainerWords(container);
      if (!result.words.length) return { ok: false, reason: "no-text" };

      const engine = engineFor(engineChoice);
      activeEngine = engine;
      const outcome = (await engine.begin(result, rate, volume)) || { ok: true };
      if (!outcome.ok) activeEngine = null;
      notify();
      return outcome;
    }

    function togglePause() {
      if (!activeEngine) return;
      activeEngine.togglePause();
      notify();
    }

    function rewind() {
      if (!activeEngine) return;
      activeEngine.rewind();
      notify();
    }

    function fastForward() {
      if (!activeEngine) return;
      activeEngine.fastForward();
      notify();
    }

    function setRate(next) {
      rate = clamp(Math.round(next * 10) / 10, MIN_RATE, MAX_RATE);
      savePref("rate", rate);
      if (activeEngine) activeEngine.setRate(rate);
      notify();
    }

    function setVolume(next) {
      volume = clamp(next, MIN_VOLUME, MAX_VOLUME);
      savePref("volume", volume);
      if (activeEngine) activeEngine.setVolume(volume);
      notify();
    }

    function setEngineChoice(choice) {
      const next = choice === "natural" ? "natural" : "system";
      if (next === engineChoice) return;
      stop();
      engineChoice = next;
      savePref("engine", engineChoice);
      if (engineChoice === "natural") naturalEngine.ensureModelLoaded().catch(() => {});
      notify();
    }

    function subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }

    return {
      start,
      stop,
      togglePause,
      rewind,
      fastForward,
      setRate,
      setVolume,
      setEngineChoice,
      getState,
      subscribe,
      WORD_CLASS,
      ACTIVE_CLASS,
      IGNORE_ATTR,
    };
  }

  window.ReadAloud = createReadAloudController();
})();
