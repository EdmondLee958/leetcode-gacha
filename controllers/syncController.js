import User from "../models/User.js";
import { getSolvedStats } from "../services/leetcodeService.js";

export async function syncLeetcode(req, res) {
  try {
    const user =
      await User.findById(
        req.user.userId
 );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const now = new Date();

    if (user.lastSync) {
        const timeSinceLastSync = now - user.lastSync;
        const oneMinute = 60 * 1000;

        if (timeSinceLastSync < oneMinute) {
            return res.status(429).json({
         message: "Please wait before syncing again",
         secondsRemaining: Math.ceil((oneMinute - timeSinceLastSync) / 1000)
    });
  }
}

    const currentStats = await getSolvedStats(user.leetcodeUsername);

    const easyDelta = Math.max(0, currentStats.easy - user.easySolved);
    const mediumDelta = Math.max(0, currentStats.medium - user.mediumSolved);
    const hardDelta = Math.max(0, currentStats.hard - user.hardSolved);

    const totalDelta = easyDelta + mediumDelta + hardDelta;

    const rollsEarned =
      easyDelta * 1 +
      mediumDelta * 3 +
      hardDelta * 7;

if (totalDelta > 0) {
  user.easySolved = currentStats.easy;
  user.mediumSolved = currentStats.medium;
  user.hardSolved = currentStats.hard;
  user.lastSolvedCount = currentStats.total;
  user.rolls += rollsEarned;
}

user.lastSync = new Date();
await user.save();

    res.json({
      currentStats,
      deltas: {
        easy: easyDelta,
        medium: mediumDelta,
        hard: hardDelta,
        total: totalDelta
      },
      rollsEarned,
      totalRolls: user.rolls
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}