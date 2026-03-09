// Variables globales
let allPokemon = [];
let currentEditingId = null;
let currentPage = 1;
let itemsPerPage = 12;
let filteredPokemon = [];

// Elementos del DOM
const pokemonForm = document.getElementById('pokemonForm');
const pokemonList = document.getElementById('pokemonList');
const searchInput = document.getElementById('searchInput');
const searchNumber = document.getElementById('searchNumber');
const searchType = document.getElementById('searchType');
const searchBtn = document.getElementById('searchBtn');
const showAllBtn = document.getElementById('showAllBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const limitSelect = document.getElementById('limitSelect');
const resetBtn = document.getElementById('resetBtn');
const listSection = document.getElementById('listSection');
const formSection = document.getElementById('formSection');
const modal = document.getElementById('detailModal');
const closeBtn = document.querySelector('.close');
const detailContent = document.getElementById('detailContent');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadPokemon);
pokemonForm.addEventListener('submit', handleFormSubmit);
searchBtn.addEventListener('click', handleSearch);
showAllBtn.addEventListener('click', showPokemonList);
closeFormBtn.addEventListener('click', () => {
  formSection.style.display = 'none';
  resetForm();
});
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  currentEditingId = null;
  resetForm();
});
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Cargar Pokémon
async function loadPokemon() {
  try {
    const response = await fetch('/api/pokemon');
    if (!response.ok) throw new Error('Error al cargar Pokémon');
    
    allPokemon = await response.json();
    populateTypeFilter();
    // No mostrar lista inicialmente
    listSection.style.display = 'none';
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error al cargar los Pokémon', 'error');
  }
}

// Poblar el filtro de tipos con todos los tipos únicos
function populateTypeFilter() {
  const typesSet = new Set();
  
  allPokemon.forEach(pokemon => {
    if (Array.isArray(pokemon.type)) {
      pokemon.type.forEach(type => typesSet.add(type));
    }
  });
  
  const sortedTypes = Array.from(typesSet).sort();
  
  // Limpiar opciones existentes excepto la primera
  searchType.innerHTML = '<option value="">Todos los tipos</option>';
  
  // Agregar cada tipo como opción
  sortedTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    searchType.appendChild(option);
  });
}

// Mostrar lista de Pokémon
function showPokemonList() {
  searchInput.value = '';
  searchNumber.value = '';
  searchType.value = '';
  const limitValue = limitSelect.value;
  
  if (limitValue === 'all') {
    itemsPerPage = filteredPokemon.length || allPokemon.length;
  } else {
    itemsPerPage = parseInt(limitValue);
  }
  
  currentPage = 1;
  filteredPokemon = [...allPokemon];
  displayPokemonWithPagination();
  listSection.style.display = 'block';
  listSection.scrollIntoView({ behavior: 'smooth' });
}

// Mostrar Pokémon con paginación
function displayPokemonWithPagination() {
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pokemonToShow = filteredPokemon.slice(startIndex, endIndex);
  
  displayPokemon(pokemonToShow);
  displayPagination(totalPages, 'top');
  displayPagination(totalPages, 'bottom');
}

// Mostrar Pokémon en la interfaz
function displayPokemon(pokemonArray) {
  pokemonList.innerHTML = '';
  
  if (pokemonArray.length === 0) {
    pokemonList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No se encontraron Pokémon</p>';
    return;
  }
  
  pokemonArray.forEach(pokemon => {
    const card = createPokemonCard(pokemon);
    pokemonList.appendChild(card);
  });
}

