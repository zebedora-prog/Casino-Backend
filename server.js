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
/app/server.js:169
    await user.save();
    at Object..js (node:internal/modules/cjs/loader:1838:10)
    ^^^^^
    at Module.load (node:internal/modules/cjs/loader:1441:32)
SyntaxError: await is only valid in async functions and the top level bodies of modules
    at Function._load (node:internal/modules/cjs/loader:1263:12)
    at wrapSafe (node:internal/modules/cjs/loader:1637:18)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at Module._compile (node:internal/modules/cjs/loader:1679:20)
    at wrapModuleLoad (node:internal/modules/cjs/loader:237:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49
Node.js v22.22.1
    // 🎯 XP SYSTEM (SAFE)
    user.xp += betAmount;

    const xpNeeded = user.level * 100;

    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp = 0;
      user.balance += 500;
    }

    await user.save();

    res.json({
      reels: [reel1, reel2, reel3],
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
