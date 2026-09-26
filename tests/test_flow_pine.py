from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from flow_pine import build_flow_pine

NOW = datetime(2026, 9, 18, 14, 5, tzinfo=ZoneInfo("America/Chicago"))


def _flow(nq=30000.0):
    return {
        "underlying": "QQQ",
        "expiry": "2026-09-18",
        "spot": 720.0,
        "nq": nq,
        # Highest strike first, the order the page shows them in.
        "rows": [
            {"strike": 721, "call_vol": 30, "put_vol": 3, "call_prem": 300.4, "put_prem": 33.0},
            {"strike": 720, "call_vol": 20, "put_vol": 2, "call_prem": 200.0, "put_prem": 22.0},
        ],
    }


def test_the_script_bakes_the_snapshot_in_as_the_data_inputs_default():
    from flow_pine import build_flow_data

    src = build_flow_pine(_flow(), NOW)
    assert "//<<DATA>>" not in src
    assert f'GEN_DATA = "{build_flow_data(_flow(), NOW)}"' in src
    assert "input.text_area(GEN_DATA" in src


def test_refuses_to_export_without_an_nq_price():
    # Without the ratio the ladder would draw at QQQ prices on an NQ chart - off-screen, silently.
    with pytest.raises(ValueError):
        build_flow_pine(_flow(nq=None), NOW)


def test_snapshot_string_is_header_then_one_row_per_strike():
    from flow_pine import build_flow_data

    data = build_flow_data(_flow(), NOW)
    # The trailing pipe is the (empty) IV Walls field. It is always emitted so the field
    # count is fixed and the Pine side can test array.size(parts) >= 6 rather than guess.
    assert data == f"QQQ flow 2026-09-18 - pulled 2:05 PM CT|{int(NOW.timestamp() * 1000)}|41.6667|1|720,20,2,200,22;721,30,3,300,33|"


def test_an_oversized_snapshot_drops_far_strikes_and_keeps_the_middle():
    from flow_pine import MAX_DATA_CHARS, build_flow_data

    flow = _flow()
    flow["rows"] = [{"strike": 500 + i, "call_vol": 123456, "put_vol": 123456, "call_prem": 12345678.0, "put_prem": 12345678.0} for i in range(300)]
    data = build_flow_data(flow, NOW)
    strikes = [int(row.split(",")[0]) for row in data.split("|")[4].split(";")]
    assert len(data) <= MAX_DATA_CHARS
    assert 649 in strikes and 650 in strikes and 500 not in strikes and 799 not in strikes


# ── IV Walls field ───────────────────────────────────────────────────────────────────

WALLS = {"ok": True, "lower": 713.0232, "upper": 728.8594, "iv_call": 0.107059, "iv_put": 0.098795}


def test_walls_ride_along_as_the_sixth_field():
    from flow_pine import build_flow_data

    data = build_flow_data(_flow(), NOW, WALLS)
    assert data.split("|")[5] == "713.02,728.86,0.1071,0.0988"


def test_the_ladder_fields_are_untouched_by_adding_walls():
    from flow_pine import build_flow_data

    without = build_flow_data(_flow(), NOW).split("|")[:5]
    with_walls = build_flow_data(_flow(), NOW, WALLS).split("|")[:5]
    assert without == with_walls


def test_a_failed_walls_pull_leaves_the_field_empty_rather_than_breaking_the_ladder():
    from flow_pine import build_flow_data

    for walls in (None, {"ok": False, "error": "no board"}):
        data = build_flow_data(_flow(), NOW, walls)
        assert data.split("|")[5] == ""
        assert data.split("|")[4] == "720,20,2,200,22;721,30,3,300,33"


def test_walls_are_counted_against_the_cap_and_are_never_what_gets_trimmed():
    from flow_pine import MAX_DATA_CHARS, build_flow_data

    flow = _flow()
    flow["rows"] = [{"strike": 500 + i, "call_vol": 123456, "put_vol": 123456,
                     "call_prem": 12345678.0, "put_prem": 12345678.0} for i in range(300)]
    data = build_flow_data(flow, NOW, WALLS)
    assert len(data) <= MAX_DATA_CHARS
    # The walls survive the trim intact - they are what gets protected, not what gets cut.
    assert data.split("|")[5] == "713.02,728.86,0.1071,0.0988"
    # Strikes are trimmed in pairs from the outside, so carrying the walls costs strikes or
    # nothing, never the reverse.
    assert len(data.split("|")[4].split(";")) <= len(build_flow_data(flow, NOW).split("|")[4].split(";"))


# ── template structure ───────────────────────────────────────────────────────────────
# These guard two rules that are invisible at the Python level and expensive to get wrong
# on a live chart. Both were broken once while building the walls layer.

def test_new_inputs_are_declared_after_the_data_input():
    # Input ids are POSITIONAL. Any input declared above "Data" shifts its id on every chart
    # that already has the script, and the pushed snapshot then lands in the wrong input -
    # which is how the ladder was put into "Can't parse pine" once already.
    from flow_pine import PINE_TEMPLATE

    lines = PINE_TEMPLATE.splitlines()
    data_at = next(i for i, l in enumerate(lines) if l.startswith("data_in "))
    for name in ("lad_gap ", "show_walls ", "walls_back "):
        assert next(i for i, l in enumerate(lines) if l.startswith(name)) > data_at, name


def test_the_stale_stamp_stays_inside_the_ladder_block():
    # show_stamp reads spine_v / spine_p / top, which only exist inside `if n > 0`. Hoisting
    # it out compiles nowhere, and nesting it under the walls block would silently tie the
    # stale warning to the IV Walls toggle.
    from flow_pine import PINE_TEMPLATE

    stamp = next(l for l in PINE_TEMPLATE.splitlines() if l.strip() == "if show_stamp")
    walls = next(l for l in PINE_TEMPLATE.splitlines() if l.strip().startswith("if show_walls"))
    assert len(stamp) - len(stamp.lstrip()) == 12
    assert len(walls) - len(walls.lstrip()) == 8
    assert PINE_TEMPLATE.index("if show_stamp") < PINE_TEMPLATE.index("if show_walls")


def test_every_drawing_array_is_cleared_before_it_is_refilled():
    # Boxes, labels and lines all accumulate otherwise, and the script hits its object cap.
    from flow_pine import PINE_TEMPLATE

    for array_name in ("B", "L", "LN"):
        assert f"array.clear({array_name})" in PINE_TEMPLATE