// Mostrar controles de paginación
function displayPagination(totalPages, position) {
  const paginationId = position === 'top' ? 'paginationTop' : 'paginationBottom';
  let paginationEl = document.getElementById(paginationId);
  
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = paginationId;
    paginationEl.className = 'pagination';
    
    if (position === 'top') {
      pokemonList.parentElement.insertBefore(paginationEl, pokemonList);
    } else {
      pokemonList.parentElement.appendChild(paginationEl);
    }
  }
  
  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredPokemon.length);
  
  let paginationHTML = `
    <div class="pagination-info">
      Mostrando ${startItem}-${endItem} de ${filteredPokemon.length} Pokémon
    </div>
    <div class="pagination-controls">
      <button class="btn btn-page" onclick="goToFirstPage()" ${currentPage === 1 ? 'disabled' : ''}>
        ⏮ Primera
      </button>
      <button class="btn btn-page" onclick="goToPreviousPage()" ${currentPage === 1 ? 'disabled' : ''}>
        ◀ Anterior
      </button>
      <span class="page-indicator">Página ${currentPage} de ${totalPages}</span>
      <button class="btn btn-page" onclick="goToNextPage()" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente ▶
      </button>
      <button class="btn btn-page" onclick="goToLastPage()" ${currentPage === totalPages ? 'disabled' : ''}>
        Última ⏭
      </button>
    </div>
  `;
  
  paginationEl.innerHTML = paginationHTML;
}

// Funciones de navegación
function goToFirstPage() {
  currentPage = 1;
  displayPokemonWithPagination();
  scrollToList();
}

function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayPokemonWithPagination();
    scrollToList();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayPokemonWithPagination();
    scrollToList();
  }
}

function goToLastPage() {
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  currentPage = totalPages;
  displayPokemonWithPagination();
  scrollToList();
}

function scrollToList() {
  listSection.scrollIntoView({ behavior: 'smooth' });
}

// Crear tarjeta de Pokémon
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.onclick = () => viewPokemon(pokemon.id);
  
  // Extraer información de la estructura compleja
  const name = pokemon.name?.english || pokemon.name || 'N/A';
  const types = Array.isArray(pokemon.type) ? pokemon.type : [];
  const species = pokemon.species || 'N/A';
  const description = pokemon.description || 'Sin descripción';
  const base = pokemon.base || {};
  const image = pokemon.image || {};
  
  const typesHTML = types.map(type => `<span class="type-tag">${type}</span>`).join('');
  const imageHTML = image.hires 
    ? `<div class="pokemon-image"><img src="${image.hires}" alt="${name}"></div>`
    : image.thumbnail
    ? `<div class="pokemon-image"><img src="${image.thumbnail}" alt="${name}"></div>`
    : image.sprite
    ? `<div class="pokemon-image"><img src="${image.sprite}" alt="${name}"></div>`
    : `<div class="pokemon-image"><p>Sin imagen</p></div>`;
  
  card.innerHTML = `
    ${imageHTML}
    <div class="pokemon-card-header">
      <span class="pokemon-id">#${pokemon.id}</span>
      <div style="flex: 1; margin-left: 10px;">
        <div class="pokemon-name">${name}</div>
      </div>
    </div>
    <div class="pokemon-type">${typesHTML}</div>
    <div class="pokemon-species"><strong>Especie:</strong> ${species}</div>
    <div class="pokemon-description">${description}</div>
    <div class="pokemon-stats">
      <div class="stat-item">
        <span class="stat-label">HP:</span>
        <span class="stat-value">${base.HP || 'N/A'}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Ataque:</span>
        <span class="stat-value">${base.Attack || 'N/A'}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Defensa:</span>
        <span class="stat-value">${base.Defense || 'N/A'}</span>
      </div>
    </div>

  `;
  
  return card;
}

