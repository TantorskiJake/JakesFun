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
    pokemon = {
        "name": data.get("name", "Unknown").capitalize(),
        "image_url": data.get("sprites", {}).get("front_default"),
        "height": data.get("height"),
        "weight": data.get("weight"),
        "base_experience": data.get("base_experience"),
        "types": [t['type']['name'] for t in data.get("types", [])],
        "abilities": [a['ability']['name'] for a in data.get("abilities", [])],
        "stats": { stat['stat']['name']: stat['base_stat'] for stat in data.get("stats", []) }
    }
    
    return render_template("index.html", pokemon=pokemon)

if __name__ == "__main__":
    app.run(debug=True)