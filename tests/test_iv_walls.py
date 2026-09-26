import math

from flow import CALL_SIGMA, PUT_SIGMA, TRADING_DAYS, atm_iv, iv_walls


SPOT = 700.0


def _c(side, iv, delta, vol=100, strike=SPOT):
    return {"contract_type": side, "iv": iv, "delta": delta, "volume_today": vol, "strike": strike}


def _iv(contracts, spot=SPOT):
    return atm_iv(contracts, spot)


# ── atm_iv ───────────────────────────────────────────────────────────────────────────

def test_each_side_gets_its_own_median():
    got = _iv([_c("call", 0.12, 0.5), _c("call", 0.14, 0.4), _c("call", 0.16, 0.3),
                  _c("put", 0.20, -0.5), _c("put", 0.22, -0.4), _c("put", 0.24, -0.3)])
    assert got == (0.14, 0.22)


def test_a_single_wild_strike_barely_moves_the_median():
    # The real case, QQQ 2026-09-22 board: the 716 call printed 8.7% against a ~12% board.
    # This is the whole reason the estimator is a median - a mean moves 17x further.
    clean = [0.121, 0.122, 0.120]
    outlier = 0.087
    base, _ = _iv([_c("call", iv, 0.5) for iv in clean])
    shifted, _ = _iv([_c("call", iv, 0.5) for iv in clean + [outlier]])
    median_shift = abs(shifted - base)
    mean_shift = abs(sum(clean + [outlier]) / 4 - sum(clean) / 3)
    assert median_shift < 0.001
    assert mean_shift > 0.008


def test_thinly_traded_strikes_are_ignored():
    # The real case: the 687 and 696 calls traded 6 and 1 contracts and reported 21.6% and
    # 19.5% against a 10.7% board. A stale print is not a market.
    iv_call, _ = _iv([_c("call", 0.12, 0.5),
                      _c("call", 9.99, 0.5, vol=0), _c("call", 9.99, 0.5, vol=None),
                      _c("call", 9.99, 0.5, vol=1), _c("call", 9.99, 0.5, vol=6)])
    assert iv_call == 0.12


def test_deep_in_the_money_strikes_cannot_pass_on_a_plausible_delta():
    # Delta cannot police moneyness: it is solved from the same quote as the IV. The 687
    # call sat 4.7% ITM - a true delta near 1.000 - yet reported 0.835 and got through.
    iv_call, _ = _iv([_c("call", 0.107, 0.5, strike=721),
                      _c("call", 0.216, 0.835, strike=687, vol=5000)], spot=721.0)
    assert iv_call == 0.107


def test_the_estimate_does_not_depend_on_how_wide_the_chain_pull_was():
    # The exact rows that broke it: a windowed pull saw only the core, a full pull also saw
    # these two. 687 is out on moneyness, 696 on volume - it traded one contract.
    core = [_c("call", 0.107, 0.5, strike=721), _c("call", 0.108, 0.4, strike=724)]
    far = [_c("call", 0.2158, 0.835, strike=687, vol=6), _c("call", 0.1952, 0.677, strike=696, vol=1)]
    assert _iv(core, spot=721.0) == _iv(core + far, spot=721.0)


def test_strikes_outside_the_delta_band_are_ignored():
    iv_call, iv_put = _iv([_c("call", 0.12, 0.5), _c("call", 9.99, 0.95), _c("call", 9.99, 0.02),
                              _c("put", 0.20, -0.5), _c("put", 9.99, -0.9)])
    assert (iv_call, iv_put) == (0.12, 0.20)


def test_the_band_edges_are_inclusive():
    iv_call, _ = _iv([_c("call", 0.10, 0.15), _c("call", 0.20, 0.85)])
    assert round(iv_call, 6) == 0.15


def test_a_side_with_nothing_usable_is_none_not_borrowed_from_the_other():
    # Borrowing the other side's IV would silently erase the skew the walls run on.
    assert _iv([_c("call", 0.12, 0.5)]) == (0.12, None)
    assert _iv([]) == (None, None)


def test_rows_missing_iv_or_delta_are_skipped():
    iv_call, _ = _iv([_c("call", None, 0.5), _c("call", 0.12, None), _c("call", 0.13, 0.5)])
    assert iv_call == 0.13


def test_unknown_contract_types_are_not_counted_as_puts():
    assert _iv([_c("spread", 9.99, 0.5)]) == (None, None)


# ── iv_walls ─────────────────────────────────────────────────────────────────────────

def test_reproduces_the_one_forecast_on_record():
    # The model author's recorded forecast: NDX 28,274.2 at 26.0 vol -> 27,430 / 29,001.
    lower, upper = iv_walls(28274.2, 0.26, 0.26)
    assert abs(lower - 27430) < 1
    assert abs(upper - 29001) < 1


