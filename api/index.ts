import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createServer } from 'http';
import { storage } from '../server/storage';
import { extractInvoiceData } from '../server/services/gemini';
import { insertInvoiceSchema, updateInvoiceSchema } from '../shared/schema';
import multer from 'multer';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: './server/.env' });

// Configure multer for file uploads (25MB limit)
// Use raw multer for serverless
const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Promisify multer middleware for serverless
const upload = (
  req: express.Request,
  res: express.Response,
): Promise<Express.Multer.File> => {
  return new Promise((resolve, reject) => {
    multerInstance.single('file')(req, res, err => {
      if (err) reject(err);
      else if (!req.file) reject(new Error('No file uploaded'));
      else resolve(req.file);
    });
  });
};

// Simple file storage simulation
const fileStorage = new Map<
  string,
  { buffer: Buffer; fileName: string; uploadedAt: string }
>();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
app.post('/api/upload', async (req, res) => {
  try {
    const file = await upload(req, res).catch(() => null);

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded or invalid file type' },
      });
    }

    const fileId = randomUUID();
    const fileName = file.originalname;

    fileStorage.set(fileId, {
      buffer: file.buffer,
      fileName,
      uploadedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        fileId,
        fileName,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Upload failed',
      },
    });
  }
});

app.post('/api/extract', async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: { message: 'File ID is required' },
      });
    }

    const fileData = fileStorage.get(fileId);
    if (!fileData) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' },
      });
    }

    const extractedData = await extractInvoiceData(
      fileData.buffer,
      fileData.fileName,
    );

    res.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Extraction failed',
        code: 'EXTRACTION_ERROR',
      },
    });
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const { q: search, limit = '10', offset = '0' } = req.query;
    const result = await storage.getInvoices(
      search as string,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10),
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to fetch invoices',
      },
    });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await storage.getInvoice(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to fetch invoice',
      },
    });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const validatedData = insertInvoiceSchema.parse(req.body);
    const invoice = await storage.createInvoice(validatedData);

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Invalid invoice data',
        code: 'VALIDATION_ERROR',
      },
    });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateInvoiceSchema.parse(req.body);
    const invoice = await storage.updateInvoice(id, validatedData);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Invalid invoice data',
        code: 'VALIDATION_ERROR',
      },
    });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteInvoice(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to delete invoice',
      },
    });
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
