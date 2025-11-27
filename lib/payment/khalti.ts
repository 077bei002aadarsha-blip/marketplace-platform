import axios from "axios";

interface KhaltiPaymentParams {
  amount: number;
  orderId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export class KhaltiPayment {
  private publicKey: string;
  private secretKey: string;
  private successUrl: string;
  private failureUrl: string;
  private baseUrl: string;

  constructor() {
    this.publicKey = process.env.KHALTI_PUBLIC_KEY || "";
    this.secretKey = process.env.KHALTI_SECRET_KEY || "";
    this.successUrl = process.env.KHALTI_SUCCESS_URL || "";
    this.failureUrl = process.env.KHALTI_FAILURE_URL || "";
    this.baseUrl = "https://a.khalti.com/api/v2";
  }

  // Initialize payment with Khalti (epayment v2 API)
  async initiatePayment({
    amount,
    orderId,
    productName,
    customerName,
    customerEmail,
    customerPhone,
  }: KhaltiPaymentParams): Promise<{
    success: boolean;
    payment_url?: string;
    pidx?: string;
    error?: string;
  }> {
    try {
      // Khalti amount is in paisa (1 Rs = 100 paisa)
      const amountInPaisa = Math.round(amount * 100);

      const payload = {
        return_url: `${this.successUrl}?oid=${orderId}&gateway=khalti`,
        website_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        amount: amountInPaisa,
        purchase_order_id: orderId,
        purchase_order_name: productName,
        customer_info: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || "9800000000",
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/epayment/initiate/`,
        payload,
        {
          headers: {
            Authorization: `Key ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.payment_url) {
        return {
          success: true,
          payment_url: response.data.payment_url,
          pidx: response.data.pidx,
        };
      }

      return {
        success: false,
        error: "Invalid response from Khalti",
      };
    } catch (error) {
      console.error("Khalti initiation error:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message,
        };
      }
      return {
        success: false,
        error: "Khalti payment initiation failed",
      };
    }
  }

  // Verify Khalti payment (epayment v2 API)
  async verifyPayment(pidx: string): Promise<{
    success: boolean;
    data?: {
      pidx: string;
      total_amount: number;
      status: string;
      transaction_id: string;
      fee: number;
      refunded: boolean;
    };
    error?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.pidx) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid response from Khalti",
      };
    } catch (error) {
      console.error("Khalti verification error:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message,
        };
      }
      return {
        success: false,
        error: "Verification failed",
      };
    }
  }

}

export const khaltiPayment = new KhaltiPayment();
