"""Energy price history: each price applies from its date until the next one.

A new price never changes the savings of the days before its start date.
This module has no Home Assistant imports, so it can be tested on its own.
"""
from __future__ import annotations

FIRST_DAY = "2000-01-01"


def price_at(tariffs: list[dict], day: str) -> float | None:
    """Price in force on a day (YYYY-MM-DD), or None before the first one."""
    price = None
    for t in sorted(tariffs or [], key=lambda x: x["from"]):
        if t["from"] <= day:
            price = float(t["price"])
    return price


def initial_tariffs(price: float | None) -> list[dict]:
    """The single price used so far applies to the whole past."""
    return [{"from": FIRST_DAY, "price": float(price or 0)}]


def update_tariffs(tariffs: list[dict] | None, old_price: float | None, new_price: float, start: str) -> list[dict]:
    """Add (or replace) the price that starts on `start`.

    The prices before `start` are kept as they are. A price equal to the one
    already in force on `start` changes nothing.
    """
    out = [dict(t) for t in (tariffs or [])] or initial_tariffs(old_price if old_price is not None else new_price)
    new_price = float(new_price)
    if price_at(out, start) == new_price:
        return sorted(out, key=lambda x: x["from"])
    out = [t for t in out if t["from"] != start] + [{"from": start, "price": new_price}]
    out.sort(key=lambda x: x["from"])
    # drop a price that repeats the one before it (no change at that date)
    clean: list[dict] = []
    for t in out:
        if clean and float(clean[-1]["price"]) == float(t["price"]):
            continue
        clean.append(t)
    return clean
