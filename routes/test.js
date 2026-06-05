import express from "express";
import User from "../models/User.js";

const router = express.Router();

import {
 signup,
 login
}
from "../controllers/authController.js";

router.post(
    "/signup",
    signup
);

router.post(
    "/login",
    login
);

import { syncLeetcode }
from "../controllers/syncController.js";

import { auth }
from "../middleware/authMiddleware.js";

router.post(
    "/sync",
    auth,
    syncLeetcode
);

import {
  rollCharacter
}
from "../controllers/rollController.js";

router.post(
  "/roll",
  auth,
  rollCharacter
);

import { getInventory } from "../controllers/inventoryController.js";

router.get("/inventory", auth, getInventory);

import {
  setLineup,
  getLineup
} from "../controllers/lineupController.js";

router.post("/lineup", auth, setLineup);
router.get("/lineup", auth, getLineup);

import { startBattle } from "../controllers/battleController.js";

router.post("/battle", auth, startBattle);

import {
  startRun,
  runBattle,
  claimReward,
  getCurrentRun,
  endRun
} from "../controllers/runController.js";

router.post("/runs/start", auth, startRun);
router.post("/runs/battle", auth, runBattle);
router.post("/runs/reward", auth, claimReward);
router.get("/runs/current", auth, getCurrentRun);
router.post("/runs/end", auth, endRun);

import { getSolvedStats } from "../services/leetcodeService.js";

router.get("/leetcode-test", async (req,res)=>{

    const solved =
      await getSolvedStats(
        "edlee1"
      );

    res.json({
        solved
    });
});

router.post("/users", async (req, res) => {
  try {
    const { email, leetcodeUsername } = req.body;

    const user = await User.create({
      email,
      leetcodeUsername
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message
    });
  }
});

export default router;