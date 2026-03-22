const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 👤 User Schema
const User = mongoose.model("User", {
  username: String,
  balance: Number
});

// 🎰 Slot Machines
const machines = {
  basic: {
    symbols: ["🍒", "🍋", "🔔"],
    payouts: { "🍒": 2, "🍋": 3, "🔔": 5 }
  },
  premium: {
    symbols: ["💎", "7️⃣", "👑"],
    payouts: { "💎": 10, "7️⃣": 25, "👑": 100 }
  }
};

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB connected");

  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("🚀 Server running on port " + process.env.PORT);
  });

})
.catch(err => {
  console.error("❌ MongoDB connection failed:");
  console.error(err);
});

// 🏠 Home route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 👤 Register / Login
app.get("/register", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.json({ error: "Username required" });
    }

    let user = await User.findOne({ username });

    if (!user) {
      user = new User({
        username,
        balance: 1000
      });
      await user.save();
    }

    res.json({
      message: "User ready",
      userId: user._id,
      balance: user.balance
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Register failed" });
  }
});

// 🎰 Spin route
app.get("/spin", async (req, res) => {
  try {
    const { userId, bet, machine } = req.query;

    if (!userId) {
      return res.json({ error: "userId required" });
    }

    const betAmount = parseInt(bet) || 10;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ error: "Invalid userId" });
    }

    if (betAmount > user.balance) {
      return res.json({
        error: "Not enough balance",
        balance: user.balance
      });
    }

    const selected = machines[machine] || machines.basic;
    const symbols = selected.symbols;

    // Deduct bet
    user.balance -= betAmount;

    // Spin reels
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0;

    if (reel1 === reel2 && reel2 === reel3) {
      multiplier = selected.payouts[reel1] || 0;
    }

    const win = betAmount * multiplier;
    user.balance += win;

    await user.save();

    res.json({
      machine: machine || "basic",
      reels: [reel1, reel2, reel3],
      bet: betAmount,
      win,
      balance: user.balance
    });

  } catch (err) {
    console.error("SPIN ERROR:", err);
    res.status(500).json({ error: "Spin failed" });
  }
});
