import random
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for
import time
import logging
import re

app = Flask(__name__)

# Cache for API responses to reduce API calls
_pokemon_cache = {}
_cache_timeout = 300  # 5 minutes

def get_pokemon_data(pokemon_id_or_name):
    """Fetch Pokémon data from API with caching"""
    cache_key = str(pokemon_id_or_name).lower()
    
    # Check cache
    if cache_key in _pokemon_cache:
        cached_data, timestamp = _pokemon_cache[cache_key]
        if time.time() - timestamp < _cache_timeout:
            return cached_data
    
    try:
        api_url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_id_or_name}"
        response = requests.get(api_url, timeout=10)
        
        if response.status_code != 200:
            return None
        
        data = response.json()
        
        # Basic Pokémon info from the main API endpoint
        pokemon = {
            "id": data.get("id"),
            "name": data.get("name", "Unknown").capitalize(),
            "image_url": data.get("sprites", {}).get("front_default"),
            "shiny_image_url": data.get("sprites", {}).get("front_shiny"),
            "back_image_url": data.get("sprites", {}).get("back_default"),
            "back_shiny_image_url": data.get("sprites", {}).get("back_shiny"),
            "height": data.get("height"),
            "weight": data.get("weight"),
            "base_experience": data.get("base_experience"),
            "types": [t['type']['name'] for t in data.get("types", [])],
            "type_urls": [t['type']['url'] for t in data.get("types", [])],
            "abilities": [{"name": a['ability']['name'], "url": a['ability']['url']} for a in data.get("abilities", [])],
            "stats": { stat['stat']['name']: stat['base_stat'] for stat in data.get("stats", []) },
            "moves": [{"name": move["move"]["name"], "url": move["move"]["url"]} for move in data.get("moves", [])]  # all moves
        }
        
        # Calculate type effectiveness
        pokemon["type_effectiveness"] = calculate_type_effectiveness(pokemon.get("type_urls", []))
        
        # Fetch species data for extra details
        species_url = data.get("species", {}).get("url")
        if species_url:
            try:
                species_response = requests.get(species_url, timeout=10)
                if species_response.status_code == 200:
                    species_data = species_response.json()
                    flavor_text = next((entry["flavor_text"].replace("\n", " ").replace("\f", " ") 
                                         for entry in species_data.get("flavor_text_entries", []) 
                                         if entry["language"]["name"] == "en"), "No description available.")
                    pokemon["color"] = species_data.get("color", {}).get("name", "unknown")
                    pokemon["habitat"] = species_data.get("habitat", {}).get("name", "unknown") if species_data.get("habitat") else "unknown"
                    pokemon["shape"] = species_data.get("shape", {}).get("name", "unknown") if species_data.get("shape") else "unknown"
                    pokemon["capture_rate"] = species_data.get("capture_rate", "unknown")
                    pokemon["growth_rate"] = species_data.get("growth_rate", {}).get("name", "unknown")
                    pokemon["egg_groups"] = [egg["name"] for egg in species_data.get("egg_groups", [])]
                    pokemon["flavor_text"] = flavor_text
                    pokemon["generation"] = species_data.get("generation", {}).get("name", "unknown")
                    
                    # Get evolution chain
                    evolution_chain_url = species_data.get("evolution_chain", {}).get("url")
                    if evolution_chain_url:
                        try:
                            evolution_response = requests.get(evolution_chain_url, timeout=10)
                            if evolution_response.status_code == 200:
                                evolution_data = evolution_response.json()
                                pokemon["evolution_chain"] = extract_evolution_chain(evolution_data.get("chain", {}))
                        except:
                            pokemon["evolution_chain"] = []
                else:
                    set_default_species_data(pokemon)
            except:
                set_default_species_data(pokemon)
        else:
            set_default_species_data(pokemon)
        
        # Cache the result
        _pokemon_cache[cache_key] = (pokemon, time.time())
        return pokemon
    
    except requests.exceptions.RequestException:
        return None

