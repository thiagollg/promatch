import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
    },
    avatar: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    language: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
        }
    ],
    subject: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        }
    ],
    location: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
        }
    ,
    price: {
        type: Number,
        default: 0,
    },
    isonboarded: {
        type: Boolean,
        default: false,
    },
    connection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    mercadopago: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MercadoPago",
    }
    
}, {timestamps: true})




userSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", userSchema);

export default User;