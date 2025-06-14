"use client"

import Canvas from "@/components/canvas"


export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Canvas />
    </main>
  )
}
