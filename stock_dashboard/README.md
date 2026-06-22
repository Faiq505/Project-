# Stock Price Analysis Dashboard
**OSSD Semester Project**  
Student: Fayeeque Haider | ID: F2024105059

---

## Features
- 🔍 Search any stock by symbol (AAPL, TSLA, MSFT, etc.)
- 📈 View real-time price, change, and market status
- 📊 1-Month historical price chart
- ⚖️ Compare up to 4 stocks side by side (normalized % chart)
- 🔥 Trending stocks panel (AAPL, MSFT, GOOGL, AMZN, TSLA)
- ⏰ Live clock display
- Dark themed, responsive UI

---

## How to Run

### Step 1 — Install Python
Make sure Python 3.8+ is installed. Check with:
```
python --version
```

### Step 2 — Open in VS Code
Open the `stock_dashboard` folder in VS Code.

### Step 3 — Open the Terminal in VS Code
`Terminal → New Terminal`

### Step 4 — Install Flask
```
pip install flask
```

### Step 5 — Run the App
```
python app.py
```

### Step 6 — Open in Browser
Go to: **http://127.0.0.1:5000**

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Frontend | HTML, CSS, JavaScript |
| Charts | Chart.js (CDN) |
| Data | Yahoo Finance API (free, no key needed) |
| Version Control | Git / GitHub |

---

## Project Structure
```
stock_dashboard/
├── app.py              # Flask backend
├── requirements.txt    # Dependencies
├── README.md
├── templates/
│   └── index.html      # Main page
└── static/
    ├── css/
    │   └── style.css   # Styling
    └── js/
        └── main.js     # Frontend logic
```

---

> **Note:** Requires an internet connection to fetch live stock data from Yahoo Finance.
