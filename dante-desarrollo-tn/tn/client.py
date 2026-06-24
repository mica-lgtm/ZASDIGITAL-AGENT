import time
import requests

USER_AGENT = "Dante (mica@zasdigital.com)"


class TiendaNubeClient:
    BASE = "https://api.tiendanube.com/v1"

    def __init__(self, store_id, token, user_agent=USER_AGENT, max_retries=3, timeout=30):
        self.store_id = str(store_id)
        self.token = token
        self.user_agent = user_agent
        self.max_retries = max_retries
        self.timeout = timeout

    def _headers(self):
        return {
            "Authentication": f"bearer {self.token}",
            "User-Agent": self.user_agent,
            "Content-Type": "application/json",
        }

    def _url(self, path):
        return f"{self.BASE}/{self.store_id}/{path.lstrip('/')}"

    def _request(self, method, url, **kwargs):
        for intento in range(self.max_retries + 1):
            resp = requests.request(
                method, url, headers=self._headers(), timeout=self.timeout, **kwargs
            )
            if resp.status_code != 429 or intento == self.max_retries:
                resp.raise_for_status()
                return resp
            time.sleep(float(resp.headers.get("Retry-After", 1)))

    def get(self, path, params=None):
        return self._request("GET", self._url(path), params=params).json()

    def get_all(self, path, params=None):
        items = []
        url = self._url(path)
        while url:
            resp = self._request("GET", url, params=params)
            params = None
            items.extend(resp.json())
            url = resp.links.get("next", {}).get("url")
        return items

    def post(self, path, json):
        return self._request("POST", self._url(path), json=json).json()

    def put(self, path, json):
        return self._request("PUT", self._url(path), json=json).json()

    def delete(self, path):
        resp = self._request("DELETE", self._url(path))
        return resp.status_code in (200, 204)
