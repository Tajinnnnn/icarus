# Build with: uv run pyinstaller dashboard.spec --noconfirm
block_cipher = None

a = Analysis(
    ["app.py"],
    pathex=[],
    binaries=[],
    datas=[
        ("dashboard.html", "."),
        ("account-tracker (C).html", "."),
        ("prop-rules (C).js", "."),
        ("options-charts (C).js", "."),
        ("prop-firm-rules (C).json", "."),
        ("assets/icarus-falling (C).png", "assets"),
        ("dashboard.css", "."),
        ("dashboard.js", "."),
        ("appearance (C).js", "."),
        ("page-swipe (C).js", "."),
        ("workflow-tracker-preview (C).css", "."),
        ("menubar_icon.png", "."),
        ("vendor/marked.min.js", "vendor"),
        ("vendor/read-aloud.js", "vendor"),
        ("vendor/lightweight-charts.standalone.production.js", "vendor"),
        ("vendor/LIGHTWEIGHT-CHARTS-LICENSE", "vendor"),
        ("vendor/kokoro/kokoro.web.js", "vendor/kokoro"),
        ("vendor/kokoro/LICENSE", "vendor/kokoro"),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="Icarus",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon="icon.icns",
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="Icarus",
)

app = BUNDLE(
    coll,
    name="Icarus.app",
    icon="icon.icns",
    bundle_identifier="local.icarus.dashboard",
    info_plist={
        # Menu-bar-only utility, matching list-widget-mac: no Dock icon or
        # Cmd+Tab entry, reachable only via the tray icon.
        "LSUIElement": True,
        "CFBundleName": "Icarus",
        "CFBundleDisplayName": "Icarus",
        "CFBundleShortVersionString": "0.2.0",
        "NSHighResolutionCapable": True,
    },
)
