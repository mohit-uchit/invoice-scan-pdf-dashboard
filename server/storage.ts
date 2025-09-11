import { type Invoice, type InsertInvoice, type UpdateInvoice } from "@shared/schema";
import mongoose, { Schema, Document } from "mongoose";

// MongoDB document interface
interface InvoiceDocument extends Document {
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
  createdAt: string;
  updatedAt?: string;
}

// MongoDB schema
const invoiceSchema = new Schema<InvoiceDocument>({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  vendor: {
    name: { type: String, required: true },
    address: { type: String },
    taxId: { type: String }
  },
  invoice: {
    number: { type: String, required: true },
    date: { type: String, required: true },
    currency: { type: String },
    subtotal: { type: Number },
    taxPercent: { type: Number },
    total: { type: Number },
    poNumber: { type: String },
    poDate: { type: String },
    lineItems: [{
      description: { type: String, required: true },
      unitPrice: { type: Number, required: true },
      quantity: { type: Number, required: true },
      total: { type: Number, required: true }
    }]
  },
  createdAt: { type: String, required: true },
  updatedAt: { type: String }
}, { timestamps: false }); // We handle timestamps manually

// Create the model
const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);

export interface IStorage {
  connect(): Promise<void>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoices(search?: string, limit?: number, offset?: number): Promise<{ invoices: Invoice[], total: number }>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: UpdateInvoice): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getInvoiceByFileId(fileId: string): Promise<Invoice | undefined>;
}

export class MongoStorage implements IStorage {
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      await mongoose.connect(mongoUri);
      this.connected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  private documentToInvoice(doc: InvoiceDocument): Invoice {
    return {
      id: (doc._id as any).toString(),
      fileId: doc.fileId,
      fileName: doc.fileName,
      vendor: doc.vendor,
      invoice: doc.invoice,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    await this.connect();
    
    try {
      const doc = await InvoiceModel.findById(id);
      return doc ? this.documentToInvoice(doc) : undefined;
    } catch (error) {
      console.error('Error getting invoice:', error);
      return undefined;
    }
  }

  async getInvoices(search?: string, limit = 10, offset = 0): Promise<{ invoices: Invoice[], total: number }> {
    await this.connect();
    
    try {
      let query = {};
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query = {
          $or: [
            { 'vendor.name': searchRegex },
            { 'invoice.number': searchRegex }
          ]
        };
      }

      const total = await InvoiceModel.countDocuments(query);
      const docs = await InvoiceModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      const invoices = docs.map(doc => this.documentToInvoice(doc));
      
      return { invoices, total };
    } catch (error) {
      console.error('Error getting invoices:', error);
      return { invoices: [], total: 0 };
    }
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    await this.connect();
    
    try {
      const now = new Date().toISOString();
      const doc = new InvoiceModel({
        ...insertInvoice,
        createdAt: now
      });
      
      const saved = await doc.save();
      return this.documentToInvoice(saved);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  async updateInvoice(id: string, updateData: UpdateInvoice): Promise<Invoice | undefined> {
    await this.connect();
    
    try {
      const now = new Date().toISOString();
      const doc = await InvoiceModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: now },
        { new: true }
      );
      
      return doc ? this.documentToInvoice(doc) : undefined;
    } catch (error) {
      console.error('Error updating invoice:', error);
      return undefined;
    }
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.connect();
    
    try {
      const result = await InvoiceModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  async getInvoiceByFileId(fileId: string): Promise<Invoice | undefined> {
    await this.connect();
    
    try {
      const doc = await InvoiceModel.findOne({ fileId });
      return doc ? this.documentToInvoice(doc) : undefined;
    } catch (error) {
      console.error('Error getting invoice by fileId:', error);
      return undefined;
    }
  }
}

export const storage = new MongoStorage();
