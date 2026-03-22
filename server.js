const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// User schema
const User = mongoose.model("User", {
  username: String,
  balance: Number,
  xp: Number,
  level: Number,
  lastClaim: Date
});

// Machines
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

// Connect DB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected");

  app.listen(process.env.PORT || 8080, () => {
    console.log("Server running");
  });
})
.catch(err => console.log(err));

// Home
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Register
app.get("/register", async (req, res) => {
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
});

// Spin
app.get("/spin", async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);

    if (!user) {
      return res.json({ error: "Invalid user" });
    }

    const bet = parseInt(req.query.bet) || 10;

    if (bet > user.balance) {
      return res.json({ error: "Not enough balance" });
    }

    const selected = machines[req.query.machine] || machines.basic;
const symbols = selected.symbols;
    
    user.balance -= bet;

    const r1 = symbols[Math.floor(Math.random() * 3)];
    const r2 = symbols[Math.floor(Math.random() * 3)];
    const r3 = symbols[Math.floor(Math.random() * 3)];

    let win = 0;

    if (r1 === r2 && r2 === r3) {
  win = bet * (selected.payouts[r1] || 5);
}

    // XP system
    user.xp = user.xp || 0;
    user.level = user.level || 1;

    user.xp += bet;

    if (user.xp >= user.level * 100) {
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
    console.log(err);
    res.status(500).send("Error");
  }
});
app.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ balance: -1 }) // highest money first
      .limit(10);

    res.json(topUsers.map(user => ({
      username: user.username,
      balance: user.balance,
      level: user.level
    })));

  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});
app.get("/daily", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({ error: "userId required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ error: "Invalid user" });
    }

    const now = new Date();

    if (user.lastClaim) {
      const diff = now - new Date(user.lastClaim);
      const hours = diff / (1000 * 60 * 60);

      if (hours < 24) {
        return res.json({
          error: "Already claimed",
          hoursLeft: Math.ceil(24 - hours)
        });
      }
    }

    // Reward
    const reward = 500;
    user.balance += reward;
    user.lastClaim = now;

    await user.save();

    res.json({
      message: "Daily reward claimed",
      reward,
      balance: user.balance
    });

  } catch (err) {
    console.error("DAILY ERROR:", err);
    res.status(500).json({ error: "Daily failed" });
  }
});
