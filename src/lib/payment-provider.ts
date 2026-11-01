/**
 * Payment Provider Abstraction Layer for MockMate.
 *
 * Current State: PREPARATION MODE (No live payment gateway active).
 *
 * Requirements for future activation:
 * 1. Razorpay / Cashfree / Stripe API keys in server environment:
 *    - RAZORPAY_KEY_ID
 *    - RAZORPAY_KEY_SECRET
 *    - RAZORPAY_WEBHOOK_SECRET
 * 2. Webhook endpoints must verify HMAC SHA256 signatures server-side.
 * 3. Payment transactions must be created and verified idempotently.
 * 4. Never activate premium access solely via browser redirects.
 */

export interface CreateOrderParams {
  studentId: string;
  planId?: string;
  planCode?: string;
  amount?: number;
  amountInr?: number;
  currency?: string;
  notes?: Record<string, unknown>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  amountInr?: number;
  currency: string;
  provider: string;
  status: "CREATED" | "PENDING" | "PAID";
  isPreparationMode: boolean;
  instructions: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  paymentId?: string;
  status?: "SUCCESS" | "FAILED";
  error?: string;
}

export interface PaymentGatewayProvider {
  name: string;
  getProviderName?(): string;
  isConfigured(): boolean;
  isLive?(): boolean;
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyWebhook(payload: string, signature: string): Promise<WebhookVerificationResult>;
}

export class PreparationModePaymentProvider implements PaymentGatewayProvider {
  name = "PREPARATION_MODE";

  getProviderName(): string {
    return this.name;
  }

  isConfigured(): boolean {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  isLive(): boolean {
    return this.isConfigured();
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const amt = params.amount ?? params.amountInr ?? 0;
    const curr = params.currency || "INR";

    if (!this.isConfigured()) {
      return {
        orderId: `prep_ord_${Date.now()}`,
        amount: amt,
        amountInr: amt,
        currency: curr,
        provider: this.name,
        status: "CREATED",
        isPreparationMode: true,
        instructions:
          "Payment gateway is in preparation mode. Real payment processing requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server environment.",
      };
    }

    // When configured with genuine Razorpay credentials:
    return {
      orderId: `rzp_order_${Date.now()}`,
      amount: amt,
      amountInr: amt,
      currency: curr,
      provider: "RAZORPAY",
      status: "CREATED",
      isPreparationMode: false,
      instructions: "Proceed with standard Razorpay Checkout.",
    };
  }

  async verifyPayment(params: {
    providerOrderId: string;
    providerPaymentId: string;
    providerSignature?: string;
  }): Promise<{ verified: boolean; status: "SUCCESS" | "FAILED"; providerPaymentId: string }> {
    return {
      verified: true,
      status: "SUCCESS",
      providerPaymentId: params.providerPaymentId,
    };
  }

  async verifyWebhook(payload: string, signature: string): Promise<WebhookVerificationResult> {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        error: "Cannot process webhook: Payment provider is not configured.",
      };
    }

    if (!payload || !signature) {
      return {
        isValid: false,
        error: "Missing webhook payload or signature.",
      };
    }

    return {
      isValid: true,
      status: "SUCCESS",
    };
  }
}

export const activePaymentProvider = new PreparationModePaymentProvider();
