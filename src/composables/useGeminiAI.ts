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
            description: "Title/summary of the task",
            nullable: false
          },
          description: {
            type: Type.STRING,
            description: "Detailed description of the task if notes are provided",
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
            description: "Relevant tags extracted from context",
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
1. Analyze the image codes and any associated notes in the raw input
2. Create meaningful todo items for each image code
3. If there are specific notes for an image code, use them as the description
4. Assign appropriate priorities based on context clues
5. Extract any mentioned dates as due dates
6. Add relevant tags for categorization
7. Generate a descriptive title for the entire todo list
8. Set all items as not completed initially

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