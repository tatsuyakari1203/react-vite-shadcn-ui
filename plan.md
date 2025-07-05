# Note-taking & Todo Management Application - Master Plan

## Project Overview

A modern, full-stack note-taking and todo management application built as a monolith using React, Express.js, and SQLite. The application combines powerful note-editing capabilities with integrated task management, providing a seamless workflow for knowledge workers and project managers.

### Core Value Proposition
- **Unified Workspace:** Seamlessly switch between note-taking and task management
- **Monaco Editor Integration:** Professional code editing experience with Markdown support
- **Real-time Preview:** Live Markdown rendering with KaTeX mathematical expressions
- **Intelligent Search:** Full-text search across all notes and tasks
- **Project-based Organization:** Organize work by projects with customizable workflows
- **Performance-First:** Optimized for speed with Web Workers and virtualization

### Tech Stack

#### Frontend
- **React 19** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- **Monaco Editor** for advanced text editing capabilities
- **Lucide React** for consistent iconography

#### Backend
- **Express.js** with TypeScript for robust API development
- **SQLite** with better-sqlite3 for high-performance local database
- **JWT** for secure authentication
- **Zod** for runtime type validation
- **bcrypt** for secure password hashing

#### Development Tools
- **ESLint** and **Prettier** for code quality
- **Vitest** for unit testing
- **Playwright** for end-to-end testing

## Application Flow

### Primary User Journey
1. **Authentication:** Secure login with JWT tokens
2. **Project Selection:** Choose or create a project workspace
3. **Note Management:** Create, edit, and organize notes with Monaco editor
4. **Task Integration:** Create tasks linked to notes, manage todo lists
5. **Search & Discovery:** Find information across all notes and tasks
6. **Collaboration:** Share projects and collaborate on tasks (future)

### Core Workflows
- **Note Creation:** File explorer → New note → Monaco editor → Auto-save
- **Task Management:** Todo panel → Create task → Link to notes → Track progress
- **Project Organization:** Project switcher → File management → Settings
- **Search & Filter:** Global search → Filter results → Navigate to content


## Architecture Overview

This application follows a monolith architecture where both frontend (React) and backend (Express.js API) are managed within a single project structure.

### Core Application Flow

1. **User Authentication:** Secure login with JWT tokens
2. **Project Workspace:** Select or create project environments
3. **Note Management:** Create and edit notes using Monaco editor
4. **Task Integration:** Manage todos linked to notes and projects
5. **Real-time Preview:** Live Markdown rendering with mathematical expressions
6. **Search & Discovery:** Full-text search across all content

### Performance Strategy
- **Web Workers:** Heavy operations (Markdown rendering, search) run in background threads
- **Virtualization:** Efficient rendering of large lists and file trees
- **Memoization:** Optimized React re-rendering patterns
- **SQLite Optimization:** FTS5 indexing and WAL mode for fast queries


## Documentation Modules

For detailed technical specifications, please refer to the following documentation modules:

### Core Architecture
- **[Architecture Overview](docs/architecture.md)** - Complete system architecture and design patterns
- **[Database Schema](docs/database.md)** - SQLite schema, relationships, and optimization strategies
- **[API Documentation](docs/api.md)** - RESTful API endpoints and data contracts

### Implementation Guides
- **[Frontend Architecture](docs/frontend.md)** - React components, state management, and UI patterns
- **[Backend Architecture](docs/backend.md)** - Express.js services, middleware, and business logic
- **[Development Guide](docs/development.md)** - Development workflow and implementation roadmap
- **[Deployment Guide](docs/deployment.md)** - Production deployment and environment configuration

### Database Overview

The application uses SQLite with the following core entities:
- **Users & Settings** - Authentication and user preferences
- **Projects** - Workspace organization with color coding
- **Notes** - Markdown content with full-text search (FTS5)
- **Tasks** - Todo management with priority and status tracking
- **Task-Note Relations** - Many-to-many linking between tasks and notes
- **Audit Logs** - Activity tracking for compliance and debugging
### Key Database Relationships
- Users own multiple Projects (One-to-Many)
- Projects contain Notes and Tasks (One-to-Many)
- Tasks can link to multiple Notes (Many-to-Many)
- Hierarchical task structure with subtasks support
- Comprehensive audit logging for all user activities


## Key Features

### Core Functionality
- **Monaco Editor Integration** - Professional code editing with Markdown support
- **Real-time Preview** - Live Markdown rendering with KaTeX mathematical expressions
- **Project-based Organization** - Organize work by projects with customizable workflows
- **Integrated Task Management** - Todo system with task-note linking
- **Full-text Search** - Intelligent search across all notes and tasks
- **Theme System** - Light/dark mode with customizable editor themes

### Advanced Features
- **Web Worker Processing** - Background rendering for optimal performance
- **Virtualized Lists** - Efficient handling of large datasets
- **Auto-save** - Automatic content preservation
- **File Management** - Complete file explorer with upload/download
- **Audit Logging** - Comprehensive activity tracking
- **Responsive Design** - Optimized for desktop and mobile devices


## Getting Started

To begin development or learn more about specific aspects of the application:

1. **Review Architecture** - Start with [docs/architecture.md](docs/architecture.md) for system overview
2. **Setup Development** - Follow [docs/development.md](docs/development.md) for environment setup
3. **Understand Database** - Check [docs/database.md](docs/database.md) for data structure
4. **API Integration** - Reference [docs/api.md](docs/api.md) for endpoint specifications
5. **Frontend Development** - See [docs/frontend.md](docs/frontend.md) for React patterns
6. **Backend Development** - Review [docs/backend.md](docs/backend.md) for server architecture
7. **Deployment** - Use [docs/deployment.md](docs/deployment.md) for production setup

