# Norwegian CRM System

A comprehensive, GDPR-compliant Customer Relationship Management system designed specifically for Norwegian businesses.

## 🚀 Features

- **Contact Management** - Complete customer database with tagging and custom fields
- **Sales Pipeline** - Drag-and-drop deal tracking with customizable stages
- **Task Management** - Automated follow-ups and reminders
- **Email Integration** - Send, schedule, and track emails with templates
- **API Integration** - RESTful API with webhooks support
- **Team Management** - Role-based access control (Admin, Manager, Sales)
- **Reports & Analytics** - Revenue tracking and performance metrics
- **GDPR Compliant** - Data export, retention policies, and EU data storage

## 📦 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for all available configuration options.

## 🌐 Deployment

### Railway (Recommended)

This project is optimized for Railway deployment. See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**

1. Create a Railway account at https://railway.app
2. Connect your Git repository
3. Configure environment variables (see `.env.example`)
4. Deploy automatically with the included Dockerfile

**Pre-flight Check:**

```bash
chmod +x scripts/railway-check.sh
./scripts/railway-check.sh
```

### Docker

Build and run locally with Docker:

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## 🏗️ Project Structure

```
.
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── Dashboard.tsx
│   │   ├── ContactsView.tsx
│   │   └── ...
│   ├── api/              # API server implementation
│   ├── lib/              # Utilities and helpers
│   │   ├── config.ts     # Environment configuration
│   │   ├── auth-context.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main application
│   └── index.css         # Global styles
├── Dockerfile            # Production Docker configuration
├── railway.json          # Railway deployment config
├── vite.config.ts        # Vite build configuration
└── package.json
```

## 🔐 Security

- JWT-based authentication
- API key management with permissions
- Role-based access control (RBAC)
- GDPR compliance features
- Secure password reset flow
- Email verification

## 🌍 Internationalization

Currently supports:
- 🇳🇴 Norwegian (Bokmål)
- 🇬🇧 English

Language switching persists across sessions.

## 📊 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: React Context + Spark KV
- **Data Persistence**: Spark KV Store
- **Build Tool**: Vite
- **Testing**: Vitest
- **Icons**: Phosphor Icons
- **Charts**: Recharts, D3

## 📚 Documentation

- [Deployment Guide](./RAILWAY_DEPLOYMENT.md) - Railway deployment instructions
- [API Documentation](./API_IMPLEMENTATION.md) - API endpoints and usage
- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Security](./SECURITY.md) - Security implementation details
- [User Guide](./USER_GUIDE.md) - End-user documentation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:production` - Build with production optimizations
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## 🔧 Configuration

### Build Optimization

The project includes optimized code-splitting:
- Vendor chunks (React, Radix UI, Forms, Charts)
- Lazy-loaded routes
- Minimized bundle sizes

### Production Considerations

- Source maps disabled in production
- Environment-based feature flags
- Health check endpoints
- Monitoring and logging ready

## 🤝 Contributing

This is a private CRM system. For team contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## 📝 License

Copyright (c) 2025. All rights reserved.

## 🆘 Support

For issues or questions:
- Check the documentation in `/docs`
- Review existing issues
- Contact the development team

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Strong secrets generated
- [ ] SMTP credentials tested
- [ ] API keys created
- [ ] GDPR compliance verified
- [ ] SSL/TLS enabled
- [ ] Custom domain configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Team access configured

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for the complete checklist.

---

Built with ❤️ for Norwegian businesses
