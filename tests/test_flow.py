from flow import aggregate_by_strike


def _contract(strike, side, vol, prem, spot=700.0, updated="2026-09-18 15:00:00"):
    return {
        "strike": strike,
        "contract_type": side,
        "volume_today": vol,
        "premium_today": prem,
        "underlying_price": spot,
        "updated_at": updated,
    }


def test_calls_and_puts_at_one_strike_collapse_into_one_row():
    spot, rows = aggregate_by_strike([_contract(700, "call", 10, 1000.0), _contract(700, "put", 4, 300.0)])
    assert spot == 700.0
    assert rows == [{"strike": 700, "call_vol": 10, "put_vol": 4, "call_prem": 1000.0, "put_prem": 300.0}]


def test_strikes_outside_the_window_are_dropped():
    contracts = [_contract(700, "call", 1, 1.0), _contract(760, "call", 99, 99.0), _contract(640, "put", 99, 99.0)]
    _, rows = aggregate_by_strike(contracts, window_pct=0.03)
    assert [r["strike"] for r in rows] == [700]


def test_rows_are_ordered_highest_strike_first_like_a_price_ladder():
    _, rows = aggregate_by_strike([_contract(698, "put", 1, 1.0), _contract(702, "call", 1, 1.0), _contract(700, "call", 1, 1.0)])
    assert [r["strike"] for r in rows] == [702, 700, 698]


def test_spot_comes_from_the_most_recently_updated_contract():
    stale = _contract(700, "call", 1, 1.0, spot=690.0, updated="2026-09-18 09:00:00")
    fresh = _contract(701, "call", 1, 1.0, spot=700.0, updated="2026-09-18 15:00:00")
    spot, _ = aggregate_by_strike([stale, fresh])
    assert spot == 700.0


def test_missing_volume_and_premium_count_as_zero():
    contract = _contract(700, "call", None, None)
    _, rows = aggregate_by_strike([contract])
    assert rows[0]["call_vol"] == 0 and rows[0]["call_prem"] == 0.0


def test_floating_point_strikes_from_the_api_merge():
    # LSE returns strikes like 495.00000000000006 for the same 495 strike.
    _, rows = aggregate_by_strike([_contract(700.0000000001, "call", 1, 1.0), _contract(700, "put", 2, 2.0)])
    assert len(rows) == 1 and rows[0]["call_vol"] == 1 and rows[0]["put_vol"] == 2


def test_empty_chain_returns_no_rows():
    assert aggregate_by_strike([]) == (None, [])
