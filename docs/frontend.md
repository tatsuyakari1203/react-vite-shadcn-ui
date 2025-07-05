# Frontend Architecture - React Application

## Tech Stack

### Core Technologies
- **React 19:** Latest React với concurrent features
- **TypeScript:** Strict mode cho type safety
- **Vite:** Fast build tool và dev server
- **Tailwind CSS:** Utility-first CSS framework

### UI Framework
- **shadcn/ui:** Component library dựa trên Radix UI
- **Radix UI:** Headless UI primitives
- **Lucide React:** Icon library
- **class-variance-authority:** Component variants

### Development Tools
- **ESLint:** Code linting
- **Prettier:** Code formatting
- **TypeScript:** Type checking
- **Vite:** Hot reload và fast refresh

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── editor/         # Editor-related components
│   ├── todo/           # Todo/Task components
│   ├── project/        # Project management
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useTasks.ts     # Task management
│   ├── useNotes.ts     # Note management
│   └── useTheme.ts     # Theme management
├── lib/                # Utilities và services
│   ├── utils.ts        # Helper functions
│   ├── api.ts          # API client
│   ├── auth.ts         # Auth service
│   └── theme.ts        # Theme configuration
├── pages/              # Page components
│   ├── LoginPage.tsx   # Authentication
│   ├── ProjectsPage.tsx # Project listing
│   └── EditorPage.tsx  # Main editor interface
├── workers/            # Web Workers
│   ├── markdown.worker.ts # Markdown processing
│   └── search.worker.ts   # Search functionality
├── styles/             # Global styles
│   └── globals.css     # Tailwind và custom CSS
└── types/              # TypeScript definitions
    ├── api.ts          # API response types
    ├── auth.ts         # Auth types
    └── models.ts       # Data models
```

## Component Architecture

### Atomic Design Pattern

#### Atoms (Basic Building Blocks)
```typescript
// Button, Input, Badge, Icon, Avatar
export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
```

#### Molecules (Simple Combinations)
```typescript
// SearchBox, TaskCard, FileItem, UserAvatar
interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchBox = ({ placeholder, onSearch, className }: SearchBoxProps) => {
  const [query, setQuery] = useState('');
  
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
        className="pl-9"
      />
    </div>
  );
};
```

#### Organisms (Complex Components)
```typescript
// TodoPanel, FileExplorer, EditorToolbar
interface TodoPanelProps {
  projectId: string;
  currentNoteId?: string;
}

export const TodoPanel = ({ projectId, currentNoteId }: TodoPanelProps) => {
  const { tasks, createTask, updateTask } = useTasks(projectId);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  return (
    <div className="h-full flex flex-col border-t">
      <TodoPanelHeader onCreateTask={createTask} />
      <TodoPanelList 
        tasks={tasks} 
        onSelectTask={setSelectedTask}
        onUpdateTask={updateTask}
      />
      <TodoPanelActions 
        selectedTask={selectedTask}
        currentNoteId={currentNoteId}
      />
    </div>
  );
};
```

#### Templates (Page Layouts)
```typescript
// EditorLayout, ProjectLayout, AuthLayout
interface EditorLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export const EditorLayout = ({ children, sidebar, toolbar }: EditorLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      {toolbar && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {toolbar}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        {sidebar && (
          <div className="w-64 border-r bg-muted/50">
            {sidebar}
          </div>
        )}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## State Management Strategy

### Custom Hooks Pattern

#### Authentication Hook
```typescript
// hooks/useAuth.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await authService.login(credentials);
      setState({
        user: response.user,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);
  
  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, loading: false, error: null });
  }, []);
  
  return { ...state, login, logout };
};
```

#### Task Management Hook
```typescript
// hooks/useTasks.ts
export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const createTask = useCallback(async (taskData: CreateTaskData) => {
    const newTask = await api.post(`/projects/${projectId}/tasks`, taskData);
    setTasks(prev => [...prev, newTask.data]);
    return newTask.data;
  }, [projectId]);
  
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updatedTask = await api.put(`/tasks/${taskId}`, updates);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updatedTask.data } : task
    ));
  }, []);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  return { tasks, loading, createTask, updateTask, refetch: fetchTasks };
};
```

### Context Providers

#### Theme Context
```typescript
// contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## Theme System

### Design Philosophy
- **Minimalist:** Clean, focused interface
- **Monochrome Base:** White/Black primary colors
- **Orange Accent:** #FF6B35 cho highlights (5% usage)
- **Semantic Colors:** Success, Warning, Error states

### CSS Variables Implementation
```css
/* styles/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --accent: 16 100% 60%; /* Orange */
  --accent-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --accent: 16 100% 60%;
  --accent-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}
```

### Theme Configuration
```typescript
// lib/theme.ts
export const themes = {
  light: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: 'hsl(var(--primary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    border: 'hsl(var(--border))',
  },
  dark: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: 'hsl(var(--primary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    border: 'hsl(var(--border))',
  }
};
```

## Performance Optimization

### React Optimization Patterns

#### Memoization Strategy
```typescript
// Memo cho expensive components
export const MarkdownPreview = React.memo(({ content }: { content: string }) => {
  const [html, setHtml] = useState('');
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    if (workerRef.current && content) {
      workerRef.current.postMessage({ type: 'RENDER_MARKDOWN', content });
    }
  }, [content]);
  
  return (
    <div 
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

// useCallback cho event handlers
const TaskCard = ({ task, onUpdate }: TaskCardProps) => {
  const handleStatusChange = useCallback((status: TaskStatus) => {
    onUpdate(task.id, { status });
  }, [task.id, onUpdate]);
  
  return (
    <Card onClick={handleStatusChange}>
      {/* Task content */}
    </Card>
  );
};
```

#### Virtualization cho Large Lists
```typescript
// components/common/VirtualizedList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: ({ index, style }: ListChildComponentProps) => React.ReactElement;
}

