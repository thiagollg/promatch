import mongoose from "mongoose";

const virtualClassSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    createdAt: {
        type: Date,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const VirtualClass = mongoose.model("VirtualClass", virtualClassSchema);

export default VirtualClass;
