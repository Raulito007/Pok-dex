const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

const pokedexPath = path.join(__dirname, 'pokedex.json');

// Cache para evitar lecturas repetidas
let pokedexCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000; // 1 segundo

// Función optimizada para leer el archivo JSON
function readPokedex() {
  const now = Date.now();
  
  // Usar cache si está disponible y es reciente
  if (pokedexCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return pokedexCache;
  }
  
  try {
    const data = fs.readFileSync(pokedexPath, 'utf8');
    pokedexCache = JSON.parse(data);
    cacheTimestamp = now;
    return pokedexCache;
  } catch (err) {
    console.error('Error al leer pokedex.json:', err);
    return [];
  }
}

// Función optimizada para escribir en el archivo JSON
function writePokedex(data) {
  try {
    fs.writeFileSync(pokedexPath, JSON.stringify(data, null, 2), 'utf8');
    // Actualizar cache después de escribir
    pokedexCache = data;
    cacheTimestamp = Date.now();
    return true;
  } catch (err) {
    console.error('Error al escribir pokedex.json:', err);
    return false;
  }
}

// Función para validar nombre único (case insensitive)
function isPokemonNameUnique(name, excludeId = null) {
  const pokedex = readPokedex();
  const normalizedName = name.toLowerCase().trim();
  
  return !pokedex.some(pokemon => {
    const pokemonName = (pokemon.name?.english || '').toLowerCase().trim();
    return pokemonName === normalizedName && pokemon.id !== excludeId;
  });
}

// RUTAS CRUD

// GET - Obtener todos los Pokémon
app.get('/api/pokemon', (req, res) => {
  try {
    const pokedex = readPokedex();
    console.log(`✓ Se cargaron ${pokedex.length} Pokémon correctamente`);
    res.json(pokedex);
  } catch (error) {
    console.error('Error en GET /api/pokemon:', error);
    res.status(500).json({ error: 'Error al obtener Pokémon' });
  }
});

// GET - Obtener un Pokémon por ID
app.get('/api/pokemon/:id', (req, res) => {
  const pokedex = readPokedex();
  const pokemon = pokedex.find(p => p.id === parseInt(req.params.id));
  
  if (!pokemon) {
    return res.status(404).json({ error: 'Pokémon no encontrado' });
  }
  
  res.json(pokemon);
});

// POST - Crear un nuevo Pokémon
app.post('/api/pokemon', (req, res) => {
  const pokedex = readPokedex();
  const newPokemon = req.body;
  
  // Validar que el nombre sea único
  const pokemonName = newPokemon.name?.english || '';
  if (!pokemonName) {
    return res.status(400).json({ error: 'El nombre del Pokémon es requerido' });
  }
  
  if (!isPokemonNameUnique(pokemonName)) {
    return res.status(400).json({ error: 'Ya existe un Pokémon con ese nombre' });
  }
  
  // Generar nuevo ID
  const maxId = Math.max(...pokedex.map(p => p.id), 0);
  newPokemon.id = maxId + 1;
  
  pokedex.push(newPokemon);
  
  if (writePokedex(pokedex)) {
    res.status(201).json(newPokemon);
  } else {
    res.status(500).json({ error: 'Error al guardar el Pokémon' });
  }
});

// PUT - Actualizar un Pokémon
app.put('/api/pokemon/:id', (req, res) => {
  const pokedex = readPokedex();
  const pokemonId = parseInt(req.params.id);
  const index = pokedex.findIndex(p => p.id === pokemonId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Pokémon no encontrado' });
  }
  
  // Validar que el nombre sea único (excluyendo el Pokémon actual)
  const pokemonName = req.body.name?.english || '';
  if (pokemonName && !isPokemonNameUnique(pokemonName, pokemonId)) {
    return res.status(400).json({ error: 'Ya existe un Pokémon con ese nombre' });
  }
  
  pokedex[index] = { ...pokedex[index], ...req.body, id: pokemonId };
  
  if (writePokedex(pokedex)) {
    res.json(pokedex[index]);
  } else {
    res.status(500).json({ error: 'Error al actualizar el Pokémon' });
  }
});

// DELETE - Eliminar un Pokémon
app.delete('/api/pokemon/:id', (req, res) => {
  const pokedex = readPokedex();
  const index = pokedex.findIndex(p => p.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Pokémon no encontrado' });
  }
  
  const deleted = pokedex.splice(index, 1);
  
  if (writePokedex(pokedex)) {
    res.json({ message: 'Pokémon eliminado', pokemon: deleted[0] });
  } else {
    res.status(500).json({ error: 'Error al eliminar el Pokémon' });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
