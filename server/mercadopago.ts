import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('MERCADO_PAGO_ACCESS_TOKEN not set - payments will be simulated');
}

const client = accessToken ? new MercadoPagoConfig({ accessToken }) : null;
const preferenceApi = client ? new Preference(client) : null;
const paymentApi = client ? new Payment(client) : null;

export interface CreatePreferenceParams {
  offerId: number;
  title: string;
  description: string;
  price: number;
  buyerEmail?: string;
  purchaseId: number;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export async function createPaymentPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
  if (!preferenceApi) {
    return {
      id: `simulated_${params.purchaseId}`,
      init_point: `/api/checkout/simulate?purchaseId=${params.purchaseId}`,
    };
  }

  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

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
