import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export type Priority = "low" | "medium" | "high"
export type Category = "work" | "personal" | "shopping" | "health" | "learning" | "other"

export interface Todo {
  id: string
  title: string
  priority: Priority
  category: Category
  position: { x: number; y: number }
  createdAt: Date
  isSelected?: boolean
}

export interface TodoTemplate {
  id: string
  name: string
  title: string
  priority: Priority
  category: Category
}

interface TodoState {
  todos: Todo[]
  templates: TodoTemplate[]
  selectedTodos: string[]
  searchQuery: string
  filterPriority: Priority | "all"
  filterCategory: Category | "all"

  // Todo operations
  addTodo: (todo: Omit<Todo, "id" | "position" | "createdAt">) => void
  deleteTodo: (id: string) => void
  updateTodoPosition: (id: string, position: { x: number; y: number }) => void
  updateTodo: (id: string, updates: Partial<Omit<Todo, "id">>) => void

  // Selection operations
  toggleTodoSelection: (id: string) => void
  selectAllTodos: () => void
  clearSelection: () => void
  deleteSelectedTodos: () => void
  updateSelectedTodos: (updates: Partial<Pick<Todo, "priority" | "category">>) => void

  // Template operations
  addTemplate: (template: Omit<TodoTemplate, "id">) => void
  deleteTemplate: (id: string) => void
  createTodoFromTemplate: (templateId: string) => void

  // Filter operations
  setSearchQuery: (query: string) => void
  setFilterPriority: (priority: Priority | "all") => void
  setFilterCategory: (category: Category | "all") => void
  getFilteredTodos: () => Todo[]
}

const categoryColors = {
  work: "#3b82f6", // blue
  personal: "#8b5cf6", // purple
  shopping: "#f59e0b", // amber
  health: "#10b981", // emerald
  learning: "#f97316", // orange
  other: "#6b7280", // gray
}

