import { GoogleGenAI, Type } from '@google/genai'

// Todo item interface
export interface TodoItem {
  id: string
  title: string
  description?: string
  imageCode: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  dueDate?: string
  tags?: string[]
}

// Todo list interface
export interface TodoList {
  title: string
  description?: string
  items: TodoItem[]
  createdAt: string
  totalItems: number
}

// Schema for structured output
const todoSchema = {
  description: "Smart todo list generated from image codes and notes",
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Title for the todo list based on the context",
      nullable: false
    },
    description: {
      type: Type.STRING,
      description: "Brief description of the todo list",
      nullable: true
    },
    items: {
      type: Type.ARRAY,
      description: "Array of todo items",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Unique identifier for the todo item",
            nullable: false
          },
          title: {
            type: Type.STRING,
            description: "Title in format: '[Image Name] - [Specific Task/Action]'",
            nullable: false
          },
          description: {
            type: Type.STRING,
            description: "Detailed description of the task, always include original customer notes if provided",
            nullable: true
          },
          imageCode: {
            type: Type.STRING,
            description: "The image code associated with this task",
            nullable: false
          },
          priority: {
            type: Type.STRING,
            description: "Priority level: low, medium, or high",
            nullable: false
          },
          completed: {
            type: Type.BOOLEAN,
            description: "Whether the task is completed",
            nullable: false
          },
          dueDate: {
            type: Type.STRING,
            description: "Due date in ISO format if mentioned in notes",
            nullable: true
          },
          tags: {
            type: Type.ARRAY,
            description: "Meaningful tags focusing on task type and image classification, avoid generic terms",
            items: {
              type: Type.STRING
            },
            nullable: true
          }
        },
        required: ["id", "title", "imageCode", "priority", "completed"]
      }
    },
    createdAt: {
      type: Type.STRING,
      description: "Creation timestamp in ISO format",
      nullable: false
    },
    totalItems: {
      type: Type.INTEGER,
      description: "Total number of items in the todo list",
      nullable: false
    }
  },
  required: ["title", "items", "createdAt", "totalItems"]
}

export function useGeminiAI() {
  const apiKey = 'AIzaSyDtTd4MAIPhD_L58Ty2EQk42oD2pZSszv0'
  const genAI = new GoogleGenAI({ apiKey })
  
  const generateTodoList = async (imageCodes: string[], rawInput: string): Promise<TodoList> => {
    const prompt = `
Create a smart todo list based on the following information:

Image codes: ${imageCodes.join(', ')}
Raw input/notes: ${rawInput}

Instructions:
1. For each image code, create a todo item with the following structure:
   - Title: "[Image Name] - [Specific Task/Action]" (e.g., "IMG_001 - Chỉnh sửa màu sắc", "photo_sunset - Crop và resize")
   - Description: Detailed description of the task. Always include the original customer description/notes if provided
   - Tags: Focus on task type and image classification, avoid generic meaningless tags. Examples: ["photo-editing", "portrait", "urgent", "color-correction", "resize", "landscape", "product-photo"]

2. Analyze the context to determine:
   - What specific action/task needs to be done for each image
   - Image type/category (portrait, landscape, product, etc.)
   - Task type (editing, processing, review, etc.)
   - Priority based on urgency indicators in notes

3. Extract any mentioned dates as due dates
4. Generate a descriptive title for the entire todo list based on the overall project context
5. Set all items as not completed initially
6. Ensure tags are meaningful and actionable, not generic terms

Return a structured JSON response following the provided schema.
    `

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: todoSchema
        }
      })
      
      const text = response.text || '{}'
       return JSON.parse(text) as TodoList
    } catch (error) {
      console.error('Error generating todo list:', error)
      throw error
    }
  }

  return {
    generateTodoList
  }
}