"""Tests for the price history (no Home Assistant needed)."""
import importlib.util
import pathlib
import sys

spec = importlib.util.spec_from_file_location("tariff", pathlib.Path(__file__).parent.parent / "custom_components/growsolar/tariff.py")
tariff = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tariff)


def test_new_price_keeps_the_past():
    t = tariff.update_tariffs(None, 1.16, 1.30, "2026-11-01")
    assert tariff.price_at(t, "2026-10-31") == 1.16
    assert tariff.price_at(t, "2026-11-01") == 1.30
    assert tariff.price_at(t, "2010-01-01") == 1.16


def test_same_price_changes_nothing():
    t = tariff.update_tariffs(None, 1.16, 1.30, "2026-11-01")
    assert tariff.update_tariffs(t, 1.30, 1.30, "2026-12-01") == t


def test_correct_a_start_day():
    t = tariff.update_tariffs(None, 1.16, 1.30, "2026-11-01")
    t = tariff.update_tariffs(t, 1.30, 1.25, "2026-11-01")
    assert tariff.price_at(t, "2026-11-20") == 1.25
    assert len(t) == 2


def test_correct_the_first_price():
    t = tariff.update_tariffs(None, 1.16, 1.30, "2026-11-01")
    t = tariff.update_tariffs(t, 1.30, 1.10, tariff.FIRST_DAY)
    assert tariff.price_at(t, "2026-10-01") == 1.10
    assert tariff.price_at(t, "2026-11-02") == 1.30


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok  ", name)
    print("ALL OK")
