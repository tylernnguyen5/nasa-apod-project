// DOMs
const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader');

// NASA API
const count = 10;
const apiKey = "5dIbMbuH7IAAp19JeBF3lXNchHbWKQd9pqY5HZdK";
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
let favorites = {};

// ======================================================================================

// FUNCTIONS

// Update DOM depending on which page the user is visiting
function updateDOM(page) {
  if (localStorage.getItem('nasaFavorites')) {
    favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
  }

  imagesContainer.textContent = '';

  createDOMNodes(page);

  showContent(page);
}

// Showing content depending on the page when the data finishes fetching
function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' })

  if (page === 'results') {
    resultsNav.classList.remove('hidden');
    favoritesNav.classList.add('hidden');
  } else {
     resultsNav.classList.add('hidden');
     favoritesNav.classList.remove('hidden');
  }

  loader.classList.add('hidden');
}


// Create DOM Nodes
function createDOMNodes(page) {
  const currentArray = page === 'results' ? resultsArray : Object.values(favorites);

  currentArray.forEach(result => {
    const copyrightResult = result.copyright === undefined ? '' : result.copyright;

    let saveText = null, saveFunc = null;
    if (page === 'results') {
      saveText = 'Add to Favorites';
      saveFunc = `saveFavorite('${result.url}')`;
    } else {
      saveText = 'Remove Favorite';
      saveFunc = `removeFavorite('${result.url}')`;
    }

    const html = `
      <div class="card">
        <a href="${result.hdurl}" title="View Full Image" target="_blank"><img src="${result.url}" alt="NASA Picture of the Day" loading="lazy" class="card-img-top"></a>
        
        <div class="card-body">
          <h5 class="card-title">${result.title}</h5>
          <p class="clickable" onclick="${saveFunc}">${saveText}</p>

          <p>${result.explanation}</p>
          
          <small class="text-muted">
            <strong>${result.date}</strong><span> ${copyrightResult}</span>
          </small>
        </div>
      </div>
    `;

    // Adding nodes to the images container
    imagesContainer.insertAdjacentHTML('beforeend', html);
  });
}

// Get 10 images from NASA API for results page (by clicking Load More)
async function getNasaPictures() {
  // Show loader
  loader.classList.remove('hidden');

  try {
    const response = await fetch(apiUrl);
    resultsArray = await response.json();
    
    updateDOM('results');
  } catch (error) {
    console.log(error);
  }
}

// Save pictures to Favorites
function saveFavorite(itemUrl) {
  // Loop through Results Array to select Favorite
  resultsArray.forEach(item => {
    if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
      favorites[itemUrl] = item;

      // Display Save Confirmation for 2 seconds (at the lower right corner)
      saveConfirmed.hidden = false;
      setTimeout(() => {
        saveConfirmed.hidden = true;
      }, 2000)

      // Save to Local Storage
      localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    }
  })
}

// Remove an item from Favorites
function removeFavorite(itemUrl) {
  if (favorites[itemUrl]) {
    delete favorites[itemUrl];

    // Update Loca Storage
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));

    updateDOM('favorites');
  }
}

// ======================================================================================

// On Load
getNasaPictures();