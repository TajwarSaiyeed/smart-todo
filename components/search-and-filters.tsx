"use client"

import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTodoStore, type Priority, type Category, categoryColors } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"

interface SearchAndFiltersProps {
  isVisible: boolean
  onClose: () => void
}

export default function SearchAndFilters({ isVisible, onClose }: SearchAndFiltersProps) {
  const {
    searchQuery,
    filterPriority,
    filterCategory,
    setSearchQuery,
    setFilterPriority,
    setFilterCategory,
    getFilteredTodos,
    todos,
  } = useTodoStore()

  const filteredTodos = getFilteredTodos()
  const hasActiveFilters = searchQuery !== "" || filterPriority !== "all" || filterCategory !== "all"

  const clearAllFilters = () => {
    setSearchQuery("")
    setFilterPriority("all")
    setFilterCategory("all")
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-20 right-4 z-40"
        >
          <Card className="w-80 p-4 shadow-xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Search & Filter</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search todos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={filterPriority} onValueChange={(value: Priority | "all") => setFilterPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filterCategory} onValueChange={(value: Category | "all") => setFilterCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="work">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.work }} />
                        Work
                      </div>
                    </SelectItem>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.personal }} />
                        Personal
                      </div>
                    </SelectItem>
                    <SelectItem value="shopping">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.shopping }} />
                        Shopping
                      </div>
                    </SelectItem>
                    <SelectItem value="health">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.health }} />
                        Health
                      </div>
                    </SelectItem>
                    <SelectItem value="learning">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.learning }} />
                        Learning
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors.other }} />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="secondary">
                  {filteredTodos.length} of {todos.length} todos
                </Badge>
                {hasActiveFilters && (
                  <Button size="sm" variant="ghost" onClick={clearAllFilters} className="text-xs">
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
