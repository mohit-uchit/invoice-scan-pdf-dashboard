import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Setup() {
  const prerequisites = [
    { name: "Node.js 18+", status: "required" },
    { name: "npm or yarn package manager", status: "required" },
    { name: "MongoDB connection (provided)", status: "configured" },
    { name: "Gemini API key (provided)", status: "configured" }
  ];

  const envVars = [
    { name: "MONGODB_URI", value: "mongodb+srv://officialmohituchit:T05zUyMA4vo6U4x9@cluster0.ejara.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", description: "MongoDB connection string" },
    { name: "GEMINI_API_KEY", value: "AIzaSyAYWkBl7JdfV5GfpZEfYu1NOFxqCNcy4RI", description: "Google Gemini AI API key" },
    { name: "PORT", value: "8000", description: "Backend server port" }
  ];

  const scripts = [
    { command: "npm run dev", description: "Start development server (frontend + backend)" },
    { command: "npm run build", description: "Build for production" },
    { command: "npm run start", description: "Start production server" },
    { command: "npm run check", description: "Type checking" }
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Local Setup & Deployment</h2>
          <p className="text-muted-foreground">Step-by-step guide to set up the PDF Review Dashboard</p>
        </header>

        {/* Prerequisites */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-check text-green-500 w-4"></i>
                    <span className="text-foreground">{prereq.name}</span>
                  </div>
                  <Badge variant={prereq.status === 'configured' ? 'default' : 'secondary'}>
                    {prereq.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Project Structure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Project Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              <pre>{`pdf-review-dashboard/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and API client
│   │   └── hooks/           # Custom React hooks
│   └── index.html
├── server/                  # Express.js backend
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data storage interface
│   └── services/            # External services (Gemini AI)
├── shared/                  # Shared TypeScript types
│   └── schema.ts            # Database schema and types
├── package.json             # Dependencies and scripts
└── README.md`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">1. Install Dependencies</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <pre>{`# Install all dependencies
npm install

# For specific packages if needed
npm install @google/genai multer
npm install --save-dev @types/multer`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">2. Environment Configuration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The required environment variables are already configured for this deployment.
                  For local development, create a <code>.env</code> file in the root directory:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <pre>{envVars.map(env => `${env.name}=${env.value}`).join('\n')}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">3. Start Development Server</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <pre>{`# Start the full stack application
npm run dev

# This will start:
# - Express backend on port 8000
# - Vite frontend on port 5000 (proxied)`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {envVars.map((env, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono text-foreground font-semibold">{env.name}</code>
                    <Badge variant="outline">configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{env.description}</p>
                  <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                    {env.name === 'GEMINI_API_KEY' ? '••••••••••••••••••••••••••••••••••••••••' : env.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Scripts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Available Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scripts.map((script, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <code className="text-sm font-mono text-foreground font-semibold">{script.command}</code>
                  <span className="text-sm text-muted-foreground">{script.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Schema */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Database Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">MongoDB document structure for invoice storage:</p>
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              <pre>{`{
  "_id": "ObjectId",
  "fileId": "string",
  "fileName": "string",
  "vendor": {
    "name": "string",
    "address": "string (optional)",
    "taxId": "string (optional)"
  },
  "invoice": {
    "number": "string",
    "date": "string (ISO 8601)",
    "currency": "string (optional)",
    "subtotal": "number (optional)",
    "taxPercent": "number (optional)",
    "total": "number (optional)",
    "poNumber": "string (optional)",
    "poDate": "string (optional)",
    "lineItems": [
      {
        "description": "string",
        "unitPrice": "number",
        "quantity": "number",
        "total": "number"
      }
    ]
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601, optional)"
}`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>PDF upload with 25MB file size limit and validation</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>AI-powered invoice data extraction using Google Gemini</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>Split-screen interface with PDF viewer and editable form</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>Complete CRUD operations for invoice management</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>Search and filter functionality for invoice lists</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>Responsive design with shadcn/ui components</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>Real-time form validation and error handling</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i>
                <span>In-memory storage with MongoDB-ready schema</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Common Issues</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Port conflicts:</strong> Ensure ports 5000 and 8000 are available</li>
                  <li><strong>PDF upload errors:</strong> Check file size (max 25MB) and format (PDF only)</li>
                  <li><strong>AI extraction failures:</strong> Verify Gemini API key is valid and has quota</li>
                  <li><strong>MongoDB connection issues:</strong> Check connection string and network access</li>
                  <li><strong>Build errors:</strong> Clear node_modules and reinstall dependencies</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-2">Support</h4>
                <p className="text-sm text-muted-foreground">
                  For issues and questions, check the console logs for detailed error messages.
                  The application includes comprehensive error handling and user feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
