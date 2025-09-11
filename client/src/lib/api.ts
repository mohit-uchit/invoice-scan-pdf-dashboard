import { apiRequest } from "./queryClient";
import type { Invoice, InsertInvoice, UpdateInvoice } from "@shared/schema";

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ExtractResponse {
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
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  limit: number;
  offset: number;
}

export const api = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  },

  async extractInvoiceData(fileId: string, model = 'gemini'): Promise<ExtractResponse> {
    const response = await apiRequest('POST', '/api/extract', { fileId, model });
    const result = await response.json();
    return result.data;
  },

  async getInvoices(search?: string, limit = 10, offset = 0): Promise<InvoicesResponse> {
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await apiRequest('GET', `/api/invoices?${params}`);
    const result = await response.json();
    return result.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiRequest('GET', `/api/invoices/${id}`);
    const result = await response.json();
    return result.data;
  },

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const response = await apiRequest('POST', '/api/invoices', invoice);
    const result = await response.json();
    return result.data;
  },

  async updateInvoice(id: string, invoice: UpdateInvoice): Promise<Invoice> {
    const response = await apiRequest('PUT', `/api/invoices/${id}`, invoice);
    const result = await response.json();
    return result.data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await apiRequest('DELETE', `/api/invoices/${id}`);
  },

  getPdfUrl(fileId: string): string {
    return `/api/files/${fileId}`;
  }
};
