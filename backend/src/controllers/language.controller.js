import Language from "../models/Language.js";


export async function getAllLanguages(req, res){
    try {
        const language = await Language.find()
        return res.status(200).json(language)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}