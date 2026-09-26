import pytest

from flow_push import STUDY_NAME, find_data_input, find_ladder_study

SNAPSHOT = "QQQ flow 2026-09-18 - pulled 2:05 PM CT|1789780937738|41.5303|1|720,20,2,200,22"


def test_finds_the_ladder_by_name():
    state = {"symbol": "MNQ1!", "studies": [{"id": "abc", "name": "VP"}, {"id": "d3c", "name": STUDY_NAME}]}
    assert find_ladder_study(state) == "d3c"


def test_refuses_when_the_ladder_is_not_on_the_chart():
    with pytest.raises(RuntimeError, match="not on the active chart"):
        find_ladder_study({"symbol": "MGC1!", "studies": [{"id": "abc", "name": "VP"}]})


def test_refuses_to_guess_between_two_ladders():
    # Duplicate-name studies have silently corrupted chart reads before; never pick one.
    state = {"studies": [{"id": "a", "name": STUDY_NAME}, {"id": "b", "name": STUDY_NAME}]}
    with pytest.raises(RuntimeError, match="2 studies"):
        find_ladder_study(state)


def test_data_input_is_found_by_its_shape_not_its_position():
    indicator = {"inputs": [
        {"id": "pineFeatures", "value": '{"indicator":1}'},
        {"id": "in_0", "value": "Volume"},
        {"id": "in_10", "value": SNAPSHOT},
        {"id": "in_3", "value": 1.0},
    ]}
    assert find_data_input(indicator) == "in_10"


def test_an_old_ladder_without_a_data_input_is_refused():
    indicator = {"inputs": [{"id": "in_0", "value": "Volume"}, {"id": "in_1", "value": 20}]}
    with pytest.raises(RuntimeError, match="paste the newest export"):
        find_data_input(indicator)
