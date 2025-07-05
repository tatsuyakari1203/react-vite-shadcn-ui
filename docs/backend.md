# Backend Architecture - Express.js Server

## Tech Stack

### Core Technologies
- **Express.js:** Web framework cho Node.js
- **TypeScript:** Type-safe server development
- **better-sqlite3:** High-performance SQLite driver
- **JWT:** JSON Web Tokens cho authentication

### Middleware & Libraries
- **cors:** Cross-Origin Resource Sharing
- **helmet:** Security headers
- **express-rate-limit:** Rate limiting
- **bcrypt:** Password hashing
- **zod:** Input validation
- **multer:** File upload handling

## Project Structure

```
server/
├── config/              # Configuration files
│   ├── database.ts      # Database configuration
│   ├── environment.ts   # Environment variables
│   └── security.ts      # Security settings
├── middleware/          # Express middleware
│   ├── auth.ts          # Authentication middleware
│   ├── validation.ts    # Input validation
│   ├── errorHandler.ts  # Error handling
│   ├── logger.ts        # Request logging
│   └── rateLimit.ts     # Rate limiting
├── routes/              # API route handlers
│   ├── auth.ts          # Authentication routes
│   ├── users.ts         # User management
│   ├── projects.ts      # Project operations
│   ├── notes.ts         # Note operations
│   ├── tasks.ts         # Task operations
│   └── files.ts         # File operations
├── services/            # Business logic layer
│   ├── AuthService.ts   # Authentication logic
│   ├── UserService.ts   # User operations
│   ├── ProjectService.ts # Project operations
│   ├── NoteService.ts   # Note operations
│   ├── TaskService.ts   # Task operations
│   └── DatabaseService.ts # Database abstraction
├── types/               # TypeScript definitions
│   ├── auth.ts          # Auth types
│   ├── api.ts           # API types
│   └── database.ts      # Database types
├── utils/               # Utility functions
│   ├── crypto.ts        # Encryption utilities
│   ├── validation.ts    # Validation schemas
│   └── logger.ts        # Logging utilities
└── index.ts             # Server entry point
```

## Server Configuration

### Main Server Setup
```typescript
// server/index.ts
import express from 'express';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { DatabaseService } from './services/DatabaseService';
import { config } from './config/environment';

const app = express();

// Initialize database
DatabaseService.getInstance();

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});
```

### Environment Configuration
```typescript
// server/config/environment.ts
export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  dbPath: process.env.DB_PATH || './data/app.db',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // File Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  
  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
};
```

## Middleware Stack

### Security Middleware
```typescript
// server/middleware/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './auth';
import { errorHandler } from './errorHandler';
import { requestLogger } from './logger';
import { config } from '../config/environment';

export const setupMiddleware = (app: express.Application) => {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // CORS
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  // Rate limiting
  app.use('/api', rateLimit({
    windowMs: config.rateLimitWindow,
    max: config.rateLimitMax,
    message: {
      error: 'Too many requests from this IP',
      retryAfter: Math.ceil(config.rateLimitWindow / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  }));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Request logging
  app.use(requestLogger);
  
  // Static files (production)
  if (config.nodeEnv === 'production') {
    app.use(express.static('dist'));
  }
  
  // Error handling (must be last)
  app.use(errorHandler);
};
```

### Authentication Middleware
```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AuthService } from '../services/AuthService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Verify user still exists and is active
    const authService = new AuthService();
    const user = await authService.getUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin-only middleware
export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### Input Validation Middleware
```typescript
// server/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// Validation schemas
export const schemas = {
  // Auth schemas
  login: z.object({
    username: z.string().min(1),
    password: z.string().min(1)
  }),
  
  // User schemas
  createUser: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email().optional(),
    password: z.string().min(8),
    role: z.enum(['admin', 'user']).default('user')
  }),
  
  // Project schemas
  createProject: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FF6B35')
  }),
  
  // Note schemas
  createNote: z.object({
    title: z.string().min(1).max(200),
    content: z.string().max(1048576), // 1MB
    file_path: z.string().min(1),
    tags: z.array(z.string()).default([])
  }),
  
  // Task schemas
  createTask: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    start_date: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    estimated_hours: z.number().min(0.1).max(999.9).optional(),
    tags: z.array(z.string()).default([]),
    assigned_to: z.number().optional(),
    parent_task_id: z.number().optional()
  })
};
```

## Database Service Layer

### Database Service
```typescript
// server/services/DatabaseService.ts
import Database from 'better-sqlite3';
import { join } from 'path';
import { config } from '../config/environment';
import { runMigrations } from '../migrations';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;
  
  private constructor() {
    const dbPath = join(process.cwd(), config.dbPath);
    this.db = new Database(dbPath, {
      verbose: config.nodeEnv === 'development' ? console.log : undefined,
      fileMustExist: false,
      timeout: 5000,
    });
    
    this.setupDatabase();
  }
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  private setupDatabase() {
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000000');
    this.db.pragma('temp_store = memory');
    this.db.pragma('foreign_keys = ON');
    
    // Run migrations
    runMigrations(this.db);
  }
  
  getDatabase(): Database.Database {
    return this.db;
  }
  
  // Transaction helper
  transaction<T>(fn: (db: Database.Database) => T): T {
    const transaction = this.db.transaction(fn);
    return transaction();
  }
  
  // Prepared statement cache
  private statements = new Map<string, Database.Statement>();
  
  prepare(sql: string): Database.Statement {
    if (!this.statements.has(sql)) {
      this.statements.set(sql, this.db.prepare(sql));
    }
    return this.statements.get(sql)!;
  }
  
  close() {
    this.db.close();
  }
}
```

## Business Logic Services

### Authentication Service
```typescript
// server/services/AuthService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DatabaseService } from './DatabaseService';
import { config } from '../config/environment';

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  is_active: boolean;
}

