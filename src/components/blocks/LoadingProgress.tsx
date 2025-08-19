'use client'

import { useEffect, useState } from 'react'

export default function LoadingProgress({ duration = 2000 }: { duration?: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percent = Math.min(100, (elapsed / duration) * 100)
      setProgress(percent)
      
      if (percent >= 100) clearInterval(interval)
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}