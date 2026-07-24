import json
import requests

API_URL = "https://api.restcountries.com/countries/v5"
API_KEY = "rc_live_099090cf2fae47b6acb54a54720d0d53"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

countries = []
offset = 0
limit = 100

while True:
    response = requests.get(
        API_URL,
        headers=headers,
        params={
            "limit": limit,
            "offset": offset
        }
    )

    response.raise_for_status()

    data = response.json()["data"]

    page = data["objects"]
    countries.extend(page)

    print(f"Downloaded {len(countries)}/{data['meta']['total']} countries")

    if not data["meta"]["more"]:
        break

    offset += limit

# Keep only full UN member states
un_countries = [
    country
    for country in countries
    if country.get("memberships", {}).get("un") is True
]

with open("country_data.json", "w", encoding="utf-8") as file:
    json.dump(un_countries, file, indent=4, ensure_ascii=False)

print(f"\nSaved {len(un_countries)} UN countries to country_data.json")