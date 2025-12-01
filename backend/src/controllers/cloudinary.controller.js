import cloudinary from "../lib/cloudinary.js";

export async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'avatars', 
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

           
            uploadStream.end(req.file.buffer);
        });

        const result = await uploadPromise;
        
        return res.status(200).json({
            success: true,
            message: "Uploaded!",
            data: result
        });
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message
        });
    }
}
