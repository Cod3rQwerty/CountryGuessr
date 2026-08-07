import requests
import os

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter

load_dotenv()

app = FastAPI()
router = APIRouter()

@router.get("/get_countries/")
def get_all_countries():
    offset = 0
    countries = []
    api_key = os.getenv("RC_API_KEY")
    headers = {
        'Authorization': f'Bearer {api_key}'
    }

    while True:
        url = f"https://api.restcountries.com/countries/v5?limit=100&memberships.un=1&offset={offset}"
        response = requests.get(url, headers=headers)
        
        response.raise_for_status()

        data = response.json()

        countries.extend(data["data"]["objects"])

        if data["data"]["meta"]["more"] is False:
            break
        else:
            offset += 100

    return countries

app.include_router(router)

if __name__ == '__main__':
    data = get_all_countries()
    print(len(data))