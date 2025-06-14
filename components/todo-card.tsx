"use client";

import type React from "react";
import { useState } from "react";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GripVertical, Trash2, Edit3, Square, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Todo, useTodoStore, categoryColors } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoCardProps {
  todo: Todo;
  isDragging?: boolean;
}

type Priority = "low" | "medium" | "high";
type Category =
  | "work"
  | "personal"
  | "shopping"
  | "health"
  | "learning"
  | "other";

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const priorityBorders = {
  low: "border-green-200 dark:border-green-800",
  medium: "border-yellow-200 dark:border-yellow-800",
  high: "border-red-200 dark:border-red-800",
};

export default function TodoCard({ todo, isDragging = false }: TodoCardProps) {
  const { deleteTodo, updateTodo, selectedTodos, toggleTodoSelection } =
    useTodoStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({
    id: todo.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);

  const isSelected = selectedTodos.includes(todo.id);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTodo(todo.id, {
        title: editTitle.trim(),
        priority: editPriority,
        category: editCategory,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setIsEditing(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTodoSelection(todo.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isBeingDragged && "opacity-50",
        isDragging && "cursor-grabbing",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card
        className={cn(
          "min-w-48 max-w-[400px] w-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 gap-px py-px",
          priorityBorders[todo.priority],
          "bg-white/90 backdrop-blur-sm dark:bg-slate-800/90",
          isSelected && "ring-1 ring-blue-400",
          isDragging && "w-[300px]"
        )}
      >
        {/* Priority Stripe */}
        <div
          className={cn(
            "h-1 w-full rounded-t-lg",
            priorityColors[todo.priority]
          )}
        />

        {/* Category Stripe */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: categoryColors[todo.category] }}
        />

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleSelection}
              className="flex-shrink-0 h-6 w-6 p-0 mt-1"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
            </Button>

            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex-shrink-0 mt-1 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-sm w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <div className="flex gap-1">
                    <Select
                      value={editPriority}
                      onValueChange={(value: Priority) =>
                        setEditPriority(value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editCategory}
                      onValueChange={(value: Category) =>
                        setEditCategory(value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-6 text-xs px-2"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-6 text-xs px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 leading-tight break-words whitespace-pre-wrap">
                    {todo.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          priorityColors[todo.priority]
                        )}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {todo.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: categoryColors[todo.category],
                        }}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {todo.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatDate(todo.createdAt)}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex-shrink-0 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
