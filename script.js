// GLOBALS ##########################################################################
var ATTEMPTS = 0
var CORRECT_COUNTRY = ""

// DOM ELEMENTS #####################################################################
const guessInput = document.getElementById("country-input")
const submitBtn = document.getElementById("submit-btn")
const attemptsText = document.getElementById("current-attempts")

// FUNCTIONS ########################################################################
async function get_all_countries() {
    var offset = 0;
    var countries = [];

    while (true) {
        const response = await fetch(
            `https://api.restcountries.com/countries/v5?limit=100&memberships.un=1&offset=${offset}`,
            { headers: { 'Authorization': 'Bearer rc_live_099090cf2fae47b6acb54a54720d0d53' } }
        );

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        countries = countries.concat(data.data.objects);

        if (data.data.meta.more === false) {
            break;
        } else {
            offset += 100;
        }
    }

    return countries;
}

async function get_all_countries_by_country() {
    const countries = await get_all_countries();
    let byCountry = {};

    for (let i = 0; i < countries.length; i++) {
        byCountry[countries[i].names.common] = countries[i]
    }

    console.log(byCountry)

    return byCountry
}

async function save_countries_to_local() {
    if (!localStorage.getItem("countryData")) {
        countries = await get_all_countries_by_country()

        localStorage.setItem("countryData", JSON.stringify(countries))
    }
    else {
        console.log("Country data already in localstorage")
    }

}

function update_countries_datalist() {
    const countries = Object.keys(JSON.parse(localStorage.getItem("countryData")))
    const datalist = document.getElementById('countries');

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        datalist.appendChild(option);
    })


}

function set_correct_country() {
    const countries = Object.keys(JSON.parse(localStorage.getItem("countryData")));
    const selected_country_idx = Math.floor(Math.random() * countries.length);
    CORRECT_COUNTRY = countries[selected_country_idx];
}

function add_guess(country_name) {
    const alertText = document.getElementById("alert")

    const countries = Object.keys(JSON.parse(localStorage.getItem("countryData")));
    if (!countries.includes(country_name)) {
        console.log(`${country_name} is not a country!`)
        alertText.textContent = "Not a valid country."
        return;
    }

    const placeholder = document.getElementById("guess-placeholder-container")
    if (placeholder != null) {
        placeholder.remove();
    }

    const guessesStack = document.getElementById("guesses-stack")
    const flagUrl = JSON.parse(localStorage.getItem("countryData"))[country_name].flag.url_png
    const guessHTML = `
    <div class="guess wrong">
      <img src="${flagUrl}" alt="${country_name} flag" style="width: 10%;">
      <span>${country_name}</span>
    </div>
  `;
    guessesStack.insertAdjacentHTML('beforeend', guessHTML);

    ATTEMPTS += 1
    attemptsText.textContent = ATTEMPTS

}

// EVENT LISTENERS ##################################################################
submitBtn.addEventListener("click", () => {
    add_guess(guessInput.value)
    guessInput.value = ""

})

guessInput.addEventListener("keyup", (event) => {
    if (event.key == "Enter") {
        add_guess(guessInput.value)
        guessInput.value = ""
        ATTEMPTS += 1
        attemptsText.value = ATTEMPTS
    }

})

// MAIN #############################################################################

save_countries_to_local()
update_countries_datalist()
set_correct_country()

console.log(CORRECT_COUNTRY)

console.log(JSON.parse(localStorage.getItem("countryData"))["Canada"])



