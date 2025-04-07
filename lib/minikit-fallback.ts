// This is a fallback implementation for when the MiniKit package is not available
// It mimics the MiniKit API to prevent errors

export class MiniKitFallback {
  static isInstalled(): boolean {
    return false
  }

  static install(appId: string): void {
    console.warn("MiniKit is not installed. Using fallback implementation.")
  }

  static get user() {
    return {
      username: "test_user",
    }
  }

  static commandsAsync = {
    walletAuth: async ({ nonce, expirationTime, statement }: any) => {
      console.warn("MiniKit walletAuth called with fallback implementation")
      return {
        finalPayload: {
          status: "error",
          error_code: "NOT_INSTALLED",
          message: "MiniKit is not installed",
          address: "0x0000000000000000000000000000000000000000",
        },
      }
    },
    pay: async ({ reference, to, tokens, description }: any) => {
      console.warn("MiniKit pay called with fallback implementation")
      return {
        finalPayload: {
          status: "error",
          error_code: "NOT_INSTALLED",
          message: "MiniKit is not installed",
        },
      }
    },
  }
}

