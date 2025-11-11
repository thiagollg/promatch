import Location from "../models/Location.js";


export async function getAllLocations(req, res){
    try {
        const locations = await Location.find()
        return res.status(200).json(locations)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}