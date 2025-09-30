// Types for transaction analysis
export interface TransactionDetails {
  hash: string;
  version: string;
  success: boolean;
  vm_status: string;
  gas_used: string;
  timestamp: string;
  sender: string;
  payload?: {
    function: string;
    arguments: any[];
    type: string;
    type_arguments: any[];
  };
  events?: any[];
  explorerUrl: string;
  block_height?: string;
  state_change_hash?: string;
  event_root_hash?: string;
}

export interface ProductExtractionResult {
  extractedBrand: string;
  extractedProductId: string;
}

export interface AnalysisOptions {
  enableLogging?: boolean;
  apiEndpoint?: string;
}

export const useTransactionAnalysis = (options: AnalysisOptions = {}) => {
  const { enableLogging = true, apiEndpoint = "https://api.testnet.aptoslabs.com/v1" } = options;

  const log = (message: string, data?: any) => {
    if (enableLogging) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  };

  // Fetch transaction details from Aptos blockchain
  const fetchRealTransactionDetails = async (hash: string): Promise<{ data: TransactionDetails | null; error: string | null }> => {
    try {
      const response = await fetch(
        `${apiEndpoint}/transactions/by_hash/${hash}`
      );

      if (!response.ok) {
        throw new Error(`Transaction not found (HTTP ${response.status})`);
      }

      const transactionData = await response.json();

      const formattedDetails: TransactionDetails = {
        hash: transactionData.hash,
        version: transactionData.version,
        success: transactionData.success,
        vm_status: transactionData.vm_status,
        gas_used: transactionData.gas_used,
        timestamp: transactionData.timestamp,
        sender: transactionData.sender,
        payload: transactionData.payload,
        events: transactionData.events,
        block_height: transactionData.block_height,
        state_change_hash: transactionData.state_change_hash,
        event_root_hash: transactionData.event_root_hash,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${hash}?network=mainnet`,
      };

      return { data: formattedDetails, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to fetch transaction details from blockchain";
      
      log("❌ Error fetching transaction details:", error);
      return { data: null, error: errorMessage };
    }
  };

  // Payload analysis - Smart detection for brand names and product IDs
  const analyzeProductFromPayload = (payload: any): ProductExtractionResult => {
    log("🔍 Analyzing payload:", payload);

    let extractedBrand = "";
    let extractedProductId = "";

    if (payload && payload.arguments && payload.arguments.length > 0) {
      log("📋 Arguments found:", payload.arguments);

      // Filter only string arguments
      const stringArgs = payload.arguments.filter(
        (arg: any) => typeof arg === "string" && arg.trim().length > 0
      );

      log("📝 String arguments:", stringArgs);

      if (stringArgs.length > 0) {
        // SMART DETECTION: Analyze each string argument
        for (const arg of stringArgs) {
          const trimmedArg = arg.trim();

          const looksLikeProductId =
            /^[A-Z0-9]{6,12}$/.test(trimmedArg) ||
            /^[A-Z]{2,4}[0-9]{3,6}$/.test(trimmedArg) ||
            /^[0-9]{8,12}$/.test(trimmedArg) ||
            /^OD[0-9]+$/.test(trimmedArg);

          const looksLikeBrandName =
            /^[A-Za-z\s]{2,20}$/.test(trimmedArg) &&
            !/\d/.test(trimmedArg) &&
            trimmedArg.length >= 2;

          log(`🔍 Analyzing "${trimmedArg}":`, {
            looksLikeProductId,
            looksLikeBrandName,
          });

          if (looksLikeProductId && !extractedProductId) {
            extractedProductId = trimmedArg;
            log("🆔 Product ID identified:", extractedProductId);
          } else if (looksLikeBrandName && !extractedBrand) {
            extractedBrand = trimmedArg;
            log("🏷️ Brand name identified:", extractedBrand);
          }
        }

        // FALLBACK: If we couldn't identify by patterns, use position-based logic
        if (!extractedBrand || !extractedProductId) {
          log("🔄 Using fallback position-based detection");

          for (let i = 0; i < stringArgs.length; i++) {
            const arg = stringArgs[i];
            if (!extractedProductId && arg.length >= 6 && arg.length <= 15) {
              extractedProductId = arg;
            } else if (
              !extractedBrand &&
              arg.length >= 2 &&
              arg.length <= 20 &&
              /^[A-Za-z]/.test(arg)
            ) {
              extractedBrand = arg;
            }
          }
        }

        // ULTIMATE FALLBACK: Simple position-based assignment
        if (!extractedBrand && stringArgs.length >= 1) {
          extractedBrand = stringArgs[stringArgs.length - 1];
        }
        if (!extractedProductId && stringArgs.length >= 2) {
          extractedProductId = stringArgs[0];
        }
      }
    }

    log("🎯 Final extraction:", {
      brand: extractedBrand,
      productId: extractedProductId,
    });

    return {
      extractedBrand: extractedBrand || "Brand not found in transaction",
      extractedProductId:
        extractedProductId || "Product ID not found in transaction",
    };
  };

  // Enhanced analysis with multiple strategies
  const enhancedProductAnalysis = (payload: any): ProductExtractionResult & { confidence: "high" | "medium" | "low" } => {
    const result = analyzeProductFromPayload(payload);
    
    let confidence: "high" | "medium" | "low" = "low";
    
    if (result.extractedBrand !== "Brand not found in transaction" && 
        result.extractedProductId !== "Product ID not found in transaction") {
      confidence = "high";
    } else if (result.extractedBrand !== "Brand not found in transaction" || 
               result.extractedProductId !== "Product ID not found in transaction") {
      confidence = "medium";
    }

    return {
      ...result,
      confidence
    };
  };

  // Validate transaction hash format
  const validateTransactionHash = (hash: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  };

  // Extract transaction hash from various formats
  const extractTransactionHash = (data: string): string | null => {
    if (data.startsWith("0x") && data.length === 66) {
      return data;
    }

    const urlMatch = data.match(/0x[a-fA-F0-9]{64}/);
    if (urlMatch) {
      return urlMatch[0];
    }

    const aptosExplorerMatch = data.match(
      /explorer\.aptoslabs\.com\/txn\/(0x[a-fA-F0-9]{64})/
    );
    if (aptosExplorerMatch) {
      return aptosExplorerMatch[1];
    }

    return null;
  };

  return {
    fetchRealTransactionDetails,
    analyzeProductFromPayload,
    enhancedProductAnalysis,
    validateTransactionHash,
    extractTransactionHash,
  };
};