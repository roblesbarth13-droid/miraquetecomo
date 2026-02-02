import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN;
const appId = process.env.MP_APP_ID;
const clientSecret = process.env.MP_CLIENT_SECRET;

if (!accessToken) {
  console.warn('MP_ACCESS_TOKEN not set - payments will be simulated');
}

const client = accessToken ? new MercadoPagoConfig({ accessToken }) : null;
const preferenceApi = client ? new Preference(client) : null;
const paymentApi = client ? new Payment(client) : null;

const PLATFORM_COMMISSION_PERCENT = 25;

export interface CreatePreferenceParams {
  offerId: number;
  title: string;
  description: string;
  price: number;
  buyerEmail?: string;
  purchaseId: number;
  sellerAccessToken?: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
  public_key: string;
  live_mode: boolean;
}

export function getOAuthUrl(redirectUri: string, state?: string): string {
  if (!appId) {
    throw new Error('MP_APP_ID not configured');
  }
  
  const params = new URLSearchParams({
    client_id: appId,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: redirectUri,
  });
  
  if (state) {
    params.append('state', state);
  }
  
  return `https://auth.mercadopago.com.ar/authorization?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  if (!appId || !clientSecret) {
    throw new Error('MP_APP_ID or MP_CLIENT_SECRET not configured');
  }

  const response = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: appId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OAuth token exchange failed:', error);
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
  if (!appId || !clientSecret) {
    throw new Error('MP_APP_ID or MP_CLIENT_SECRET not configured');
  }

  const response = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: appId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OAuth token refresh failed:', error);
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

export async function createPaymentPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
  // In production, use the deployment URL; in dev, use REPLIT_DEV_DOMAIN
  let baseUrl: string;
  if (process.env.REPLIT_DEPLOYMENT === '1') {
    baseUrl = 'https://miraquetecomo.replit.app';
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  } else {
    baseUrl = 'http://localhost:5000';
  }

  if (params.sellerAccessToken) {
    const sellerClient = new MercadoPagoConfig({ accessToken: params.sellerAccessToken });
    const sellerPreferenceApi = new Preference(sellerClient);
    
    const applicationFee = Math.round(params.price * (PLATFORM_COMMISSION_PERCENT / 100) * 100) / 100;
    
    const preference = await sellerPreferenceApi.create({
      body: {
        items: [
          {
            id: params.offerId.toString(),
            title: params.title,
            description: params.description,
            quantity: 1,
            unit_price: params.price,
            currency_id: 'ARS',
          },
        ],
        marketplace_fee: applicationFee,
        back_urls: {
          success: `${baseUrl}/pago/exito?purchaseId=${params.purchaseId}`,
          failure: `${baseUrl}/pago/fallo?purchaseId=${params.purchaseId}`,
          pending: `${baseUrl}/pago/pendiente?purchaseId=${params.purchaseId}`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
        external_reference: params.purchaseId.toString(),
        payer: params.buyerEmail ? { email: params.buyerEmail } : undefined,
      },
    });

    console.log(`Split payment preference created: ${preference.id}, fee: ${applicationFee} ARS (${PLATFORM_COMMISSION_PERCENT}%)`);

    return {
      id: preference.id!,
      init_point: preference.init_point!,
      sandbox_init_point: preference.sandbox_init_point,
    };
  }

  if (!preferenceApi) {
    return {
      id: `simulated_${params.purchaseId}`,
      init_point: `/api/checkout/simulate?purchaseId=${params.purchaseId}`,
    };
  }

  const preference = await preferenceApi.create({
    body: {
      items: [
        {
          id: params.offerId.toString(),
          title: params.title,
          description: params.description,
          quantity: 1,
          unit_price: params.price,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${baseUrl}/pago/exito?purchaseId=${params.purchaseId}`,
        failure: `${baseUrl}/pago/fallo?purchaseId=${params.purchaseId}`,
        pending: `${baseUrl}/pago/pendiente?purchaseId=${params.purchaseId}`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhook/mercadopago`,
      external_reference: params.purchaseId.toString(),
      payer: params.buyerEmail ? { email: params.buyerEmail } : undefined,
    },
  });

  return {
    id: preference.id!,
    init_point: preference.init_point!,
    sandbox_init_point: preference.sandbox_init_point,
  };
}

export async function getPaymentDetails(paymentId: string): Promise<any> {
  if (!paymentApi) {
    return {
      status: 'approved',
      external_reference: paymentId,
    };
  }

  return await paymentApi.get({ id: paymentId });
}

export function isMercadoPagoConfigured(): boolean {
  return !!accessToken;
}

export function isOAuthConfigured(): boolean {
  return !!appId && !!clientSecret;
}

export function getCommissionPercent(): number {
  return PLATFORM_COMMISSION_PERCENT;
}