def set_default_species_data(pokemon):
    """Set default values for species data"""
    pokemon["color"] = "unknown"
    pokemon["habitat"] = "unknown"
    pokemon["shape"] = "unknown"
    pokemon["capture_rate"] = "unknown"
    pokemon["growth_rate"] = "unknown"
    pokemon["egg_groups"] = []
    pokemon["flavor_text"] = "No description available."
    pokemon["generation"] = "unknown"
    pokemon["evolution_chain"] = []

def extract_evolution_chain(chain):
    """Extract evolution chain from API response"""
    evolutions = []
    current = chain
    
    while current:
        species_name = current.get("species", {}).get("name", "")
        if species_name:
            evolutions.append(species_name)
        
        evolves_to = current.get("evolves_to", [])
        if evolves_to:
            current = evolves_to[0]
        else:
            break
    
    return evolutions

def calculate_type_effectiveness(type_urls):
    """Calculate type effectiveness (weaknesses and resistances)"""
    if not type_urls:
        return {"weak_to": [], "resistant_to": [], "immune_to": []}
    
    all_damage_relations = {
        "double_damage_from": [],
        "half_damage_from": [],
        "no_damage_from": []
    }
    
    # Fetch type data for each type
    for type_url in type_urls:
        try:
            type_response = requests.get(type_url, timeout=5)
            if type_response.status_code == 200:
                type_data = type_response.json()
                damage_relations = type_data.get("damage_relations", {})
                
                # Collect damage relations for each type
                if "double_damage_from" in damage_relations:
                    all_damage_relations["double_damage_from"].extend([t["name"] for t in damage_relations["double_damage_from"]])
                if "half_damage_from" in damage_relations:
                    all_damage_relations["half_damage_from"].extend([t["name"] for t in damage_relations["half_damage_from"]])
                if "no_damage_from" in damage_relations:
                    all_damage_relations["no_damage_from"].extend([t["name"] for t in damage_relations["no_damage_from"]])
        except:
            continue
    
    # For dual types: multiply effectiveness
    # Count occurrences to determine final effectiveness
    type_counts = {}
    for type_name in all_damage_relations["double_damage_from"]:
        type_counts[type_name] = type_counts.get(type_name, 0) + 1
    
    for type_name in all_damage_relations["half_damage_from"]:
        type_counts[type_name] = type_counts.get(type_name, 0) - 1
    
    # Calculate final effectiveness
    weak_to = []
    resistant_to = []
    immune_to = list(set(all_damage_relations["no_damage_from"]))
    
    # Types that appear in double_damage_from but not in half_damage_from or no_damage_from
    weak_types = set(all_damage_relations["double_damage_from"]) - set(all_damage_relations["half_damage_from"]) - set(immune_to)
    weak_to = list(weak_types)
    
    # Types that appear in half_damage_from but not in double_damage_from or no_damage_from
    resistant_types = set(all_damage_relations["half_damage_from"]) - set(all_damage_relations["double_damage_from"]) - set(immune_to)
    resistant_to = list(resistant_types)
    
    # For dual types: if a type appears in both lists, calculate net effect
    # 2x weak + 0.5x resistant = 1x (neutral)
    # 2x weak + 2x weak = 4x (super weak)
    # 0.5x resistant + 0.5x resistant = 0.25x (super resistant)
    both_types = set(all_damage_relations["double_damage_from"]) & set(all_damage_relations["half_damage_from"])
    for type_name in both_types:
        double_count = all_damage_relations["double_damage_from"].count(type_name)
        half_count = all_damage_relations["half_damage_from"].count(type_name)
        
        if double_count > half_count:
            # Net weakness
            if type_name not in immune_to:
                weak_to.append(type_name)
        elif half_count > double_count:
            # Net resistance
            if type_name not in immune_to:
                resistant_to.append(type_name)
        # If equal, it's neutral (1x), so don't add to either list
    
    return {
        "weak_to": sorted(list(set(weak_to))),
        "resistant_to": sorted(list(set(resistant_to))),
        "immune_to": sorted(list(set(immune_to)))
    }

@app.route("/")
def index():
    # Redirect to random Pokémon page
    return redirect(url_for('random_pokemon'))

