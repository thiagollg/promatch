import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "../models/Subject.js";
import Role from "../models/Role.js";
import Location from "../models/Location.js"
import Language from "../models/Language.js"
dotenv.config();

const sampleSubjects = [
    { name: 'Matemáticas' },
    { name: 'Lengua y Literatura' },
    { name: 'Historia' },
    { name: 'Geografía' },
    { name: 'Ciencias Naturales' },
    { name: 'Ciencias Sociales' },
    { name: 'Biología' },
    { name: 'Física' },
    { name: 'Química' },
    { name: 'Educación Cívica' },
    { name: 'Inglés' },
    { name: 'Educación Física' },
    { name: 'Arte' },
    { name: 'Música' },
    { name: 'Tecnología' },
    { name: 'Informática' },
    { name: 'Filosofía' },
    { name: 'Psicología' },
    { name: 'Economía' },
    { name: 'Otro' }

];

const sampleRoles = [
    { name: 'Profesor' },
    { name: 'Alumno' }
];

const sampleLanguages = [
    { name: 'Español' },
    { name: 'Inglés' },
    { name: 'Francés' },
    { name: 'Portugués' },
    { name: 'Italiano' },
    { name: 'Alemán' },
    { name: 'Chino Mandarín' },
    { name: 'Japonés' },
    { name: 'Ruso' },
    { name: 'Árabe' },
    { name: 'Coreano' },
    { name: 'Guaraní' },
    { name: 'Quechua' },
    { name: 'Hebreo' },
    { name: 'Latín' },
    { name: 'Griego' }
];

const sampleLocations = [
    { name: 'Buenos Aires' },
    { name: 'Ciudad Autónoma de Buenos Aires' },
    { name: 'Catamarca' },
    { name: 'Chaco' },
    { name: 'Chubut' },
    { name: 'Córdoba' },
    { name: 'Corrientes' },
    { name: 'Entre Ríos' },
    { name: 'Formosa' },
    { name: 'Jujuy' },
    { name: 'La Pampa' },
    { name: 'La Rioja' },
    { name: 'Mendoza' },
    { name: 'Misiones' },
    { name: 'Neuquén' },
    { name: 'Río Negro' },
    { name: 'Salta' },
    { name: 'San Juan' },
    { name: 'San Luis' },
    { name: 'Santa Cruz' },
    { name: 'Santa Fe' },
    { name: 'Santiago del Estero' },
    { name: 'Tierra del Fuego, Antártida e Islas del Atlántico Sur' },
    { name: 'Tucumán' },
    { name: 'Otro' }

]

export const connectDB = async () => {
    try {
        const conn  = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // 🔹 Seed Subjects con upsert
        for (const subj of sampleSubjects) {
            await Subject.updateOne(
                { name: subj.name },       // criterio de unicidad
                { $setOnInsert: subj },    // si no existe, lo inserta
                { upsert: true }
            );
        }
        console.log("Subjects ensured in the database ✅");

        // 🔹 Seed Roles con upsert
        for (const role of sampleRoles) {
            await Role.updateOne(
                { name: role.name },       // criterio de unicidad
                { $setOnInsert: role },
                { upsert: true }
            );
        }

        console.log("Roles ensured in the database ✅");

        for (const location of sampleLocations) {
            await Location.updateOne(
                { name: location.name },       // criterio de unicidad
                { $setOnInsert: location },
                { upsert: true }
            );
        }

        console.log("Locations ensured in the database ✅");


        for (const language of sampleLanguages) {
            await Language.updateOne(
                { name: language.name },       // criterio de unicidad
                { $setOnInsert: language },
                { upsert: true }
            );
        }

        console.log("Languages ensured in the database ✅");

        

    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};
