document.addEventListener('DOMContentLoaded', function () {
const searchBtn = document.getElementById('search-btn');
const mealList = document.querySelector('.meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const mealInformationCloseBtn = document.getElementById('mealInformation-close-btn');
const favMealPage = document.getElementById('fav-meal-page');
const favoritePageLink = document.querySelector('.favorite-page');
const favMealPageCloseBtn=document.getElementById('fav-meal-page-close-btn');
const favMealPageTitle=document.querySelector('.fav-meal-page-title');

// event listeners
// Load favorite meals from localStorage when the addFavoriteLink is clicked
favoritePageLink.addEventListener('click', loadFavoriteMeals);

// Add an event listener for the meal items in the favorite page (favMealPage)
favMealPage.addEventListener('click', handleFavoriteMealClick);
searchBtn.addEventListener('click', getMealList);

// Add an event listener for the meal items in the mealList (search result)
mealList.addEventListener('click', getMealInformation);
mealInformationCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showMealInformation');
});


favMealPageCloseBtn.addEventListener('click',()=>{
    favMealPageTitle.classList.add('hide-element');
    favMealPageCloseBtn.classList.add('hide-element');
    favoritePageLink.classList.remove('hide-element');
    favMealPage.classList.add('hide-element','display-none');
});



// get meal list that matches with the meal-name
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInputTxt}`)
    .then(response => response.json())
    .then(data => {
        let html = "";
        if(data.meals){
            data.meals.forEach(meal => {
                html += `
                    <div class = "meal-item" data-id = "${meal.idMeal}">
                        <div class = "meal-img">
                            <img src = "${meal.strMealThumb}" alt = "food">
                        </div>
                        <div class = "meal-name">
                            <h3>${meal.strMeal}</h3>
                        </div>
                        <div id="fav-btn"> 
                        <i class="fa-regular fa-heart"></i>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
        } else{
            html = "Sorry, we didn't find any meal!";
            mealList.classList.add('notFound');
        }

        mealList.innerHTML = html;
    });
}

// get detailed information about the meal
let favoriteMealIds = [];
function getMealInformation(e) {
    e.preventDefault();
    const mealItem = e.target.parentElement.parentElement;
    const id=mealItem.getAttribute('data-id');
    if(e.target.parentElement.parentElement.classList.contains('meal-item') && !e.target.classList.contains('fa-heart')){   
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(data => mealInformationModal(data.meals));
    }else if(e.target.classList.contains('fa-heart')){
        const isMealAlreadyAdded = Array.from(favMealPage.children).some(child => child.dataset.id === mealItem.dataset.id);
        if (!isMealAlreadyAdded) {
        const favMealIcon=mealItem.querySelector('.fa-heart');
        favMealIcon.style.color='red';
        const favoriteMealItem = mealItem.cloneNode(true);
        favoriteMealIds.push(id);
        const favoriteIcon = favoriteMealItem.querySelector('.fa-heart');
        favoriteIcon.style.visibility = 'hidden';

        const removeBtn = document.createElement('div');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => removeMealFromFavorites(id));
        favoriteMealItem.appendChild(removeBtn);
        favMealPage.appendChild(favoriteMealItem);
        alert("meal added to favourite List");
        saveFavoriteMeals(); 
      }else{
        const index = favoriteMealIds.indexOf(id);
        if (index !== -1) {
            favoriteMealIds.splice(index, 1);
            removeMealFromFavorites(id);
        }
      }
    }
}

// Save the favorite meals to localStorage
function saveFavoriteMeals() {
    const favoriteMeals = Array.from(favMealPage.children).map(child => child.outerHTML);
    sessionStorage.setItem('favoriteMeals', JSON.stringify(favoriteMeals));
}

// Remove meal from favorites page
// function removeMealFromFavorites(favoriteMealItem) {
//     console.log("remove");
//     console.log("favMealItem",favoriteMealItem);
//     favMealPage.removeChild(favoriteMealItem);
//     saveFavoriteMeals();
// }
function removeMealFromFavorites(id) {
    const mealItemToRemove = favMealPage.querySelector(`[data-id="${id}"]`);
    const isMealItemInMealList = Array.from(mealList.children).some(child => child.dataset.id === id);
    if(isMealItemInMealList){
    const mealItemOfMealList=mealList.querySelector(`[data-id="${id}"]`);
    const favMealIcon=mealItemOfMealList.querySelector('.fa-heart');
    favMealIcon.style.color='black';
    }
    if (mealItemToRemove) {
        favMealPage.removeChild(mealItemToRemove);
        saveFavoriteMeals();
    }
}

// Load favorite meals from localStorage and display them
function loadFavoriteMeals() {
    favMealPageTitle.classList.remove('hide-element');
    favMealPage.classList.remove('hide-element','display-none');
    favoritePageLink.classList.add('hide-element');
    favMealPageCloseBtn.classList.remove('hide-element');
    const favoriteMeals = JSON.parse(sessionStorage.getItem('favoriteMeals')) || [];

    // Clear the existing content before loading
    favMealPage.innerHTML = '';
    favoriteMeals.forEach(mealHTML => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mealHTML;
        const favoriteMealItem = tempDiv.firstChild;
        // Add event listener to the new remove button
        const removeBtn = favoriteMealItem.querySelector('.remove-btn');
        if(removeBtn){
        // removeBtn.addEventListener('click', () => removeMealFromFavorites(favoriteMealItem));}
        removeBtn.addEventListener('click', () => {
            const id = favoriteMealItem.getAttribute('data-id');
            removeMealFromFavorites(id);
        });}
        favMealPage.appendChild(favoriteMealItem);
    });
}

// // Function to handle clicks on meal items in the favorite page
// function handleFavoriteMealClick(e) {
//     e.preventDefault();
//     const mealItem = e.target.closest('.meal-item'); // Use closest to get the parent meal item
//     if (mealItem) {
//         const id = mealItem.getAttribute('data-id');
//         const isRemoveBtnClicked = e.target.classList.contains('remove-btn');
//         if (!isRemoveBtnClicked) {
//             console.log("not remove");
//             // If the heart icon is clicked, show the meal information
//             fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
//                 .then(response => response.json())
//                 .then(data => mealInformationModal(data.meals));
//         } else {
//             // If the remove button is clicked, remove the meal from favorites
//             console.log('remove');
//             removeMealFromFavorites(id);
//         }
//     }
// }

// Function to handle clicks on meal items in the favorite page
function handleFavoriteMealClick(e) {
    e.preventDefault();
    const removeBtn = e.target.closest('.remove-btn');
    if (removeBtn) {
        // If the remove button is clicked, remove the meal from favorites
        const mealItem = removeBtn.closest('.meal-item');
        if (mealItem) {
            const id = mealItem.getAttribute('data-id');
            removeMealFromFavorites(id);
        }
    } else {
        // If the heart icon is clicked, show the meal information
        const mealItem = e.target.closest('.meal-item');
        if (mealItem && !e.target.classList.contains('fa-heart')) {
            const id = mealItem.getAttribute('data-id');
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                .then(response => response.json())
                .then(data => mealInformationModal(data.meals));
        }
    }
}


function mealInformationModal(meal){
    console.log(meal);
    meal = meal[0];
    let html = `
        <h2 class = "mealInformation-title">${meal.strMeal}</h2>
        <p class = "mealInformation-category">${meal.strCategory}</p>
        <div class = "mealInformation-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "mealInformation-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "mealInformation-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showMealInformation');
}
});


