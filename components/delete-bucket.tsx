"use client"

import { useDroppable } from "@dnd-kit/core"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeleteBucketProps {
  isVisible: boolean
  isDragOver: boolean
}

export default function DeleteBucket({ isVisible, isDragOver }: DeleteBucketProps) {
  const { setNodeRef } = useDroppable({
    id: "delete-bucket",
  })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            ref={setNodeRef}
            className={cn(
              "flex items-center justify-center w-24 h-24 rounded-full border-4 border-dashed transition-all duration-200",
              isDragOver
                ? "bg-red-500 border-red-400 scale-110 shadow-2xl"
                : "bg-red-100 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:border-red-700",
            )}
          >
            <motion.div
              animate={isDragOver ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.3, repeat: isDragOver ? Number.POSITIVE_INFINITY : 0 }}
            >
              <Trash2
                className={cn(
                  "h-8 w-8 transition-colors",
                  isDragOver ? "text-white" : "text-red-600 dark:text-red-400",
                )}
              />
            </motion.div>
          </div>
          <motion.p
            className="text-center mt-2 text-sm font-medium text-red-600 dark:text-red-400"
            animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
          >
            {isDragOver ? "Release to delete" : "Drop to delete"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
