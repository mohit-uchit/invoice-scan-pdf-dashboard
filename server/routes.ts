import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractInvoiceData } from "./services/gemini";
import { insertInvoiceSchema, updateInvoiceSchema } from "@shared/schema";
import multer from "multer";
import { randomUUID } from "crypto";

// Configure multer for file uploads (25MB limit)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Simple file storage simulation (in production, use Vercel Blob or similar)
const fileStorage = new Map<string, { buffer: Buffer; fileName: string; uploadedAt: string }>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload PDF endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: "No file uploaded" }
        });
      }

      const fileId = randomUUID();
      const fileName = req.file.originalname;
      
      // Store file in memory (in production, use proper blob storage)
      fileStorage.set(fileId, {
        buffer: req.file.buffer,
        fileName,
        uploadedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          fileId,
          fileName,
          fileSize: req.file.size,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Upload failed' }
      });
    }
  });

  // Extract invoice data with AI
  app.post("/api/extract", async (req, res) => {
    try {
      const { fileId, model = 'gemini' } = req.body;

      if (!fileId) {
        return res.status(400).json({
          success: false,
          error: { message: "File ID is required" }
        });
      }

      const fileData = fileStorage.get(fileId);
      if (!fileData) {
        return res.status(404).json({
          success: false,
          error: { message: "File not found" }
        });
      }

      // Extract data using Gemini
      const extractedData = await extractInvoiceData(fileData.buffer, fileData.fileName);

      res.json({
        success: true,
        data: extractedData
      });
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({
        success: false,
        error: { 
          message: error instanceof Error ? error.message : 'Extraction failed',
          code: 'EXTRACTION_ERROR'
        }
      });
    }
  });

  // Get all invoices with optional search
  app.get("/api/invoices", async (req, res) => {
    try {
      const { q: search, limit: limitParam = '10', offset: offsetParam = '0' } = req.query;
      const limit = parseInt(limitParam as string, 10);
      const offset = parseInt(offsetParam as string, 10);

      const result = await storage.getInvoices(search as string, limit, offset);

      res.json({
        success: true,
        data: {
          invoices: result.invoices,
          total: result.total,
          limit,
          offset
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to fetch invoices' }
      });
    }
  });

  // Get single invoice
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: { message: "Invoice not found" }
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to fetch invoice' }
      });
    }
  });

  // Create new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);

      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { 
          message: error instanceof Error ? error.message : 'Invalid invoice data',
          code: 'VALIDATION_ERROR'
        }
      });
    }
  });

  // Update invoice
  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateInvoiceSchema.parse(req.body);
      
      const invoice = await storage.updateInvoice(id, validatedData);
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: { message: "Invoice not found" }
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: { 
          message: error instanceof Error ? error.message : 'Invalid invoice data',
          code: 'VALIDATION_ERROR'
        }
      });
    }
  });

  // Delete invoice
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvoice(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { message: "Invoice not found" }
        });
      }

      res.json({
        success: true,
        message: "Invoice deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to delete invoice' }
      });
    }
  });

  // Get PDF file
  app.get("/api/files/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const fileData = fileStorage.get(fileId);

      if (!fileData) {
        return res.status(404).json({
          success: false,
          error: { message: "File not found" }
        });
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileData.fileName}"`
      });
      res.send(fileData.buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to retrieve file' }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
