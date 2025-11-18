'use client'

import { Suspense } from 'react'
import { Bench } from '@/components/dashboard/bench'

export default function DemoBenchPage() {
  console.log('[DemoBenchPage] 📄 Page component rendering')

  return (
    <Suspense fallback={<div>Loading demo...</div>}>
      <Bench />
    </Suspense>
  )
}
