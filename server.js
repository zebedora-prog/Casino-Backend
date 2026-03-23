const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const app = express();


app.use(express.json());

// 👤 User Schema
const User = mongoose.model("User", {
  username: String,
  balance: Number,
  xp: Number,
  level: Number
});

// 🏠 ROOT (IMPORTANT - API CHECK)
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
    console.error("REGISTER ERROR:", err);
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

    // 🎰 BUILD 3x5 GRID (ROWS x COLS)
    const grid = Array.from({ length: 3 }, () => []);

    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 3; r++) {
        grid[r][c] =
          symbols[Math.floor(Math.random() * symbols.length)];
      }
    }

    // 🎯 PAYLINES
    const paylines = [
      [0,0,0,0,0], // top
      [1,1,1,1,1], // middle
      [2,2,2,2,2], // bottom
      [0,1,2,1,0], // V
      [2,1,0,1,2], // inverted V
      [0,1,0,1,0], // zigzag
      [2,1,2,1,2], // zigzag bottom
      [1,0,1,2,1]  // W shape
    ];

    let win = 0;
    let winningLines = [];

    // 🎯 CHECK PAYLINES
    paylines.forEach((line, index) => {
      let first = null;
      let count = 0;

      for (let c = 0; c < 5; c++) {
        const symbol = grid[line[c]][c];

        if (!first && symbol !== "🃏") {
          first = symbol;
        }

        if (
          symbol === first ||
          symbol === "🃏" ||
          first === null
        ) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        const payout = betAmount * count;
        win += payout;

        winningLines.push({
          lineIndex: index,
          length: count,
          symbol: first || "🃏",
          payout
        });
      }
    });

    // 💸 UPDATE BALANCE
    user.balance -= betAmount;
    user.balance += win;

    // 🎯 XP + LEVEL
    user.xp += betAmount;

    const xpNeeded = user.level * 100;
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      user.balance += 500;
    }

    await user.save();

    // ✅ FINAL RESPONSE (CRITICAL)
    res.json({
      reels: grid,
      win,
      balance: user.balance,
      xp: user.xp,
      level: user.level,
      winningLines
    });

  } catch (err) {
    console.error("SPIN ERROR:", err);
    res.status(500).json({ error: "Spin failed" });
  }
});

// 🔗 CONNECT DB + START SERVER
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
