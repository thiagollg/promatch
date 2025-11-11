import Role from "../models/Role.js";


export async function getAllRoles(req, res){
    try {
        const roles = await Role.find()
        return res.status(200).json(roles)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}