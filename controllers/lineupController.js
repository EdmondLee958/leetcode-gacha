import User from "../models/User.js";

export async function setLineup(req, res) {
  try {
    const { characterIds } = req.body;

    if (!Array.isArray(characterIds) || characterIds.length !== 4) {
      return res.status(400).json({
        message: "Lineup must contain exactly 4 characters"
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const ownedCharacterIds = user.characters.map(character =>
      character._id.toString()
    );

    const allOwned = characterIds.every(id =>
      ownedCharacterIds.includes(id)
    );

    if (!allOwned) {
      return res.status(400).json({
        message: "One or more characters are not owned by this user"
      });
    }

    user.lineup = characterIds;

    await user.save();

    res.json({
      message: "Lineup saved",
      lineup: user.lineup
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}