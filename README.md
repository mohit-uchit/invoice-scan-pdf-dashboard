# InvoiceScan - AI-Powered Invoice Management System

## Project Overview 🚀

InvoiceScan is an advanced invoice management solution that leverages artificial intelligence to streamline the processing of PDF invoices. Built with security and efficiency in mind, it provides a seamless experience for businesses to handle their invoice workflow.

### Key Features ⭐

- **Smart PDF Processing**: Upload and process invoices with AI-powered data extraction
- **Real-time Viewer**: Built-in PDF viewer with side-by-side data extraction
- **Intelligent Extraction**: Automatically extracts vendor details, line items, amounts, and dates
- **Data Management**: Comprehensive invoice database with search and filter capabilities
- **Security First**: Secure file handling and data processing with best practices
- **Modern UI**: Responsive design built with React and Radix UI components

## How It Works 🔄

1. **Upload Phase**
   - Drag and drop or select PDF invoices
   - Automatic file validation and virus scanning
   - Secure storage with encryption

2. **Processing Phase**
   - AI-powered text extraction using Google Gemini
   - Structured data parsing and validation
   - Automatic field mapping and categorization

3. **Review Phase**
   - Side-by-side PDF and extracted data view
   - Interactive data verification interface
   - Manual correction capabilities

4. **Management Phase**
   - Searchable invoice database
   - Export functionality
   - Audit trail and version history

## Technology Stack 💻

### Frontend
- React + TypeScript
- Vite for blazing fast development
- Radix UI + TailwindCSS for modern UI
- React Query for efficient data fetching

### Backend
- Node.js + Express
- TypeScript for type safety
- MongoDB for data persistence
- Google Gemini AI API integration

### Security Features
- PDF sanitization
- Rate limiting
- Input validation
- Secure file storage
- Data encryption

## Getting Started 🏁

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Google Gemini AI API key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mohit-uchit/InvoiceScan.git
   cd InvoiceScan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Access the application at `http://localhost:5000`

## Project Structure 📁

```
InvoiceScan/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Route components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and API client
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic and external services
│   └── models/           # Database models and schemas
└── shared/               # Shared TypeScript types and utilities
```

## Security Best Practices 🔒

- Use `.env.local` for sensitive credentials (not committed to git)
- Implement proper authentication in production
- Regular security audits and updates
- Secure file handling and storage
- Input validation and sanitization
- Rate limiting and request validation

## API Documentation 📚

### Core Endpoints

- `POST /api/upload` - Upload PDF files
- `GET /api/files/:id` - Retrieve PDF files
- `POST /api/extract` - Extract data using AI
- `GET /api/invoices` - List all invoices
- `PUT /api/invoices/:id` - Update invoice data
- `DELETE /api/invoices/:id` - Delete invoice

Full API documentation available at `/api-docs` when running the application.

## Production Deployment 🚀

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Production Considerations**
   - Set up proper monitoring and logging
   - Configure CDN for static assets
   - Implement caching strategy
   - Set up backup systems
   - Configure proper security measures

## Author 👨‍💻

**Mohit Uchit**
Senior Backend Developer | Cyber Security Specialist

- 3 years of experience in Node.js backend development
- Expertise in building secure, scalable applications
- Focus on cyber security and best practices
- Background in system architecture and API design

### Connect With Me 🌐

[![LinkedIn](https://img.shields.io/badge/LinkedIn-mohituchit-blue)](https://linkedin.com/in/mohituchit)
[![GitHub](https://img.shields.io/badge/GitHub-mohit--uchit-darkgreen)](https://github.com/mohit-uchit)
[![Twitter](https://img.shields.io/badge/Twitter-mohituchit-blue)](https://twitter.com/mohituchit)
[![Instagram](https://img.shields.io/badge/Instagram-mohit0__0uchit-purple)](https://instagram.com/mohit0_0uchit)

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

For support, email [contact@mohituchit.com] or create an issue in the repository.