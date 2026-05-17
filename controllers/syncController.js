import User from "../models/User.js";
import { getSolvedCount } from "../services/leetcodeService.js";

export async function syncLeetcode(req,res){

    try{

        const { email } = req.body;

        const user =
          await User.findOne({email});

        if(!user){

            return res.status(404).json({
                message:"User not found"
            });
        }

        const currentSolved =
            await getSolvedCount(
                user.leetcodeUsername
            );

        const delta =
            currentSolved -
            user.lastSolvedCount;

        let rollsEarned = 0;

        if(delta>0){

            rollsEarned = delta * 2;

            user.rolls += rollsEarned;

            user.lastSolvedCount =
                currentSolved;

            user.lastSync =
                new Date();

            await user.save();
        }

        res.json({
            currentSolved,
            previousSolved:
                currentSolved-delta,
            delta,
            rollsEarned,
            totalRolls:user.rolls
        });

    }catch(error){

        res.status(500).json({
            error:error.message
        });
    }

}
