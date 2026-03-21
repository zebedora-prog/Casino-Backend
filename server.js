const express = require("express");
const app = express();

// ✅ Base route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🎰 ADD THIS HERE (same file)
app.get("/spin", (req, res) => {
  const symbols = ["🍒", "🍋", "🔔", "💎", "7️⃣"];

  const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

  const result = [reel1, reel2, reel3];

  let win = 0;

  if (reel1 === reel2 && reel2 === reel3) {
    switch (reel1) {
      case "🍒": win = 10; break;
      case "🍋": win = 20; break;
      case "🔔": win = 50; break;
      case "💎": win = 100; break;
      case "7️⃣": win = 500; break;
    }
  }

  res.json({
    reels: result,
    win: win
  });
});

// 🚨 Keep this at the bottom
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
