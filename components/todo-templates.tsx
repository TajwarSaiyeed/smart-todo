"use client";

import { useState } from "react";
import { LayoutTemplateIcon as Template, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTodoStore,
  type Priority,
  type Category,
  categoryColors,
} from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TodoTemplatesProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TodoTemplates({
  isVisible,
  onClose,
}: TodoTemplatesProps) {
  const { templates, addTemplate, deleteTemplate, createTodoFromTemplate } =
    useTodoStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    title: "",
    priority: "medium" as Priority,
    category: "other" as Category,
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.title.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    addTemplate(newTemplate);
    setNewTemplate({
      name: "",
      title: "",
      priority: "medium",
      category: "other",
    });
    setShowCreateForm(false);
    toast.success("Template created successfully");
  };

  const handleUseTemplate = (templateId: string) => {
    createTodoFromTemplate(templateId);
    toast.success("Todo created from template");
  };

  const priorityColors = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40"
        >
          <Card className="w-96 max-h-96 overflow-y-auto p-4 shadow-xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Template className="h-4 w-4" />
                <h3 className="font-semibold">Todo Templates</h3>
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
              {/* Create Template Button */}
              {!showCreateForm && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Template
                </Button>
              )}

              {/* Create Template Form */}
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 p-3 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <Input
                    placeholder="Template name..."
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Todo title..."
                    value={newTemplate.title}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, title: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Select
                      value={newTemplate.priority}
                      onValueChange={(value: Priority) =>
                        setNewTemplate({ ...newTemplate, priority: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value: Category) =>
                        setNewTemplate({ ...newTemplate, category: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTemplate}
                      className="flex-1"
                    >
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Templates List */}
              <div className="space-y-2">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {template.name}
                        </h4>
                        <div className="flex gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              priorityColors[template.priority]
                            }`}
                          />
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColors[template.category],
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {template.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template.id)}
                        className="h-7 px-2 text-xs"
                      >
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {templates.length === 0 && !showCreateForm && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  <Template className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No templates yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
