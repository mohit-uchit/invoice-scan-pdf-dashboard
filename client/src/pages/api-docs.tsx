import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ApiDocs() {
  const endpoints = [
    {
      method: 'POST',
      path: '/upload',
      title: 'Upload PDF',
      description: 'Upload a PDF file for processing (max 25MB)',
      requestBody: 'multipart/form-data with "file" field',
      response: `{
  "success": true,
  "data": {
    "fileId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "fileName": "invoice_sample.pdf",
    "fileSize": 2048576,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}`
    },
    {
      method: 'POST',
      path: '/extract',
      title: 'Extract with AI',
      description: 'Extract invoice data using AI models',
      requestBody: `{
  "fileId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "model": "gemini"
}`,
      response: `{
  "success": true,
  "data": {
    "vendor": {
      "name": "TechCorp Solutions",
      "address": "123 Business Ave, San Francisco, CA 94105",
      "taxId": "12-3456789"
    },
    "invoice": {
      "number": "INV-2024-001",
      "date": "2024-01-15",
      "currency": "USD",
      "subtotal": 6000.00,
      "taxPercent": 8.25,
      "total": 6495.00,
      "poNumber": "PO-2024-001",
      "poDate": "2024-01-10",
      "lineItems": [
        {
          "description": "Software Development Services",
          "unitPrice": 150.00,
          "quantity": 40,
          "total": 6000.00
        }
      ]
    }
  }
}`
    },
    {
      method: 'GET',
      path: '/invoices',
      title: 'Get Invoices',
      description: 'Retrieve all invoices with optional search',
      requestBody: 'Query parameters: ?q=search_term&limit=10&offset=0',
      response: `{
  "success": true,
  "data": {
    "invoices": [...],
    "total": 3,
    "limit": 10,
    "offset": 0
  }
}`
    },
    {
      method: 'GET',
      path: '/invoices/:id',
      title: 'Get Single Invoice',
      description: 'Retrieve a specific invoice by ID',
      requestBody: 'Path parameter: id',
      response: `{
  "success": true,
  "data": {
    "fileId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "fileName": "invoice_sample.pdf",
    "vendor": { ... },
    "invoice": { ... },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}`
    },
    {
      method: 'PUT',
      path: '/invoices/:id',
      title: 'Update Invoice',
      description: 'Update invoice data',
      requestBody: `{
  "vendor": {
    "name": "Updated Vendor Name",
    "address": "New Address",
    "taxId": "NEW-TAX-ID"
  },
  "invoice": {
    "number": "INV-2024-001-UPDATED",
    "date": "2024-01-15",
    "total": 7000.00
  }
}`,
      response: `{
  "success": true,
  "data": { /* updated invoice object */ }
}`
    },
    {
      method: 'DELETE',
      path: '/invoices/:id',
      title: 'Delete Invoice',
      description: 'Delete an invoice and associated file',
      requestBody: 'Path parameter: id',
      response: `{
  "success": true,
  "message": "Invoice deleted successfully"
}`
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">API Documentation</h2>
          <p className="text-muted-foreground">Complete API reference for the PDF Review Dashboard</p>
        </header>

        {/* Base URL */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <code>http://localhost:8000/api</code>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              Currently, the API does not require authentication for local development.
              In production, implement proper API key authentication.
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">Endpoints</h3>
          
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-foreground">/api{endpoint.path}</code>
                </div>
                <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                <p className="text-muted-foreground">{endpoint.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Request</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <pre>{endpoint.requestBody}</pre>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Response</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <pre>{endpoint.response}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Responses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Error Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">All endpoints return consistent error responses:</p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <pre>{`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "fileId",
      "reason": "Required field missing"
    }
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
