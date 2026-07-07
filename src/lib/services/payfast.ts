import crypto from "node:crypto";
import { getIntegration } from "@/lib/services/integrations";
import type { PayFastConfig, PayFastSecrets } from "@/types/integrations";

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX !== "false";
const PAYFAST_HOST = PAYFAST_SANDBOX ? "sandbox.payfast.co.za" : "www.payfast.co.za";

export class PayFastNotConnectedError extends Error {
  constructor() {
    super("PayFast is not connected for this business.");
    this.name = "PayFastNotConnectedError";
  }
}

function pfEncode(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function buildSignature(fields: Record<string, string>, passphrase?: string): string {
  const parts = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([key, value]) => `${key}=${pfEncode(String(value))}`);

  let query = parts.join("&");
  if (passphrase) query += `&passphrase=${pfEncode(passphrase)}`;

  return crypto.createHash("md5").update(query).digest("hex");
}

export interface CreatePaymentLinkParams {
  businessId: string;
  bookingId: string;
  amountCents: number;
  itemName: string;
  customerName?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export async function createPayFastPaymentUrl(params: CreatePaymentLinkParams): Promise<string> {
  const integration = await getIntegration<PayFastConfig, PayFastSecrets>(params.businessId, "payfast");
  if (!integration?.config.merchant_id || !integration.secrets.merchant_key) {
    throw new PayFastNotConnectedError();
  }

  const [nameFirst, ...rest] = (params.customerName || "Customer").split(" ");

  const fields: Record<string, string> = {
    merchant_id: integration.config.merchant_id,
    merchant_key: integration.secrets.merchant_key,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: nameFirst || "Customer",
    name_last: rest.join(" ") || "",
    m_payment_id: params.bookingId,
    amount: (params.amountCents / 100).toFixed(2),
    item_name: params.itemName.slice(0, 100),
  };

  const signature = buildSignature(fields, integration.secrets.passphrase);
  const query = new URLSearchParams({ ...fields, signature }).toString();

  return `https://${PAYFAST_HOST}/eng/process?${query}`;
}

export interface PayFastItnResult {
  valid: boolean;
  bookingId?: string;
  amountCents?: number;
  status?: "paid" | "failed" | "cancelled";
  providerPaymentId?: string;
}

/** Verifies an Instant Transaction Notification payload against the stored passphrase. */
export async function verifyPayFastItn(
  businessId: string,
  fields: Record<string, string>
): Promise<PayFastItnResult> {
  const integration = await getIntegration<PayFastConfig, PayFastSecrets>(businessId, "payfast");
  if (!integration) return { valid: false };

  const { signature, ...rest } = fields;
  const expected = buildSignature(rest, integration.secrets.passphrase);
  if (expected !== signature) return { valid: false };

  const paymentStatus = fields.payment_status?.toUpperCase();
  const status = paymentStatus === "COMPLETE" ? "paid" : paymentStatus === "CANCELLED" ? "cancelled" : "failed";

  return {
    valid: true,
    bookingId: fields.m_payment_id,
    amountCents: Math.round(parseFloat(fields.amount_gross || fields.amount || "0") * 100),
    status,
    providerPaymentId: fields.pf_payment_id,
  };
}
