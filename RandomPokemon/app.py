import random
import requests
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def random_pokemon():
    # Randomly choose a Pokémon ID (from 1 to 898)
    random_id = random.randint(1, 898)
    api_url = f"https://pokeapi.co/api/v2/pokemon/{random_id}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        return "Error fetching Pokémon data. Please try again later."
    
    data = response.json()
    
    # Basic Pokémon info from the main API endpoint
    pokemon = {
        "id": data.get("id"),
        "name": data.get("name", "Unknown").capitalize(),
        "image_url": data.get("sprites", {}).get("front_default"),
        "shiny_image_url": data.get("sprites", {}).get("front_shiny"),
        "height": data.get("height"),
        "weight": data.get("weight"),
        "base_experience": data.get("base_experience"),
        "types": [t['type']['name'] for t in data.get("types", [])],
        "abilities": [a['ability']['name'] for a in data.get("abilities", [])],
        "stats": { stat['stat']['name']: stat['base_stat'] for stat in data.get("stats", []) },
        "moves": [move["move"]["name"] for move in data.get("moves", [])][:5]  # first 5 moves
    }
    
    # Fetch species data for extra details
    species_url = data.get("species", {}).get("url")
    if species_url:
        species_response = requests.get(species_url)
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
        else:
            pokemon["color"] = "unknown"
            pokemon["habitat"] = "unknown"
            pokemon["shape"] = "unknown"
            pokemon["capture_rate"] = "unknown"
            pokemon["growth_rate"] = "unknown"
            pokemon["egg_groups"] = []
            pokemon["flavor_text"] = "No description available."
    else:
        pokemon["color"] = "unknown"
        pokemon["habitat"] = "unknown"
        pokemon["shape"] = "unknown"
        pokemon["capture_rate"] = "unknown"
        pokemon["growth_rate"] = "unknown"
        pokemon["egg_groups"] = []
        pokemon["flavor_text"] = "No description available."
    
    return render_template("index.html", pokemon=pokemon)

if __name__ == "__main__":
    app.run(debug=True)