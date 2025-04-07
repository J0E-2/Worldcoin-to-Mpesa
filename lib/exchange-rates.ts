import axios from "axios"

// API keys for exchange rate services
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest"

// Cache for exchange rates to avoid excessive API calls
interface RateCache {
  wldToUsd: number
  usdToKes: number
  timestamp: number
  expiresAt: number
}

let rateCache: RateCache | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Get WLD to USD exchange rate from CoinGecko
async function getWLDtoUSD(): Promise<number> {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: "worldcoin",
        vs_currencies: "usd",
      },
    })

    return response.data.worldcoin.usd
  } catch (error) {
    console.error("Error fetching WLD to USD rate:", error)
    throw new Error("Failed to fetch WLD to USD exchange rate")
  }
}

// Get USD to KES exchange rate
async function getUSDtoKES(): Promise<number> {
  try {
    const response = await axios.get(`${EXCHANGE_RATE_API_URL}/USD`)
    return response.data.rates.KES
  } catch (error) {
    console.error("Error fetching USD to KES rate:", error)
    throw new Error("Failed to fetch USD to KES exchange rate")
  }
}

// Get all exchange rates with caching
export async function getExchangeRates(): Promise<{
  wldToUsd: number
  usdToKes: number
  wldToKes: number
  lastUpdated: Date
}> {
  const now = Date.now()

  // Return cached rates if they're still valid
  if (rateCache && now < rateCache.expiresAt) {
    return {
      wldToUsd: rateCache.wldToUsd,
      usdToKes: rateCache.usdToKes,
      wldToKes: rateCache.wldToUsd * rateCache.usdToKes,
      lastUpdated: new Date(rateCache.timestamp),
    }
  }

  // Fetch new rates
  try {
    const [wldToUsd, usdToKes] = await Promise.all([getWLDtoUSD(), getUSDtoKES()])

    // Update cache
    rateCache = {
      wldToUsd,
      usdToKes,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    }

    return {
      wldToUsd,
      usdToKes,
      wldToKes: wldToUsd * usdToKes,
      lastUpdated: new Date(now),
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error)

    // If cache exists but is expired, use it as fallback
    if (rateCache) {
      return {
        wldToUsd: rateCache.wldToUsd,
        usdToKes: rateCache.usdToKes,
        wldToKes: rateCache.wldToUsd * rateCache.usdToKes,
        lastUpdated: new Date(rateCache.timestamp),
      }
    }

    throw new Error("Failed to fetch exchange rates")
  }
}

// Convert WLD to KES
export async function convertWLDtoKES(wldAmount: number): Promise<{
  kesAmount: number
  wldToUsd: number
  usdToKes: number
  wldToKes: number
}> {
  const rates = await getExchangeRates()
  const kesAmount = wldAmount * rates.wldToKes

  return {
    kesAmount,
    wldToUsd: rates.wldToUsd,
    usdToKes: rates.usdToKes,
    wldToKes: rates.wldToKes,
  }
}

