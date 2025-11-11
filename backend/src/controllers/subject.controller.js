import Subject from "../models/Subject.js";


export async function getAllSubjects(req, res){
    try {
        const subjects = await Subject.find()
        return res.status(200).json(subjects)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}
