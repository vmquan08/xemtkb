import requests
import json

url = "https://thptbencat.edu.vn/category/thoi-khoa-bieu" 
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://thptbencat.edu.vn/"
}

res = requests.get(url, headers=headers)
text = res.text

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(text, f, ensure_ascii=False, indent=2)