@app.route("/random")
def random_pokemon():
    # Get generation filter if provided
    generation = request.args.get("generation", "").strip()
    
    # Generation ID ranges (approximate, based on Pokémon generations)
    generation_ranges = {
        "1": (1, 151),      # Kanto
        "2": (152, 251),    # Johto
        "3": (252, 386),    # Hoenn
        "4": (387, 493),    # Sinnoh
        "5": (494, 649),    # Unova
        "6": (650, 721),    # Kalos
        "7": (722, 809),    # Alola
        "8": (810, 905),    # Galar
        "9": (906, 1025)    # Paldea
    }
    
    if generation and generation in generation_ranges:
        min_id, max_id = generation_ranges[generation]
        random_id = random.randint(min_id, max_id)
    else:
        # Randomly choose a Pokémon ID (from 1 to 1025 for more Pokémon)
        random_id = random.randint(1, 1025)
    
    pokemon = get_pokemon_data(random_id)
    
    if not pokemon:
        return render_template("index.html", error="Error fetching Pokémon data. Please try again later.")
    
    return render_template("index.html", pokemon=pokemon)

@app.route("/pokemon/<pokemon_id_or_name>")
def get_pokemon(pokemon_id_or_name):
    pokemon = get_pokemon_data(pokemon_id_or_name)
    
    if not pokemon:
        common_names = ["pikachu", "charizard", "blastoise", "venusaur", "mewtwo", "eevee"]
        suggestions = common_names[:5]
        return render_template("index.html", 
                             error=f"Pokémon '{pokemon_id_or_name}' not found.",
                             error_suggestions=[f"Try: {s.capitalize()}" for s in suggestions] + 
                                             ["Use ID numbers 1-1025", "Check the type filters", "Visit /random for a random Pokémon"])
    
    return render_template("index.html", pokemon=pokemon)

@app.route("/search")
def search():
    query = request.args.get("q", "").strip().lower()
    if not query:
        return render_template("index.html", error="Please enter a Pokémon name or ID.", error_suggestions=["Try searching for: Pikachu, Charizard, or 25"])
    
    pokemon = get_pokemon_data(query)
    
    if not pokemon:
        # Generate suggestions based on common names
        common_names = ["pikachu", "charizard", "blastoise", "venusaur", "mewtwo", "eevee", 
                       "snorlax", "dragonite", "gyarados", "lucario", "garchomp", "tyranitar"]
        suggestions = [name for name in common_names if query[0] == name[0] or query in name[:3]][:5]
        if not suggestions:
            suggestions = common_names[:5]
        
        return render_template("index.html", 
                             error=f"Pokémon '{query}' not found.",
                             error_suggestions=[f"Did you mean: {s.capitalize()}?" for s in suggestions] + 
                                             ["Try searching by ID (1-1025)", "Check your spelling", "Use the type filters below"])
    
    return render_template("index.html", pokemon=pokemon)

@app.route("/favorites")
def favorites():
    return render_template("favorites.html")

@app.route("/history")
def history():
    return render_template("history.html")

@app.route("/team")
def random_team():
    # Generate a random team of 6 Pokémon
    team_ids = random.sample(range(1, 1026), 6)
    team = []
    for pokemon_id in team_ids:
        pokemon = get_pokemon_data(pokemon_id)
        if pokemon:
            team.append(pokemon)
    return render_template("team.html", team=team)

@app.route("/api/pokemon/<pokemon_id_or_name>")
def api_get_pokemon(pokemon_id_or_name):
    """API endpoint for fetching Pokémon data"""
    pokemon = get_pokemon_data(pokemon_id_or_name)
    
    if not pokemon:
        return jsonify({"error": "Pokémon not found"}), 404
    
    return jsonify(pokemon)

@app.route("/api/search-suggestions")
def search_suggestions():
    """API endpoint for search autocomplete suggestions"""
    query = request.args.get("q", "").strip().lower()
    if len(query) < 2:
        return jsonify({"suggestions": []})
    
    # Common Pokémon names for autocomplete (first 151 for speed)
    # In a real app, you'd cache this or use a proper search index
    common_names = [
        "pikachu", "charizard", "blastoise", "venusaur", "mewtwo", "mew",
        "eevee", "snorlax", "dragonite", "gyarados", "lapras", "arcanine",
        "alakazam", "gengar", "machamp", "golem", "rhydon", "nidoking",
        "nidoqueen", "vaporeon", "jolteon", "flareon", "aerodactyl", "kabutops"
    ]
    
    # Filter suggestions based on query
    suggestions = [name for name in common_names if query in name][:5]
    
    return jsonify({"suggestions": suggestions})

