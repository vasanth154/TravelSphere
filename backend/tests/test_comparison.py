"""Tests for the deterministic transport comparison engine."""

from app.services.comparison import calculate_total_cost, compare_options


def test_calculate_total_cost_public():
    opt = {"price": 300, "fuel_cost": 0, "toll_cost": 0, "mode": "train"}
    assert calculate_total_cost(opt) == 300


def test_calculate_total_cost_self_drive():
    opt = {"price": 800, "fuel_cost": 120, "toll_cost": 50, "mode": "car"}
    assert calculate_total_cost(opt) == 970


def test_cheapest_winner():
    options = [
        {"id": "a", "mode": "train", "price": 300, "duration": 270, "comfort": 8, "convenience": 7},
        {"id": "b", "mode": "flight", "price": 1800, "duration": 75, "comfort": 8, "convenience": 9},
        {"id": "c", "mode": "bus", "price": 350, "duration": 260, "comfort": 7, "convenience": 6},
    ]
    result = compare_options(options)
    assert result["cheapest"]["id"] == "a"
    assert result["fastest"]["id"] == "b"
    assert result["best_comfort"]["id"] == "a"


def test_empty_options():
    result = compare_options([])
    assert result["cheapest"] is None
    assert result["ranked"] == []


def test_profile_budget_sensitive_prefers_cheap():
    options = [
        {"id": "a", "mode": "flight", "price": 1800, "duration": 75, "comfort": 8, "convenience": 9},
        {"id": "b", "mode": "train", "price": 300, "duration": 270, "comfort": 8, "convenience": 7},
    ]
    result = compare_options(options, profile="budget_sensitive")
    assert result["best_value"]["id"] == "b"
