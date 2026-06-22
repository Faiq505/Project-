let priceChartInstance = null;
let compareChartInstance = null;

// ── Clock ──────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString("en-US", { hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

// ── Toast ──────────────────────────────────────────────
function showToast(msg, duration = 3000) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
}

// ── Search ─────────────────────────────────────────────
function searchStock() {
    const val = document.getElementById("searchInput").value.trim().toUpperCase();
    if (!val) { showToast("Please enter a stock symbol."); return; }
    loadStock(val);
}

document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") searchStock();
});

// ── Load Stock ─────────────────────────────────────────
async function loadStock(symbol) {
    document.getElementById("searchInput").value = symbol;
    showToast(`Fetching ${symbol}...`);

    try {
        const res = await fetch(`/api/stock/${symbol}`);
        const data = await res.json();

        if (data.error) { showToast(`Error: ${data.error}`); return; }

        // Card
        document.getElementById("cardSymbol").textContent = data.symbol;
        document.getElementById("cardName").textContent = data.name;
        document.getElementById("cardPrice").textContent = `${data.currency} ${data.price.toLocaleString()}`;
        document.getElementById("metaPrev").textContent = data.prev_close;
        document.getElementById("metaCurrency").textContent = data.currency;
        document.getElementById("metaMarket").textContent = data.market_state;

        const changeEl = document.getElementById("cardChange");
        changeEl.textContent = `${data.change >= 0 ? "▲" : "▼"} ${Math.abs(data.change)} (${Math.abs(data.change_pct)}%)`;
        changeEl.className = "stock-change " + (data.change >= 0 ? "change-up" : "change-down");

        document.getElementById("stockCardSection").style.display = "block";
        document.getElementById("chartSection").style.display = "block";
        document.getElementById("chartTitle").textContent = `${data.symbol} - Price History (1 Month)`;

        // Chart
        drawPriceChart(data.history, data.symbol);

    } catch (err) {
        showToast("Failed to fetch stock data. Check your internet connection.");
    }
}

// ── Price Chart ────────────────────────────────────────
function drawPriceChart(history, symbol) {
    const labels = history.map(h => h.date);
    const prices = history.map(h => h.close);
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (priceChartInstance) priceChartInstance.destroy();

    const isUp = prices[prices.length - 1] >= prices[0];
    const color = isUp ? "#3fb950" : "#f85149";

    priceChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: `${symbol} Close Price`,
                data: prices,
                borderColor: color,
                backgroundColor: color + "22",
                borderWidth: 2,
                pointRadius: 3,
                fill: true,
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: "#8b949e" } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` $${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: { ticks: { color: "#8b949e", maxTicksLimit: 8 }, grid: { color: "#21262d" } },
                y: { ticks: { color: "#8b949e", callback: v => "$" + v }, grid: { color: "#21262d" } }
            }
        }
    });
}

// ── Compare ────────────────────────────────────────────
async function compareStocks() {
    const syms = ["cmp1", "cmp2", "cmp3", "cmp4"]
        .map(id => document.getElementById(id).value.trim().toUpperCase())
        .filter(Boolean);

    if (syms.length < 2) { showToast("Enter at least 2 symbols to compare."); return; }

    showToast("Comparing stocks...");
    try {
        const res = await fetch(`/api/compare?symbols=${syms.join(",")}`);
        const stocks = await res.json();

        if (!stocks.length) { showToast("No valid stocks found."); return; }

        // Cards
        const resultDiv = document.getElementById("compareResult");
        resultDiv.innerHTML = stocks.map(s => `
            <div class="compare-card" onclick="loadStock('${s.symbol}')">
                <div class="sym">${s.symbol}</div>
                <div class="nm">${s.name}</div>
                <div class="pr">${s.currency} ${s.price.toLocaleString()}</div>
                <div class="ch ${s.change >= 0 ? "change-up" : "change-down"}">
                    ${s.change >= 0 ? "▲" : "▼"} ${Math.abs(s.change)} (${Math.abs(s.change_pct)}%)
                </div>
            </div>
        `).join("");

        // Compare chart
        document.getElementById("compareChartCard").style.display = "block";
        drawCompareChart(stocks);

    } catch (err) {
        showToast("Failed to compare stocks.");
    }
}

function drawCompareChart(stocks) {
    const colors = ["#3fb950", "#58a6ff", "#d29922", "#f85149"];
    const ctx = document.getElementById("compareChart").getContext("2d");

    if (compareChartInstance) compareChartInstance.destroy();

    // Normalize to % change from first day for fair comparison
    const datasets = stocks.map((s, i) => {
        const base = s.history[0]?.close || 1;
        return {
            label: s.symbol,
            data: s.history.map(h => ({ x: h.date, y: parseFloat(((h.close - base) / base * 100).toFixed(2)) })),
            borderColor: colors[i],
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3,
        };
    });

    compareChartInstance = new Chart(ctx, {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            parsing: false,
            plugins: {
                legend: { labels: { color: "#8b949e" } },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y > 0 ? "+" : ""}${ctx.parsed.y}%` }
                }
            },
            scales: {
                x: { type: "category", ticks: { color: "#8b949e", maxTicksLimit: 8 }, grid: { color: "#21262d" } },
                y: {
                    ticks: { color: "#8b949e", callback: v => v + "%" },
                    grid: { color: "#21262d" },
                    title: { display: true, text: "% Change from Start", color: "#8b949e" }
                }
            }
        }
    });
}

// ── Trending ───────────────────────────────────────────
async function loadTrending() {
    try {
        const res = await fetch("/api/trending");
        const stocks = await res.json();
        const list = document.getElementById("trendingList");

        if (!stocks.length) {
            list.innerHTML = "<div class='loading'>Could not load trending stocks.</div>";
            return;
        }

        list.innerHTML = stocks.map(s => `
            <div class="trend-card" onclick="loadStock('${s.symbol}')">
                <div class="t-sym">${s.symbol}</div>
                <div class="t-nm">${s.name}</div>
                <div class="t-pr">$${s.price.toLocaleString()}</div>
                <div class="t-ch ${s.change >= 0 ? "change-up" : "change-down"}">
                    ${s.change >= 0 ? "▲" : "▼"} ${Math.abs(s.change)} (${Math.abs(s.change_pct)}%)
                </div>
            </div>
        `).join("");
    } catch {
        document.getElementById("trendingList").innerHTML = "<div class='loading'>Could not load data.</div>";
    }
}

// Init
loadTrending();
