# API Documentation - Note-Taking & Todo App

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Tất cả API endpoints (trừ auth) yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Authentication Endpoints

### POST /auth/login
Đăng nhập người dùng

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/logout
Đăng xuất người dùng

### POST /auth/refresh
Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

### GET /auth/me
Lấy thông tin user hiện tại

## User Management (Admin Only)

### GET /users
Lấy danh sách người dùng

**Query Parameters:**
- `page`: số trang (default: 1)
- `limit`: số lượng per page (default: 20)
- `search`: tìm kiếm theo username/email

### POST /users
Tạo người dùng mới

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin"
}
```

### GET /users/:id
Lấy thông tin người dùng

### PUT /users/:id
Cập nhật thông tin người dùng

### DELETE /users/:id
Xóa người dùng

## User Settings

### GET /users/:id/settings
Lấy cài đặt người dùng

**Response:**
```json
{
  "theme": "light|dark",
  "editor_font_size": 14,
  "editor_theme": "vs-light|vs-dark",
  "auto_save": true,
  "settings_json": {...}
}
```

### PUT /users/:id/settings
Cập nhật cài đặt người dùng

## Projects

### GET /projects
Lấy danh sách projects của user

**Query Parameters:**
- `archived`: true/false (default: false)
- `search`: tìm kiếm theo tên project

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "color": "#FF6B35",
      "is_archived": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /projects
Tạo project mới

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "color": "#FF6B35"
}
```

### GET /projects/:id
Lấy thông tin project

### PUT /projects/:id
Cập nhật project

### DELETE /projects/:id
Xóa project

## Notes

### GET /projects/:id/notes
Lấy danh sách notes trong project

**Query Parameters:**
- `search`: tìm kiếm full-text
- `pinned`: true/false
- `tags`: filter theo tags

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Note Title",
      "content": "Markdown content",
      "file_path": "/path/to/file.md",
      "file_size": 1024,
      "is_pinned": false,
      "tags": ["tag1", "tag2"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /projects/:id/notes
Tạo note mới

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "file_path": "string",
  "tags": ["string"]
}
```

### GET /notes/:id
Lấy nội dung note

### PUT /notes/:id
Cập nhật note

### DELETE /notes/:id
Xóa note

### GET /notes/search
Tìm kiếm notes (Full-text search)

**Query Parameters:**
- `q`: search query
- `project_id`: filter theo project
- `limit`: số kết quả (default: 20)

## Tasks

### GET /projects/:id/tasks
Lấy danh sách tasks trong project

**Query Parameters:**
- `status`: pending|in_progress|done|cancelled
- `priority`: low|medium|high|urgent
- `assigned_to`: user ID
- `parent_task_id`: lấy subtasks

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Task Title",
      "description": "Task description",
      "status": "pending",
      "priority": "medium",
      "start_date": "2024-01-01",
      "deadline": "2024-01-15",
      "estimated_hours": 8.0,
      "actual_hours": 0.0,
      "completion_percentage": 0,
      "tags": ["tag1"],
      "created_by": 1,
      "assigned_to": 1,
      "parent_task_id": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /projects/:id/tasks
Tạo task mới

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "start_date": "2024-01-01",
  "deadline": "2024-01-15",
  "estimated_hours": 8.0,
  "tags": ["string"],
  "assigned_to": 1,
  "parent_task_id": null
}
```

### GET /tasks/:id
Lấy thông tin task

### PUT /tasks/:id
Cập nhật task

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "pending|in_progress|done|cancelled",
  "priority": "low|medium|high|urgent",
  "start_date": "2024-01-01",
  "deadline": "2024-01-15",
  "estimated_hours": 8.0,
  "actual_hours": 5.0,
  "completion_percentage": 75,
  "tags": ["string"],
  "assigned_to": 1
}
```

### DELETE /tasks/:id
Xóa task

## Task-Note Relations

### POST /tasks/:id/notes
Gắn note vào task

**Request Body:**
```json
{
  "note_id": 1
}
```

### GET /tasks/:id/notes
Lấy danh sách notes gắn với task

### DELETE /tasks/:taskId/notes/:noteId
Gỡ note khỏi task

## File Operations

### POST /files/upload
Upload file

**Request:** multipart/form-data
- `file`: file to upload
- `project_id`: project ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "document.pdf",
    "original_name": "My Document.pdf",
    "mime_type": "application/pdf",
    "size": 1024000,
    "url": "/api/files/1"
  }
}
```

### GET /files/:id
Download file

### DELETE /files/:id
Xóa file

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **File upload:** 10 requests per hour per user

## Validation Rules

### User
- `username`: 3-50 characters, alphanumeric + underscore
- `email`: valid email format
- `password`: minimum 8 characters

### Project
- `name`: 1-100 characters
- `description`: max 500 characters
- `color`: valid hex color

### Note
- `title`: 1-200 characters
- `content`: max 1MB
- `file_path`: valid file path

### Task
- `title`: 1-200 characters
- `description`: max 2000 characters
- `estimated_hours`: 0.1-999.9
- `completion_percentage`: 0-100

## Pagination

Các endpoints trả về danh sách sử dụng pagination:

**Query Parameters:**
- `page`: số trang (default: 1)
- `limit`: số items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "items_per_page": 20,
    "has_next": true,
    "has_prev": false
  }
}
```

## WebSocket Events (Future)

Các events real-time sẽ được implement trong tương lai:

- `note:updated` - Note được cập nhật
- `task:status_changed` - Task status thay đổi
- `project:member_added` - Thành viên mới được thêm
- `notification:new` - Thông báo mới

API này cung cấp foundation hoàn chỉnh cho note-taking và task management application với focus vào performance, security và developer experience.