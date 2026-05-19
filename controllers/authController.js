import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function signup(req,res){

    try{

        const {
            email,
            password,
            leetcodeUsername
        } = req.body;

        const existingUser =
            await User.findOne({email});

        if(existingUser){

            return res.status(400).json({
                message:
                "User already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const user =
            await User.create({

                email,

                password:
                    hashedPassword,

                leetcodeUsername
            });

        res.status(201).json({

            message:
            "Signup successful"

        });

    }catch(error){

        res.status(500).json({

            error:error.message

        });

    }
}


export async function login(req,res){

    try{

        const {
            email,
            password
        }=req.body;

        const user =
            await User.findOne({
                email
            });

        if(!user){

            return res.status(400)
            .json({

                message:
                "Invalid credentials"

            });

        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if(!validPassword){

            return res.status(400)
            .json({

                message:
                "Invalid credentials"

            });

        }

        const token =
            jwt.sign(

            {
                userId:user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );

        res.json({

            token

        });

    }catch(error){

        res.status(500)
        .json({

            error:error.message

        });

    }
}