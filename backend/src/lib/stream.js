import {StreamChat} from "stream-chat";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();



const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if(!api_key || !api_secret) {
    throw new Error("Stream API key or secret not found");
}

//const streamChat = new StreamChat(api_key, api_secret);
const streamClient = StreamChat.getInstance(api_key, api_secret);


export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        //console.log("User upserted successfully", userData)
        return userData;
    } catch (error) {
        console.error("Error upserting stream user", error);
    }
};

export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating stream token", error);
    }
};

// Obtener mensajes no leídos para un usuario
export const getUnreadMessages = async (userId) => {
    try {
        const userIdStr = userId.toString();
        
        // Obtener canales del usuario
        const filter = { members: { $in: [userIdStr] } };
        const sort = [{ last_message_at: -1 }];
        
        const channels = await streamClient.queryChannels(filter, sort, {
            watch: false,
            state: true
        });
        
        // Crear un mapa de userId -> unread count
        const unreadMap = {};
        for (const channel of channels) {
            // Obtener el estado de lectura del usuario en este canal
            // En Stream, el estado de lectura se guarda con la key del userId
            const readState = channel.state.read[userIdStr];
            
            // Obtener el conteo de mensajes no leídos
            // Stream calcula: unread_count = total_messages - last_read_message_id_index
            let unreadCount = 0;
            if (readState) {
                const lastReadMessageId = readState.last_read_message_id;
                const messageCount = channel.state.messages.length;
                
                if (lastReadMessageId) {
                    // Encontrar el índice del último mensaje leído
                    const lastReadIndex = channel.state.messages.findIndex(
                        msg => msg.id === lastReadMessageId
                    );
                    if (lastReadIndex !== -1) {
                        unreadCount = messageCount - (lastReadIndex + 1);
                    } else {
                        // Si no se encuentra, todos los mensajes son no leídos
                        unreadCount = messageCount;
                    }
                } else {
                    // Si nunca ha leído, todos los mensajes son no leídos
                    unreadCount = messageCount;
                }
            } else {
                // Si no hay estado de lectura, todos los mensajes son no leídos
                unreadCount = channel.state.messages.length;
            }
            
            // Obtener el otro miembro del canal para identificarlo
            const members = Object.values(channel.state.members);
            const otherMember = members.find(m => m.user_id !== userIdStr);
            
            if (otherMember && unreadCount > 0) {
                unreadMap[otherMember.user_id] = {
                    count: unreadCount,
                    channelId: channel.id
                };
            }
        }
        
        return unreadMap;
    } catch (error) {
        console.error("Error getting unread messages", error);
        return {};
    }
};
// Verificar firma del webhook de Stream
export const verifyWebhookSignature = (payload, signature) => {
    const hash = crypto
        .createHmac('sha256', api_secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    return hash === signature;
};
