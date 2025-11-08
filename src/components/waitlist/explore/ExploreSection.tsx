'use client'

import { useRef, useEffect, useState } from 'react'
import { ProjectCard } from './ProjectCard'

// Mock data for restoration projects
const projects = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1703875497348-bdf7aaf7c35a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FyJTIwcmVzdG9yYXRpb258ZW58MXx8fHwxNzYyMDc1OTQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1978 Toyota Land Cruiser',
    userName: 'Jacob R.',
    location: 'Portland, OR',
    progress: 75,
    followers: 1243,
    likes: 892,
    comments: 156,
    tags: ['Full Rebuild', 'Engine', 'Bodywork'],
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1570707981341-1d1d85c51614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwY2FyJTIwZW5naW5lfGVufDF8fHx8MTc2MjA3NzI0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1967 Ford Mustang GT',
    userName: 'Marcus T.',
    location: 'Detroit, MI',
    progress: 45,
    followers: 2105,
    likes: 1456,
    comments: 203,
    tags: ['Engine', 'Mechanical'],
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1633621122959-cc47b41cb70e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwY2FyJTIwcmVzdG9yYXRpb258ZW58MXx8fHwxNzYyMDc3MjQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1955 Chevrolet Bel Air',
    userName: 'Sarah K.',
    location: 'Austin, TX',
    progress: 62,
    followers: 3204,
    likes: 2103,
    comments: 412,
    tags: ['Full Rebuild', 'Interior'],
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcG9yc2NoZXxlbnwxfHx8fDE3NjIwNzcyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1973 Porsche 911 Carrera',
    userName: 'Alex R.',
    location: 'Los Angeles, CA',
    progress: 88,
    followers: 5612,
    likes: 4023,
    comments: 687,
    tags: ['Engine', 'Performance'],
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwdHJ1Y2t8ZW58MXx8fHwxNzYyMDc3MjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1972 Ford F-100 Custom',
    userName: 'Chris W.',
    location: 'Nashville, TN',
    progress: 31,
    followers: 892,
    likes: 543,
    comments: 89,
    tags: ['Bodywork', 'Paint'],
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbWluaSUyMGNvb3BlcnxlbnwxfHx8fDE3NjIwNzcyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1965 Mini Cooper S',
    userName: 'Emma V.',
    location: 'Seattle, WA',
    progress: 54,
    followers: 1567,
    likes: 1102,
    comments: 234,
    tags: ['Engine', 'Suspension'],
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwamVlcHxlbnwxfHx8fDE3NjIwNzcyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1983 Land Rover Defender',
    userName: 'David L.',
    location: 'Denver, CO',
    progress: 71,
    followers: 2341,
    likes: 1876,
    comments: 345,
    tags: ['Full Rebuild', 'Off-Road'],
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZmVycmFyaXxlbnwxfHx8fDE3NjIwNzcyNDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1969 Ferrari 365 GTB/4',
    userName: 'Ryan H.',
    location: 'Miami, FL',
    progress: 92,
    followers: 8934,
    likes: 6721,
    comments: 1203,
    tags: ['Full Rebuild', 'Performance'],
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwY2FyfGVufDF8fHx8MTc2MjA3NzI0NXww&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1970 Dodge Challenger R/T',
    userName: 'Tom B.',
    location: 'Phoenix, AZ',
    progress: 39,
    followers: 1678,
    likes: 1234,
    comments: 267,
    tags: ['Engine', 'Paint'],
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwdm9sa3N3YWdlbnxlbnwxfHx8fDE3NjIwNzcyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '1969 VW Beetle Convertible',
    userName: 'Lisa M.',
    location: 'San Diego, CA',
    progress: 58,
    followers: 2890,
    likes: 2341,
    comments: 456,
    tags: ['Interior', 'Electrical'],
  },
]

// Duplicate projects for continuous scrolling
const extendedProjects = [...projects, ...projects, ...projects]

export function ExploreSection() {
  const topRowRef = useRef<HTMLDivElement>(null)
  const bottomRowRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!topRowRef.current || !bottomRowRef.current || isPaused) return

    const topRow = topRowRef.current
    const bottomRow = bottomRowRef.current

    let topScrollPosition = 0
    let bottomScrollPosition = 0

    const scrollSpeed = 0.5 // Pixels per frame

    const animate = () => {
      // Scroll top row to the left
      topScrollPosition += scrollSpeed
      if (topRow.scrollWidth && topScrollPosition >= topRow.scrollWidth / 3) {
        topScrollPosition = 0
      }
      topRow.scrollLeft = topScrollPosition

      // Scroll bottom row to the right (slower)
      bottomScrollPosition -= scrollSpeed * 0.7
      if (bottomScrollPosition <= 0) {
        bottomScrollPosition = bottomRow.scrollWidth / 3
      }
      bottomRow.scrollLeft = bottomScrollPosition

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  return (
    <div
      className="py-4 space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Row - Scrolls Left */}
      <div
        ref={topRowRef}
        className="flex gap-4 overflow-x-hidden px-6"
        style={{ scrollBehavior: 'auto' }}
      >
        {extendedProjects.map((project, index) => (
          <div key={`top-${index}`} className="flex-shrink-0 w-[320px] h-[380px]">
            <ProjectCard {...project} />
          </div>
        ))}
      </div>

      {/* Bottom Row - Scrolls Right */}
      <div
        ref={bottomRowRef}
        className="flex gap-4 overflow-x-hidden px-6"
        style={{ scrollBehavior: 'auto' }}
      >
        {extendedProjects.map((project, index) => (
          <div
            key={`bottom-${index}`}
            className="flex-shrink-0 w-[320px] h-[380px]"
          >
            <ProjectCard {...project} />
          </div>
        ))}
      </div>
    </div>
  )
}
