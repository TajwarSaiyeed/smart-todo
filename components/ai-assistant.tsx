"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Lightbulb,
  Wand2,
  BarChart3,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTodoStore, type Priority, type Category } from "@/lib/store";
import { toast } from "sonner";
import { 
  generateTodoSuggestions,
  analyzeProductivity,
  improveTodoTitle,
  categorizeTodo,
  AIInsight, 
  AITodoSuggestion 
} from "@/actions/ai";

interface AIAssistantProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AIAssistant({ isVisible, onClose }: AIAssistantProps) {
  const { todos, addTodo, updateTodo } = useTodoStore();

  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AITodoSuggestion[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [contextInput, setContextInput] = useState("");
  const [improvingTodo, setImprovingTodo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    if (!contextInput.trim()) {
      toast.error("Context Required: Please describe what you're working on", {
        description:
          "Provide some context to generate relevant todo suggestions.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newSuggestions = await generateTodoSuggestions(
        contextInput,
        todos.map(t => ({ title: t.title, priority: t.priority, category: t.category }))
      );
      setSuggestions(newSuggestions);
      toast.success("AI Suggestions Generated", {
        description: `Found ${newSuggestions.length} relevant todos`,
      });
    } catch (error) {
      console.error("AI Error:", error);
      setError(
        "Failed to generate suggestions. Please check your API key and try again."
      );
      toast.error("Something went wrong", {
        description:
          "Failed to generate suggestions. Using fallback suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeProductivity = async () => {
    if (todos.length === 0) {
      toast.error("No Data", {
        description: "Add some todos first to get insights",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newInsights = await analyzeProductivity(
        todos.map(t => ({ 
          title: t.title, 
          priority: t.priority, 
          category: t.category,
          createdAt: t.createdAt 
        }))
      );
      setInsights(newInsights);
      toast.success("Productivity Analysis Complete", {
        description: `Generated ${newInsights.length} insights`,
      });
    } catch (error) {
      console.error("Analysis Error:", error);
      setError("Failed to analyze productivity. Please try again.");
      toast.error("Analysis Error", {
        description: "Failed to analyze productivity. Using basic insights.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: AITodoSuggestion) => {
    addTodo({
      title: suggestion.title,
      priority: suggestion.priority,
      category: suggestion.category,
    });
    toast.success("Todo Added", {
      description: suggestion.title,
    });
  };

  const handleImproveTodo = async (
    todoId: string,
    currentTitle: string,
    category: string
  ) => {
    setImprovingTodo(todoId);
    try {
      const improvedTitle = await improveTodoTitle(
        currentTitle,
        category
      );
      if (improvedTitle !== currentTitle) {
        updateTodo(todoId, { title: improvedTitle });
        toast.success("Todo Improved", {
          description: "Title has been enhanced by AI",
        });
      } else {
        toast.info("No Changes", {
          description: "The todo title is already well-structured",
        });
      }
    } catch (error) {
      console.error("Improvement Error:", error);
      toast.error("Improvement Error", {
        description: "Failed to improve todo",
      });
    } finally {
      setImprovingTodo(null);
    }
  };

  const handleSmartCategorize = async (todoId: string, title: string) => {
    try {
      const result = await categorizeTodo(title);
      updateTodo(todoId, {
        category: result.category as Category,
        priority: result.priority as Priority,
      });
      toast.success("Auto-Categorized", {
        description: result.reasoning,
      });
    } catch (error) {
      console.error("Categorization Error:", error);
      toast.error("Categorization Error", {
        description: "Failed to categorize todo",
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "productivity":
        return <TrendingUp className="h-4 w-4" />;
      case "organization":
        return <BarChart3 className="h-4 w-4" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "pattern":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-4 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <Card className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl font-semibold">
                    AI Assistant
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700"
                  >
                    Powered by Gemini
                  </Badge>
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
            </CardHeader>

            <CardContent className="overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Use AI to enhance your productivity with smart todo suggestions,
                insights, and improvements.
              </p>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="suggestions"
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Smart Suggestions
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Productivity Insights
                  </TabsTrigger>
                  <TabsTrigger
                    value="improve"
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Improve Todos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="suggestions" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe what you're working on (e.g., 'planning a vacation', 'starting a new project')..."
                        value={contextInput}
                        onChange={(e) => setContextInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleGenerateSuggestions}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Generate
                      </Button>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
                          AI Suggested Todos:
                        </h4>
                        {suggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-sm">
                                  {suggestion.title}
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {suggestion.reasoning}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddSuggestion(suggestion)}
                              className="h-7 px-2 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={handleAnalyzeProductivity}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      Analyze My Productivity
                    </Button>

                    {insights.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
                          AI Insights:
                        </h4>
                        {insights.map((insight, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getInsightIcon(insight.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium text-sm">
                                    {insight.title}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {insight.type}
                                  </Badge>
                                  {insight.actionable && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Actionable
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                  {insight.description}
                                </p>
                                {insight.action && (
                                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="font-medium">
                                      Action: {insight.action}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="improve" className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select todos to improve with AI or auto-categorize them:
                    </p>

                    {todos.slice(0, 10).map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">
                            {todo.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {todo.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {todo.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleImproveTodo(
                                todo.id,
                                todo.title,
                                todo.category
                              )
                            }
                            disabled={improvingTodo === todo.id}
                            className="h-7 px-2 text-xs"
                          >
                            {improvingTodo === todo.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Wand2 className="h-3 w-3" />
                            )}
                            Improve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleSmartCategorize(todo.id, todo.title)
                            }
                            className="h-7 px-2 text-xs"
                          >
                            <Sparkles className="h-3 w-3" />
                            Auto-Cat
                          </Button>
                        </div>
                      </div>
                    ))}

                    {todos.length > 10 && (
                      <p className="text-xs text-slate-500 text-center">
                        Showing first 10 todos. Use search to find specific
                        ones.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
