// GLOBALS ##########################################################################
var ATTEMPTS = 0
var CORRECT_COUNTRY = ""
const HINT_TYPES = {
    "HARD": ["DRIVING-SIDE",         // HARD hints give away the least info
        "LANDLOCKED",
        "CONTINENT",
        "AREA",
        "G20",
        "CURRENCY"],
    "MEDIUM": [
        "BORDERS-3",
        "COUNTRY-FIRST-LETTER",
        "LANGUAGES",
        "POPULATION",
        "GOVERNMENT-TYPE",
        "CAPITAL-FIRST-LETTER"],
    "EASY": [                        // EASY hints give away the most info
        "FLAG-DESC",
        "CAPITAL",
        "ALL-BORDERS"]
}
let USED_HINTS = []

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

    if (country_name === CORRECT_COUNTRY) {
        handleCorrectAnswer();
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

    add_hint(CORRECT_COUNTRY, ATTEMPTS)

}
function handleCorrectAnswer() {
    const alertText = document.getElementById("alert")
    alertText.textContent = "You got the correct country!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    // TODO: Implement correct answer logic
}

function getSanitizedDescription(countryName) {
    const countryData = JSON.parse(localStorage.getItem("countryData"))[countryName];
    if (!countryData) return null;

    // Combine all names into a single array cuz description name format is inconsistently weird
    const names = [
        ...(countryData.names.alternates || []),
        countryData.names.official,
        countryData.names.common,
    ].filter(Boolean);

    let description = countryData.flag.description;

    for (const name of names) {
        description = description.replaceAll(name, "this country");
    }

    return description;
}

function get_hint_text(country_name, hint_type) {
    const country_info = JSON.parse(localStorage.getItem("countryData"))[country_name]

    switch (hint_type) {
        case "DRIVING-SIDE": {
            return `This country drives on the ${country_info.cars.driving_side}`;
        }
        case "LANDLOCKED": {
            if (country_info.landlocked == true) {
                return "This country is landlocked."
            }
            else {
                return "This country is not landlocked."
            }
        }
        case "CONTINENT": {
            const continent = country_info.continents[0]
            // To handle continents like Americas
            if (continent[-1] == "s") {
                return `This country is in the continent of the ${continent}`
            }
            else {
                return `This country is in the continent of ${continent}`
            }
        }
        case "AREA": {
            const km_area = country_info.area.kilometers
            const m_area = country_info.area.miles
            return `This country has an area of ${km_area.toLocaleString()} km² (${m_area.toLocaleString()} miles²)`
        }
        case "G20": {
            if (country_info.memberships["g20"] == true) {
                return "This country is an induvidual member of the G20."
            }
            else {
                return "This country is not an individual member of the G20."
            }
        }
        case "CURRENCY": {
            return `This country's currency symbol is ${country_info.currencies[0].symbol}`
        }
        case "BORDERS-3": {
            const all_borders_codes = country_info.borders || [];
            if (all_borders_codes.length === 0) {
                return "This country doesn't border any other country.";
            }

            const all_borders_names = []
            all_borders_codes.forEach((code) => {
                all_borders_names.push(ISO3_COUNTRIES[code])
            })

            const selected_borders = [...all_borders_names]
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            if (selected_borders.length >= 3) {
                return `3 countries this country borders are: ${selected_borders[0]}, ${selected_borders[1]}, and ${selected_borders[2]}.`;
            } else if (selected_borders.length === 2) {
                return `This country borders ${selected_borders[0]} and ${selected_borders[1]}.`;
            } else {
                return `This country borders ${selected_borders[0]}.`;
            }
        }
        case "COUNTRY-FIRST-LETTER": {
            return `The first letter of this country is ${country_name[0]}`
        }
        case "LANGUAGES": {
            const languages = [];
            country_info.languages.forEach((langObj) => {
                languages.push(langObj.name);
            });

            const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
            const formatted = formatter.format(languages);

            return `This country speaks ${formatted}.`
        }
        case "POPULATION": {
            return `This country has a population of ${country_info.population.toLocaleString()}`
        }
        case "GOVERNMENT-TYPE": {
            return `This country's government type is ${country_info.government_type}`
        }
        case "CAPITAL-FIRST-LETTER": {
            const capitals = country_info.capitals
            var capital = ""
            capitals.forEach((cap) => {
                if (cap.attributes.primary == true) {
                    capital = cap.name
                }
            })

            if (capital) {
                return `The first letter of this country's primary capital is ${capital[0]}`
            }
            else {
                return `This country does not have a primary capital.`
            }
        }
        case "FLAG-DESC": {
            return getSanitizedDescription(country_name)
        }
        case "CAPITAL": {
            const capitals = country_info.capitals
            var capital = ""
            capitals.forEach((cap) => {
                if (cap.attributes.primary == true) {
                    capital = cap.name
                }
            })

            if (capital) {
                return `This country's primary capital is ${capital}`
            }
            else {
                return `This country does not have a primary capital.`
            }
        }
        case "ALL-BORDERS": {
            const all_borders_codes = country_info.borders || [];
            if (all_borders_codes.length === 0) {
                return "This country doesn't border any other country.";
            }

            const all_borders_names = []
            all_borders_codes.forEach((code) => {
                if (ISO3_COUNTRIES[code]) { all_borders_names.push(ISO3_COUNTRIES[code]) } else { console.log(code) }
            })

            const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
            const formatted = formatter.format(all_borders_names);
            const label = all_borders_names.length === 1 ? "country" : "countries";

            return `This country borders ${all_borders_names.length} ${label}: ${formatted}.`;
        }
        default: {
            return `${hint_type} NOT IMPLEMENTED !!!!!!!!!!!!!!!!!!!!!!!!!`
        }
    }
}

