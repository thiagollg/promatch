import { generateStreamToken, getUnreadMessages, verifyWebhookSignature } from "../lib/stream.js";

export async function getStreamToken(req, res) {
    try {
        const token = generateStreamToken(req.user.id);
        return res.status(200).json({success: true, message: "Token generated successfully", token})     
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}

// Obtener mensajes no leídos para el usuario actual
export async function getUnreadCounts(req, res) {
    try {
        const userId = req.user.id;
        
        const unreadMap = await getUnreadMessages(userId);
        return res.status(200).json({success: true, unreadMessages: unreadMap});
    } catch (error) {
        console.error("Error getting unread counts", error);
        return res.status(500).json({success: false, message: error.message});
    }
}
// Webhook endpoint para recibir eventos de Stream
export async function streamWebhook(req, res) {
    try {
        const signature = req.headers['x-signature'];
        const payload = req.body;
        console.log("payload", payload)
        console.log("signature", signature)
        
        // Verificar firma del webhook (descomentar cuando tengas el webhook configurado en Stream)
         if (!verifyWebhookSignature(payload, signature)) {
             return res.status(401).json({success: false, message: "Invalid signature"});
         }
        
        console.log("📩 Stream webhook event received:", payload.type);
        
        // Manejar diferentes tipos de eventos
        if (payload.type === "message.new" || payload.type === "message.read") {
            // Estos eventos indican cambios en mensajes, podemos loguearlos
            console.log("💬 Message event:", {
                type: payload.type,
                channel_id: payload.channel_id,
                user_id: payload.user?.id
            });
        }
        
        // Siempre responder 200 para que Stream sepa que recibimos el webhook
        return res.status(200).json({success: true, message: "Webhook received"});
    } catch (error) {
        console.error("Error processing webhook", error);
        return res.status(500).json({success: false, message: error.message});
    }
}

