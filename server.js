const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 👤 User Schema
const User = mongoose.model("User", {
  username: String,
  balance: Number,
  xp: Number,
  level: Number
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

// 🏠 Home
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
        balance: 1000,
        xp: 0,
        level: 1
      });
      await user.save();
    }

    res.json({
      message: "User ready",
      userId: user._id,
      balance: user.balance,
      xp: user.xp,
      level: user.level
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Register failed" });
  }
});

// 🎰 Spin
app.get("/spin", async (req, res) => {
  try {
    const { userId, bet, machine } = req.query;

    if (!userId) {
      return res.json({ error: "userId required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ error: "Invalid userId" });
    }

    // Safe defaults
    if (user.balance == null) user.balance = 1000;
    if (user.xp == null) user.xp = 0;
    if (user.level == null) user.level = 1;

    const betAmount = parseInt(bet) || 10;

    if (betAmount > user.balance) {
      return res.json({ error: "Not enough balance" });
    }

    const selected = machines[machine] || machines.basic;
    const symbols = selected.symbols;

    user.balance -= betAmount;

    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0;

    if (r1 === r2 && r2 === r3) {
      multiplier = selected.payouts[r1] || 0;
    }

    const win = betAmount * multiplier;
    user.balance += win;

    // XP system
    user.xp += betAmount;

    const xpNeeded = user.level * 100;

    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      user.balance += 500;
    }

    await user.save();

    res.json({
      reels: [r1, r2, r3],
      win,
      balance: user.balance,
      xp: user.xp,
      level: user.level
    });

  } catch (err) {
    console.error("SPIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
    // 🎯 XP SYSTEM
    const xpGain = betAmount;
    user.xp += xpGain;

    const xpNeeded = user.level * 100;

    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      user.balance += 500; // level reward
    }

    await user.save();

    res.json({
      machine: machine || "basic",
      reels: [reel1, reel2, reel3],
      bet: betAmount,
      win,
      balance: user.balance,
      xp: user.xp,
      level: user.level
    });

  } catch (err) {
    console.error("SPIN ERROR:", err);
    res.status(500).json({ error: "Spin failed" });
  }
});
