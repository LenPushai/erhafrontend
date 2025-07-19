# ERHA OPS Quote Management Module v7.0

??? **Enhanced Quote Management with Quality Cost Integration & Safety Assessment**

## ?? Overview

The Quote Management Module is a critical component of the ERHA OPS platform, providing comprehensive quote lifecycle management with integrated quality cost analysis and safety risk assessment capabilities.

## ? Key Features

### ?? Core Quote Management
- Complete quote lifecycle from creation to acceptance
- Multi-level approval workflows
- Automated quote numbering and tracking
- Client communication and feedback handling
- Revision history and change tracking

### ??? Quality & Safety Integration
- **Quality cost estimation and tracking**
- **Safety risk assessment scoring**
- **Compliance cost calculations**
- **ISO 9001 integration points**
- **Risk-adjusted pricing models**

### ?? Analytics & Reporting
- Real-time quote performance metrics
- Quality cost analytics and trends
- Safety risk distribution analysis
- Approval workflow efficiency tracking
- ROI analysis for quality investments

### ?? Mobile Support
- Progressive Web App (PWA) for mobile access
- Offline capability for field assessments
- Touch-optimized interfaces
- Quick quality checks and approvals

## ??? Architecture

### Frontend (React + TypeScript)
`
src/
??? components/
?   ??? dashboard/          # Main dashboard components
?   ??? quotes/             # Quote management UI
?   ??? approval/           # Approval workflow components
?   ??? quality-cost/       # Quality cost analytics
?   ??? safety-assessment/  # Safety risk components
?   ??? shared/             # Reusable components
??? pages/                  # Page components
??? services/               # API services
??? hooks/                  # Custom React hooks
??? types/                  # TypeScript interfaces
??? utils/                  # Utility functions
`

### Backend (Node.js + Express)
`
backend/src/
??? controllers/            # Request handlers
??? models/                 # Data models
??? routes/                 # API routes
??? middleware/             # Custom middleware
??? services/               # Business logic
??? validators/             # Input validation
??? utils/                  # Utility functions
`

### Database Schema
- **quotes** - Main quote records with quality/safety fields
- **quote_items** - Individual quote line items with specifications
- **quote_approvals** - Multi-level approval tracking
- **quote_revisions** - Change history and version control

## ?? Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+ (for caching)
- SMTP server (for notifications)

### Installation

1. **Install Frontend Dependencies**
   `ash
   cd erha-ops-quote-management
   npm install
   `

2. **Install Backend Dependencies**
   `ash
   cd backend
   npm install
   `

3. **Database Setup**
   `ash
   # Run migrations
   cd backend
   npm run migrate
   
   # Seed test data (optional)
   npm run seed
   `

4. **Environment Configuration**
   `ash
   # Frontend (.env)
   VITE_API_URL=http://localhost:5002
   VITE_APP_NAME=ERHA OPS Quote Management
   VITE_VERSION=7.0.0
   
   # Backend (.env)
   PORT=5002
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=erha_ops_quotes
   DB_USER=your_db_user
   DB_PASS=your_db_password
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   `

### Development

1. **Start Backend Server**
   `ash
   cd backend
   npm run dev
   `

2. **Start Frontend Development Server**
   `ash
   npm run dev
   `

3. **Access Application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5002
   - Health Check: http://localhost:5002/health

## ?? Configuration

### Quality Cost Settings
Configure quality cost parameters in the admin panel:
- Default quality percentage (% of total quote)
- Risk multipliers by category
- Compliance cost templates
- Safety assessment scoring weights

### Approval Workflows
Set up multi-level approval processes:
- Technical review requirements
- Quality assurance checkpoints
- Safety risk thresholds
- Financial approval limits
- Management sign-off criteria

### Integration Points
Configure external system connections:
- Core platform API endpoints
- Safety module integration
- Finance system sync
- Document management links
- Client portal connections

## ?? API Endpoints

### Quotes
- GET /api/quotes - List quotes with filters
- POST /api/quotes - Create new quote
- GET /api/quotes/:id - Get quote details
- PUT /api/quotes/:id - Update quote
- DELETE /api/quotes/:id - Delete quote
- POST /api/quotes/:id/approve - Submit for approval
- POST /api/quotes/:id/send - Send to client

### Quality Cost
- GET /api/quality/metrics - Quality cost analytics
- POST /api/quality/assessment - Run quality assessment
- GET /api/quality/templates - Cost templates
- PUT /api/quality/settings - Update quality settings

### Safety Assessment
- POST /api/safety/assess - Perform safety risk assessment
- GET /api/safety/metrics - Safety metrics and trends
- GET /api/safety/requirements - Safety requirement templates

### Analytics
- GET /api/analytics/dashboard - Dashboard KPIs
- GET /api/analytics/trends - Historical trends
- GET /api/analytics/reports - Detailed reports

## ?? Testing

### Frontend Tests
`ash
npm run test                # Run unit tests
npm run test:coverage       # Run with coverage
npm run test:e2e           # End-to-end tests
`

### Backend Tests
`ash
cd backend
npm run test               # Run unit tests
npm run test:integration   # Integration tests
npm run test:coverage      # Coverage report
`

## ?? Deployment

### Production Build
`ash
# Frontend
npm run build

# Backend
cd backend
npm run build
`

### Docker Deployment
`ash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
`

### Environment Variables
Ensure all production environment variables are configured:
- Database connections
- Redis cache settings
- SMTP configuration
- JWT secrets
- API endpoints
- File upload paths

## ?? Security Considerations

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Request validation
- SQL injection prevention

### Data Protection
- Encrypted sensitive data
- Audit trail logging
- GDPR compliance measures
- Secure file uploads
- Regular security updates

## ?? Performance Optimization

### Frontend
- Code splitting and lazy loading
- Image optimization
- Service worker caching
- Bundle size optimization
- Progressive Web App features

### Backend
- Database query optimization
- Redis caching strategy
- Connection pooling
- Response compression
- API response pagination

## ?? Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

2. **API Rate Limiting**
   - Check rate limit settings
   - Implement proper retry logic
   - Monitor API usage patterns

3. **Mobile PWA Issues**
   - Clear service worker cache
   - Check manifest.json validity
   - Verify HTTPS requirement

4. **Quality Cost Calculations**
   - Validate input parameters
   - Check calculation formulas
   - Review cost templates

## ?? Support & Maintenance

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database performance metrics
- API usage analytics

### Maintenance Tasks
- Regular database optimization
- Log file rotation
- Security patch updates
- Performance tuning
- Backup verification

## ?? Contributing

1. Follow TypeScript/JavaScript best practices
2. Maintain test coverage above 80%
3. Document all API changes
4. Follow Git branching strategy
5. Update changelog for releases

## ?? License

ERHA OPS Quote Management Module - Proprietary Software
Copyright (c) 2025 ERHA Fabrication and Construction

---

**?? Support Contact:** dev-team@erha.co.za  
**?? Documentation:** https://docs.erha-ops.com/quote-management  
**?? Issues:** https://github.com/erha-ops/quote-management/issues
