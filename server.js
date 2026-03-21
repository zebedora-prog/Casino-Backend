const express = require("express");
const app = express();

let playerBalance = 1000;

// Base route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Spin route
app.get("/spin", (req, res) => {
  const bet = parseInt(req.query.bet) || 10;

  if (bet > playerBalance) {
    return res.json({
      error: "Not enough balance",
      balance: playerBalance
    });
  }

  playerBalance -= bet;

  const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];

  const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

  const result = [reel1, reel2, reel3];

  let multiplier = 0;

  if (reel1 === reel2 && reel2 === reel3) {
    switch (reel1) {
      case "🍒": multiplier = 2; break;
      case "🍋": multiplier = 3; break;
      case "🔔": multiplier = 5; break;
      case "💎": multiplier = 10; break;
      case "7️⃣": multiplier = 50; break;
    }
  }

  const win = bet * multiplier;
  playerBalance += win;

  res.json({
    reels: result,
    bet: bet,
    win: win,
    balance: playerBalance
  });
});

// 🚨 REQUIRED for Railway
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
