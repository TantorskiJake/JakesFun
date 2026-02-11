"""Team synergy analysis helpers."""

from __future__ import annotations

import time
from typing import Any, Dict, List

from . import type_chart

PROFILE_TTL_SECONDS = 60
_DEF_PROFILE_CACHE: Dict[Any, Any] = {}
_OFF_PROFILE_CACHE: Dict[Any, Any] = {}

STAT_KEYS = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
]


def _cache_get(cache: Dict[Any, Any], key: Any):
    payload = cache.get(key)
    if not payload:
        return None
    timestamp, value = payload
    if time.time() - timestamp > PROFILE_TTL_SECONDS:
        return None
    return value


def _cache_set(cache: Dict[Any, Any], key: Any, value: Any):
    cache[key] = (time.time(), value)


def _normalize_types(pokemon: Dict[str, Any]) -> List[str]:
    return [t.lower() for t in pokemon.get("types", []) if isinstance(t, str)]


def _defensive_profile(pokemon: Dict[str, Any]) -> Dict[str, float]:
    key = ("def", pokemon.get("id"), tuple(sorted(_normalize_types(pokemon))))
    cached = _cache_get(_DEF_PROFILE_CACHE, key)
    if cached:
        return cached
    profile = type_chart.combine_defense(_normalize_types(pokemon))
    _cache_set(_DEF_PROFILE_CACHE, key, profile)
    return profile


def _offensive_profile(pokemon: Dict[str, Any]) -> Dict[str, float]:
    key = ("off", pokemon.get("id"), tuple(sorted(_normalize_types(pokemon))))
    cached = _cache_get(_OFF_PROFILE_CACHE, key)
    if cached:
        return cached
    profile = type_chart.offensive_profile(_normalize_types(pokemon))
    _cache_set(_OFF_PROFILE_CACHE, key, profile)
    return profile


