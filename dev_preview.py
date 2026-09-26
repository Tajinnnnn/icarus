"""(C) Browser preview of the dashboard UI, for development only.

The real app runs inside pywebview, where dashboard.js talks to Python through
window.pywebview.api. This serves the same dashboard.html to a normal browser and
backs that API with the REAL JsApi over localhost, so pages can be looked at and
debugged with browser dev tools without rebuilding the .app.

    uv run python dev_preview.py        # then open http://127.0.0.1:8431

It is the real API: saving a note here really saves it. Bound to 127.0.0.1 only.
Automation events are polled in the browser; the native app receives live callbacks.
"""
import json
import os
from urllib.parse import unquote, urlsplit
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from js_api import JsApi
from tracker import render_tracker_html

PORT = int(os.environ.get("ICARUS_PREVIEW_PORT", "8431"))
ROOT = Path(__file__).resolve().parent


class PreviewApi(JsApi):
    # A browser will not iframe a file:// page from an http origin, so in the
    # preview the tracker is served over localhost too (see /__tracker.html).
    def get_tracker_info(self):
        info = super().get_tracker_info()
        info["url"] = "/__tracker.html?host=fleur"
        return info


api = PreviewApi()

# Injected ahead of dashboard.js: a Proxy that turns api.anything(...args) into a POST.
SHIM = """<script>
window.icarusBrowserPreview = true;
window.pywebview = { api: new Proxy({}, { get: (_, method) => (...args) =>
  fetch("/__api/" + method, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(args) }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Request failed"); return data; }) }) };
window.addEventListener("load", () => window.dispatchEvent(new Event("pywebviewready")));
</script>"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.headers.get("Host") not in {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}:
            self._send(403, b"{}", "application/json")
            return
        if self.path.startswith("/__tracker.html"):
            try:
                html = render_tracker_html()
            except OSError:
                self._send(404, b"Tracker unavailable", "text/plain")
                return
            self._send(200, html.encode(), "text/html; charset=utf-8")
            return
        if self.path in ("/", "/index.html"):
            html = (ROOT / "dashboard.html").read_text().replace('<script src="vendor/marked', SHIM + '\n<script src="vendor/marked', 1)
            self._send(200, html.encode(), "text/html; charset=utf-8")
            return
        path = unquote(urlsplit(self.path).path).lstrip("/")
        allowed = {"options-charts (C).js", "prop-rules (C).js", "dashboard.css", "dashboard.js", "appearance (C).js", "page-swipe (C).js", "icon.icns", "menubar_icon.png", "assets/icarus-falling (C).png"}
        candidate = (ROOT / path).resolve()
        vendor = (ROOT / "vendor").resolve()
        if not candidate.is_file() or not (path in allowed or vendor in candidate.parents):
            self._send(404, b"{}", "application/json")
            return
        super().do_GET()

    def do_POST(self):
        allowed_hosts = {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}
        host = self.headers.get("Host", "")
        origin = self.headers.get("Origin")
        if host not in allowed_hosts or (origin and origin != "http://" + host) or self.headers.get("Content-Type") != "application/json":
            self._send(403, b'{"error":"Local preview requests only"}', "application/json")
            return
        name = self.path.removeprefix("/__api/")
        method = getattr(api, name, None) if self.path.startswith("/__api/") and not name.startswith("_") else None
        if not callable(method):
            self._send(404, b"{}", "application/json")
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if not 0 <= length <= 2_000_000:
                raise ValueError("Request too large")
            args = json.loads(self.rfile.read(length) or b"[]")
            if not isinstance(args, list):
                raise ValueError("Expected arguments")
            result = method(*args)
        except Exception as exc:
            self._send(400, json.dumps({"ok": False, "error": str(exc)}).encode(), "application/json")
            return
        self._send(200, json.dumps(result).encode(), "application/json")

    def _send(self, status, body, content_type):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):  # keep the terminal quiet
        pass


if __name__ == "__main__":
    print(f"Dashboard preview: http://127.0.0.1:{PORT}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
