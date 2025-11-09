'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, MapPin, TrendingUp, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from './ImageWithFallback'

interface ProjectCardProps {
  image: string
  title: string
  userName: string
  userAvatar?: string
  location: string
  progress: number
  followers: number
  likes: number
  comments: number
  tags: string[]
}

export function ProjectCard({
  image,
  title,
  userName,
  userAvatar,
  location,
  progress,
  followers,
  likes,
  comments,
  tags,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden h-full"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Image Container with Overlay Content */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Background Image */}
        <div className="w-full h-full absolute inset-0">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top Section - Tags & Progress */}
        <div
          className="absolute top-0 left-0 right-0 flex items-start justify-between"
          style={{
            padding: 'calc(var(--sizer) * 1rem)',
            gap: 'calc(var(--sizer) * 0.5rem)',
          }}
        >
          {/* Tags */}
          <div className="flex flex-wrap" style={{ gap: 'calc(var(--sizer) * 0.375rem)' }}>
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                className="bg-white/95 backdrop-blur-sm text-[#463B47] border-0 shadow-lg"
                style={{
                  paddingLeft: 'calc(var(--sizer) * 0.625rem)',
                  paddingRight: 'calc(var(--sizer) * 0.625rem)',
                  paddingTop: 'calc(var(--sizer) * 0.25rem)',
                  paddingBottom: 'calc(var(--sizer) * 0.25rem)',
                  fontSize: 'calc(var(--sizer) * 0.75rem)',
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Progress Indicator */}
          <div
            className="flex items-center bg-[#8BE196]/95 backdrop-blur-sm rounded-full shadow-lg shrink-0"
            style={{
              gap: 'calc(var(--sizer) * 0.375rem)',
              paddingLeft: 'calc(var(--sizer) * 0.625rem)',
              paddingRight: 'calc(var(--sizer) * 0.625rem)',
              paddingTop: 'calc(var(--sizer) * 0.25rem)',
              paddingBottom: 'calc(var(--sizer) * 0.25rem)',
            }}
          >
            <TrendingUp style={{ width: 'calc(var(--sizer) * 0.875rem)', height: 'calc(var(--sizer) * 0.875rem)' }} className="text-[#463B47]" />
            <span className="text-[#463B47]" style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}>{progress}%</span>
          </div>
        </div>

        {/* Bottom Section - Title & User Info */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            padding: 'calc(var(--sizer) * 1rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'calc(var(--sizer) * 0.75rem)',
          }}
        >
          {/* Title */}
          <div
            className="text-white drop-shadow-lg leading-tight font-semibold"
            style={{ fontSize: 'clamp(0.875rem, calc(var(--sizer) * 1rem), 1.125rem)' }}
          >
            {title}
          </div>

          {/* User Info Row */}
          <div className="flex items-center justify-between" style={{ gap: 'calc(var(--sizer) * 0.5rem)' }}>
            {/* User */}
            <div className="flex items-center min-w-0 flex-1" style={{ gap: 'calc(var(--sizer) * 0.5rem)' }}>
              <Avatar
                className="ring-2 ring-white/30 shrink-0"
                style={{ width: 'calc(var(--sizer) * 2rem)', height: 'calc(var(--sizer) * 2rem)' }}
              >
                <AvatarImage src={userAvatar} />
                <AvatarFallback
                  className="bg-[#D4A574] text-white"
                  style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}
                >
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p
                  className="!text-white truncate font-semibold"
                  style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}
                >
                  {userName}
                </p>
                <div className="flex items-center text-white/80" style={{ gap: 'calc(var(--sizer) * 0.25rem)' }}>
                  <MapPin style={{ width: 'calc(var(--sizer) * 0.625rem)', height: 'calc(var(--sizer) * 0.625rem)' }} className="shrink-0" />
                  <span className="truncate" style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}>{location}</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <Button
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                setIsFollowing(!isFollowing)
              }}
              className={`shrink-0 ${
                isFollowing
                  ? 'bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm'
                  : 'bg-white text-[#463B47] hover:bg-white/90'
              }`}
              style={{
                height: 'calc(var(--sizer) * 1.75rem)',
                paddingLeft: 'calc(var(--sizer) * 0.75rem)',
                paddingRight: 'calc(var(--sizer) * 0.75rem)',
                fontSize: 'calc(var(--sizer) * 0.75rem)',
                gap: 'calc(var(--sizer) * 0.25rem)',
              }}
            >
              {isFollowing ? (
                <>Following</>
              ) : (
                <>
                  <UserPlus style={{ width: 'calc(var(--sizer) * 0.75rem)', height: 'calc(var(--sizer) * 0.75rem)' }} />
                  Follow
                </>
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center text-white/90" style={{ gap: 'calc(var(--sizer) * 0.75rem)' }}>
            <div className="flex items-center" style={{ gap: 'calc(var(--sizer) * 0.25rem)' }}>
              <Heart style={{ width: 'calc(var(--sizer) * 0.875rem)', height: 'calc(var(--sizer) * 0.875rem)' }} fill="white" />
              <span style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}>{likes}</span>
            </div>
            <div className="flex items-center" style={{ gap: 'calc(var(--sizer) * 0.25rem)' }}>
              <MessageCircle style={{ width: 'calc(var(--sizer) * 0.875rem)', height: 'calc(var(--sizer) * 0.875rem)' }} />
              <span style={{ fontSize: 'calc(var(--sizer) * 0.75rem)' }}>{comments}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
