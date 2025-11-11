import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";
import subjectRoutes from "./routes/subject.route.js";
import roleRoutes from "./routes/role.route.js";
import locationRoutes from "./routes/location.route.js"
import languageRoutes from "./routes/language.route.js"
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import mercadoPagoRoutes from "./routes/mercadopago.route.js";
import activityRoutes from "./routes/activity.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";



dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

const __dirname = path.resolve();

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}))

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/mercadopago", mercadoPagoRoutes)
app.use("/api/activity", activityRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/locations", locationRoutes)
app.use("/api/languages", languageRoutes)
app.use("/api/cloudinary", cloudinaryRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/promatch-frontend/dist")))
    app.get("*", (req, res) =>{
        res.sendFile(path.join(__dirname, "../frontend/promatch-frontend/dist/index.html"))
    })
}



app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDB()
});