export class AuthService {
  private db: Database.Database;
  
  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }
  
  async login(credentials: LoginCredentials): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> {
    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, role, is_active
      FROM users 
      WHERE username = ? AND is_active = 1
    `);
    
    const user = stmt.get(credentials.username) as any;
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password_hash
    );
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    const updateStmt = this.db.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(user.id);
    
    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwtSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      },
      token,
      refreshToken
    };
  }
  
  async createUser(userData: {
    username: string;
    email?: string;
    password: string;
    role?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, config.bcryptRounds);
    
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(
        userData.username,
        userData.email,
        passwordHash,
        userData.role || 'user'
      );
      
      return this.getUserById(result.lastInsertRowid as number);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }
  
  async getUserById(id: number): Promise<User | null> {
    const stmt = this.db.prepare(`
      SELECT id, username, email, role, is_active
      FROM users WHERE id = ?
    `);
    
    const user = stmt.get(id) as any;
    return user || null;
  }
  
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }
      
      const user = await this.getUserById(decoded.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }
      
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      
      return { token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
```

### Task Service
```typescript
// server/services/TaskService.ts
import { DatabaseService } from './DatabaseService';
import { AuditService } from './AuditService';

interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  deadline?: string;
  estimated_hours?: number;
  tags: string[];
  assigned_to?: number;
  parent_task_id?: number;
}

export class TaskService {
  private db: Database.Database;
  private auditService: AuditService;
  
  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
    this.auditService = new AuditService();
  }
  
  async createTask(
    projectId: number,
    taskData: CreateTaskData,
    userId: number
  ): Promise<any> {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        title, description, priority, start_date, deadline,
        estimated_hours, tags, project_id, created_by, assigned_to, parent_task_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.start_date,
      taskData.deadline,
      taskData.estimated_hours,
      JSON.stringify(taskData.tags),
      projectId,
      userId,
      taskData.assigned_to,
      taskData.parent_task_id
    );
    
    // Audit log
    await this.auditService.log({
      userId,
      action: 'create',
      resourceType: 'task',
      resourceId: result.lastInsertRowid as number,
      newValues: taskData
    });
    
    return this.getTaskById(result.lastInsertRowid as number);
  }
  
  async updateTask(
    taskId: number,
    updates: Partial<CreateTaskData>,
    userId: number
  ): Promise<any> {
    // Get old values for audit
    const oldTask = this.getTaskById(taskId);
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(...values, taskId);
    
    // Audit log
    await this.auditService.log({
      userId,
      action: 'update',
      resourceType: 'task',
      resourceId: taskId,
      oldValues: oldTask,
      newValues: updates
    });
    
    return this.getTaskById(taskId);
  }
  
  async attachNoteToTask(taskId: number, noteId: number): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO task_notes (task_id, note_id)
      VALUES (?, ?)
    `);
    
    stmt.run(taskId, noteId);
  }
  
  async getTasksByProject(projectId: number, filters?: {
    status?: string;
    priority?: string;
    assigned_to?: number;
  }): Promise<any[]> {
    let sql = `
      SELECT t.*, u1.username as created_by_username, u2.username as assigned_to_username
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.project_id = ?
    `;
    
    const params: any[] = [projectId];
    
    if (filters?.status) {
      sql += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters?.priority) {
      sql += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters?.assigned_to) {
      sql += ' AND t.assigned_to = ?';
      params.push(filters.assigned_to);
    }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as any[];
  }
  
  private getTaskById(id: number): any {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  }
}
```

## Error Handling

### Global Error Handler
```typescript
// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Don't leak error details in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = undefined;
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
```

## API Routes Structure

### Route Setup
```typescript
// server/routes/index.ts
import { Application } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import projectRoutes from './projects';
import noteRoutes from './notes';
import taskRoutes from './tasks';
import fileRoutes from './files';

export const setupRoutes = (app: Application) => {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/files', fileRoutes);
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Catch-all for SPA (production)
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }
};
```

Backend architecture này cung cấp foundation mạnh mẽ cho Express.js server với focus vào security, performance và maintainability.