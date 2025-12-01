import multer from "multer";

// uso memoria para luego subir a cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});