def summarize_stats(pokemon_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not pokemon_list:
        return {
            "teamSize": 0,
            "average": {stat: 0 for stat in STAT_KEYS},
            "peaks": {},
            "lows": {},
            "averageBST": 0,
        }

    team_size = len(pokemon_list)
    averages = {}
    peaks = {}
    lows = {}
    bst_values = []

    for stat in STAT_KEYS:
        values = [pokemon.get("stats", {}).get(stat, 0) for pokemon in pokemon_list]
        averages[stat] = round(sum(values) / team_size, 1)
        best_index = max(range(team_size), key=lambda idx: values[idx])
        worst_index = min(range(team_size), key=lambda idx: values[idx])
        peaks[stat] = {
            "name": pokemon_list[best_index].get("name", "Unknown"),
            "value": values[best_index],
        }
        lows[stat] = {
            "name": pokemon_list[worst_index].get("name", "Unknown"),
            "value": values[worst_index],
        }

    for pokemon in pokemon_list:
        stats = pokemon.get("stats", {})
        bst_values.append(sum(stats.get(stat, 0) for stat in STAT_KEYS))

    average_bst = round(sum(bst_values) / team_size, 1)

    return {
        "teamSize": team_size,
        "average": averages,
        "peaks": peaks,
        "lows": lows,
        "averageBST": average_bst,
    }


def build_defensive_matrix(pokemon_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    matrix = []
    for attack_type in type_chart.POKEMON_TYPES:
        entry = {
            "type": attack_type,
            "quadWeak": 0,
            "weak": 0,
            "neutral": 0,
            "resist": 0,
            "immune": 0,
        }
        for pokemon in pokemon_list:
            multipliers = _defensive_profile(pokemon)
            multiplier = multipliers.get(attack_type, 1.0)
            if multiplier == 0:
                entry["immune"] += 1
            elif multiplier >= 4:
                entry["quadWeak"] += 1
            elif multiplier > 1:
                entry["weak"] += 1
            elif multiplier < 1:
                entry["resist"] += 1
            else:
                entry["neutral"] += 1
        matrix.append(entry)
    return matrix


def build_offensive_matrix(pokemon_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    matrix = []
    for target_type in type_chart.POKEMON_TYPES:
        pokemon_sources = []
        type_breakdown: Dict[str, Dict[str, Any]] = {}
        for pokemon in pokemon_list:
            profile = _offensive_profile(pokemon)
            if profile.get(target_type, 1.0) <= 1:
                continue
            effective_types = {
                atk_type
                for atk_type in _normalize_types(pokemon)
                if type_chart.get_multiplier(atk_type, target_type) > 1
            }
            if effective_types:
                pokemon_name = pokemon.get("name", "Unknown")
                pokemon_sources.append(pokemon_name)
                for atk_type in effective_types:
                    breakdown_entry = type_breakdown.setdefault(
                        atk_type,
                        {"type": atk_type, "count": 0, "pokemon": []},
                    )
                    breakdown_entry["count"] += 1
                    if pokemon_name not in breakdown_entry["pokemon"]:
                        breakdown_entry["pokemon"].append(pokemon_name)
        matrix.append(
            {
                "target": target_type,
                "coverage": len(set(pokemon_sources)),
                "sources": sorted(set(pokemon_sources)),
                "typeBreakdown": sorted(
                    type_breakdown.values(), key=lambda item: (-item["count"], item["type"])
                ),
            }
        )
    return matrix


def classify_roles(pokemon_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    roles = []
    for pokemon in pokemon_list:
        stats = pokemon.get("stats", {})
        hp = stats.get("hp", 0)
        attack = stats.get("attack", 0)
        defense = stats.get("defense", 0)
        sp_atk = stats.get("special-attack", 0)
        sp_def = stats.get("special-defense", 0)
        speed = stats.get("speed", 0)

        chosen_role = "Balanced"
        reasons = []

        if speed >= 110 and (attack >= 100 or sp_atk >= 100):
            chosen_role = "Fast Sweeper"
            reasons = ["Speed >= 110", "Offense >= 100"]
        elif attack >= 120 and speed >= 90:
            chosen_role = "Physical Sweeper"
            reasons = ["Attack >= 120", "Speed >= 90"]
        elif sp_atk >= 120 and speed >= 90:
            chosen_role = "Special Sweeper"
            reasons = ["Sp. Attack >= 120", "Speed >= 90"]
        elif (defense >= 110 and hp >= 90) or (sp_def >= 110 and hp >= 90):
            chosen_role = "Tank"
            reasons = ["High bulk stats", "HP >= 90"]
        elif (attack >= 110 or sp_atk >= 110) and speed < 70:
            chosen_role = "Wallbreaker"
            reasons = ["High offense", "Lower speed"]
        elif hp >= 100 and (defense >= 100 or sp_def >= 100):
            chosen_role = "Support"
            reasons = ["High HP", "Solid defenses"]

        roles.append(
            {
                "name": pokemon.get("name", "Unknown"),
                "role": chosen_role,
                "reasons": reasons,
            }
        )
    return roles


def _count_defensive_totals(matrix: List[Dict[str, Any]]):
    totals = {"weak": 0, "quadWeak": 0, "resist": 0, "immune": 0}
    for entry in matrix:
        totals["weak"] += entry["weak"]
        totals["quadWeak"] += entry["quadWeak"]
        totals["resist"] += entry["resist"]
        totals["immune"] += entry["immune"]
    return totals


def generate_recommendations(inputs: Dict[str, Any]) -> List[Dict[str, Any]]:
    recommendations = []
    defensive = inputs.get("defensiveMatrix", [])
    offensive = inputs.get("offensiveMatrix", [])
    roles = inputs.get("roles", [])
    stats_summary = inputs.get("statSummary", {})

    # Defensive gaps
    for entry in defensive:
        overlap = entry["weak"] + entry["quadWeak"]
        if overlap >= 3:
            severity = "high" if overlap >= 4 else "medium"
            recommendations.append(
                {
                    "severity": severity,
                    "message": f"{overlap} Pokémon are weak to {entry['type'].title()}. Add counters or resistances.",
                    "type": entry["type"],
                }
            )
        elif entry["immune"] == 0 and entry["resist"] == 0:
            recommendations.append(
                {
                    "severity": "low",
                    "message": f"No resistances to {entry['type'].title()} attacks.",
                    "type": entry["type"],
                }
            )

    # Offensive coverage gaps
    uncovered = [row for row in offensive if row["coverage"] == 0]
    for row in uncovered:
        recommendations.append(
            {
                "severity": "medium",
                "message": f"Team cannot hit {row['target'].title()} super effectively with STAB.",
                "type": row["target"],
            }
        )

    # Role diversity
    unique_roles = {role["role"] for role in roles}
    if len(unique_roles) <= 2 and len(roles) >= 4:
        recommendations.append(
            {
                "severity": "medium",
                "message": "Team roles are similar. Consider mixing wall, sweeper, and support roles.",
                "type": "roles",
            }
        )

    # Stat pacing
    average_speed = stats_summary.get("average", {}).get("speed", 0)
    if average_speed and average_speed < 70:
        recommendations.append(
            {
                "severity": "low",
                "message": "Average speed is low (<70). Consider adding a faster pivot.",
                "type": "stats",
            }
        )

    return recommendations


def _calculate_synergy_score(
    defensive: List[Dict[str, Any]],
    offensive: List[Dict[str, Any]],
    stats_summary: Dict[str, Any],
) -> Dict[str, Any]:
    totals = _count_defensive_totals(defensive)
    weakness_total = totals["weak"] + (2 * totals["quadWeak"])
    resistance_total = totals["resist"] + (2 * totals["immune"])
    defense_ratio = resistance_total / (weakness_total + 1)
    defense_score = round(min(1.0, defense_ratio / 2.0) * 40, 1)

    covered_targets = len([row for row in offensive if row["coverage"] > 0])
    offense_score = round((covered_targets / len(type_chart.POKEMON_TYPES)) * 35, 1)

    average_bst = stats_summary.get("averageBST", 0)
    stats_score = round(min(1.0, average_bst / 600) * 25, 1)

    total = round(defense_score + offense_score + stats_score, 1)
    return {
        "value": total,
        "breakdown": {
            "defense": defense_score,
            "offense": offense_score,
            "stats": stats_score,
        },
    }


def analyze_team(pokemon_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    defensive = build_defensive_matrix(pokemon_list)
    offensive = build_offensive_matrix(pokemon_list)
    stats_summary = summarize_stats(pokemon_list)
    roles = classify_roles(pokemon_list)
    recommendations = generate_recommendations(
        {
            "defensiveMatrix": defensive,
            "offensiveMatrix": offensive,
            "roles": roles,
            "statSummary": stats_summary,
        }
    )
    synergy_score = _calculate_synergy_score(defensive, offensive, stats_summary)

    return {
        "team": pokemon_list,
        "defensiveMatrix": defensive,
        "offensiveMatrix": offensive,
        "statSummary": stats_summary,
        "roles": roles,
        "synergyScore": synergy_score,
        "recommendations": recommendations,
    }
