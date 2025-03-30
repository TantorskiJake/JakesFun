import random
import requests
from flask import Flask, render_template_string

app = Flask(__name__)

@app.route("/")
def random_pokemon():
    # Using 898 as an approximate maximum Pokémon ID.
    random_id = random.randint(1, 898)
    
    # Fetch Pokémon data from the PokéAPI.
    api_url = f"https://pokeapi.co/api/v2/pokemon/{random_id}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        return "Error fetching Pokémon data. Please try again later."

    pokemon_data = response.json()
    
    # Extract the Pokémon name and default front image.
    name = pokemon_data.get("name", "Unknown").capitalize()
    image_url = pokemon_data.get("sprites", {}).get("front_default")
    
    # HTML template to display the Pokémon.
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Random Pokémon</title>
    </head>
    <body>
        <h1>{{ name }}</h1>
        {% if image_url %}
            <img src="{{ image_url }}" alt="{{ name }}">
        {% else %}
            <p>No image available.</p>
        {% endif %}
    </body>
    </html>
    """
    
    return render_template_string(html_template, name=name, image_url=image_url)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)