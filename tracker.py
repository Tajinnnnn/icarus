"""(C) Manual account data stays local; public UI and firm rules ship with Icarus."""
import json
import os

from pathlib import Path
from config import VAULT_ROOT, DATA_DIR, resource_path

TRACKER_DIR = VAULT_ROOT / "Trading" / "prop-tracker"
TRACKER_HTML = Path(os.environ.get("ICARUS_TRACKER_FILE", resource_path("account-tracker (C).html"))).expanduser()
TRACKER_DATA = Path(os.environ.get("ICARUS_TRACKER_DATA", str(TRACKER_DIR / "tracker-data.json"))).expanduser()


def get_prop_firm_rules():
    return json.loads(Path(resource_path("prop-firm-rules (C).json")).read_text(encoding="utf-8"))


def render_tracker_html():
    html = TRACKER_HTML.read_text(encoding="utf-8")
    style = Path(resource_path("workflow-tracker-preview (C).css")).read_text(encoding="utf-8")
    bridge = """<script>window.addEventListener('message', event => {
      if (event.source !== window.parent || event.data?.type !== 'fleur:theme') return;
      if (['fleur','light','dark','chrome'].includes(event.data.theme)) document.documentElement.dataset.theme = event.data.theme;
    });
    // (C) Grow the frame to its content; let the dashboard own vertical scrolling.
    window.addEventListener('DOMContentLoaded', () => {
      let previousHeight = 0;
      const reportHeight = () => {
        const height = Math.ceil(document.body.getBoundingClientRect().height);
        if (height === previousHeight) return;
        previousHeight = height;
        window.parent.postMessage({type:'icarus:tracker-height',height}, '*');
      };
      new ResizeObserver(reportHeight).observe(document.body);
      reportHeight();
    });</script>"""
    # Compatible trackers may be HTML fragments without an explicit head element.
    extra = "<style>" + style + "\nhtml,body{height:auto;min-height:0}.topbar{position:static}</style>" + bridge
    if "</head>" in html:
        return html.replace("</head>", extra + "</head>", 1)
    return html.replace("</style>", "</style>" + extra, 1)


def get_tracker_info():
    try:
        data = TRACKER_DATA.read_text(encoding="utf-8") if TRACKER_DATA.exists() else None
        if data is not None:
            json.loads(data)  # fail closed instead of overwriting unreadable private data
        html = render_tracker_html()
        cached = DATA_DIR / "tracker-view (C).html"
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not cached.exists() or cached.read_text(encoding="utf-8") != html:
            cached.write_text(html, encoding="utf-8")
        return {"ok": True, "url": cached.as_uri() + "?host=fleur", "data": data, "error": None}
    except (OSError, ValueError) as error:
        return {"ok": False, "url": "", "data": None, "error": str(error)}


def save_tracker_data(text):
    try:
        json.loads(text)  # never write something the tracker cannot read back
        TRACKER_DATA.parent.mkdir(parents=True, exist_ok=True)
        tmp = TRACKER_DATA.with_name(TRACKER_DATA.name + ".tmp")
        tmp.write_text(text, encoding="utf-8")
        os.replace(tmp, TRACKER_DATA)
        return {"ok": True}
    except (ValueError, OSError) as e:
        return {"ok": False, "error": str(e)}
