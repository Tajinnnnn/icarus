import json
import threading

import state
from preferences import DEFAULT_PATHS, get_preferences, save_preferences
from flow import _nq_price, get_iv_walls, get_options_flow
from flow_pine import export_flow_pine
from flow_push import get_status as get_flow_push_status
from flow_push import set_enabled as set_flow_push
from freeflow import get_gex_walls
from freeflow_pine import export_gex_pine
from freeflow_push import get_status as get_freeflow_push_status
from freeflow_push import set_enabled as set_freeflow_push
from walls_daemon import get_status as get_walls_status
from images import IMAGES_DIR, save_pasted_image
from journal import get_journal_entry, get_today_and_recent, save_journal_entry
from notes import (
    create_category,
    create_folder,
    create_note,
    get_note_content,
    list_categories,
    move_folder,
    move_note,
    rename_folder,
    rename_note,
    save_note_content,
    trash_folder,
    trash_note,
)
from outputs import get_output_file_preview, get_outputs_tree
from automations import load_automations, save_automation, build_command as build_automation_command
from runner import open_output_file, reveal_output_file, send_input, start_run, stop_run, is_running
from tracker import get_tracker_info, save_tracker_data, get_prop_firm_rules
from backtests import (
    get_backtest_bars,
    get_backtest_run,
    get_backtest_run_status,
    list_backtest_runs,
    start_backtest_run,
)


