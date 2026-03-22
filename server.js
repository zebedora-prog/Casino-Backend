const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // ✅ MUST be here

const app = express();
app.use(express.json());

// ✅ serve frontend
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
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
  Array.from({ length: 3 }, () =>
    symbols[Math.floor(Math.random() * symbols.length)]
  )
);

   const paylines = [
  [0,0,0,0,0], // top
  [1,1,1,1,1], // middle
  [2,2,2,2,2], // bottom

  [0,1,2,1,0], // diag down
  [2,1,0,1,2], // diag up

  [0,1,0,1,0], // zigzag
  [2,1,2,1,2],
  [1,0,1,2,1]
];

// 🎰 build 3x5 grid
const grid = Array.from({ length: 3 }, () => []);

for (let c = 0; c < 5; c++) {
  const col = [];
  for (let r = 0; r < 3; r++) {
    col.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }
  for (let r = 0; r < 3; r++) {
    if (!grid[r]) grid[r] = [];
    grid[r][c] = col[r];
  }
}

let win = 0;
let winningLines = [];

// 🎯 check paylines
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

  } catch (err) {
    console.error("SPIN ERROR:", err);
    res.status(500).json({ error: "Spin failed" });
  }
});
