"use client";

import { CheckSquare, Square, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useTodoStore,
  type Priority,
  type Category,
  categoryColors,
} from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface BulkOperationsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function BulkOperations({
  isVisible,
  onClose,
}: BulkOperationsProps) {
  const {
    selectedTodos,
    selectAllTodos,
    clearSelection,
    deleteSelectedTodos,
    updateSelectedTodos,
    getFilteredTodos,
  } = useTodoStore();

  const filteredTodos = getFilteredTodos();
  const allSelected =
    filteredTodos.length > 0 && selectedTodos.length === filteredTodos.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllTodos();
    }
  };

  const handleBulkPriorityChange = (priority: Priority) => {
    updateSelectedTodos({ priority });
  };

  const handleBulkCategoryChange = (category: Category) => {
    updateSelectedTodos({ category });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-20 right-4 z-40"
        >
          <Card className="w-80 p-4 shadow-xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <h3 className="font-semibold">Bulk Operations</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Selection Controls */}
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
                <Badge variant="secondary">
                  {selectedTodos.length} selected
                </Badge>
              </div>

              {selectedTodos.length > 0 && (
                <>
                  {/* Bulk Actions */}
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Change Priority
                      </label>
                      <Select onValueChange={handleBulkPriorityChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              High Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              Medium Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              Low Priority
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Change Category
                      </label>
                      <Select onValueChange={handleBulkCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: categoryColors.work }}
                              />
                              Work
                            </div>
                          </SelectItem>
                          <SelectItem value="personal">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: categoryColors.personal,
                                }}
                              />
                              Personal
                            </div>
                          </SelectItem>
                          <SelectItem value="shopping">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: categoryColors.shopping,
                                }}
                              />
                              Shopping
                            </div>
                          </SelectItem>
                          <SelectItem value="health">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: categoryColors.health,
                                }}
                              />
                              Health
                            </div>
                          </SelectItem>
                          <SelectItem value="learning">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: categoryColors.learning,
                                }}
                              />
                              Learning
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: categoryColors.other,
                                }}
                              />
                              Other
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deleteSelectedTodos}
                      className="w-full flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedTodos.length})
                    </Button>
                  </div>
                </>
              )}

              {selectedTodos.length === 0 && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Select todos to perform bulk operations
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
