const express = require("express");
const app = express();

app.use(express.json());

// 🧠 In-memory user storage
let users = {};
let nextUserId = 1;

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 👤 Register user
app.get("/register", (req, res) => {
  const userId = nextUserId++;
  users[userId] = {
    balance: 1000
  };

  res.json({
    message: "User created",
    userId: userId,
    balance: users[userId].balance
  });
});

// 🎰 Spin
app.get("/spin", (req, res) => {
  const userId = req.query.userId;
  const bet = parseInt(req.query.bet) || 10;

  if (!users[userId]) {
    return res.json({ error: "Invalid userId" });
  }

  if (bet > users[userId].balance) {
    return res.json({
      error: "Not enough balance",
      balance: users[userId].balance
    });
  }

  users[userId].balance -= bet;

  const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];

  const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

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
  users[userId].balance += win;

  res.json({
    reels: [reel1, reel2, reel3],
    bet,
    win,
    balance: users[userId].balance
  });
});

// 🚨 Required for Railway
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