// Ver detalles de un Pokémon
function viewPokemon(id) {
  const pokemon = allPokemon.find(p => p.id === id);
  if (!pokemon) return;
  
  const name = pokemon.name?.english || 'N/A';
  const base = pokemon.base || {};
  const profile = pokemon.profile || {};
  const image = pokemon.image || {};
  
  detailContent.innerHTML = `
    <h2>${name} (#${pokemon.id})</h2>
    
    ${image.hires ? `<div style="text-align: center; margin: 20px 0;">
      <img src="${image.hires}" alt="${name}" style="max-width: 200px; height: auto; border: 2px solid #667eea; border-radius: 5px;">
    </div>` : ''}
    
    <div class="modal-detail">
      <div class="modal-detail-title">Tipo</div>
      <div class="modal-detail-value">${Array.isArray(pokemon.type) ? pokemon.type.join(', ') : 'N/A'}</div>
    </div>
    
    <div class="modal-detail">
      <div class="modal-detail-title">Especie</div>
      <div class="modal-detail-value">${pokemon.species || 'N/A'}</div>
    </div>
    
    <div class="modal-detail">
      <div class="modal-detail-title">Descripción</div>
      <div class="modal-detail-value">${pokemon.description || 'N/A'}</div>
    </div>
    
    <div class="modal-detail">
      <div class="modal-detail-title">Estadísticas Base</div>
      <div class="modal-detail-value">
        HP: ${base.HP || 'N/A'}<br>
        Ataque: ${base.Attack || 'N/A'}<br>
        Defensa: ${base.Defense || 'N/A'}<br>
        Ataque Esp.: ${base['Sp. Attack'] || 'N/A'}<br>
        Defensa Esp.: ${base['Sp. Defense'] || 'N/A'}<br>
        Velocidad: ${base.Speed || 'N/A'}
      </div>
    </div>
    
    ${profile.height || profile.weight ? `
    <div class="modal-detail">
      <div class="modal-detail-title">Perfil</div>
      <div class="modal-detail-value">
        ${profile.height ? `Altura: ${profile.height}<br>` : ''}
        ${profile.weight ? `Peso: ${profile.weight}` : ''}
      </div>
    </div>
    ` : ''}
    
    ${profile.ability && Array.isArray(profile.ability) && profile.ability.length > 0 ? `
    <div class="modal-detail">
      <div class="modal-detail-title">Habilidades</div>
      <div class="modal-detail-value">
        ${profile.ability.map(ability => `${ability[0]}${ability[1] ? ' (Oculta)' : ''}`).join('<br>')}
      </div>
    </div>
    ` : ''}
  `;
  
  modal.style.display = 'block';
}

// Editar Pokémon
function editPokemon(id) {
  const pokemon = allPokemon.find(p => p.id === id);
  if (!pokemon) return;
  
  currentEditingId = id;
  
  const name = pokemon.name?.english || '';
  const types = Array.isArray(pokemon.type) ? pokemon.type.join(', ') : '';
  const base = pokemon.base || {};
  const image = pokemon.image || {};
  
  // Rellenar formulario
  document.getElementById('name').value = name;
  document.getElementById('type').value = types;
  document.getElementById('species').value = pokemon.species || '';
  document.getElementById('description').value = pokemon.description || '';
  document.getElementById('hp').value = base.HP || '';
  document.getElementById('attack').value = base.Attack || '';
  document.getElementById('defense').value = base.Defense || '';
  document.getElementById('spAttack').value = base['Sp. Attack'] || '';
  document.getElementById('spDefense').value = base['Sp. Defense'] || '';
  document.getElementById('speed').value = base.Speed || '';
  document.getElementById('imageSprite').value = image.sprite || '';
  document.getElementById('imageThumbnail').value = image.thumbnail || '';
  document.getElementById('imageHires').value = image.hires || '';
  
  // Mostrar formulario y desplazar
  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth' });
}

