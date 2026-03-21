const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 👤 User schema
const User = mongoose.model("User", {
  balance: Number
});

// 🔗 Connect to MongoDB FIRST
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB connected");

  // ✅ Start server ONLY after DB connects
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("Server running on port " + process.env.PORT);
  });

})
.catch(err => {
  console.error("❌ MongoDB connection failed:");
  console.error(err);
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 👤 Register
app.get("/register", async (req, res) => {
  const user = new User({ balance: 1000 });
  await user.save();

  res.json({
    message: "User created",
    userId: user._id,
    balance: user.balance
  });
});

// 🎰 Spin
app.get("/spin", async (req, res) => {
  const { userId, bet } = req.query;
  const betAmount = parseInt(bet) || 10;

  const user = await User.findById(userId);
  if (!user) return res.json({ error: "Invalid userId" });

  if (betAmount > user.balance) {
    return res.json({
      error: "Not enough balance",
      balance: user.balance
    });
  }

  user.balance -= betAmount;

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

  const win = betAmount * multiplier;
  user.balance += win;

  await user.save();

  res.json({
    reels: [reel1, reel2, reel3],
    bet: betAmount,
    win,
    balance: user.balance
  });
});
