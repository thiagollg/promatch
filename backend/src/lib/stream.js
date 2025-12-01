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


export const getUnreadMessages = async (userId) => {
    try {
        const userIdStr = userId.toString();
        
        
        const filter = { members: { $in: [userIdStr] } };
        const sort = [{ last_message_at: -1 }];
        
        const channels = await streamClient.queryChannels(filter, sort, {
            watch: false,
            state: true
        });
        
        // Creo un mapa
        const unreadMap = {};
        for (const channel of channels) {
          
            const readState = channel.state.read[userIdStr];
            
          
            let unreadCount = 0;
            if (readState) {
                const lastReadMessageId = readState.last_read_message_id;
                const messageCount = channel.state.messages.length;
                
                if (lastReadMessageId) {
                    
                    const lastReadIndex = channel.state.messages.findIndex(
                        msg => msg.id === lastReadMessageId
                    );
                    if (lastReadIndex !== -1) {
                        unreadCount = messageCount - (lastReadIndex + 1);
                    } else {
                       
                        unreadCount = messageCount;
                    }
                } else {
                    
                    unreadCount = messageCount;
                }
            } else {
               
                unreadCount = channel.state.messages.length;
            }
            
            
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

export const verifyWebhookSignature = (payload, signature) => {
    const hash = crypto
        .createHmac('sha256', api_secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    return hash === signature;
};
