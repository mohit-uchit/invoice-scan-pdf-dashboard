import { z } from "zod";

// Line item schema
const lineItemSchema = z.object({
  description: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  total: z.number()
});

// Vendor schema
const vendorSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  taxId: z.string().optional()
});

// Invoice details schema
const invoiceSchema = z.object({
  number: z.string(),
  date: z.string(),
  currency: z.string().optional(),
  subtotal: z.number().optional(),
  taxPercent: z.number().optional(),
  total: z.number().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  lineItems: z.array(lineItemSchema)
});

// Complete invoice document schema for MongoDB
export const invoiceDocumentSchema = z.object({
  _id: z.string().optional(), // MongoDB _id (optional for inserts)
  fileId: z.string(),
  fileName: z.string(),
  vendor: vendorSchema,
  invoice: invoiceSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

// Insert schema (no _id, createdAt, updatedAt)
export const insertInvoiceSchema = invoiceDocumentSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true
});

// Update schema (partial, no _id, createdAt)
export const updateInvoiceSchema = invoiceDocumentSchema.omit({
  _id: true,
  createdAt: true
}).partial();

// TypeScript types
export type Invoice = z.infer<typeof invoiceDocumentSchema> & { id: string }; // id instead of _id for frontend
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;

// Export individual schemas for validation
export { vendorSchema, invoiceSchema, lineItemSchema };
