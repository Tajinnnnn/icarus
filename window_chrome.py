import AppKit
from PyObjCTools import AppHelper

import state
from config import DEBUG_LOG_PATH


def _window_bg_color():
    # Matches dashboard.css's --panel (#151217) - the topnav's own
    # background, so the rounded top corners don't show a mismatched color
    # before the WebView paints.
    return AppKit.NSColor.colorWithSRGBRed_green_blue_alpha_(
        0x15 / 255, 0x12 / 255, 0x17 / 255, 1.0
    )


def configure_window_chrome():
    # window.native (the NSWindow) only exists once pywebview has actually
    # built the native window, which happens lazily inside webview.start() -
    # not yet when create_window() returns. "loaded" fires after that, but
    # from a background thread, so the actual mutation has to hop back to
    # the main thread (NSWindow geometry/style changes require it).
    #
    # Seamless chrome: no title bar at all. The three traffic lights are
    # reparented into the content view so they sit inline with the
    # dashboard's own .topnav, and the window goes borderless so AppKit
    # stops putting fresh ones back. Moving the window is handled by
    # pywebview's drag region: .topnav carries the pywebview-drag-region
    # class (dashboard.js), and pywebview's injected script turns a drag
    # on it into window.move() - which works for a borderless window too.
    # (A titled window with a transparent title bar was tried; it left a
    # visible strip above the content, so this is the way.)
    def _apply():
        try:
            ns_window = state.window.native
            if ns_window is None:
                return
            ns_window.setTitlebarAppearsTransparent_(True)
            ns_window.setTitleVisibility_(AppKit.NSWindowTitleHidden)
            ns_window.setStyleMask_(
                ns_window.styleMask() | AppKit.NSWindowStyleMaskFullSizeContentView
            )
            ns_window.setBackgroundColor_(_window_bg_color())

            content_view = ns_window.contentView()

            # Reparent the 3 standard buttons into the content view, so
            # they sit inline with the dashboard's own .topnav (left of the
            # flower-mark logo) instead of a separate native title bar.
            # standardWindowButton_ only returns real controls for a titled
            # window, so this has to happen *before* going borderless below.
            # dashboard.css reserves left padding on .topnav to match these
            # coordinates - keep the two in sync if either changes.
            # .topnav is 8px padding + 30px icons + 8px = 46px tall, so its
            # icons are centred at y=23; the lights sit on the same line.
            button_center_y = 23
            start_x = 16
            spacing = 22

            for index, button_type in enumerate((
                AppKit.NSWindowCloseButton,
                AppKit.NSWindowMiniaturizeButton,
                AppKit.NSWindowZoomButton,
            )):
                button = ns_window.standardWindowButton_(button_type)
                if button is None:
                    continue
                button.retain()
                button.removeFromSuperview()
                button.setTranslatesAutoresizingMaskIntoConstraints_(False)
                content_view.addSubview_(button)
                x = start_x + index * spacing
                button.leadingAnchor().constraintEqualToAnchor_constant_(
                    content_view.leadingAnchor(), x
                ).setActive_(True)
                button.centerYAnchor().constraintEqualToAnchor_constant_(
                    content_view.topAnchor(), button_center_y
                ).setActive_(True)

            # Removing the buttons alone doesn't stick - as long as the
            # window is still "titled", AppKit's own window-chrome upkeep
            # just puts fresh ones back in the titlebar. Going fully
            # borderless (while keeping resizable/closable/miniaturizable,
            # which are independent of the .titled bit) stops that, but
            # loses the automatic rounded corners + shadow (reconstructed
            # by hand below).
            mask = ns_window.styleMask()
            mask &= ~AppKit.NSWindowStyleMaskTitled
            ns_window.setStyleMask_(mask)
            ns_window.setHasShadow_(True)
            ns_window.setMovableByWindowBackground_(True)

            content_view.setWantsLayer_(True)
            layer = content_view.layer()
            layer.setCornerRadius_(10.0)
            layer.setMasksToBounds_(True)
        except Exception as e:
            DEBUG_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(DEBUG_LOG_PATH, "a") as f:
                f.write(f"EXCEPTION: {e!r}\n")

    AppHelper.callAfter(_apply)
