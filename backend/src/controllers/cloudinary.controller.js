import cloudinary from "../lib/cloudinary.js";

export async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Convertir el buffer a una cadena base64 o usar upload_stream
        // Opción 1: Usar upload_stream (más eficiente para archivos grandes)
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'avatars', // Opcional: organizar en carpetas en Cloudinary
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Enviar el buffer directamente a Cloudinary
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
