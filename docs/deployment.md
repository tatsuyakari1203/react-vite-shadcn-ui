# Deployment & Production Setup

## Environment Configuration

### Environment Variables
```bash
# .env.production
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
DB_PATH=./data/production.db

# Authentication
JWT_SECRET=your-super-secure-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Development Environment
```bash
# .env.development
NODE_ENV=development
PORT=3000
DB_PATH=./data/development.db
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

## Build Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p server/tsconfig.json",
    "start": "node dist/server/index.js",
    "preview": "vite preview",
    "setup": "tsx server/scripts/setup.ts",
    "migrate": "tsx server/scripts/migrate.ts",
    "seed": "tsx server/scripts/seed.ts",
    "backup": "tsx server/scripts/backup.ts",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit && tsc -p server --noEmit",
    "clean": "rimraf dist",
    "postinstall": "npm run setup"
  }
}
```

## Initial Setup Script

### Setup Script
```typescript
// server/scripts/setup.ts
import { DatabaseService } from '../services/DatabaseService';
import { AuthService } from '../services/AuthService';
import { config } from '../config/environment';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function setup() {
  console.log('🚀 Setting up Note-taking Application...');
  
  try {
    // Create necessary directories
    const dirs = [
      './data',
      './uploads',
      './logs',
      './backups'
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
    
    // Initialize database
    console.log('📊 Initializing database...');
    const dbService = DatabaseService.getInstance();
    console.log('✅ Database initialized');
    
    // Check if admin user exists
    const authService = new AuthService();
    const existingAdmin = await authService.getUserByUsername('admin');
    
    if (!existingAdmin) {
      console.log('\n👤 Creating admin user...');
      
      const username = await question('Admin username (default: admin): ') || 'admin';
      const email = await question('Admin email (optional): ') || undefined;
      const password = await question('Admin password: ');
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      await authService.createUser({
        username,
        email,
        password,
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create default project for admin
    const projectService = new ProjectService();
    const adminUser = await authService.getUserByUsername('admin');
    
    if (adminUser) {
      const existingProjects = await projectService.getProjectsByUser(adminUser.id);
      
      if (existingProjects.length === 0) {
        await projectService.createProject({
          name: 'Welcome Project',
          description: 'Your first project to get started',
          color: '#FF6B35'
        }, adminUser.id);
        
        console.log('✅ Default project created');
      }
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Review your .env file');
    console.log('2. Run `npm run dev` to start development');
    console.log('3. Run `npm run build` to build for production');
    console.log('4. Run `npm start` to start production server');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

setup();
```

## Production Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create necessary directories
RUN mkdir -p data uploads logs backups
RUN chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "dist/server/index.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_PATH=/app/data/production.db
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./logs:/app/logs
      - ./backups:/app/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    server {
        listen 80;
        server_name yourdomain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
        
        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                proxy_pass http://app;
            }
        }
    }
}
```

## Database Management

### Migration Script
```typescript
// server/scripts/migrate.ts
import { DatabaseService } from '../services/DatabaseService';
import { runMigrations } from '../migrations';

async function migrate() {
  console.log('🔄 Running database migrations...');
  
  try {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    runMigrations(db);
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

### Backup Script
```typescript
// server/scripts/backup.ts
import { DatabaseService } from '../services/DatabaseService';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config/environment';

async function backup() {
  console.log('💾 Creating database backup...');
  
  try {
    const backupDir = './backups';
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(backupDir, `backup-${timestamp}.db`);
    
    // Close existing connections
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    // Create backup using SQLite backup API
    const backupDb = new (require('better-sqlite3'))(backupPath);
    db.backup(backupDb);
    backupDb.close();
    
    console.log(`✅ Backup created: ${backupPath}`);
    
    // Clean old backups (keep last 30)
    const fs = require('fs');
    const backups = fs.readdirSync(backupDir)
      .filter((file: string) => file.startsWith('backup-') && file.endsWith('.db'))
      .sort()
      .reverse();
    
    if (backups.length > 30) {
      const toDelete = backups.slice(30);
      toDelete.forEach((file: string) => {
        fs.unlinkSync(join(backupDir, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backup();
```

## Monitoring & Logging

### Performance Monitor
```typescript
// server/utils/PerformanceMonitor.ts
export class PerformanceMonitor {
  private static metrics = {
    requests: 0,
    errors: 0,
    responseTime: [] as number[],
    memoryUsage: [] as number[],
    dbQueries: 0,
    slowQueries: 0
  };
  
  static recordRequest(responseTime: number) {
    this.metrics.requests++;
    this.metrics.responseTime.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }
  
  static recordError() {
    this.metrics.errors++;
  }
  
  static recordDbQuery(queryTime: number) {
    this.metrics.dbQueries++;
    
    if (queryTime > 100) { // Slow query threshold: 100ms
      this.metrics.slowQueries++;
    }
  }
  
  static recordMemoryUsage() {
    const usage = process.memoryUsage();
    this.metrics.memoryUsage.push(usage.heapUsed / 1024 / 1024); // MB
    
    // Keep only last 100 memory readings
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
  }
  
  static getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;
    
    const avgMemoryUsage = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length
      : 0;
    
    return {
      ...this.metrics,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      avgMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
      errorRate: this.metrics.requests > 0 
        ? Math.round((this.metrics.errors / this.metrics.requests) * 10000) / 100
        : 0,
      slowQueryRate: this.metrics.dbQueries > 0
        ? Math.round((this.metrics.slowQueries / this.metrics.dbQueries) * 10000) / 100
        : 0
    };
  }
  
  static reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      dbQueries: 0,
      slowQueries: 0
    };
  }
}

// Middleware to track performance
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    PerformanceMonitor.recordRequest(responseTime);
    
    if (res.statusCode >= 400) {
      PerformanceMonitor.recordError();
    }
  });
  
  next();
};

// Schedule memory monitoring
setInterval(() => {
  PerformanceMonitor.recordMemoryUsage();
}, 30000); // Every 30 seconds
```

### Health Check Endpoint
```typescript
// server/routes/health.ts
import { Router } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

const router = Router();

router.get('/', (req, res) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

router.get('/detailed', (req, res) => {
  try {
    // Detailed health check
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    // Test database connection
    const dbTest = db.prepare('SELECT 1 as test').get();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbTest ? 'connected' : 'disconnected',
        path: process.env.DB_PATH
      },
      memory: process.memoryUsage(),
      performance: PerformanceMonitor.getMetrics()
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

## Security Considerations

### Production Security Checklist
- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Use helmet for security headers
- [ ] Validate all input data
- [ ] Hash passwords with bcrypt (12+ rounds)
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable database foreign key constraints
- [ ] Set up proper file upload restrictions
- [ ] Configure proper logging (no sensitive data)
- [ ] Use HTTPS for all external API calls
- [ ] Set up database backups
- [ ] Monitor for security vulnerabilities

### Environment Security
```bash
# Secure file permissions
chmod 600 .env.production
chmod 700 data/
chmod 700 uploads/
chmod 755 logs/

# Database security
sudo chown app:app data/production.db
chmod 600 data/production.db
```

Deployment configuration này đảm bảo ứng dụng có thể được triển khai an toàn và hiệu quả trong môi trường production với monitoring và backup đầy đủ.