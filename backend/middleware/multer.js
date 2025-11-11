import multer from "multer";

// Usar memoria en lugar de disco - el archivo se mantiene en memoria y se sube directamente a Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
    }
});
