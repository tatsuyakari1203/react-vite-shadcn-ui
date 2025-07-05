# Database Schema - SQLite

## Tổng quan

Ứng dụng sử dụng SQLite làm database chính với các tối ưu hóa:
- **WAL Mode:** Cải thiện concurrency
- **FTS5:** Full-text search hiệu suất cao
- **Indexes:** Tối ưu truy vấn
- **Foreign Keys:** Đảm bảo tính toàn vẹn dữ liệu

## Schema Definition

### Bảng users
Quản lý thông tin người dùng và xác thực

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Mô tả các trường:**
- `id`: Primary key tự tăng
- `username`: Tên đăng nhập duy nhất
- `email`: Email người dùng (optional)
- `password_hash`: Mật khẩu đã hash (bcrypt)
- `role`: Vai trò (admin/user)
- `is_active`: Trạng thái kích hoạt
- `last_login`: Lần đăng nhập cuối

### Bảng user_settings
Cài đặt cá nhân của người dùng

```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  editor_font_size INTEGER DEFAULT 14,
  editor_theme TEXT DEFAULT 'vs-light',
  auto_save BOOLEAN DEFAULT 1,
  settings_json TEXT, -- JSON cho các cài đặt khác
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);
```

**Mô tả các trường:**
- `theme`: Giao diện (light/dark)
- `editor_font_size`: Cỡ chữ editor (px)
- `editor_theme`: Theme Monaco editor
- `auto_save`: Tự động lưu
- `settings_json`: Cài đặt mở rộng (JSON)

### Bảng projects
Quản lý các dự án/workspace

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#FF6B35', -- Project color
  is_archived BOOLEAN DEFAULT 0,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Mô tả các trường:**
- `name`: Tên project
- `description`: Mô tả project
- `color`: Màu đại diện (hex)
- `is_archived`: Trạng thái lưu trữ
- `user_id`: Chủ sở hữu project

### Bảng notes
Lưu trữ ghi chú và nội dung

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT 0,
  tags TEXT, -- JSON array của tags
  project_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

**Mô tả các trường:**
- `title`: Tiêu đề note
- `content`: Nội dung Markdown
- `file_path`: Đường dẫn file trong project
- `file_size`: Kích thước file (bytes)
- `is_pinned`: Ghim note quan trọng
- `tags`: Danh sách tags (JSON array)

### Full-text Search Index
Index FTS5 cho tìm kiếm nhanh

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title, content, tags,
  content='notes',
  content_rowid='id'
);

-- Triggers để đồng bộ FTS index
CREATE TRIGGER notes_fts_insert AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, title, content, tags)
  VALUES (new.id, new.title, new.content, new.tags);
END;

CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, tags)
  VALUES('delete', old.id, old.title, old.content, old.tags);
END;

CREATE TRIGGER notes_fts_update AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, tags)
  VALUES('delete', old.id, old.title, old.content, old.tags);
  INSERT INTO notes_fts(rowid, title, content, tags)
  VALUES (new.id, new.title, new.content, new.tags);
END;
```

### Bảng tasks
Quản lý công việc và todo items

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  deadline DATE,
  estimated_hours REAL,
  actual_hours REAL,
  completion_percentage INTEGER DEFAULT 0,
  tags TEXT, -- JSON array
  project_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  assigned_to INTEGER,
  parent_task_id INTEGER, -- Cho subtasks
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
);
```

**Mô tả các trường:**
- `status`: Trạng thái task (pending/in_progress/done/cancelled)
- `priority`: Độ ưu tiên (low/medium/high/urgent)
- `start_date`: Ngày bắt đầu
- `deadline`: Hạn chót
- `estimated_hours`: Thời gian ước tính
- `actual_hours`: Thời gian thực tế
- `completion_percentage`: Phần trăm hoàn thành (0-100)
- `parent_task_id`: Task cha (cho subtasks)

### Bảng task_notes
Liên kết giữa tasks và notes (Many-to-Many)

```sql
CREATE TABLE task_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  note_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE(task_id, note_id)
);
```

**Mục đích:**
- Gắn notes vào tasks
- Một task có thể có nhiều notes
- Một note có thể thuộc nhiều tasks

### Bảng audit_logs
Ghi lại hoạt động của người dùng

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  resource_type TEXT NOT NULL, -- 'note', 'task', 'project', etc.
  resource_id INTEGER,
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Mục đích:**
- Theo dõi hoạt động người dùng
- Audit trail cho compliance
- Debug và troubleshooting
- Security monitoring

## Indexes để Tối ưu Hiệu suất

```sql
-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Project indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);

-- Note indexes
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX idx_notes_file_path ON notes(file_path);

-- Task indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Task-Note relationship indexes
CREATE INDEX idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX idx_task_notes_note_id ON task_notes(note_id);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## Quan hệ Database

### One-to-Many Relationships
- `users` → `projects` (1:N)
- `users` → `user_settings` (1:1)
- `projects` → `notes` (1:N)
- `projects` → `tasks` (1:N)
- `users` → `tasks` (created_by, assigned_to) (1:N)
- `tasks` → `tasks` (parent_task_id - subtasks) (1:N)
- `users` → `audit_logs` (1:N)

### Many-to-Many Relationships
- `tasks` ↔ `notes` (thông qua `task_notes`)

## Database Configuration

### SQLite Pragmas
```sql
-- Performance optimizations
PRAGMA journal_mode = WAL;        -- Write-Ahead Logging
PRAGMA synchronous = NORMAL;      -- Balance safety/performance
PRAGMA cache_size = 1000000;      -- 1GB cache
PRAGMA temp_store = memory;       -- Temp tables in memory
PRAGMA mmap_size = 268435456;     -- 256MB memory mapping

-- Security
PRAGMA foreign_keys = ON;         -- Enable foreign key constraints
```

### Connection Pool Settings
```typescript
// better-sqlite3 configuration
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null,
  fileMustExist: false,
  timeout: 5000,
  readonly: false
});
```

## Migration Strategy

### Migration Files Structure
```
server/migrations/
├── 001_initial_schema.sql
├── 002_add_user_settings.sql
├── 003_add_audit_logs.sql
├── 004_add_fts_index.sql
└── 005_add_task_features.sql
```

### Migration Runner
```typescript
// Pseudo-code cho migration runner
class MigrationRunner {
  async runMigrations() {
    const appliedMigrations = this.getAppliedMigrations();
    const availableMigrations = this.getAvailableMigrations();
    
    for (const migration of availableMigrations) {
      if (!appliedMigrations.includes(migration.id)) {
        await this.applyMigration(migration);
      }
    }
  }
}
```

## Backup Strategy

### Automated Backups
- **Daily:** Full database backup
- **Hourly:** WAL file backup
- **Real-time:** Replication to secondary location

### Backup Commands
```bash
# SQLite backup
sqlite3 app.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# WAL checkpoint
sqlite3 app.db "PRAGMA wal_checkpoint(FULL);"
```

## Performance Monitoring

### Query Analysis
```sql
-- Enable query planner
PRAGMA query_only = ON;
EXPLAIN QUERY PLAN SELECT * FROM notes WHERE project_id = ?;

-- Check index usage
.eqp on
SELECT * FROM tasks WHERE status = 'pending' AND deadline < date('now');
```

### Database Statistics
```sql
-- Database size
PRAGMA page_count;
PRAGMA page_size;

-- Table statistics
ANALYZE;
SELECT * FROM sqlite_stat1;
```

Database schema này cung cấp foundation vững chắc cho note-taking application với focus vào performance, scalability và data integrity.