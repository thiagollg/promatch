import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Campos adicionales de Mercado Pago
    mpPaymentId: {
        type: String,
        required: false,
        default: null,
    },
    status: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