class JsApi:
    def __init__(self):
        self._entries = load_automations()
        self._run_events = []
        self._event_sequence = 0
        self._events_lock = threading.Lock()

    def get_settings(self):
        return {"ok": True, **get_preferences(), "defaults": DEFAULT_PATHS}

    def save_settings(self, paths, branding):
        try:
            settings = save_preferences(paths, branding)
        except (ValueError, OSError) as exc:
            return {"ok": False, "error": str(exc)}
        if state.window is not None:
            state.window.set_title(settings["branding"]["title"])
        return {"ok": True, **settings, "defaults": DEFAULT_PATHS}

    def choose_folder(self, current_path=None):
        if state.window is None:
            return {"ok": False, "error": "In the browser preview, paste a folder path. The folder picker is available in the desktop app."}
        import webview
        from pathlib import Path
        directory = str(Path(current_path).expanduser()) if current_path and Path(current_path).expanduser().is_dir() else ''
        try:
            selected = state.window.create_file_dialog(webview.FileDialog.FOLDER, directory=directory)
            return {"ok": True, "path": selected[0] if selected else None}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def list_automations(self):
        self._entries = load_automations()
        return [entry.to_dict() for entry in self._entries]

    def save_automation(self, draft):
        try:
            if draft.get("id") and is_running(draft["id"]):
                raise ValueError("Stop this automation before changing its settings.")
            entry = save_automation(draft)
            self._entries = load_automations()
            return {"ok": True, "entry": entry.to_dict()}
        except (ValueError, OSError) as exc:
            return {"ok": False, "error": str(exc)}

    def _record_event(self, kind, *args):
        with self._events_lock:
            self._event_sequence += 1
            self._run_events.append({"sequence":self._event_sequence, "kind":kind, "args":args})
            self._run_events = self._run_events[-500:]
        _push_call(kind, *args)

    def get_run_events(self, after=0):
        with self._events_lock:
            return [event for event in self._run_events if event["sequence"] > after]


    def run_automation(self, crew_id, inputs):
        self._entries = load_automations()
        entry = next((item for item in self._entries if item.id == crew_id), None)
        if entry is None:
            return {"started": False, "error": f"Unknown automation: {crew_id}"}
        if not entry.valid:
            return {"started": False, "error": entry.invalid_reason}

        def on_log(line):
            self._record_event("appendLog", crew_id, line)

        def on_done(success, payload):
            self._record_event("runFinished", crew_id, success, payload)

        def on_awaiting_input():
            self._record_event("awaitingInput", crew_id)

        started = start_run(entry, inputs, on_log, on_done, on_awaiting_input, command_builder=build_automation_command)
        if not started:
            return {"started": False, "error": "This automation is already running"}
        return {"started": True}

    def send_input(self, crew_id, text):
        return {"sent": send_input(crew_id, text)}

    def stop_run(self, crew_id):
        return {"stopped": stop_run(crew_id)}

    def open_output_file(self, path):
        open_output_file(path)

    def reveal_output_file(self, path):
        reveal_output_file(path)

    def get_outputs_tree(self):
        return get_outputs_tree(self._entries)

    def get_output_file_preview(self, path):
        try:
            return {"ok": True, **get_output_file_preview(self._entries, path)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def list_backtest_runs(self):
        return list_backtest_runs()

    def get_backtest_run(self, run_id):
        return get_backtest_run(run_id)

    def get_backtest_bars(self, symbol, resolution, start_iso, end_iso):
        return get_backtest_bars(symbol, resolution, start_iso, end_iso)

    def start_backtest_run(self, label=None):
        return start_backtest_run(label)

    def get_backtest_run_status(self):
        return get_backtest_run_status()

    def get_prop_firm_rules(self):
        return get_prop_firm_rules()

    def get_tracker_info(self):
        return get_tracker_info()

    def save_tracker_data(self, text):
        return save_tracker_data(text)

    def get_journal_data(self, source="personal"):
        return get_today_and_recent(source=source)

    def get_journal_entry(self, date_str, source="personal"):
        return get_journal_entry(date_str, source=source)

    def save_journal_entry(self, date_str, sections, source="personal"):
        return save_journal_entry(date_str, sections, source=source)

    def get_notes_data(self):
        return list_categories()

    def get_note_content(self, path):
        try:
            return {"ok": True, **get_note_content(path)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def save_note_content(self, path, content):
        try:
            return {"ok": True, "entry": save_note_content(path, content)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def create_note(self, category, name, parent_path=None, blank=False):
        try:
            return {"ok": True, "entry": create_note(category, name, parent_path=parent_path, blank=blank)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def create_folder(self, category, name, parent_path=None):
        try:
            return {"ok": True, "entry": create_folder(category, name, parent_path=parent_path)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def create_category(self, name):
        try:
            return {"ok": True, "entry": create_category(name)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def rename_note(self, path, new_name):
        try:
            return {"ok": True, "entry": rename_note(path, new_name)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def rename_folder(self, path, new_name):
        try:
            return {"ok": True, "entry": rename_folder(path, new_name)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def move_note(self, path, target_folder=None, category=None):
        try:
            return {"ok": True, "entry": move_note(path, target_folder=target_folder, category=category)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def move_folder(self, path, target_folder=None, category=None):
        try:
            return {"ok": True, "entry": move_folder(path, target_folder=target_folder, category=category)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def trash_folder(self, path):
        try:
            return {"ok": True, "entry": trash_folder(path)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def trash_note(self, path):
        try:
            return {"ok": True, "entry": trash_note(path)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}

    def get_options_flow(self, underlying="QQQ"):
        # flow.py returns {"ok": False, "error": ...} for every expected failure;
        # this catch is only so an unexpected one reaches the page as text
        # instead of hanging its "Pulling..." state forever.
        try:
            return get_options_flow(underlying)
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": f"{type(e).__name__}: {e}"}

    def export_flow_pine(self, underlying="QQQ"):
        # Pulls fresh rather than exporting whatever the page last showed, so the
        # pull time stamped on the chart is the real age of the numbers.
        try:
            flow = get_options_flow(underlying)
            if not flow["ok"]:
                return flow
            walls = get_iv_walls(underlying)
            return {"ok": True, **export_flow_pine(flow, walls if walls["ok"] else None)}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": f"{type(e).__name__}: {e}"}

    def set_flow_push(self, enabled):
        return set_flow_push(enabled)

    def get_flow_push_status(self):
        return get_flow_push_status()

    def get_iv_walls(self, underlying="QQQ"):
        # Same contract as get_options_flow: every expected failure comes back as
        # {"ok": False, "error": ...}, so this only catches the unexpected.
        try:
            return get_iv_walls(underlying)
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": f"{type(e).__name__}: {e}"}

    def get_walls_status(self):
        return get_walls_status()

    def get_gex_walls(self, underlying="QQQ"):
        # Same contract as get_options_flow/get_iv_walls: every expected failure comes
        # back as {"ok": False, "error": ...}, so this only catches the unexpected.
        try:
            return get_gex_walls(underlying)
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": f"{type(e).__name__}: {e}"}

    def export_gex_pine(self, underlying="QQQ"):
        # Pulls fresh rather than exporting whatever the page last showed, same rationale
        # as export_flow_pine: the pull time stamped on the chart is the real age of the
        # numbers.
        try:
            gex = get_gex_walls(underlying)
            if not gex["ok"]:
                return gex
            return {"ok": True, **export_gex_pine(gex, _nq_price())}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": f"{type(e).__name__}: {e}"}

    def set_freeflow_push(self, enabled):
        return set_freeflow_push(enabled)

    def get_freeflow_push_status(self):
        return get_freeflow_push_status()

    def get_media_images_dir(self):
        return str(IMAGES_DIR)

    def save_pasted_image(self, data_base64, mime_type):
        try:
            return {"ok": True, **save_pasted_image(data_base64, mime_type)}
        except (ValueError, OSError) as e:
            return {"ok": False, "error": str(e)}


def _push_call(js_function_name, *args):
    # Pushed from a background thread in runner.py, so the dashboard sees
    # live updates without polling.
    if state.window is None:
        return
    encoded_args = ", ".join(json.dumps(arg) for arg in args)
    state.window.evaluate_js(f"window.crewDashboard.{js_function_name}({encoded_args})")