export const VirtualizedList = <T,>({
  items,
  height,
  itemHeight,
  renderItem
}: VirtualizedListProps<T>) => {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      className="scrollbar-thin scrollbar-thumb-gray-300"
    >
      {renderItem}
    </List>
  );
};
```

### Web Workers Integration

#### Markdown Processing Worker
```typescript
// workers/markdown.worker.ts
import { marked } from 'marked';
import katex from 'katex';

self.onmessage = (event) => {
  const { type, content, options } = event.data;
  
  switch (type) {
    case 'RENDER_MARKDOWN':
      try {
        const renderer = new marked.Renderer();
        
        // KaTeX integration
        renderer.code = (code, language) => {
          if (language === 'math') {
            return katex.renderToString(code, { displayMode: true });
          }
          return `<pre><code class="language-${language}">${code}</code></pre>`;
        };
        
        const html = marked(content, { renderer });
        self.postMessage({ type: 'MARKDOWN_RENDERED', html });
      } catch (error) {
        self.postMessage({ type: 'MARKDOWN_ERROR', error: error.message });
      }
      break;
  }
};
```

#### Worker Hook
```typescript
// hooks/useMarkdownWorker.ts
export const useMarkdownWorker = () => {
  const workerRef = useRef<Worker>();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/markdown.worker.ts', import.meta.url)
    );
    
    workerRef.current.onmessage = (event) => {
      const { type, html, error } = event.data;
      
      if (type === 'MARKDOWN_RENDERED') {
        setHtml(html);
        setLoading(false);
      } else if (type === 'MARKDOWN_ERROR') {
        console.error('Markdown rendering error:', error);
        setLoading(false);
      }
    };
    
    return () => workerRef.current?.terminate();
  }, []);
  
  const renderMarkdown = useCallback((content: string) => {
    if (workerRef.current) {
      setLoading(true);
      workerRef.current.postMessage({ type: 'RENDER_MARKDOWN', content });
    }
  }, []);
  
  return { html, loading, renderMarkdown };
};
```

## Editor Page Implementation

### 3-Column Layout
```typescript
// pages/EditorPage.tsx
export const EditorPage = () => {
  const { projectId } = useParams();
  const [layout, setLayout] = useState({
    showFileExplorer: true,
    showPreview: true,
    showTodoPanel: true
  });
  
  return (
    <EditorLayout
      toolbar={<EditorToolbar layout={layout} onLayoutChange={setLayout} />}
    >
      <ResizablePanelGroup direction="horizontal">
        {/* File Explorer - Left Panel */}
        {layout.showFileExplorer && (
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer projectId={projectId} />
          </ResizablePanel>
        )}
        
        {/* Main Editor - Center */}
        <ResizablePanel defaultSize={layout.showPreview ? 40 : 60}>
          <MonacoEditor />
        </ResizablePanel>
        
        {/* Preview/Todo - Right Panel */}
        {layout.showPreview && (
          <ResizablePanel defaultSize={40} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <MarkdownPreview />
              </ResizablePanel>
              
              {layout.showTodoPanel && (
                <ResizablePanel defaultSize={30} minSize={20}>
                  <TodoPanel projectId={projectId} />
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </EditorLayout>
  );
};
```

## Error Handling

### Error Boundary
```typescript
// components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Card className="p-6 max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                An unexpected error occurred. Please refresh the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// lib/api.ts
class ApiClient {
  private async request<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message, response.status, error.details);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, error);
    }
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

Frontend architecture này cung cấp foundation mạnh mẽ cho modern React application với focus vào performance, maintainability và developer experience.