def test_the_band_is_lognormal_not_linear():
    # Same multipliers applied linearly miss that forecast by 9 to 13 points.
    spot, sigma = 28274.2, 0.26
    lower, upper = iv_walls(spot, sigma, sigma)
    step = sigma / math.sqrt(TRADING_DAYS)
    assert abs(upper - spot * (1 + CALL_SIGMA * step)) > 5
    assert abs(lower - spot * (1 - PUT_SIGMA * step)) > 5


def test_the_put_wall_sits_wider_than_the_call_wall_at_equal_vol():
    spot = 700.0
    lower, upper = iv_walls(spot, 0.15, 0.15)
    assert (spot - lower) > (upper - spot)
    # The calibrated "~20% wider" is a property of the multipliers. The resulting price
    # distances come out slightly tighter than that, because the band is lognormal.
    assert round(PUT_SIGMA / CALL_SIGMA, 2) == 1.19
    assert round((spot - lower) / (upper - spot), 2) == 1.17


def test_each_side_uses_its_own_implied_vol():
    # A fatter put IV must push only the lower wall.
    base_lo, base_hi = iv_walls(700.0, 0.15, 0.15)
    skew_lo, skew_hi = iv_walls(700.0, 0.15, 0.25)
    assert skew_lo < base_lo
    assert skew_hi == base_hi


def test_missing_inputs_give_no_walls_rather_than_a_wrong_number():
    assert iv_walls(700.0, None, 0.15) == (None, None)
    assert iv_walls(700.0, 0.15, None) == (None, None)
    assert iv_walls(None, 0.15, 0.15) == (None, None)


def test_the_live_board_produces_the_expected_zone():
    # QQQ spot 721.28, call IV 12.1%, put IV 12.0% (measured 2026-09-19).
    lower, upper = iv_walls(721.28, 0.121, 0.120)
    assert round(lower, 2) == 711.26
    assert round(upper, 2) == 729.85


# ── IV from prints ───────────────────────────────────────────────────────────────────
# The chain's IV cannot be trusted for skew: it solves from last_price while carrying the
# 16:00 cash close as underlying_price, and QQQ options trade to 16:15. Trades carry their
# own spot, so they stay internally consistent.

from flow import atm_iv_from_prints


def _p(side, iv, delta, strike=700.0, spot=700.0):
    return {"contract_type": side, "iv": iv, "delta": delta, "strike": strike, "underlying_price": spot}


def test_prints_give_a_median_per_side_and_their_own_spot():
    got = atm_iv_from_prints([_p("call", 0.09, 0.5), _p("call", 0.10, 0.4), _p("call", 0.11, 0.3),
                              _p("put", 0.12, -0.5), _p("put", 0.13, -0.4), _p("put", 0.14, -0.3)])
    assert got == (0.10, 0.13, 700.0)


def test_the_spot_comes_from_the_prints_not_the_caller():
    # This is the whole point: the IVs and the spot they were solved against travel together.
    _, _, spot = atm_iv_from_prints([_p("call", 0.09, 0.5, strike=725, spot=725.0)])
    assert spot == 725.0


def test_normal_equity_skew_survives_the_estimator():
    # Five sampled sessions all had put IV above call IV; the chain inverted it.
    iv_call, iv_put, _ = atm_iv_from_prints(
        [_p("call", 0.0921, 0.5), _p("put", 0.1048, -0.5)])
    assert iv_put > iv_call


def test_prints_are_gated_on_moneyness_and_delta_like_the_chain_path():
    iv_call, _, _ = atm_iv_from_prints([
        _p("call", 0.09, 0.5, strike=700, spot=700.0),
        _p("call", 9.99, 0.5, strike=650, spot=700.0),   # 7% away - outside the window
        _p("call", 9.99, 0.95, strike=701, spot=700.0),  # delta out of band
    ])
    assert iv_call == 0.09


def test_a_heavily_traded_strike_carries_more_weight_by_appearing_more_often():
    # No volume gate on prints: each print IS a trade, so repetition is the weighting.
    iv_call, _, _ = atm_iv_from_prints(
        [_p("call", 0.10, 0.5)] * 9 + [_p("call", 0.30, 0.5)])
    assert iv_call == 0.10


def test_no_prints_yields_nothing_rather_than_a_guess():
    assert atm_iv_from_prints([]) == (None, None, None)
    assert atm_iv_from_prints([{"contract_type": "call", "iv": 0.1, "delta": 0.5, "strike": 700}]) == (None, None, None)