// Eliminar Pokémon
async function deletePokemon(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este Pokémon?')) return;
  
  try {
    const response = await fetch(`/api/pokemon/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    showMessage('Pokémon eliminado con éxito', 'success');
    await loadPokemon();
    
    // Si la lista estaba visible, refrescarla
    if (listSection.style.display === 'block') {
      filteredPokemon = [...allPokemon];
      displayPokemonWithPagination();
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error al eliminar el Pokémon', 'error');
  }
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: {
      english: document.getElementById('name').value
    },
    type: document.getElementById('type').value
      .split(',')
      .map(t => t.trim())
      .filter(t => t),
    species: document.getElementById('species').value,
    description: document.getElementById('description').value,
    base: {
      HP: parseInt(document.getElementById('hp').value) || 0,
      Attack: parseInt(document.getElementById('attack').value) || 0,
      Defense: parseInt(document.getElementById('defense').value) || 0,
      'Sp. Attack': parseInt(document.getElementById('spAttack').value) || 0,
      'Sp. Defense': parseInt(document.getElementById('spDefense').value) || 0,
      Speed: parseInt(document.getElementById('speed').value) || 0
    },
    image: {
      sprite: document.getElementById('imageSprite').value || null,
      thumbnail: document.getElementById('imageThumbnail').value || null,
      hires: document.getElementById('imageHires').value || null
    }
  };
  
  try {
    const url = currentEditingId 
      ? `/api/pokemon/${currentEditingId}` 
      : '/api/pokemon';
    
    const method = currentEditingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }
    
    const action = currentEditingId ? 'actualizado' : 'creado';
    showMessage(`Pokémon ${action} con éxito`, 'success');
    
    currentEditingId = null;
    resetForm();
    formSection.style.display = 'none';
    await loadPokemon();
    
    // Si la lista estaba visible, refrescarla
    if (listSection.style.display === 'block') {
      filteredPokemon = [...allPokemon];
      displayPokemonWithPagination();
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage(error.message || 'Error al guardar el Pokémon', 'error');
  }
}

// Buscar Pokémon
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const searchNum = searchNumber.value.trim();
  const selectedType = searchType.value;
  
  if (!searchTerm && !searchNum && !selectedType) {
    listSection.style.display = 'none';
    return;
  }
  
  filteredPokemon = allPokemon.filter(pokemon => {
    const name = pokemon.name?.english || '';
    const species = pokemon.species || '';
    const types = Array.isArray(pokemon.type) ? pokemon.type : [];
    const typesString = types.join(' ');
    
    // Búsqueda por número
    if (searchNum) {
      const matchesNumber = pokemon.id.toString() === searchNum;
      // Si hay tipo seleccionado, también debe coincidir
      if (selectedType) {
        return matchesNumber && types.includes(selectedType);
      }
      return matchesNumber;
    }
    
    // Búsqueda por tipo
    if (selectedType && !types.includes(selectedType)) {
      return false;
    }
    
    // Búsqueda por texto (si hay)
    if (searchTerm) {
      return name.toLowerCase().includes(searchTerm) ||
             species.toLowerCase().includes(searchTerm) ||
             typesString.toLowerCase().includes(searchTerm) ||
             pokemon.id.toString().includes(searchTerm);
    }
    
    // Si solo hay tipo seleccionado
    return true;
  });
  
  currentPage = 1;
  const limitValue = limitSelect.value;
  
  if (limitValue === 'all') {
    itemsPerPage = filteredPokemon.length;
  } else {
    itemsPerPage = parseInt(limitValue);
  }
  
  displayPokemonWithPagination();
  listSection.style.display = 'block';
  listSection.scrollIntoView({ behavior: 'smooth' });
}

// Permitir buscar al presionar Enter en ambos campos
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSearch();
  }
});

searchNumber.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSearch();
  }
});

searchType.addEventListener('change', () => {
  if (searchType.value) {
    handleSearch();
  }
});

// Reiniciar formulario
function resetForm() {
  pokemonForm.reset();
  currentEditingId = null;
  document.getElementById('imageSprite').value = '';
  document.getElementById('imageThumbnail').value = '';
  document.getElementById('imageHires').value = '';
}

// Mostrar mensajes
function showMessage(text, type) {
  // Crear elemento de mensaje si no existe
  let messageEl = document.querySelector('.message');
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.className = 'message';
    document.querySelector('main').insertBefore(messageEl, document.querySelector('main').firstChild);
  }
  
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  
  // Auto remover después de 3 segundos
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}
