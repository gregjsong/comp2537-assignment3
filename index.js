const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = [];
let selectedTypes = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  // set pagination range
  const rangeSize = 5;
  const pageRange = getPageRange(currentPage, numPages, rangeSize);
  const startPage = pageRange[0];
  const endPage = pageRange[pageRange.length - 1];


  // Prev button
  if (currentPage !== 1 && numPages !== 0) {
    $('#pagination').append(`<button class="btn btn-primary page ml-1 prevButton" value="${currentPage - 1}">Prev</button>`);
  }

  // pagination buttons
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }

  // Next button
  if (currentPage !== numPages && numPages !== 0) {
    $('#pagination').append(`<button class="btn btn-primary page ml-1 nextButton" value="${currentPage + 1}">Next</button>`);
  }

  // // highlight current page button
  var button = $('#pagination button[value="' + currentPage + '"]').first();
  console.log(button);
  button.removeClass('btn-primary').addClass('btn-outline-primary');
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // set num Cards
  $('#numCards').text(`Showing ${selected_pokemons.length} of ${pokemons.length} Pokemons`);

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}

const setup = async () => {
  // set up pokeTypes filter
  let pokeTypesBox = $('#pokeTypesFilter');
  pokeTypesBox.empty();
  let pokeTypesRes = await axios.get('https://pokeapi.co/api/v2/type/');

  const pokeTypes = pokeTypesRes.data.results;

  pokeTypes.forEach((obj) => {
    pokeTypesBox.append(`<input id="${obj.name}" class="typeFilter" type="checkbox" name="type" value="${obj.name}">`);
    pokeTypesBox.append(`<label for="${obj.name}">${obj.name}</label>`);
  });


  // test out poke api using axios here

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  var numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  paginate(currentPage, PAGE_SIZE, pokemons)
  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  })

  // // add event listener to Prev button
  $('body').on('click', ".prevButton", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, numPages);
  });

  // add event listener to Next button
  $('body').on('click', ".nextButton", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, numPages);
  });

  // add event listener to Types checkboxes
  $('body').on('change', '.typeFilter', async function () {
    var isChecked = $(this).is(':checked');
    var value = $(this).val();
  
    if (isChecked) {
      // set Types array
      selectedTypes.push(value);
      handleTypeInputs();
    } else {
      selectedTypes = selectedTypes.filter(function (el) {
        console.log(selectedTypes);
        return el !== value;
      });
      handleTypeInputs();
    }
  });
}


$(document).ready(setup)

/* Functions */
function getPageRange(currentPage, numPages, rangeSize) {
  var start = Math.max(1, currentPage - Math.floor(rangeSize / 2));
  var end = Math.min(start + rangeSize - 1, numPages);

  // Adjust start if range is not complete and numPages is greater than rangeSize
  if (numPages > rangeSize && end - start + 1 < rangeSize) {
    start = Math.max(1, end - rangeSize + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const getNumPages = () => {
  Math.ceil(pokemons.length / PAGE_SIZE) === 0 ? 1 : Math.ceil(pokemons.length / PAGE_SIZE);
}

const updatePokeCards = () => {
  currentPage = 1;
  numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  paginate(currentPage, PAGE_SIZE, pokemons);
  updatePaginationDiv(currentPage, numPages);
}

const handleTypeInputs = async () => {
  if (selectedTypes.length === 0) {
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    pokemons = response.data.results;
    updatePokeCards();
  } else if (selectedTypes.length === 1) {
    // fetch
    var response = await axios.get(`https://pokeapi.co/api/v2/type/${selectedTypes[0]}`);

    // replace old pokemons array
    var pokemonsArr = response.data.pokemon;
    pokemons = pokemonsArr.map((obj) => {
      return obj.pokemon;
    })
    // update
    updatePokeCards();
  } else if (selectedTypes.length === 2) {
    // fetch and format res
    var response = await axios.get(`https://pokeapi.co/api/v2/type/${selectedTypes[1]}`);
    var pokemonsArr = response.data.pokemon;
    pokemonsArr2 = pokemonsArr.map((obj) => {
      return obj.pokemon;
    });
    // filter pokemons for matching pokemon from second type array
    const commonPokemons = pokemons.filter((pokemon1) => {
      return pokemonsArr2.some((pokemon2)=> 
        pokemon2.name === pokemon1.name
      );
    });
    pokemons = commonPokemons;
    // update
    updatePokeCards();
  } else if (selectedTypes.length > 2) {
    pokemons = [];
    updatePokeCards();
  }
}