function generate_hints(country_name) {
    var generated = {}
    Object.entries(HINT_TYPES).forEach((difficulty) => {
        generated[difficulty[0]] = {}
        difficulty[1].forEach((hint_type) => {
            if (!USED_HINTS.includes(hint_type)) {
                generated[difficulty[0]][hint_type] = get_hint_text(country_name, hint_type)
            }
            else {
                // Hint already used so dont add it to possible hints
            }
        })
    })

    return generated;
}

function add_hint(country_name, hint_number, hint_type) {
    const hintDiv = document.getElementById(`hint-${hint_number}`)
    const hintTag = document.getElementById(`hint-${hint_number}-tag`)
    const hintContent = document.getElementById(`hint-${hint_number}-content`)

    try {
        hintDiv.className = "hint" // No longer locked
    }
    catch { TypeError } {
        // When on last attempt, no hint #6 so need to catch that error.
    }

    if (hint_type) {
        hintContent.textContent = get_hint_text(country_name, hint_type)
        return;
    }

    const possible_hints = generate_hints(country_name)

    if ([1, 2].includes(hint_number)) {
        const selected_hints = Object.values(possible_hints["HARD"])
        const selected_idx = Math.floor(Math.random() * selected_hints.length)
        const selected_hint_type = Object.keys(possible_hints["HARD"])[selected_idx]
        hintContent.textContent = selected_hints[selected_idx];

        USED_HINTS.push(selected_hint_type)
    }
    if ([3, 4].includes(hint_number)) {
        const selected_hints = Object.values(possible_hints["MEDIUM"])
        const selected_idx = Math.floor(Math.random() * selected_hints.length)
        const selected_hint_type = Object.keys(possible_hints["MEDIUM"])[selected_idx]
        hintContent.textContent = selected_hints[selected_idx];

        USED_HINTS.push(selected_hint_type)
    }
    if ([5].includes(hint_number)) {
        const selected_hints = Object.values(possible_hints["EASY"])
        const selected_idx = Math.floor(Math.random() * selected_hints.length)
        const selected_hint_type = Object.keys(possible_hints["EASY"])[selected_idx]
        hintContent.textContent = selected_hints[selected_idx];

        USED_HINTS.push(selected_hint_type)
    }
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
    }

})

// MAIN #############################################################################
async function init() {
    await save_countries_to_local()
    update_countries_datalist()
    set_correct_country()

    console.log(CORRECT_COUNTRY)
    console.log(JSON.parse(localStorage.getItem("countryData"))[CORRECT_COUNTRY])
}

init()




