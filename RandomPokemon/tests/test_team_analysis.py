import math

import pytest

from analysis.team_analysis import (
    analyze_team,
    build_defensive_matrix,
    build_offensive_matrix,
    classify_roles,
    summarize_stats,
)


def build_pokemon(pid, name, types, stats):
    return {
        "id": pid,
        "name": name,
        "types": types,
        "stats": stats,
    }


@pytest.fixture
def sample_team():
    return [
        build_pokemon(
            6,
            "Charizard",
            ["fire", "flying"],
            {
                "hp": 78,
                "attack": 84,
                "defense": 78,
                "special-attack": 109,
                "special-defense": 85,
                "speed": 100,
            },
        ),
        build_pokemon(
            445,
            "Garchomp",
            ["dragon", "ground"],
            {
                "hp": 108,
                "attack": 130,
                "defense": 95,
                "special-attack": 80,
                "special-defense": 85,
                "speed": 102,
            },
        ),
        build_pokemon(
            423,
            "Gastrodon",
            ["water", "ground"],
            {
                "hp": 111,
                "attack": 83,
                "defense": 68,
                "special-attack": 92,
                "special-defense": 82,
                "speed": 39,
            },
        ),
    ]


def test_summarize_stats_returns_averages(sample_team):
    summary = summarize_stats(sample_team)
    assert summary["teamSize"] == 3
    assert math.isclose(summary["average"]["speed"], (100 + 102 + 39) / 3, rel_tol=1e-3)
    assert summary["peaks"]["attack"]["name"] == "Garchomp"
    assert summary["lows"]["speed"]["name"] == "Gastrodon"


def test_defensive_matrix_counts_weaknesses(sample_team):
    matrix = build_defensive_matrix(sample_team)
    ice_row = next(row for row in matrix if row["type"] == "ice")
    # Only Ground/Dragon is quad-weak to Ice in this trio
    assert ice_row["weak"] == 0
    assert ice_row["quadWeak"] >= 1


def test_offensive_matrix_tracks_sources(sample_team):
    matrix = build_offensive_matrix(sample_team)
    steel_row = next(row for row in matrix if row["target"] == "steel")
    assert steel_row["coverage"] >= 2  # Fire and Ground users
    sources = set(steel_row["sources"])
    assert "Charizard" in sources
    assert "Garchomp" in sources or "Gastrodon" in sources


def test_classify_roles_gives_diverse_labels(sample_team):
    roles = classify_roles(sample_team)
    assert {role["role"] for role in roles}


def test_analyze_team_returns_synergy(sample_team):
    analysis = analyze_team(sample_team)
    assert analysis["defensiveMatrix"]
    assert analysis["offensiveMatrix"]
    assert analysis["statSummary"]["teamSize"] == 3
    breakdown = analysis["synergyScore"]["breakdown"]
    assert set(breakdown.keys()) == {"defense", "offense", "stats"}
    assert analysis["recommendations"]  # Expect at least one recommendation
