import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Role from "../models/Role.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../lib/stream.js";

export async function singup(req, res)    {
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }
        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"})
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({message: "Invalid email address"})
        }
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"})
        }
        const newUser = await User.create({fullName, email, password});

        try {
            await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            avatar: newUser.avatar || "",
            });
            console.log("User created successfully", newUser)
        } catch (error) {
            console.log("error", error)
            return res.status(500).json({success: false, message: error.message})
        }


        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
        
        res.cookie("jwt",token,{
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        })
        return res.status(201).json({success: true, message: "User created successfully", user: newUser})

    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}

export async function login(req, res)    {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({message: "User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({message: "Invalid credentials"})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
        
        res.cookie("jwt",token,{
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        })
        return res.status(200).json({success: true, message: "User logged in successfully", user})
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}

export function logout(req, res)    {
    res.clearCookie("jwt");
    return res.status(200).json({success: true, message: "User logged out successfully"})
}


export async function onboard(req, res)    {
    try {
        const userId = req.user._id;
        const {fullName, role, avatar, bio, language, subject, location, price} = req.body;
        
        if(role === "") {
            return res.status(400).json({message: "Role is required"})
        }
        
        if(role.name === "Profesor" && (!fullName || !avatar || !bio || !language || !subject || !location || !price)) {
            return res.status(400).json({message: "All fields are required", missingfields:[
                !fullName && "Full name is required",
                
                !avatar && "Avatar is required",
                !bio && "Bio is required",
                !language && "Language is required",
                !subject && "Subject is required",
                !location && "Location is required",
                !price && "Price is required",
            ].filter(Boolean),})
        }


        if(role.name === "Alumno" && (!fullName || !avatar || !language || !subject || !location)) {
            return res.status(400).json({message: "All fields are required", missingfields:[
                !fullName && "Full name is required",
                !avatar && "Avatar is required",
                !language && "Language is required",
                !subject && "Subject is required",
                !location && "Location is required",
            ].filter(Boolean),})
        }

        const updateUser = await User.findByIdAndUpdate(userId, {
            fullName,
            role,
            
            avatar,
            bio,
            language,
            subject,
            location,
            price,
            isonboarded: true
        }, {new: true})
        
        if(!updateUser) return res.status(404).json({message: "User not found"})
        
        

        try {
            await upsertStreamUser({
                id: updateUser._id.toString(),
                name: updateUser.fullName,
                avatar: updateUser.avatar || "",
            })
            console.log("User onboarded successfully and added to stream", updateUser)
            return res.status(200).json({success: true, message: "User onboarded successfully and added to stream", user: updateUser})
        } catch (error) {
            console.log("error", error)
            return res.status(500).json({success: false, message: error.message})
            
        }

        
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}

