import { getMarketplaceConnectUrl, exchangeAuthorizationCode, createPaymentPreference, getPaymentDetails } from "../lib/mercadopago.js";
import User from "../models/User.js";
import MercadoPago from "../models/MercadoPago.js";
import Payment from "../models/Payment.js";
import dotenv from "dotenv";

dotenv.config();

export const connect = async (req, res) => {
    try {
        const userId = req.user?._id?.toString() || "anonymous";
        const state = `uid:${userId}`;
        const url = getMarketplaceConnectUrl({ state });
        
        console.log("🔗 Mercado Pago Connect URL:", url);
        console.log("👤 User ID:", userId);
        console.log("🔑 State:", state);
        
        return res.status(200).json({ url });
    } catch (error) {
        console.error("❌ Error creating MP connect URL:", error);
        return res.status(500).json({ message: error.message || "Failed to create Mercado Pago connect URL" });
    }
}

export const oauthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        
        console.log("🔄 OAuth Callback received:");
        console.log("📝 Code:", code ? "Present" : "Missing");
        console.log("🔑 State:", state);
        
        if (!code) {
            console.error("❌ No authorization code provided");
            return res.status(400).json({ message: "Authorization code not provided" });
        }

        // Extract user ID from state (format: "uid:userId")
        const userId = state?.split(':')[1];
        console.log("👤 Extracted User ID:", userId);
        
        if (!userId) {
            console.error("❌ Invalid state parameter");
            return res.status(400).json({ message: "Invalid state parameter" });
        }

        console.log("🔄 Exchanging authorization code for tokens...");
        // Exchange authorization code for tokens
        const tokenData = await exchangeAuthorizationCode(code);
        console.log("tokenData", tokenData)
        console.log("✅ Tokens received:", {
            hasAccessToken: !!tokenData.accessToken,
            hasRefreshToken: !!tokenData.refreshToken,
            sellerId: tokenData.sellerId
        });
        
        // Create or update MercadoPago document
        let mercadoPagoDoc = await MercadoPago.findOne({ user: userId });
        
        if (mercadoPagoDoc) {
            // Update existing document
            mercadoPagoDoc.accessToken = tokenData.accessToken;
            mercadoPagoDoc.refreshToken = tokenData.refreshToken;
            mercadoPagoDoc.expiresAt = tokenData.expiresAt;
            mercadoPagoDoc.sellerId = tokenData.sellerId;
            mercadoPagoDoc.isConnected = true;
            await mercadoPagoDoc.save();
        } else {
            // Create new document
            mercadoPagoDoc = await MercadoPago.create({
                user: userId,
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
                expiresAt: tokenData.expiresAt,
                sellerId: tokenData.sellerId,
                isConnected: true,
            });
        }

        // Update user with MercadoPago reference
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                mercadopago: mercadoPagoDoc._id,
            },
            { new: true }
        );

        if (!updatedUser) {
            console.error("❌ User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User updated successfully:", updatedUser.email);
        
        // Redirect to frontend with success message
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        console.log("🔄 Redirecting to:", `${frontendUrl}/onboarding?mp_connected=true`);
        return res.redirect(`${frontendUrl}/onboarding?mp_connected=true`);
        
    } catch (error) {
        console.error("❌ OAuth callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/onboarding?mp_error=true`);
    }
}

export const getConnectionStatus = async (req, res) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await User.findById(userId).select('mercadopago').populate('mercadopago');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mercadoPagoData = user.mercadopago;
        const isConnected = mercadoPagoData?.isConnected || false;
        const sellerId = mercadoPagoData?.sellerId || null;
        const expiresAt = mercadoPagoData?.expiresAt || null;

        return res.status(200).json({
            isConnected,
            sellerId,
            expiresAt,
            hasValidToken: isConnected && expiresAt && new Date(expiresAt) > new Date()
        });
        
    } catch (error) {
        console.error("❌ Error getting connection status:", error);
        return res.status(500).json({ message: "Error getting connection status" });
    }
}

