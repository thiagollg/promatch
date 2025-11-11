import mongoose from "mongoose";

const mercadoPagoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    accessToken: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: String,
        default: "",
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    sellerId: {
        type: String,
        default: "",
    },
    isConnected: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true});

const MercadoPago = mongoose.model("MercadoPago", mercadoPagoSchema);

export default MercadoPago;
