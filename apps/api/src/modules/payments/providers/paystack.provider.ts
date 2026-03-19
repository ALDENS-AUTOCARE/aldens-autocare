type PaystackInitializeInput = {
  email: string;
  amount: number; // in pesewas
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
};

export const paystackProvider = {
  async initializePayment(input: PaystackInitializeInput) {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to initialize Paystack payment");
    }

    const json = await response.json();

    return {
      authorizationUrl: json.data.authorization_url as string,
      accessCode: json.data.access_code as string,
      reference: json.data.reference as string,
    };
  },
};

