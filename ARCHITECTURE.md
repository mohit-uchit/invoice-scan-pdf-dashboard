# InvoiceScan - Architecture Documentation

## Overview

InvoiceScan is a modern web application for uploading, analyzing, and managing invoices using AI-powered data extraction. The application provides a seamless user experience for processing PDF invoices and maintaining an organized database of extracted information.

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Router**: Wouter (lightweight alternative to React Router)
- **State Management**: 
  - React Query for server state
  - React Hooks for local state
- **UI Components**: 
  - Radix UI (accessible component primitives)
  - Tailwind CSS for styling
  - Custom UI components in `components/ui/`
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **File Upload**: Multer middleware
- **AI Integration**: Google Gemini AI API for PDF data extraction
- **Database**: MongoDB (with schema validation)
- **Development Server**: Custom Vite dev server integration

### Shared
- **Type Safety**: TypeScript with shared type definitions
- **Schema Validation**: Zod for runtime type checking
- **Environment Management**: dotenv for configuration

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   └── ...        # Feature-specific components
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
├── server/                 # Express.js backend
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database interface
│   ├── services/          # External services integration
│   └── vite.ts           # Development server setup
├── shared/                # Shared TypeScript types
└── config files          # Various configuration files
```

## Architecture Design

### Frontend Architecture

1. **Component Organization**
   - Atomic design pattern for UI components
   - Feature-based organization for business logic
   - Shared UI components in `components/ui/`
   - Page components handle routing and data fetching

2. **State Management**
   - React Query for server state (caching, invalidation)
   - Local state with React hooks
   - Centralized API client for data fetching

3. **Routing**
   - Wouter for lightweight client-side routing
   - Route components in `pages/` directory
   - Layout components for shared UI structure

### Backend Architecture

1. **API Design**
   - RESTful endpoints with consistent response format
   - Error handling middleware
   - Request validation using Zod schemas
   - File upload handling with size and type restrictions

2. **Middleware Stack**
   ```typescript
   app.use(express.json());
   app.use(express.urlencoded({ extended: false }));
   app.use(requestLogging);
   ```

3. **File Handling**
   - In-memory storage for development
   - Pluggable storage interface for production (e.g., Vercel Blob)
   - PDF file validation and size limits

4. **AI Integration**
   - Gemini AI service for PDF text extraction
   - Structured data extraction with validation
   - Error handling and retries

### Data Flow

1. **PDF Upload Flow**
   ```
   Client -> Upload PDF -> Store File -> Extract Data -> Save to DB
   ```

2. **Data Extraction Flow**
   ```
   PDF -> Gemini AI -> Structured JSON -> Validation -> Database
   ```

3. **Invoice Management Flow**
   ```
   List/Search -> View Details -> Edit/Update -> Save Changes
   ```

## API Endpoints

### Base URL: `/api`

#### PDF Management
- `POST /upload` - Upload PDF file
- `POST /extract` - Extract data using AI
- `GET /files/:fileId` - Retrieve PDF file

#### Invoice Management
- `GET /invoices` - List all invoices with search
- `GET /invoices/:id` - Get single invoice
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

## Security Considerations

1. **File Upload Security**
   - File type validation
   - Size limits (25MB max)
   - Secure file storage recommendations

2. **API Security**
   - Input validation
   - Error handling
   - Rate limiting (recommended for production)

3. **Environment Variables**
   - Secure credential management
   - Separate dev/prod configurations
   - API key protection

## Development Workflow

1. **Local Development**
   ```bash
   npm install        # Install dependencies
   npm run dev       # Start development server
   ```

2. **Build Process**
   ```bash
   npm run build     # Build for production
   npm start         # Start production server
   ```

3. **Environment Configuration**
   - Create `.env` file
   - Required variables:
     - `MONGODB_URI`
     - `GEMINI_API_KEY`
     - `PORT` (default: 5000)

## Production Considerations

1. **Deployment**
   - Separate frontend/backend deployments
   - Environment variable management
   - Database connection handling

2. **Storage**
   - Replace in-memory storage with blob storage
   - Configure CDN for PDF serving
   - Implement file cleanup

3. **Monitoring**
   - API logging
   - Error tracking
   - Performance monitoring

## Future Improvements

1. **Features**
   - Batch processing
   - Export functionality
   - Advanced search filters
   - User authentication

2. **Technical**
   - Caching layer
   - Queue system for processing
   - Real-time updates
   - Test coverage

3. **Infrastructure**
   - Container support
   - CI/CD pipeline
   - Backup strategy
   - Scaling considerations