// Random placement algorithm to avoid overlaps
const generateRandomPosition = (existingTodos: Todo[]): { x: number; y: number } => {
  const canvasWidth = 5000
  const canvasHeight = 5000
  const cardWidth = 300 // max-w-[300px]
  const cardHeight = 160 // increased for dynamic content
  const padding = 20
  const maxAttempts = 50

  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const initialRadius = Math.min(800, canvasWidth / 4)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let x: number, y: number

    if (existingTodos.length < 10) {
      const angle = Math.random() * 2 * Math.PI
      const radius = Math.random() * initialRadius
      x = centerX + Math.cos(angle) * radius - cardWidth / 2
      y = centerY + Math.sin(angle) * radius - cardHeight / 2
    } else {
      x = Math.random() * (canvasWidth - cardWidth - 200) + 100
      y = Math.random() * (canvasHeight - cardHeight - 200) + 100
    }

    x = Math.max(100, Math.min(x, canvasWidth - cardWidth - 100))
    y = Math.max(100, Math.min(y, canvasHeight - cardHeight - 100))

    const hasOverlap = existingTodos.some((todo) => {
      const dx = Math.abs(x - todo.position.x)
      const dy = Math.abs(y - todo.position.y)
      return dx < cardWidth + padding && dy < cardHeight + padding
    })

    if (!hasOverlap) {
      return { x, y }
    }
  }

  const gridSize = cardWidth + padding
  const cols = Math.floor(canvasWidth / gridSize)
  const startCol = Math.floor(cols / 2) - 5
  const startRow = Math.floor(canvasHeight / gridSize / 2) - 5

  for (let radius = 0; radius < 10; radius++) {
    for (let angle = 0; angle < 8; angle++) {
      const col = startCol + Math.round(radius * Math.cos((angle * Math.PI) / 4))
      const row = startRow + Math.round(radius * Math.sin((angle * Math.PI) / 4))

      if (col >= 0 && col < cols && row >= 0) {
        const position = row * cols + col
        const usedPositions = new Set(
          existingTodos.map((todo) => {
            const todoCol = Math.floor(todo.position.x / gridSize)
            const todoRow = Math.floor(todo.position.y / gridSize)
            return todoRow * cols + todoCol
          }),
        )

        if (!usedPositions.has(position)) {
          return {
            x: col * gridSize + 100,
            y: row * gridSize + 100,
          }
        }
      }
    }
  }

  return { x: centerX - cardWidth / 2, y: centerY - cardHeight / 2 }
}

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set, get) => ({
        todos: [],
        templates: [
          {
            id: "1",
            name: "Daily Standup",
            title: "Prepare for daily standup meeting",
            priority: "medium",
            category: "work",
          },
          {
            id: "2",
            name: "Grocery Run",
            title: "Buy groceries for the week",
            priority: "low",
            category: "shopping",
          },
          {
            id: "3",
            name: "Exercise",
            title: "30-minute workout session",
            priority: "high",
            category: "health",
          },
        ],
        selectedTodos: [],
        searchQuery: "",
        filterPriority: "all",
        filterCategory: "all",

        addTodo: (todoData) => {
          const existingTodos = get().todos
          const position = generateRandomPosition(existingTodos)

          const newTodo: Todo = {
            id: crypto.randomUUID(),
            ...todoData,
            position,
            createdAt: new Date(),
          }

          set(
            (state) => ({
              todos: [...state.todos, newTodo],
            }),
            false,
            "addTodo",
          )
        },

        deleteTodo: (id) => {
          set(
            (state) => ({
              todos: state.todos.filter((todo) => todo.id !== id),
              selectedTodos: state.selectedTodos.filter((selectedId) => selectedId !== id),
            }),
            false,
            "deleteTodo",
          )
        },

        updateTodoPosition: (id, position) => {
          set(
            (state) => ({
              todos: state.todos.map((todo) => (todo.id === id ? { ...todo, position } : todo)),
            }),
            false,
            "updateTodoPosition",
          )
        },

        updateTodo: (id, updates) => {
          set(
            (state) => ({
              todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
            }),
            false,
            "updateTodo",
          )
        },

        toggleTodoSelection: (id) => {
          set(
            (state) => ({
              selectedTodos: state.selectedTodos.includes(id)
                ? state.selectedTodos.filter((selectedId) => selectedId !== id)
                : [...state.selectedTodos, id],
            }),
            false,
            "toggleTodoSelection",
          )
        },

        selectAllTodos: () => {
          const filteredTodos = get().getFilteredTodos()
          set(
            () => ({
              selectedTodos: filteredTodos.map((todo) => todo.id),
            }),
            false,
            "selectAllTodos",
          )
        },

        clearSelection: () => {
          set(
            () => ({
              selectedTodos: [],
            }),
            false,
            "clearSelection",
          )
        },

        deleteSelectedTodos: () => {
          set(
            (state) => ({
              todos: state.todos.filter((todo) => !state.selectedTodos.includes(todo.id)),
              selectedTodos: [],
            }),
            false,
            "deleteSelectedTodos",
          )
        },

        updateSelectedTodos: (updates) => {
          set(
            (state) => ({
              todos: state.todos.map((todo) =>
                state.selectedTodos.includes(todo.id) ? { ...todo, ...updates } : todo,
              ),
            }),
            false,
            "updateSelectedTodos",
          )
        },

        addTemplate: (templateData) => {
          const newTemplate: TodoTemplate = {
            id: crypto.randomUUID(),
            ...templateData,
          }

          set(
            (state) => ({
              templates: [...state.templates, newTemplate],
            }),
            false,
            "addTemplate",
          )
        },

        deleteTemplate: (id) => {
          set(
            (state) => ({
              templates: state.templates.filter((template) => template.id !== id),
            }),
            false,
            "deleteTemplate",
          )
        },

        createTodoFromTemplate: (templateId) => {
          const template = get().templates.find((t) => t.id === templateId)
          if (template) {
            get().addTodo({
              title: template.title,
              priority: template.priority,
              category: template.category,
            })
          }
        },

        setSearchQuery: (query) => {
          set(
            () => ({
              searchQuery: query,
            }),
            false,
            "setSearchQuery",
          )
        },

        setFilterPriority: (priority) => {
          set(
            () => ({
              filterPriority: priority,
            }),
            false,
            "setFilterPriority",
          )
        },

        setFilterCategory: (category) => {
          set(
            () => ({
              filterCategory: category,
            }),
            false,
            "setFilterCategory",
          )
        },

        getFilteredTodos: () => {
          const { todos, searchQuery, filterPriority, filterCategory } = get()

          return todos.filter((todo) => {
            const matchesSearch = searchQuery === "" || todo.title.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesPriority = filterPriority === "all" || todo.priority === filterPriority
            const matchesCategory = filterCategory === "all" || todo.category === filterCategory

            return matchesSearch && matchesPriority && matchesCategory
          })
        },
      }),
      {
        name: "todo-canvas-storage",
        partialize: (state) => ({
          todos: state.todos,
          templates: state.templates,
        }),
        storage: {
          getItem: (name) => {
            if (typeof window === 'undefined') return null;
            const str = localStorage.getItem(name);
            if (!str) return null;
            try {
              const data = JSON.parse(str);
              if (data.state?.todos) {
                data.state.todos = data.state.todos.map((todo: Todo & { createdAt: string }) => ({
                  ...todo,
                  createdAt: new Date(todo.createdAt),
                }));
              }
              return data;
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem(name, JSON.stringify(value));
            }
          },
          removeItem: (name) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(name);
            }
          },
        },
      },
    ),
    {
      name: "todo-canvas-store",
    },
  ),
)

export { categoryColors }
