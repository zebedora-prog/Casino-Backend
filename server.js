const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"));
// 👤 User Schema
const User = mongoose.model("User", {
  username: String,
  balance: Number,
  xp: Number,
  level: Number
});

// 🔗 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB connected");

  app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log("🚀 Server running");
  });
})
.catch(err => {
  console.error("❌ MongoDB error:", err);
});

// 🏠 Home (SAFE)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 👤 Register/Login
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
      userId: user._id,
      balance: user.balance,
      xp: user.xp,
      level: user.level
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Register failed" });
  }
});

// 🎰 SPIN
app.get("/spin", async (req, res) => {
  try {
    const { userId, bet = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const betAmount = parseInt(bet);

    if (user.balance < betAmount) {
      return res.json({ error: "Not enough balance" });
    }

    const symbols = ["🍒","🍋","🔔","💎","7️⃣","👑","🃏"];

    const reels = Array.from({ length: 5 }, () =>
      symbols[Math.floor(Math.random() * symbols.length)]
    );

    let win = 0;

    function match(a, b) {
      return a === b || a === "🃏" || b === "🃏";
    }

    let streak = 1;

    for (let i = 1; i < reels.length; i++) {
      if (match(reels[i], reels[i - 1])) {
        streak++;
      } else {
        break;
      }
    }

    if (streak >= 3) win += betAmount * 2;
    if (streak >= 4) win += betAmount * 5;
    if (streak >= 5) win += betAmount * 10;

    if (Math.random() > 0.7) {
      win += betAmount * 2;
    }

    user.balance -= betAmount;
    user.balance += win;

    user.xp += betAmount;

    const xpNeeded = user.level * 100;
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      user.balance += 500;
    }

    await user.save();

    res.json({
      reels,
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
