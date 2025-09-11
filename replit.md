# Overview

This is a PDF Review Dashboard built as a fullstack monorepo application. The system allows users to upload PDF files (up to 25MB), view them in a browser-based PDF viewer, and extract invoice data using AI models like Google Gemini. The extracted data can be edited, saved, and managed through a comprehensive CRUD interface. The application features a clean separation between frontend and backend components within a single repository structure.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React** and **TypeScript**, utilizing modern React patterns with functional components and hooks. The UI is constructed using **shadcn/ui** components built on top of **Radix UI** primitives, providing a consistent and accessible design system. **Tailwind CSS** handles styling with a custom design token system. The application uses **Wouter** for client-side routing and **TanStack Query** for server state management, providing efficient data fetching, caching, and synchronization.

## Backend Architecture
The backend follows a **Node.js Express** server architecture with TypeScript. It implements a RESTful API design with clear endpoint separation for file uploads, AI extraction, and CRUD operations. The server uses **multer** for handling file uploads with built-in validation and size limits. Error handling is centralized through Express middleware, providing consistent error responses across all endpoints.

## Data Storage Solutions
The application uses **MongoDB** as its primary database, accessed through **Mongoose ODM** for schema definition and data validation. **Drizzle ORM** is configured for potential database operations with PostgreSQL support. File storage is currently implemented as in-memory storage for development, designed to be easily replaced with cloud storage solutions like Vercel Blob or MongoDB GridFS for production deployments.

## Authentication and Authorization
Currently, the application does not implement user authentication, operating as a single-user system. The architecture is designed to accommodate future authentication integration through middleware patterns already established in the Express server setup.

## AI Integration Architecture
The system integrates with **Google Gemini AI** for intelligent document processing. The AI service is abstracted into a dedicated service layer (`server/services/gemini.ts`) that handles PDF analysis and structured data extraction. The service converts PDF files to base64 for AI processing and uses schema validation to ensure extracted data conforms to expected formats.

## Component Architecture
The frontend follows a modular component structure with clear separation of concerns:
- **UI Components**: Reusable design system components in `client/src/components/ui/`
- **Feature Components**: Business logic components like `PDFViewer` and `InvoiceForm`
- **Pages**: Route-level components handling specific application views
- **Shared Types**: TypeScript schemas shared between frontend and backend in the `shared/` directory

## API Design Patterns
The REST API follows consistent patterns with standardized response formats including success/error states and data wrapping. All endpoints use proper HTTP status codes and include comprehensive error handling. The API supports file upload validation, search functionality, and CRUD operations with appropriate HTTP methods.

# External Dependencies

## AI Services
- **Google Gemini AI**: Primary AI service for PDF content extraction and invoice data processing
- **@google/genai**: Official Google Generative AI SDK for API integration

## Database and ORM
- **MongoDB**: Primary database for storing invoice records and metadata
- **Mongoose**: MongoDB object modeling for Node.js with schema validation
- **Drizzle ORM**: Modern TypeScript ORM configured for potential PostgreSQL integration
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Drizzle

## Frontend Libraries
- **React**: Core frontend framework with TypeScript support
- **TanStack Query**: Powerful data synchronization for React applications
- **Wouter**: Minimalist routing library for React
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema parsing

## UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimization for Replit platform

## File Processing
- **Multer**: Middleware for handling multipart/form-data file uploads
- **PDF.js**: Browser-based PDF rendering (referenced for viewer implementation)