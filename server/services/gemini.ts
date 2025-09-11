import { GoogleGenAI } from "@google/genai";
import { vendorSchema, invoiceSchema } from "@shared/schema";
import { z } from "zod";

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 GEMINI_API_KEY check:', apiKey ? `Available (${apiKey.substring(0, 10)}...)` : 'NOT SET');

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY environment variable is not set');
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const ai = new GoogleGenAI({ 
  apiKey: apiKey 
});

const extractionResponseSchema = z.object({
  vendor: vendorSchema,
  invoice: invoiceSchema
});

export type ExtractionResponse = z.infer<typeof extractionResponseSchema>;

export async function extractInvoiceData(fileBuffer: Buffer, fileName: string): Promise<ExtractionResponse> {
  try {
    const systemPrompt = `You are an expert invoice data extraction system. 
Extract structured data from the invoice PDF and return it as JSON.

Extract the following information:
- Vendor information (name, address, tax ID)
- Invoice details (number, date, currency, amounts, PO details)
- Line items with descriptions, quantities, unit prices, and totals

Be precise and only extract information that is clearly visible in the document.
For dates, use YYYY-MM-DD format.
For numbers, use decimal format without currency symbols.`;

    const contents = [
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
      systemPrompt
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            vendor: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                taxId: { type: "string" }
              },
              required: ["name"]
            },
            invoice: {
              type: "object",
              properties: {
                number: { type: "string" },
                date: { type: "string" },
                currency: { type: "string" },
                subtotal: { type: "number" },
                taxPercent: { type: "number" },
                total: { type: "number" },
                poNumber: { type: "string" },
                poDate: { type: "string" },
                lineItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      unitPrice: { type: "number" },
                      quantity: { type: "number" },
                      total: { type: "number" }
                    },
                    required: ["description", "unitPrice", "quantity", "total"]
                  }
                }
              },
              required: ["number", "date", "lineItems"]
            }
          },
          required: ["vendor", "invoice"]
        }
      },
      contents: contents,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(rawJson);
    
    // Validate the response against our schema
    const validatedData = extractionResponseSchema.parse(parsedData);
    
    return validatedData;
  } catch (error) {
    console.error("Gemini extraction error:", error);
    throw new Error(`Failed to extract invoice data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