@app.route("/api/pokemon-by-type/<type_name>")
def pokemon_by_type(type_name):
    """Get a random Pokémon of a specific type"""
    try:
        type_url = f"https://pokeapi.co/api/v2/type/{type_name.lower()}"
        response = requests.get(type_url, timeout=10)
        
        if response.status_code != 200:
            return jsonify({"error": "Type not found"}), 404
        
        type_data = response.json()
        pokemon_list = type_data.get("pokemon", [])
        
        if not pokemon_list:
            return jsonify({"error": "No Pokémon found for this type"}), 404
        
        # Get a random Pokémon from this type
        random_pokemon = random.choice(pokemon_list)
        pokemon_name = random_pokemon.get("pokemon", {}).get("name", "")
        
        if pokemon_name:
            pokemon = get_pokemon_data(pokemon_name)
            if pokemon:
                return jsonify(pokemon)
        
        return jsonify({"error": "Failed to fetch Pokémon"}), 500
    
    except:
        return jsonify({"error": "Error fetching type data"}), 500

if __name__ == "__main__":
    # Custom formatter to convert HTTP logs to friendly language
    class FriendlyFormatter(logging.Formatter):
        def format(self, record):
            message = record.getMessage()
            
            # Filter out static files
            if '/static/' in message or '/favicon.ico' in message:
                return None
            
            # Convert HTTP requests to friendly messages
            if 'GET /pokemon/' in message:
                # Extract Pokémon name/ID from URL
                match = re.search(r'/pokemon/([^\s]+)', message)
                if match:
                    pokemon_id = match.group(1)
                    return f"📱 Fetched Pokémon: {pokemon_id.title()}"
            
            elif 'GET /random' in message:
                if 'generation=' in message:
                    gen_match = re.search(r'generation=(\d+)', message)
                    if gen_match:
                        gen = gen_match.group(1)
                        gen_names = {'1': 'Kanto', '2': 'Johto', '3': 'Hoenn', '4': 'Sinnoh', 
                                    '5': 'Unova', '6': 'Kalos', '7': 'Alola', '8': 'Galar', '9': 'Paldea'}
                        gen_name = gen_names.get(gen, f'Gen {gen}')
                        return f"🎲 Generated random Pokémon from {gen_name}"
                return "🎲 Generated random Pokémon"
            
            elif 'GET /search' in message:
                query_match = re.search(r'q=([^\s&]+)', message)
                if query_match:
                    query = query_match.group(1)
                    return f"🔍 Searched for: {query.title()}"
                return "🔍 Search performed"
            
            elif 'GET /team' in message:
                return "👥 Generated random team"
            
            elif 'GET /favorites' in message:
                return "⭐ Viewed favorites"
            
            elif 'GET /history' in message:
                return "📜 Viewed history"
            
            elif 'GET /api/pokemon-by-type/' in message:
                type_match = re.search(r'/pokemon-by-type/([^\s]+)', message)
                if type_match:
                    ptype = type_match.group(1)
                    return f"🔥 Found random {ptype.title()} type Pokémon"
            
            elif 'GET /api/' in message:
                return "📡 API request"
            
            elif 'GET /' in message:
                return "🏠 Home page accessed"
            
            # Return None to filter out other messages
            return None
    
    # Custom filter to only show Pokémon-related requests
    class StaticFileFilter(logging.Filter):
        def filter(self, record):
            message = record.getMessage()
            if '/static/' in message or '/favicon.ico' in message:
                return False
            return True
    
    # Apply custom formatter and filter to Werkzeug logger
    log = logging.getLogger('werkzeug')
    log.addFilter(StaticFileFilter())
    
    # Remove default handlers and add our custom formatter
    for handler in log.handlers[:]:
        log.removeHandler(handler)
    
    handler = logging.StreamHandler()
    handler.setFormatter(FriendlyFormatter())
    log.addHandler(handler)
    log.setLevel(logging.INFO)
    
    app.run(debug=True, port=5001)