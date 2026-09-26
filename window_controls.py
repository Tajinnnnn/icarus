import signal
import time

import AppKit
from PyObjCTools import AppHelper

import state
from config import SCREEN_MARGIN, WINDOW_WIDTH
from runner import stop_all_runs


def position_near_menu_bar():
    try:
        screen = AppKit.NSScreen.mainScreen()
        full = screen.frame()
        visible_frame = screen.visibleFrame()
        # Distance from the top of the screen down to the top of the usable
        # area — i.e. the menu bar's height (varies with notch displays).
        menu_bar_height = full.size.height - (visible_frame.origin.y + visible_frame.size.height)
        # Use the window's actual current width, not the WINDOW_WIDTH default
        # — otherwise repositioning after a manual resize shifts the window
        # off its intended spot, since it'd assume the pre-resize width.
        current_width = state.window.native.frame().size.width if state.window.native else WINDOW_WIDTH
        x = full.size.width - current_width - SCREEN_MARGIN
        y = menu_bar_height + SCREEN_MARGIN
        state.window.move(x, y)
    except Exception:
        pass


def show_window(icon=None, item=None):
    # Since 2026-09-26 the window keeps wherever the user last put it -
    # position_near_menu_bar() is kept for reference but no longer called.
    if state.window is None:
        return
    state.window.show()
    state.visible = True


def hide_window(icon=None, item=None):
    if state.window is None:
        return
    state.window.hide()
    state.visible = False


def toggle_window(icon=None, item=None):
    if state.visible:
        hide_window()
    else:
        show_window()


def quit_app(icon=None, item=None):
    # Stop any crews still running first - otherwise quitting the dashboard
    # would silently orphan their subprocesses instead of shutting them down.
    stop_all_runs()
    if state.window is not None:
        time.sleep(0.4)
    if icon is not None:
        icon.stop()
    if state.window is not None:
        state.window.destroy()


def on_closing():
    hide_window()
    return False


def _handle_sigterm(signum, frame):
    # Sent on logout/shutdown/`kill` (not on Cmd+Q or the tray Quit item,
    # which go through quit_app already) - same subprocess-cleanup treatment
    # so a system restart can't silently orphan a running crew. Signal
    # handlers interrupt whatever the main thread was doing, so don't do
    # real work here - defer it back onto the normal run loop.
    AppHelper.callAfter(quit_app, state.tray_icon, None)


signal.signal(signal.SIGTERM, _handle_sigterm)
