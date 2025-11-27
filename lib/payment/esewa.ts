import CryptoJS from "crypto-js";

interface EsewaPaymentParams {
  amount: number;
  orderId: string;
  productName: string;
}

interface EsewaVerificationParams {
  orderId: string;
  amount: number;
  refId: string;
}

export class EsewaPayment {
  private merchantId: string;
  private secretKey: string;
  private productCode: string;
  private successUrl: string;
  private failureUrl: string;
  private paymentUrl: string;

  constructor() {
    this.merchantId = process.env.ESEWA_MERCHANT_ID || "";
    this.secretKey = process.env.ESEWA_SECRET_KEY || "";
    this.productCode = process.env.ESEWA_PRODUCT_CODE || "";
    this.successUrl = process.env.ESEWA_SUCCESS_URL || "";
    this.failureUrl = process.env.ESEWA_FAILURE_URL || "";
    this.paymentUrl = process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || "";
  }

  // Generate signature for eSewa payment
  generateSignature(message: string): string {
    const hash = CryptoJS.HmacSHA256(message, this.secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
  }

  // Initialize payment with eSewa
  initiatePayment({ amount, orderId, productName }: EsewaPaymentParams) {
    const totalAmount = amount.toFixed(2);
    const taxAmount = "0";
    const productServiceCharge = "0";
    const productDeliveryCharge = "0";

    // Create signature message for v2 API
    const message = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${this.productCode}`;
    const signature = this.generateSignature(message);

    return {
      paymentUrl: this.paymentUrl,
      params: {
        amount: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: orderId,
        product_code: this.productCode,
        product_service_charge: productServiceCharge,
        product_delivery_charge: productDeliveryCharge,
        success_url: `${this.successUrl}?oid=${orderId}`,
        failure_url: `${this.failureUrl}?oid=${orderId}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      },
    };
  }

  // Verify eSewa payment
  async verifyPayment({ orderId, amount, refId }: EsewaVerificationParams): Promise<boolean> {
    try {
      const totalAmount = amount.toFixed(2);
      
      if (!refId) {
        return false;
      }

      // Call eSewa v2 verification endpoint
      const verificationUrl = `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${this.productCode}&total_amount=${totalAmount}&transaction_uuid=${orderId}`;
      
      const response = await fetch(verificationUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Check if transaction status is COMPLETE
      return data.status === "COMPLETE";
    } catch (error) {
      console.error("eSewa verification error:", error);
      return false;
    }
  }
}

export const esewaPayment = new EsewaPayment();
