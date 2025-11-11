import jwt from "jsonwebtoken";
import User from "../src/models/User.js";



export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({message: "Unauthorized"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({message: "Unauthorized"})
        }
        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return res.status(401).json({message: "Unauthorized"})
        }
        req.user = user;
        console.log("OK", user)
        next();
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}