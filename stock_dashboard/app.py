from flask import Flask, render_template, jsonify, request
import urllib.request
import urllib.parse
import json
import random
from datetime import datetime, timedelta

app = Flask(__name__)

# Using Yahoo Finance unofficial API (free, no key needed)
def fetch_stock_data(symbol):
    """Fetch real-time stock data using Yahoo Finance"""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1mo"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        result = data["chart"]["result"][0]
        meta = result["meta"]
        timestamps = result["timestamp"]
        closes = result["indicators"]["quote"][0]["close"]
        opens = result["indicators"]["quote"][0].get("open", [])
        highs = result["indicators"]["quote"][0].get("high", [])
        lows = result["indicators"]["quote"][0].get("low", [])
        volumes = result["indicators"]["quote"][0].get("volume", [])

        history = []
        for i in range(len(timestamps)):
            if closes[i] is not None:
                history.append({
                    "date": datetime.fromtimestamp(timestamps[i]).strftime("%Y-%m-%d"),
                    "close": round(closes[i], 2),
                    "open": round(opens[i], 2) if opens and opens[i] else None,
                    "high": round(highs[i], 2) if highs and highs[i] else None,
                    "low": round(lows[i], 2) if lows and lows[i] else None,
                    "volume": volumes[i] if volumes and volumes[i] else None,
                })

        current_price = meta.get("regularMarketPrice", 0)
        prev_close = meta.get("chartPreviousClose", meta.get("previousClose", current_price))
        change = round(current_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

        return {
            "symbol": symbol.upper(),
            "name": meta.get("shortName", symbol.upper()),
            "price": round(current_price, 2),
            "prev_close": round(prev_close, 2),
            "change": change,
            "change_pct": change_pct,
            "currency": meta.get("currency", "USD"),
            "market_state": meta.get("marketState", "CLOSED"),
            "history": history,
            "error": None
        }
    except Exception as e:
        return {"error": str(e), "symbol": symbol.upper()}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/stock/<symbol>")
def get_stock(symbol):
    data = fetch_stock_data(symbol.upper())
    return jsonify(data)


@app.route("/api/compare")
def compare_stocks():
    symbols = request.args.get("symbols", "").split(",")
    symbols = [s.strip().upper() for s in symbols if s.strip()][:4]  # max 4
    results = []
    for sym in symbols:
        data = fetch_stock_data(sym)
        if not data.get("error"):
            results.append(data)
    return jsonify(results)


@app.route("/api/trending")
def trending():
    popular = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
    results = []
    for sym in popular:
        data = fetch_stock_data(sym)
        if not data.get("error"):
            results.append({
                "symbol": data["symbol"],
                "name": data["name"],
                "price": data["price"],
                "change": data["change"],
                "change_pct": data["change_pct"],
            })
    return jsonify(results)


if __name__ == "__main__":
    print("=" * 50)
    print("  Stock Price Analysis Dashboard")
    print("  Open http://127.0.0.1:5000 in your browser")
    print("=" * 50)
    app.run(debug=True)
