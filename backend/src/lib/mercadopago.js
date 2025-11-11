import dotenv from "dotenv";

dotenv.config();

const MP_BASE_AUTH_URL = "https://auth.mercadopago.com/authorization";

export function getMarketplaceConnectUrl({ state }) {
    const clientId = process.env.MP_CLIENT_ID?.replace(/"/g, '');
    const redirectUri = process.env.MP_REDIRECT_URI?.replace(/"/g, ''); // must be configured in MP app
    const responseType = "code"; // OAuth authorization code
    const marketplace = "mp"; // enables marketplace mode

    if (!clientId || !redirectUri) {
        throw new Error("Missing MP_CLIENT_ID or MP_REDIRECT_URI environment variables");
    }

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: responseType,
        redirect_uri: redirectUri,
        platform_id: marketplace,
        state: state || "", // echo back to prevent CSRF and track user/session
    });

    return `${MP_BASE_AUTH_URL}?${params.toString()}`;
}

export function getOAuthCredentials() {
    const clientId = process.env.MP_CLIENT_ID?.replace(/"/g, '');
    const clientSecret = process.env.MP_CLIENT_SECRET?.replace(/"/g, '');
    const redirectUri = process.env.MP_REDIRECT_URI?.replace(/"/g, '');
    
    console.log("🔑 OAuth Credentials check:");
    console.log("Client ID:", clientId ? "Present" : "Missing");
    console.log("Client Secret:", clientSecret ? "Present" : "Missing");
    console.log("Redirect URI:", redirectUri);
    
    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("Missing Mercado Pago OAuth env vars");
    }

    return { clientId, clientSecret, redirectUri };
}

export async function exchangeAuthorizationCode(authorizationCode) {
    const { clientId, clientSecret, redirectUri } = getOAuthCredentials();
    
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri,
    });

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`MP OAuth error: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Calculate expiration time (MP tokens typically last 6 hours)
    const expiresAt = new Date(Date.now() + (data.expires_in * 1000));
    
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        scope: data.scope,
        userId: data.user_id,
        sellerId: data.user_id, // In marketplace mode, user_id is the seller ID
    };
}

export async function createPaymentPreference(sellerAccessToken, paymentData) {
    const {
        amount,
        description,
        payerEmail,
        payerName,
        externalReference,
        successUrl,
        failureUrl,
        pendingUrl
    } = paymentData;
    console.log(successUrl)
    const preferenceData = {
        items: [
            {
                title: description,
                quantity: 1,
                unit_price: amount,
                currency_id: "ARS"
            }
        ],
        payer: {
            email: payerEmail,
            name: payerName
        },
        external_reference: externalReference,
        notification_url: `${process.env.OFFICIAL_URL}/api/mercadopago/webhook`,
        back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl
        },
        //auto_return: "approved",
        payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: 1
        }
    };
    console.log(sellerAccessToken)
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sellerAccessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`MP Preference error: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
}

export async function getPaymentDetails(sellerAccessToken, paymentId) {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sellerAccessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`MP Payment details error: ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
}


