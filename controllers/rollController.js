import User from "../models/User.js";
import { characterPool } from "../data/characterPool.js";

function getRarity() {

    const roll = Math.random() * 100;

    if (roll < 80) {
        return "Common";
    }

    if (roll < 95) {
        return "Rare";
    }

    return "Legendary";
}

export async function rollCharacter(req,res){

    try{

        const user =
          await User.findById(
            req.user.userId
          );

        if(!user){

            return res.status(404)
            .json({
                message:"User not found"
            });
        }

        if(user.rolls < 1){

            return res.status(400)
            .json({
                message:
                "Not enough rolls"
            });
        }

        const rarity =
          getRarity();

        const pool =
          characterPool[rarity];

        const randomIndex =
          Math.floor(
            Math.random() *
            pool.length
          );

        const character =
          pool[randomIndex];

        user.rolls -= 1;

        user.characters.push(
          character
        );

        await user.save();

        res.json({

            character,

            remainingRolls:
              user.rolls

        });

    }catch(error){

        res.status(500)
        .json({
            error:error.message
        });

    }

}