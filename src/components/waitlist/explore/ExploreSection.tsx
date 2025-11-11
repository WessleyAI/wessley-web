'use client'

import { useRef, useEffect, useState } from 'react'
import { ProjectCard } from './ProjectCard'

// Mock data for restoration projects
const projects = [
  {
    id: 1,
    image: '/cars/land-cruiser-fj40.jpg',
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
    image: '/cars/mustang-1967.jpg',
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
    image: '/cars/bel-air-1955.jpg',
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
    image: '/cars/porsche-911-1973.jpg',
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
    image: '/cars/ford-f100.jpg',
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
    image: '/cars/mini-cooper-1965.jpg',
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
    image: '/cars/land-rover-defender.jpg',
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
    image: '/cars/ferrari-365.jpg',
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
    image: '/cars/challenger-1970.jpg',
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
    image: '/cars/vw-beetle.jpg',
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

// Second row projects - different cars and users
const projectsRow2 = [
  {
    id: 11,
    image: '/cars/challenger-1970.jpg',
    title: '1970 Dodge Challenger R/T',
    userName: 'Mike D.',
    location: 'Chicago, IL',
    progress: 53,
    followers: 1890,
    likes: 1345,
    comments: 198,
    tags: ['Paint', 'Interior'],
  },
  {
    id: 12,
    image: '/cars/vw-beetle.jpg',
    title: '1969 VW Beetle Convertible',
    userName: 'Hannah B.',
    location: 'Portland, OR',
    progress: 67,
    followers: 2456,
    likes: 1987,
    comments: 301,
    tags: ['Electrical', 'Bodywork'],
  },
  {
    id: 13,
    image: '/cars/mini-cooper-1965.jpg',
    title: '1965 Mini Cooper S',
    userName: 'Oliver P.',
    location: 'Boston, MA',
    progress: 41,
    followers: 1678,
    likes: 1234,
    comments: 167,
    tags: ['Engine', 'Suspension'],
  },
  {
    id: 14,
    image: '/cars/land-rover-defender.jpg',
    title: '1983 Land Rover Defender',
    userName: 'Sophia M.',
    location: 'Denver, CO',
    progress: 79,
    followers: 3421,
    likes: 2876,
    comments: 445,
    tags: ['Off-Road', 'Full Rebuild'],
  },
  {
    id: 15,
    image: '/cars/ferrari-365.jpg',
    title: '1969 Ferrari 365 GTB/4',
    userName: 'James W.',
    location: 'Miami, FL',
    progress: 91,
    followers: 9234,
    likes: 7123,
    comments: 1456,
    tags: ['Performance', 'Engine'],
  },
  {
    id: 16,
    image: '/cars/camaro-1969.jpg',
    title: '1969 Chevrolet Camaro SS',
    userName: 'Ethan S.',
    location: 'Seattle, WA',
    progress: 58,
    followers: 2109,
    likes: 1654,
    comments: 234,
    tags: ['Restoration', 'Engine'],
  },
  {
    id: 17,
    image: '/cars/barracuda-1970.jpg',
    title: '1970 Plymouth Barracuda',
    userName: 'Ava L.',
    location: 'Atlanta, GA',
    progress: 36,
    followers: 1543,
    likes: 987,
    comments: 145,
    tags: ['Bodywork', 'Paint'],
  },
  {
    id: 18,
    image: '/cars/corvette-1963.jpg',
    title: '1963 Corvette Stingray C2',
    userName: 'Noah G.',
    location: 'Houston, TX',
    progress: 72,
    followers: 2987,
    likes: 2345,
    comments: 389,
    tags: ['Chrome', 'Interior'],
  },
  {
    id: 19,
    image: '/cars/thunderbird-1957.jpg',
    title: '1957 Ford Thunderbird',
    userName: 'Isabella R.',
    location: 'San Francisco, CA',
    progress: 85,
    followers: 4567,
    likes: 3456,
    comments: 567,
    tags: ['Classic', 'Convertible'],
  },
  {
    id: 20,
    image: '/cars/ford-deuce-1932.jpg',
    title: '1932 Ford Deuce Coupe',
    userName: 'Liam T.',
    location: 'Dallas, TX',
    progress: 48,
    followers: 1345,
    likes: 876,
    comments: 123,
    tags: ['Hot Rod', 'Custom'],
  },
]

// Duplicate projects for continuous scrolling
const extendedProjectsRow1 = [...projects, ...projects, ...projects]
const extendedProjectsRow2 = [...projectsRow2, ...projectsRow2, ...projectsRow2]

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

    let animationId: number

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

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  return (
    <div
      className="w-full space-y-2"
      style={{ paddingTop: 'calc(var(--sizer) * 0.5rem)', paddingBottom: 'calc(var(--sizer) * 0.5rem)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Row - Scrolls Left */}
      <div
        ref={topRowRef}
        className="flex overflow-x-hidden"
        style={{
          gap: 'calc(var(--sizer) * 0.75rem)',
          paddingLeft: 'calc(var(--sizer) * 1rem)',
          paddingRight: 'calc(var(--sizer) * 1rem)',
          scrollBehavior: 'auto',
        }}
      >
        {extendedProjectsRow1.map((project, index) => (
          <div
            key={`top-${index}`}
            className="flex-shrink-0"
            style={{
              width: 'calc(var(--sizer) * 14rem)',
              height: '35vh',
              maxHeight: '35vh',
            }}
          >
            <ProjectCard {...project} />
          </div>
        ))}
      </div>

      {/* Bottom Row - Scrolls Right */}
      <div
        ref={bottomRowRef}
        className="flex overflow-x-hidden"
        style={{
          gap: 'calc(var(--sizer) * 0.75rem)',
          paddingLeft: 'calc(var(--sizer) * 1rem)',
          paddingRight: 'calc(var(--sizer) * 1rem)',
          scrollBehavior: 'auto',
        }}
      >
        {extendedProjectsRow2.map((project, index) => (
          <div
            key={`bottom-${index}`}
            className="flex-shrink-0"
            style={{
              width: 'calc(var(--sizer) * 14rem)',
              height: '35vh',
              maxHeight: '35vh',
            }}
          >
            <ProjectCard {...project} />
          </div>
        ))}
      </div>
    </div>
  )
}
