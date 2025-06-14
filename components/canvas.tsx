"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  Search,
  CheckSquare,
  LayoutTemplateIcon as Template,
  Sparkles,
} from "lucide-react";

import { useTodoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchAndFilters from "./search-and-filters";
import BulkOperations from "./bulk-operations";
import AddTodo from "./add-todo";
import TodoTemplates from "./todo-templates";
import TodoCard from "./todo-card";
import DeleteBucket from "./delete-bucket";
import HydrationSafe from "./hydration-safe";
import AIAssistant from "./ai-assistant";

export default function Canvas() {
  const {
    todos,
    deleteTodo,
    updateTodoPosition,
    getFilteredTodos,
    selectedTodos,
  } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showBulkOps, setShowBulkOps] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [isDragOverDelete, setIsDragOverDelete] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const filteredTodos = getFilteredTodos();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setIsDragOverDelete(over?.id === "delete-bucket");
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta, over } = event;

      if (over?.id === "delete-bucket") {
        deleteTodo(active.id as string);
        setActiveId(null);
        setIsDragOverDelete(false);
        return;
      }

      if (delta.x !== 0 || delta.y !== 0) {
        const todo = todos.find((t) => t.id === active.id);
        if (todo) {
          updateTodoPosition(active.id as string, {
            x: todo.position.x + delta.x,
            y: todo.position.y + delta.y,
          });
        }
      }

      setActiveId(null);
      setIsDragOverDelete(false);
    },
    [todos, updateTodoPosition, deleteTodo]
  );

  const handleCenterView = useCallback(() => {
    if (filteredTodos.length > 0) {
      const avgX =
        filteredTodos.reduce((sum, todo) => sum + todo.position.x, 0) /
        filteredTodos.length;
      const avgY =
        filteredTodos.reduce((sum, todo) => sum + todo.position.y, 0) /
        filteredTodos.length;
      transformRef.current?.setTransform(
        -avgX + window.innerWidth / 2,
        -avgY + window.innerHeight / 2,
        1
      );
    }
  }, [filteredTodos]);

  const activeTodo = activeId ? todos.find((t) => t.id === activeId) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (todos.length > 0 && transformRef.current) {
        handleCenterView();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [todos.length, handleCenterView]);

  return (
    <div className="relative h-full w-full">
      {/* Control Panel */}
      <Card className="absolute top-4 left-4 z-50 p-2 shadow-lg border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddTodo(!showAddTodo)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Todo
          </Button>

          <div className="hidden sm:flex items-center gap-1 border-l pl-2 ml-2">
            <Button
              size="sm"
              variant={showAI ? "secondary" : "ghost"}
              onClick={() => setShowAI(!showAI)}
              title="AI Assistant (Cmd+I)"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={showSearch ? "secondary" : "ghost"}
              onClick={() => setShowSearch(!showSearch)}
              title="Search & Filter (Cmd+F)"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={showBulkOps ? "secondary" : "ghost"}
              onClick={() => setShowBulkOps(!showBulkOps)}
              title="Bulk Operations (Cmd+B)"
            >
              <CheckSquare className="h-4 w-4" />
              <HydrationSafe>
                {selectedTodos.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-4 px-1 text-xs"
                  >
                    {selectedTodos.length}
                  </Badge>
                )}
              </HydrationSafe>
            </Button>
            <Button
              size="sm"
              variant={showTemplates ? "secondary" : "ghost"}
              onClick={() => setShowTemplates(!showTemplates)}
              title="Templates (Cmd+T)"
            >
              <Template className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l pl-2 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => transformRef.current?.zoomIn()}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => transformRef.current?.zoomOut()}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => transformRef.current?.resetTransform()}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCenterView}
              title="Center on todos (C)"
            >
              <Target className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Bar */}
      <HydrationSafe>
        {(filteredTodos.length !== todos.length ||
          selectedTodos.length > 0) && (
          <Card className="absolute bottom-4 left-4 z-50 p-2 shadow-lg border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <div className="flex items-center gap-2 text-sm">
              {filteredTodos.length !== todos.length && (
                <Badge variant="secondary">
                  {filteredTodos.length} of {todos.length} todos shown
                </Badge>
              )}
              {selectedTodos.length > 0 && (
                <Badge variant="outline">{selectedTodos.length} selected</Badge>
              )}
            </div>
          </Card>
        )}
      </HydrationSafe>

      {/* Panels */}
      <AnimatePresence>
        {showAddTodo && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-20 left-4 z-40"
          >
            <AddTodo onClose={() => setShowAddTodo(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <SearchAndFilters
        isVisible={showSearch}
        onClose={() => setShowSearch(false)}
      />
      <BulkOperations
        isVisible={showBulkOps}
        onClose={() => setShowBulkOps(false)}
      />
      <TodoTemplates
        isVisible={showTemplates}
        onClose={() => setShowTemplates(false)}
      />

      <AIAssistant isVisible={showAI} onClose={() => setShowAI(false)} />

      {/* Canvas */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={3}
          limitToBounds={false}
          centerOnInit={true}
          initialPositionX={0}
          initialPositionY={0}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          panning={{
            velocityDisabled: true,
            disabled: activeId !== null,
          }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full"
          >
            <div className="relative w-[5000px] h-[5000px] bg-grid-pattern">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="grid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-slate-300 dark:text-slate-600"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Todo Cards - Only show filtered todos */}
              <HydrationSafe>
                <AnimatePresence>
                  {filteredTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      style={{
                        position: "absolute",
                        left: todo.position.x,
                        top: todo.position.y,
                      }}
                    >
                      <TodoCard todo={todo} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {filteredTodos.length === 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border">
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {todos.length === 0
                          ? "No todos yet"
                          : "No todos match your filters"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {todos.length === 0
                          ? 'Click "Add Todo" or try the AI Assistant for smart suggestions'
                          : "Try adjusting your search or filter criteria"}
                      </p>
                      {todos.length === 0 && (
                        <Button
                          onClick={() => setShowAI(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get AI Suggestions
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </HydrationSafe>
            </div>
          </TransformComponent>
        </TransformWrapper>

        <DeleteBucket
          isVisible={activeId !== null}
          isDragOver={isDragOverDelete}
        />

        <DragOverlay>
          {activeTodo && (
            <div className="rotate-3 opacity-90" style={{ width: "300px" }}>
              <TodoCard todo={activeTodo} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
