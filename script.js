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
        countries = get_all_countries_by_country()

        localStorage.setItem("countryData", countries)
    }
    else {
        console.log("Country data already in localstorage")
    }

}

save_countries_to_local()