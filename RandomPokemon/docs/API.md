# API Documentation

This document provides detailed information about the Random Pokémon App API endpoints.

## Base URL

```
http://localhost:5001
```

## Web Routes

### Home Route

**GET /**  
Redirects to the random Pokémon page.

**Response:**  
HTTP 302 Redirect to `/random`

---

### Random Pokémon

**GET /random**  
Get a random Pokémon.

**Query Parameters:**
- `generation` (optional): Filter by generation (1-9)
  - `1`: Kanto (IDs 1-151)
  - `2`: Johto (IDs 152-251)
  - `3`: Hoenn (IDs 252-386)
  - `4`: Sinnoh (IDs 387-493)
  - `5`: Unova (IDs 494-649)
  - `6`: Kalos (IDs 650-721)
  - `7`: Alola (IDs 722-809)
  - `8`: Galar (IDs 810-905)
  - `9`: Paldea (IDs 906-1025)

**Example Requests:**
```
GET /random
GET /random?generation=1
```

**Response:**  
Renders HTML template with Pokémon data.

---

### Get Pokémon by ID or Name

**GET /pokemon/<pokemon_id_or_name>**  
Get specific Pokémon by ID number or name.

**Path Parameters:**
- `pokemon_id_or_name`: Pokémon ID (1-1025) or name (case-insensitive)

**Example Requests:**
```
GET /pokemon/25
GET /pokemon/pikachu
GET /pokemon/Pikachu
```

**Response:**  
Renders HTML template with Pokémon data.

**Error Response:**  
If Pokémon not found, renders error page with suggestions.

---

### Search Pokémon

**GET /search?q=<query>**  
Search for Pokémon by name or ID.

**Query Parameters:**
- `q` (required): Search query (name or ID)

**Example Requests:**
```
GET /search?q=pika
GET /search?q=charizard
GET /search?q=150
```

**Response:**  
Renders HTML template with search results or error.

---

### Favorites Page

**GET /favorites**  
Display user's favorited Pokémon.

**Response:**  
Renders favorites page (data loaded from localStorage).

---

### History Page

**GET /history**  
Display recently viewed Pokémon.

**Response:**  
Renders history page (data loaded from localStorage).

---

### Team Builder

**GET /team**  
Generate a random team of 6 Pokémon.

**Response:**  
Renders team page with 6 random Pokémon.

---

## API Endpoints (JSON)

### Get Pokémon Data

**GET /api/pokemon/<pokemon_id_or_name>**  
Get Pokémon data as JSON.

**Path Parameters:**
- `pokemon_id_or_name`: Pokémon ID or name

**Example Request:**
```bash
curl http://localhost:5001/api/pokemon/pikachu
```

**Response:**
```json
{
  "id": 25,
  "name": "Pikachu",
  "image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "shiny_image_url": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
  "height": 4,
  "weight": 60,
  "base_experience": 112,
  "types": ["electric"],
  "abilities": [
    {"name": "static", "url": "https://pokeapi.co/api/v2/ability/9/"},
    {"name": "lightning-rod", "url": "https://pokeapi.co/api/v2/ability/31/"}
  ],
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special-attack": 50,
    "special-defense": 50,
    "speed": 90
  },
  "moves": [
    {"name": "mega-punch", "url": "https://pokeapi.co/api/v2/move/5/"},
    ...
  ],
  "type_effectiveness": {
    "weak_to": ["ground"],
    "resistant_to": ["electric", "flying", "steel"],
    "immune_to": []
  },
  "evolution_chain": [...],
  "species_data": {...}
}
```

**Error Response:**
```json
{
  "error": "Pokémon not found"
}
```
Status: 404

---

### Search Suggestions

**GET /api/search-suggestions?q=<query>**  
Get autocomplete suggestions for search.

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

**Example Request:**
```bash
curl "http://localhost:5001/api/search-suggestions?q=pika"
```

**Response:**
```json
[
  {"id": 25, "name": "pikachu"},
  {"id": 172, "name": "pichu"},
  {"id": 173, "name": "cleffa"},
  {"id": 174, "name": "igglybuff"},
  {"id": 175, "name": "togepi"}
]
```

**Response Format:**
- Array of objects with `id` and `name`
- Maximum 10 suggestions
- Case-insensitive matching

---

### Get Pokémon by Type

**GET /api/pokemon-by-type/<type_name>**  
Get a random Pokémon of the specified type.

**Path Parameters:**
- `type_name`: Type name (normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy)

**Example Request:**
```bash
curl http://localhost:5001/api/pokemon-by-type/fire
```

**Response:**
```json
{
  "id": 4,
  "name": "charmander",
  "type": "fire"
}
```

**Error Response:**
```json
{
  "error": "No Pokémon found for type: <type_name>"
}
```

---

### Team Synergy Analysis

**GET /api/team-analysis?ids=<comma-separated-ids>**  
Compute defensive/offensive/stat breakdowns for up to 6 Pokémon IDs.

**Query Parameters:**
- `ids` (required): Comma-separated Pokédex IDs (`1-1025`), limited to 6 entries.

**Example Request:**
```bash
curl "http://localhost:5001/api/team-analysis?ids=6,445,423,130,91,681"
```

**Response:**
```json
{
  "team": [{"id":6,"name":"charizard","types":["fire","flying"],"...":"..."}],
  "defensiveMatrix": [
    {"type":"ice","quadWeak":1,"weak":1,"neutral":4,"resist":0,"immune":0}
  ],
  "offensiveMatrix": [
    {"target":"steel","coverage":3,"sources":["Charizard","Garchomp"],"typeBreakdown":[{"type":"fire","count":2,"pokemon":["Charizard"]}]}
  ],
  "statSummary": {
    "teamSize":6,
    "average":{"hp":82.0,"attack":95.5,"defense":86.0,"special-attack":92.5,"special-defense":88.3,"speed":93.2},
    "peaks":{"speed":{"name":"Dragapult","value":142}},
    "lows":{"special-defense":{"name":"Gengar","value":75}},
    "averageBST": 520.1
  },
  "roles":[{"name":"Gastrodon","role":"Tank","reasons":["High bulk stats","HP >= 90"]}],
  "synergyScore":{"value":78.5,"breakdown":{"defense":34.0,"offense":25.0,"stats":19.5}},
  "recommendations":[{"severity":"high","message":"3 Pokémon are weak to Ice. Add counters or resistances.","type":"ice"}]
}
```

**Error Responses:**
- `400`: Missing or invalid IDs.
- `404`: Unable to assemble a team using provided IDs.

---

## Data Structures

### Pokémon Object

```typescript
interface Pokemon {
  id: number;
  name: string;
  image_url: string;
  shiny_image_url: string;
  back_image_url: string;
  back_shiny_image_url: string;
  height: number;
  weight: number;
  base_experience: number;
  types: string[];
  type_urls: string[];
  abilities: Array<{
    name: string;
    url: string;
  }>;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    "special-attack": number;
    "special-defense": number;
    speed: number;
  };
  moves: Array<{
    name: string;
    url: string;
  }>;
  type_effectiveness: {
    weak_to: string[];
    resistant_to: string[];
    immune_to: string[];
  };
  evolution_chain: Evolution[];
  species_data: SpeciesData;
}
```

### Type Effectiveness Object

```typescript
interface TypeEffectiveness {
  weak_to: string[];        // Types that deal 2x or more damage
  resistant_to: string[];    // Types that deal 0.5x or less damage
  immune_to: string[];       // Types that deal 0x damage
}
```

### Evolution Chain Object

```typescript
interface Evolution {
  name: string;
  id: number;
  image_url: string;
  level?: number;
  method?: string;
}
```

---

## Caching

The API implements in-memory caching:
- **Cache Duration**: 5 minutes (300 seconds)
- **Cache Key**: Pokémon ID or name (lowercase)
- **Automatic Expiration**: Cached entries expire after timeout

This reduces API calls to PokeAPI and improves response times.

---

## Rate Limiting

The app respects PokeAPI rate limits:
- **No built-in rate limiting**: Relies on PokeAPI's rate limiting
- **Caching helps**: Reduces redundant API calls
- **Recommendation**: Add delays between rapid requests if needed

---

## Error Handling

### Common Error Responses

**404 Not Found:**
```json
{
  "error": "Pokémon not found"
}
```

**500 Internal Server Error:**
- Usually indicates PokeAPI is unavailable or timeout
- Check network connection
- Verify PokeAPI status

### Error Messages

The web interface provides:
- User-friendly error messages
- Suggestions for similar Pokémon
- Helpful tips for resolving issues

---

## External API

This app uses the **PokeAPI** (https://pokeapi.co):
- **Base URL**: `https://pokeapi.co/api/v2/`
- **Documentation**: https://pokeapi.co/docs/v2
- **Rate Limits**: See PokeAPI documentation
- **No Authentication Required**: Public API

---

## Examples

### Complete Workflow

1. **Get random Pokémon:**
   ```bash
   curl http://localhost:5001/random
   ```

2. **Search for Pokémon:**
   ```bash
   curl "http://localhost:5001/api/search-suggestions?q=char"
   ```

3. **Get specific Pokémon:**
   ```bash
   curl http://localhost:5001/api/pokemon/charizard
   ```

4. **Get random fire type:**
   ```bash
   curl http://localhost:5001/api/pokemon-by-type/fire
   ```

---

## Notes

- All endpoints return UTF-8 encoded responses
- Pokémon names are capitalized in responses
- Type names are lowercase
- IDs are integers (1-1025)
- Image URLs point to PokeAPI CDN
