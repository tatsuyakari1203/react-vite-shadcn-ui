# Kiến trúc Tổng thể - Note-Taking & Todo App

## 1. Tổng quan Kiến trúc

### Mô hình Monolith
Ứng dụng được xây dựng theo mô hình monolith với frontend (React) và backend (Express.js) trong cùng một project.

### Tech Stack Chính
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** SQLite với better-sqlite3
- **Authentication:** JWT
- **Performance:** Web Workers cho xử lý nặng

### Luồng hoạt động
1. **User:** Truy cập web, đăng nhập
2. **Server:** Phục vụ static files (production), cung cấp API endpoints, xử lý logic nghiệp vụ
3. **Client:** React app gọi API, Web Worker xử lý Markdown/KaTeX

## 2. Cấu trúc Thư mục

```
/
├── docs/                    # Tài liệu kiến trúc
│   ├── api.md              # API Documentation
│   ├── database.md         # Database Schema
│   ├── frontend.md         # Frontend Architecture
│   ├── backend.md          # Backend Architecture
│   └── deployment.md       # Deployment Guide
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── pages/             # Page components
│   ├── workers/           # Web Workers
│   └── styles/            # Global styles
├── server/                # Backend source
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── config/            # Configuration
└── scripts/               # Setup & migration scripts
```

## 3. Kiến trúc Component (Frontend)

### Atomic Design Pattern
- **Atoms:** Button, Input, Badge, Icon
- **Molecules:** SearchBox, TaskCard, FileItem
- **Organisms:** TodoPanel, FileExplorer, EditorToolbar
- **Templates:** EditorLayout, ProjectLayout
- **Pages:** LoginPage, ProjectsPage, EditorPage

### State Management
- **Local State:** useState cho component state
- **Custom Hooks:** useAuth, useTasks, useNotes cho business logic
- **Context:** Theme, Authentication context

## 4. Performance Strategy

### Web Workers
- **Markdown Worker:** Xử lý render Markdown + KaTeX
- **Search Worker:** Full-text search không block UI

### React Optimization
- **Memoization:** React.memo, useMemo, useCallback
- **Virtualization:** react-window cho danh sách lớn
- **Code Splitting:** Lazy loading cho routes

### Database Optimization
- **SQLite WAL mode:** Cải thiện concurrency
- **Indexes:** Tối ưu truy vấn
- **FTS5:** Full-text search hiệu suất cao

## 5. Security & Authentication

### JWT Authentication
- **Access Token:** 24h expiry
- **Refresh Token:** 7 days expiry
- **Role-based Access:** Admin/User roles

### Security Measures
- **Input Validation:** Zod schemas
- **Rate Limiting:** Express rate limiter
- **CORS:** Configured origins
- **Helmet:** Security headers

## 6. Theme System

### Design Philosophy
- **Minimalist:** White/Black primary colors
- **Accent:** Orange (#FF6B35) cho highlights
- **Modes:** Light/Dark theme support

### Implementation
- **CSS Variables:** Dynamic theme switching
- **Tailwind:** Utility-first styling
- **shadcn/ui:** Consistent component library

## 7. Key Features

### Editor Layout (3-Column)
1. **File Explorer** (Left): Project file navigation
2. **Monaco Editor** (Center): Markdown editing
3. **Preview/Todo Panel** (Right): Rendered preview + task management

### Todo Integration
- **Task Management:** CRUD operations
- **Note Linking:** Attach notes to tasks
- **Status Tracking:** Pending → In Progress → Done
- **Priority System:** Low/Medium/High/Urgent

### Advanced Features
- **Auto-save:** Real-time content saving
- **Full-text Search:** FTS5 powered search
- **File Upload:** Attachment support
- **Keyboard Shortcuts:** Power user features

## 8. Deployment Architecture

### Development
- **Vite Dev Server:** Hot reload frontend
- **Express Server:** API development
- **Concurrent Mode:** Both servers running

### Production
- **Static Build:** Vite build output
- **Single Server:** Express serves static + API
- **SQLite File:** Local database storage

## 9. Monitoring & Logging

### Performance Monitoring
- **Custom PerformanceMonitor:** Track slow operations
- **Metrics Collection:** Average response times
- **Console Warnings:** Operations > 100ms

### Audit Logging
- **User Actions:** Create/Update/Delete tracking
- **Database Changes:** Old/New values logging
- **Security Events:** Login attempts, failures

## 10. Scalability Considerations

### Current Architecture Benefits
- **Simple Deployment:** Single server setup
- **Fast Development:** Monolith advantages
- **Local Performance:** SQLite efficiency

### Future Migration Path
- **Microservices:** Split by domain (auth, notes, tasks)
- **Database:** PostgreSQL for multi-user
- **Caching:** Redis for session management
- **CDN:** Static asset distribution

Kiến trúc này cung cấp foundation vững chắc cho note-taking application hiện đại, cân bằng giữa simplicity và performance, với khả năng scale trong tương lai.