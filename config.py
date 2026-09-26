"""(C) Portable defaults. Machine-specific paths never live in source control."""
import json
import os
import sys
from pathlib import Path

APP_TITLE = "Icarus"
DATA_DIR = Path(os.environ.get("ICARUS_DATA_DIR", Path.home() / "Library/Application Support/CrewDashboard")).expanduser().resolve()
MACHINE_PATH = DATA_DIR / "machine (C).json"
try:
    MACHINE = json.loads(MACHINE_PATH.read_text(encoding="utf-8"))
except FileNotFoundError:
    MACHINE = {}
VAULT_ROOT = Path(os.environ.get("ICARUS_VAULT_ROOT", MACHINE.get("vault_root", str(DATA_DIR / "Library")))).expanduser().resolve()
TV_CLI = Path(os.environ.get("ICARUS_TV_CLI", MACHINE.get("tv_cli", str(DATA_DIR / "integrations/tradingview/cli.js")))).expanduser().resolve()
WINDOW_WIDTH = 1100
WINDOW_HEIGHT = 720
SCREEN_MARGIN = 12
LOCK_PATH = DATA_DIR / ".lock"
DEBUG_LOG_PATH = DATA_DIR / "debug.log"


def resource_path(relative):
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.realpath(os.path.join(base, relative))


LOCAL_CREWS_PATH = DATA_DIR / "crews.local.yaml"
CREWS_YAML_PATH = Path(os.environ.get("ICARUS_CREWS_FILE", str(LOCAL_CREWS_PATH if LOCAL_CREWS_PATH.exists() else resource_path("crews.yaml")))).expanduser()

TRADING_DIR = Path(os.environ.get("ICARUS_TRADING_DIR", str(VAULT_ROOT / "Trading/ai-trading-workflow"))).expanduser().resolve()
BACKTEST_DIR = Path(os.environ.get("ICARUS_BACKTEST_DIR", str(TRADING_DIR / "07 System/backtest"))).expanduser().resolve()
