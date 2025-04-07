// M-Pesa API integration
// Based on Safaricom's Daraja API

import axios from "axios"

// M-Pesa API credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const SHORTCODE = process.env.MPESA_SHORTCODE || ""
const PASSKEY = process.env.MPESA_PASSKEY || ""
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || ""

// Base URL for Safaricom API
const BASE_URL = "https://sandbox.safaricom.co.ke"
  process.env.NODE_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"

// Get OAuth token
async function getAccessToken() {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    return response.data.access_token
  } catch (error) {
    console.error("Error getting M-Pesa access token:", error)
    throw new Error("Failed to get M-Pesa access token")
  }
}

// Generate timestamp in the format required by M-Pesa
function getTimestamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  const second = String(date.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}${hour}${minute}${second}`
}

// Generate password for STK Push
function getPassword(timestamp: string) {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64")
}

// Initiate STK Push to request payment from customer
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string,
) {
  try {
    // Format phone number (remove leading 0 or +254)
    const formattedPhone = phoneNumber.replace(/^(0|\+254)/, "254")

    const timestamp = getTimestamp()
    const password = getPassword(timestamp)
    const token = await getAccessToken()

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount), // M-Pesa requires whole numbers
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      customerMessage: response.data.CustomerMessage,
    }
  } catch (error) {
    console.error("Error initiating STK push:", error)
    return {
      success: false,
      error: "Failed to initiate M-Pesa payment",
    }
  }
}

// Check STK Push transaction status
export async function checkTransactionStatus(checkoutRequestID: string) {
  try {
    const timestamp = getTimestamp()
    const password = getPassword(timestamp)
    const token = await getAccessToken()

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    return {
      success: true,
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
    }
  } catch (error) {
    console.error("Error checking transaction status:", error)
    return {
      success: false,
      error: "Failed to check transaction status",
    }
  }
}

// Process M-Pesa callback
export function processMpesaCallback(callbackData: any) {
  try {
    const { Body } = callbackData

    if (Body.stkCallback.ResultCode === 0) {
      // Successful transaction
      const { CallbackMetadata } = Body.stkCallback

      // Extract payment details
      const amount = CallbackMetadata.Item.find((item: any) => item.Name === "Amount")?.Value
      const mpesaReceiptNumber = CallbackMetadata.Item.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value
      const transactionDate = CallbackMetadata.Item.find((item: any) => item.Name === "TransactionDate")?.Value
      const phoneNumber = CallbackMetadata.Item.find((item: any) => item.Name === "PhoneNumber")?.Value

      return {
        success: true,
        amount,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
      }
    } else {
      // Failed transaction
      return {
        success: false,
        resultCode: Body.stkCallback.ResultCode,
        resultDesc: Body.stkCallback.ResultDesc,
      }
    }
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error)
    return {
      success: false,
      error: "Failed to process callback",
    }
  }
}

