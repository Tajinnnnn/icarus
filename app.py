import sys
import os
from preferences import get_preferences

import AppKit
import webview

import state
from config import APP_TITLE, WINDOW_HEIGHT, WINDOW_WIDTH, resource_path
from js_api import JsApi
from single_instance import already_running
from tray import setup_tray
from walls_daemon import start as start_walls_scoreboard
from window_chrome import configure_window_chrome
from window_controls import on_closing


def main():
    if already_running():
        sys.exit(0)

    html_path = "file://" + resource_path("dashboard.html")
    state.window = webview.create_window(
        get_preferences()["branding"]["title"],
        html_path,
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        min_size=(760, 520),
        resizable=True,
        hidden=False,
        js_api=JsApi(),
    )
    state.visible = True
    state.window.events.closing += on_closing
    state.window.events.loaded += configure_window_chrome

    # A regular app (Dock icon + Cmd+Tab): the window is a normal movable,
    # resizable window. The menu-bar icon stays as a second way to show/hide it.
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(
        AppKit.NSApplicationActivationPolicyRegular
    )

    setup_tray()

    # Records the next session's IV Walls forecast and grades any session that has since
    # closed. Local file writes only, so unlike the chart pusher it needs no toggle.
    if os.environ.get("ICARUS_ENABLE_WALLS_RECORDER") == "1":
        start_walls_scoreboard()

    # pywebview defaults private_mode to True, which would wipe local
    # storage on every launch; kept off so persisted UI state survives.
    # debug=True gives a right-click "Inspect Element" / console for
    # diagnosing editor issues. It also auto-opens the inspector window on
    # every launch; this keeps right-click "Inspect Element" without that.
    webview.settings["OPEN_DEVTOOLS_IN_DEBUG"] = False
    # Only the top nav's own background drags the window (its class is
    # pywebview-drag-region); its buttons and icons keep working as clicks.
    webview.settings["DRAG_REGION_DIRECT_TARGET_ONLY"] = True
    webview.start(private_mode=False, debug=os.environ.get("ICARUS_DEBUG") == "1")


if __name__ == "__main__":
    main()
