FoodPuz is a SaaS platform designed to revolutionize marketing for restaurants and retail shops through engaging, interactive games. The platform enables businesses to effortlessly create and customize branded games, tailored to their identity and promotions.

Once a game is configured, businesses can share a unique link with their customers, encouraging them to participate. As customers play and win, they earn discounts, coupons, or other rewards that can be redeemed at the restaurant or shop.

This approach not only boosts customer engagement but also fosters loyalty and provides businesses with valuable insights into customer preferences and behavior. FoodPuz offers a fun, innovative, and effective way for businesses to attract and retain customers, all while enhancing their brand visibility in the market.

# FoodPuz Backend Technical Documentation

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Joi
- **Other Tools**: 
  - Docker for containerization
  - Jest for testing
  - ESLint & Prettier for code quality
  - Winston for logging

## Project Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types/interfaces
│   ├── utils/           # Utility functions
│   └── app.ts           # App entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```



## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  logo_url VARCHAR,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Organization Members Table
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

### Campaigns Table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Games Table
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  config JSONB,
  rewards JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Authentication Implementation

1. **Email/Password Authentication**
   - Implement using Supabase Auth
   - Required fields: email, password, full name
   - Email verification required
   - Password requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one number
     - At least one special character

2. **Google Authentication**
   - Implement using Supabase Auth with Google OAuth
   - Required scopes:
     - email
     - profile
   - Auto-create user profile on first login

## Role-Based Access Control (RBAC)

### User Roles and Permissions

1. **Owner**
   - Full access to organization settings
   - Manage all members and their roles
   - Create/edit/delete campaigns and games
   - Access all analytics and reports

2. **Admin**
   - Manage members (except owners)
   - Create/edit/delete campaigns and games
   - Access all analytics and reports

3. **Editor**
   - Create/edit campaigns and games
   - View analytics and reports

4. **Viewer**
   - View campaigns and games
   - View basic analytics

5. **Client**
   - Play games
   - View and redeem rewards

## API Endpoints Structure

### Authentication
```
POST /auth/register
POST /auth/login
POST /auth/google
POST /auth/logout
POST /auth/refresh-token
```

### Organizations
```
POST   /organizations
GET    /organizations
GET    /organizations/:id
PUT    /organizations/:id
DELETE /organizations/:id
POST   /organizations/:id/members
```

### Campaigns
```
POST   /organizations/:orgId/campaigns
GET    /organizations/:orgId/campaigns
GET    /organizations/:orgId/campaigns/:id
PUT    /organizations/:orgId/campaigns/:id
DELETE /organizations/:orgId/campaigns/:id
```

### Games
```
POST   /campaigns/:campaignId/games
GET    /campaigns/:campaignId/games
GET    /campaigns/:campaignId/games/:id
PUT    /campaigns/:campaignId/games/:id
DELETE /campaigns/:campaignId/games/:id
```

## Security Considerations

1. **Authentication**
   - Use JWT tokens with appropriate expiration
   - Implement refresh token rotation
   - Rate limiting on auth endpoints

2. **Authorization**
   - Middleware for role-based access control
   - Organization-level permissions
   - Campaign-level permissions

3. **Data Protection**
   - Input validation using Joi
   - SQL injection protection
   - XSS protection
   - CORS configuration

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in required values
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Run tests: `npm test`

## Deployment Guidelines

1. **Environment Variables**
   - Supabase URL and API keys
   - JWT secret
   - Google OAuth credentials
   - Node environment
   - Port number

2. **Production Deployment**
   - Use Docker containers
   - Set up CI/CD pipeline
   - Configure production logging
   - Set up monitoring and alerts

## Testing Strategy

1. **Unit Tests**
   - Controllers
   - Services
   - Utilities

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Authentication flows

3. **E2E Tests**
   - Critical user journeys
   - Payment flows
   - Game mechanics

## Monitoring and Logging

1. **Application Logs**
   - Use Winston for structured logging
   - Log levels: error, warn, info, debug
   - Request/response logging

2. **Metrics**
   - API response times
   - Error rates
   - Active users
   - Game participation rates

## Future Considerations

1. **Scalability**
   - Implement caching strategy
   - Consider message queues for async operations
   - Plan for horizontal scaling

2. **Features**
   - Real-time game analytics
   - Advanced reward systems
   - Social sharing integration
   - Custom game templates
