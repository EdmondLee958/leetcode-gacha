import express from "express";
import User from "../models/User.js";

const router = express.Router();

import { syncLeetcode }
from "../controllers/syncController.js";

router.post(
    "/sync",
    syncLeetcode
);

import { getSolvedCount } from "../services/leetcodeService.js";

router.get("/leetcode-test", async (req,res)=>{

    const solved =
      await getSolvedCount(
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