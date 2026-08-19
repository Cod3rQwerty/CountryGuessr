import os
import httpx
import dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded,
                           _rate_limit_exceeded_handler) # type: ignore


dotenv.load_dotenv()

@app.get("/api/get_countries")
@limiter.limit("5/minute")
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
