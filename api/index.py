import os
import httpx
import dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, etc.
    allow_headers=["*"],  # Allows all headers
)

dotenv.load_dotenv()

@app.get("/api/get_countries")
async def get_countries():
    api_key = os.getenv("REST_COUNTRIES_API_KEY")
    offset = 0
    countries = []

    async with httpx.AsyncClient() as client:
        while True:
            response: httpx.Response = await client.get(
                    "https://api.restcountries.com/countries/v5",
                    params={
                        "limit": 100,
                        "memberships.un": 1,
                        "offset": offset,
                    },
                    headers={
                        "Authorization": f"Bearer {api_key}"
                    }
                )

            if not response.is_success:
                raise Exception(f"Response failed: {response.status_code} {response.text}")

            data = response.json()
            countries.extend(data["data"]["objects"])

            if data["data"]["meta"]["more"]:
                offset += 100
            else:
                break

    return countries
