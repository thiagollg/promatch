import Payment from "../models/Payment.js";
import VirtualClass from "../models/VirtualClass.js";

export const getActivityHistory = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Pagos
        const payments = await Payment.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .populate('sender receiver')
        .sort({ createdAt: -1 })
        .limit(50);
        // Clases virtuales
        const virtualClasses = await VirtualClass.find({
            participants: userId
        })
        .populate('participants')
        .sort({ createdAt: -1 })
        .limit(50);
        // Actividades
        const activities = [
            ...payments.map(payment => ({
                type: 'payment',
                id: payment._id,
                data: {
                    sender: payment.sender && payment.sender._id ? payment.sender : { fullName: '(Usuario eliminado)', _id: null },
                    receiver: payment.receiver && payment.receiver._id ? payment.receiver : { fullName: '(Usuario eliminado)', _id: null },
                    amount: payment.amount,
                    status: payment.status,
                    createdAt: payment.createdAt,
                    isSender: payment.sender && payment.sender._id && payment.sender._id.toString() === userId.toString()
                }
            })),
            ...virtualClasses.map(virtualClass => ({
                type: 'virtual_class',
                id: virtualClass._id,
                data: {
                    participants: (virtualClass.participants || []).map(p => p && p._id ? p : { fullName: '(Usuario eliminado)', _id: null }),
                    createdAt: virtualClass.createdAt,
                    channelId: virtualClass.channelId
                }
            }))
        ].sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

        return res.status(200).json({
            activities,
            totalPayments: payments.length,
            totalVirtualClasses: virtualClasses.length
        });
    } catch (error) {
        console.error("❌ Error getting activity history:", error);
        return res.status(500).json({ message: "Error getting activity history" });
    }
}

export const createVirtualClass = async (req, res) => {
    try {
        //console.log("📥 Body recibido:", req.body);
        const { participants, channelId } = req.body;
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        //console.log("🧩 participants:", participants);
        //console.log("🧩 channel:", channelId);
        //console.log("🧩 tipo:", typeof participants);

        // Verificar que el usuario esté en los participantes
        if (!participants.includes(userId.toString())) {
            return res.status(400).json({ message: "User must be a participant" });
        }

        const virtualClass = new VirtualClass({
            participants,
            createdAt: new Date(),
            channelId
        });

        await virtualClass.save();
        await virtualClass.populate('participants');

        console.log("📹 Virtual class created:", {
            id: virtualClass._id,
            participants: virtualClass.participants.map(p => p.fullName),
            channelId
        });

        return res.status(201).json({
            message: "Virtual class created successfully",
            virtualClass
        });
        
    } catch (error) {
        console.error("❌ Error creating virtual class:", error);
        return res.status(500).json({ message: "Error creating virtual class" });
    }
}
