import os
from dotenv import load_dotenv
import requests
from typing import Optional, Dict, Any
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("API_KEY")
API_URL = os.getenv("API_URL")

class APIError(Exception):
    pass

class Api:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
        self.headers = {
            "x-api-key": self.api_key,
            "user-agent": "TIG API"
        }

    def get(self, path: str) -> Any:
        response = requests.get(f"{self.api_url}/{path}", headers=self.headers)
        if response.status_code != 200:
            raise APIError(f"Failed to get data: {response.text}")
        return response.json()

    def post(self, path: str, body: Dict[str, Any]) -> Any:
        response = requests.post(f"{self.api_url}/{path}", json=body, headers=self.headers)
        if response.status_code != 200:
            raise APIError(f"Failed to post data: {response.text}")
        return response.json()

    def get_challenges(self, block_id: str) -> Any:
        return self.get(f"get-challenges?block_id={block_id}")

    def get_algorithms(self, block_id: str) -> Any:
        return self.get(f"get-algorithms?block_id={block_id}")

    def get_players(self, block_id: str, player_type: str) -> Any:
        return self.get(f"get-players?block_id={block_id}&player_type={player_type}")

    def get_benchmarks(self, block_id: str, player_id: str) -> Any:
        return self.get(f"get-benchmarks?block_id={block_id}&player_id={player_id}")

    def get_benchmark_data(self, benchmark_id: str) -> Any:
        return self.get(f"get-benchmark-data?benchmark_id={benchmark_id}")

    def get_block(self, id: Optional[str] = None, height: Optional[int] = None, round: Optional[int] = None) -> Any:
        params = []
        if id:
            params.append(f"id={id}")
        if height:
            params.append(f"height={height}")
        if round:
            params.append(f"round={round}")
        query_string = "&".join(params)
        return self.get(f"get-block?{query_string}")

    def submit_algorithm(self, req: Dict[str, Any]) -> Any:
        return self.post("submit-algorithm", req)

    def submit_benchmark(self, req: Dict[str, Any]) -> Any:
        return self.post("submit-benchmark", req)

    def submit_proof(self, req: Dict[str, Any]) -> Any:
        return self.post("submit-proof", req)

# Example usage:
if __name__ == "__main__":
    api = Api(API_URL, API_KEY)
    try:
        challenges = api.get_challenges("some_block_id")
        print(challenges)
    except APIError as e:
        print(f"API Error: {e}")