export const createPayment = async (req, res) => {
    try {
        const { professorId } = req.params;
        const userId = req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Obtener el usuario actual con su rol populado
        const currentUser = await User.findById(userId).populate('role', 'name');
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }

        // Verificar que el usuario actual no sea profesor
        if (currentUser.role?.name === "Profesor") {
            return res.status(403).json({ message: "Teachers cannot pay other teachers" });
        }

        // Obtener información del profesor
        const professor = await User.findById(professorId).populate('role', 'name').populate('mercadopago');
        if (!professor) {
            return res.status(404).json({ message: "Professor not found" });
        }

        // Verificar que el profesor al que intenta pagar sea realmente un profesor
        if (professor.role?.name !== "Profesor") {
            return res.status(400).json({ message: "The user you are trying to pay is not a teacher" });
        }

        // Verificar que el profesor tenga Mercado Pago conectado
        if (!professor.mercadopago?.isConnected || !professor.mercadopago?.accessToken) {
            return res.status(400).json({ message: "Professor has not connected Mercado Pago" });
        }

        // Obtener información del usuario que paga
        const payer = await User.findById(userId);
        if (!payer) {
            return res.status(404).json({ message: "Payer not found" });
        }

        const amount = professor.price;
        const externalReference = `payment_${userId}_${professorId}_${Date.now()}`;

        const paymentData = {
            amount,
            description: `Clase con ${professor.fullName}`,
            payerEmail: payer.email,
            payerName: payer.fullName,
            externalReference,
            successUrl: `${process.env.FRONTEND_URL}/professor/${professorId}?payment=success`,
            failureUrl: `${process.env.FRONTEND_URL}/professor/${professorId}?payment=failure`,
            pendingUrl: `${process.env.FRONTEND_URL}/professor/${professorId}?payment=pending`
        };

        console.log("🔄 Creating payment preference for:", {
            professor: professor.fullName,
            payer: payer.fullName,
            amount,
            externalReference  
        });
        //console.log("paymentData", paymentData)
        const preference = await createPaymentPreference(
            professor.mercadopago.accessToken,
            paymentData
        );
        console.log(professor.mercadopago.accessToken)
        //console.log ("La preferencia",preference)
        // Guardar información del pago en la base de datos
        
        
        return res.status(200).json({
            preferenceId: preference.id,
            initPoint: preference.init_point,
            sandboxInitPoint: preference.sandbox_init_point
        });
        
    } catch (error) {
        console.error("❌ Error creating payment:", error);
        return res.status(500).json({ message: error.message || "Error creating payment" });
    }
}

export const webhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log("🔄 Webhook received:", { type, data });

        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar el pago en nuestra base de datos por preference_id
            //const payment = await Payment.findOne({ mpPreferenceId: paymentId }).populate('sender receiver');
            
            //if (!payment) {
            //    console.log("⚠️ Payment not found in database:", paymentId);
            //    return res.status(200).json({ message: "Payment not found" });
            //}

            // Obtener detalles del pago desde Mercado Pago
            //const professor = await User.findById(payment.receiver);
            //const paymentDetails = await getPaymentDetails(professor.mercadopago.accessToken, paymentId);
            const paymentDetails = await getPaymentDetails(process.env.MERCADOPAGO_ACCESS_TOKEN, paymentId);
            console.log("leeeeeer", paymentDetails)
            console.log("💰 Payment details:", {
                id: paymentDetails.id,
                status: paymentDetails.status,
                amount: paymentDetails.transaction_amount,
                payer: paymentDetails.payer?.email
            });

            const finaldata = {
                paymentId: paymentDetails.id,
                amount: paymentDetails.transaction_amount,
                status: paymentDetails.status,
                date: paymentDetails.date_created, // o date_approved
                externalReference: paymentDetails.external_reference
              };
              
              const [, userId, professorId] = finaldata.externalReference.split("_");

              // Crear el registro del pago en tu base de datos
              const payment = new Payment({
                sender: userId,              // alumno
                receiver: professorId,       // profesor
                amount: finaldata.amount,
                mpPaymentId: finaldata.paymentId, // ID del pago en Mercado Pago
                status: finaldata.status,         // "approved", "pending", etc.
                date: finaldata.date              // guardás la fecha
              });
              
              await payment.save();

            console.log("Webhook processed successfully")
            return res.status(200).json({ message: "Webhook processed successfully" });
        }

        return res.status(200).json({ message: "Webhook received but not processed" });
        
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return res.status(500).json({ message: "Webhook error" });
    }
}


