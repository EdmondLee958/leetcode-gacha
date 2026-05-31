import User from "../models/User.js";

export async function getInventory(req, res) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      rolls: user.rolls,
      characters: user.characters
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}