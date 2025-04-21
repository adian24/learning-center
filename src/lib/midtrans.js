import midtransClient from "midtrans-client";

const isProduction = process.env.NODE_ENV === "production";

export const SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com/v2";
export const PRODUCTION_BASE_URL = "https://api.midtrans.com/v2";

export const baseUrl = isProduction ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;

export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

// Function to truncate text to a safe length for Midtrans
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Format card expiry from MM/YY to requested format
export const formatCardExpiry = (expiry) => {
  // Remove any non-digit characters
  const expiryDigits = expiry.replace(/\D/g, "");

  if (expiryDigits.length < 4) {
    return { month: "", year: "" };
  }

  const month = expiryDigits.substring(0, 2);
  const year = `20${expiryDigits.substring(2, 4)}`;

  return { month, year };
};

// Format card number by removing spaces
export const formatCardNumber = (cardNumber) => {
  return cardNumber.replace(/\s+/g, "");
};
