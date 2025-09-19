// Variables globales
let currentOffset = 0;
const limit = 10;
const baseUrl = 'https://pokeapi.co/api/v2';
let currentPage = 1;

// Referencias DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const errorContainer = document.getElementById('error-container');
const listContainer = document.getElementById('list-container');
const detailContainer = document.getElementById('detail-container');
const pokemonList = document.getElementById('pokemon-list');
const pokemonDetail = document.getElementById('pokemon-detail');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const backToListBtn = document.getElementById('back-to-list');
const pageInfo = document.getElementById('page-info');

/**
 * Obtiene una lista de pokémon desde la API
 * @param {number} offset - Número de pokémon a saltar
 * @param {number} limit - Número máximo de resultados
 * @returns {Promise} - Promesa con los datos de la lista de pokémon
 */
async function fetchPokemonList(offset, limit) {
    try {
        const response = await fetch(`${baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Obtener detalles para cada pokémon de la lista
        const pokemonDetailsPromises = data.results.map(pokemon => {
            return fetchPokemonDetail(pokemon.name);
        });
        
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);
        
        return {
            count: data.count,
            next: data.next,
            previous: data.previous,
            results: pokemonDetails
        };
    } catch (error) {
        showError(`Error al obtener lista de Pokémon: ${error.message}`);
        throw error;
    }
}

/**
 * Obtiene detalles de un pokémon específico por nombre o ID
 * @param {string|number} nameOrId - Nombre o ID del pokémon
 * @returns {Promise} - Promesa con los detalles del pokémon
 */
async function fetchPokemonDetail(nameOrId) {
    try {
        // Normalizar entrada: convertir a minúsculas si es string
        const query = typeof nameOrId === 'string' ? nameOrId.toLowerCase() : nameOrId;
        
        const response = await fetch(`${baseUrl}/pokemon/${query}`);
        
        if (!response.ok) {
            throw new Error(`Pokémon no encontrado: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Muestra la lista de pokémon en el DOM
 * @param {Array} pokemonList - Array con datos de pokémon
 */
function displayPokemonList(pokemonList) {
    listContainer.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        
        // Obtener la imagen oficial del pokémon
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                         pokemon.sprites.front_default;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <p>#${pokemon.id.toString().padStart(3, '0')}</p>
        `;
        
        // Evento para mostrar detalles al hacer clic
        card.addEventListener('click', () => {
            displayPokemonDetail(pokemon);
            // Mostrar sección de detalles y ocultar lista
            pokemonList.classList.add('hidden');
            pokemonDetail.classList.remove('hidden');
        });
        
        listContainer.appendChild(card);
    });
}

/**
 * Muestra los detalles de un pokémon específico
 * @param {Object} pokemon - Datos del pokémon
 */
function displayPokemonDetail(pokemon) {
    detailContainer.innerHTML = '';
    
    // Obtener la imagen oficial del pokémon
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || 
                    pokemon.sprites.front_default;
    
    // Crear objeto para los colores de tipos
    const typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };
    
    // Crear la tarjeta de detalle
    const detailCard = document.createElement('div');
    detailCard.className = 'detail-card';
    
    // Crear HTML para los tipos
    const typesHTML = pokemon.types.map(type => {
        const typeName = type.type.name;
        const color = typeColors[typeName] || '#777777';
        return `<span class="type-badge" style="background-color: ${color}">${typeName}</span>`;
    }).join('');
    
    // Crear HTML para las habilidades (máximo 3)
    const abilitiesHTML = pokemon.abilities
        .slice(0, 3)
        .map(ability => `<span class="ability-item">${ability.ability.name}</span>`)
        .join('');
    
    // Llenar la tarjeta con la información
    detailCard.innerHTML = `
        <h3>${pokemon.name}</h3>
        <img src="${imageUrl}" alt="${pokemon.name}">
        <div class="detail-info">
            <div class="detail-section">
                <h4>Número</h4>
                <p>#${pokemon.id.toString().padStart(3, '0')}</p>
            </div>
            <div class="detail-section">
                <h4>Tipos</h4>
                <div class="type-list">${typesHTML}</div>
            </div>
            <div class="detail-section">
                <h4>Habilidades</h4>
                <div class="ability-list">${abilitiesHTML}</div>
            </div>
            <div class="detail-section">
                <h4>Estadísticas base</h4>
                <p>HP: ${pokemon.stats[0].base_stat}</p>
                <p>Ataque: ${pokemon.stats[1].base_stat}</p>
                <p>Defensa: ${pokemon.stats[2].base_stat}</p>
            </div>
            <div class="detail-section">
                <h4>Altura / Peso</h4>
                <p>${(pokemon.height / 10).toFixed(1)} m / ${(pokemon.weight / 10).toFixed(1)} kg</p>
            </div>
        </div>
    `;
    
    detailContainer.appendChild(detailCard);
}

/**
 * Muestra mensajes de error en el contenedor correspondiente
 * @param {string} message - Mensaje de error a mostrar
 */
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 5000);
}

/**
 * Carga la página siguiente de pokémon
 */
async function loadNextPage() {
    currentOffset += limit;
    currentPage++;
    updatePageInfo();
    await loadPokemonList();
    
    // Habilitar botón anterior cuando estamos en página 2+
    prevBtn.disabled = false;
}

/**
 * Carga la página anterior de pokémon
 */
async function loadPrevPage() {
    currentOffset = Math.max(0, currentOffset - limit);
    currentPage = Math.max(1, currentPage - 1);
    updatePageInfo();
    await loadPokemonList();
    
    // Deshabilitar botón anterior si estamos en primera página
    prevBtn.disabled = currentOffset === 0;
}

/**
 * Actualiza el indicador de página
 */
function updatePageInfo() {
    pageInfo.textContent = `Página ${currentPage}`;
}

/**
 * Carga y muestra la lista de pokémon
 */
async function loadPokemonList() {
    try {
        const data = await fetchPokemonList(currentOffset, limit);
        displayPokemonList(data.results);
        
        // Actualizar estado de botones de paginación
        nextBtn.disabled = !data.next;
        prevBtn.disabled = !data.previous;
    } catch (error) {
        console.error('Error al cargar lista:', error);
    }
}

/**
 * Inicializa la aplicación
 */
function init() {
    // Cargar lista inicial de pokémon
    loadPokemonList();
    
    // Configurar eventos
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            showError('Por favor, ingresa un nombre o ID de Pokémon');
            return;
        }
        
        try {
            const pokemon = await fetchPokemonDetail(searchTerm);
            displayPokemonDetail(pokemon);
            
            // Mostrar sección de detalles y ocultar lista
            pokemonList.classList.add('hidden');
            pokemonDetail.classList.remove('hidden');
            
            // Limpiar input
            searchInput.value = '';
        } catch (error) {
            showError(`No se encontró ningún Pokémon con el nombre o ID: ${searchTerm}`);
        }
    });
    
    // Eventos para botones de paginación
    nextBtn.addEventListener('click', loadNextPage);
    prevBtn.addEventListener('click', loadPrevPage);
    
    // Evento para volver a la lista
    backToListBtn.addEventListener('click', () => {
        pokemonDetail.classList.add('hidden');
        pokemonList.classList.remove('hidden');
    });
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);