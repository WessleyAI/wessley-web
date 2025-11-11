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
      className="group relative bg-white rounded-xl overflow-hidden h-full"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
        maxHeight: '35vh',
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
            padding: 'calc(var(--sizer) * 0.5rem)',
            gap: 'calc(var(--sizer) * 0.25rem)',
          }}
        >
          {/* Tags */}
          <div className="flex flex-wrap" style={{ gap: 'calc(var(--sizer) * 0.25rem)' }}>
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                className="bg-white/95 backdrop-blur-sm text-[#463B47] border-0 shadow-md"
                style={{
                  paddingLeft: 'calc(var(--sizer) * 0.375rem)',
                  paddingRight: 'calc(var(--sizer) * 0.375rem)',
                  paddingTop: 'calc(var(--sizer) * 0.125rem)',
                  paddingBottom: 'calc(var(--sizer) * 0.125rem)',
                  fontSize: 'calc(var(--sizer) * 0.5rem)',
                  fontWeight: 500,
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Progress Indicator */}
          <div
            className="flex items-center bg-[#8BE196]/95 backdrop-blur-sm rounded-full shadow-md shrink-0"
            style={{
              gap: 'calc(var(--sizer) * 0.25rem)',
              paddingLeft: 'calc(var(--sizer) * 0.375rem)',
              paddingRight: 'calc(var(--sizer) * 0.375rem)',
              paddingTop: 'calc(var(--sizer) * 0.125rem)',
              paddingBottom: 'calc(var(--sizer) * 0.125rem)',
            }}
          >
            <TrendingUp style={{ width: 'calc(var(--sizer) * 0.625rem)', height: 'calc(var(--sizer) * 0.625rem)' }} className="text-[#463B47]" />
            <span className="text-[#463B47] font-semibold" style={{ fontSize: 'calc(var(--sizer) * 0.5rem)' }}>{progress}%</span>
          </div>
        </div>

        {/* Bottom Section - Title & User Info */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            padding: 'calc(var(--sizer) * 0.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'calc(var(--sizer) * 0.375rem)',
          }}
        >
          {/* Title */}
          <div
            className="text-white drop-shadow-lg leading-tight font-semibold"
            style={{ fontSize: 'clamp(0.625rem, calc(var(--sizer) * 0.7rem), 0.875rem)' }}
          >
            {title}
          </div>

          {/* User Info Row */}
          <div className="flex items-center justify-between" style={{ gap: 'calc(var(--sizer) * 0.375rem)' }}>
            {/* User */}
            <div className="flex items-center min-w-0 flex-1" style={{ gap: 'calc(var(--sizer) * 0.375rem)' }}>
              <Avatar
                className="ring-1 ring-white/30 shrink-0"
                style={{ width: 'calc(var(--sizer) * 1.25rem)', height: 'calc(var(--sizer) * 1.25rem)' }}
              >
                <AvatarImage src={userAvatar} />
                <AvatarFallback
                  className="bg-[#D4A574] text-white"
                  style={{ fontSize: 'calc(var(--sizer) * 0.5rem)' }}
                >
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p
                  className="!text-white truncate font-semibold"
                  style={{ fontSize: 'calc(var(--sizer) * 0.5rem)' }}
                >
                  {userName}
                </p>
                <div className="flex items-center text-white/80" style={{ gap: 'calc(var(--sizer) * 0.125rem)' }}>
                  <MapPin style={{ width: 'calc(var(--sizer) * 0.45rem)', height: 'calc(var(--sizer) * 0.45rem)' }} className="shrink-0" />
                  <span className="truncate" style={{ fontSize: 'calc(var(--sizer) * 0.45rem)' }}>{location}</span>
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
                height: 'calc(var(--sizer) * 1.125rem)',
                paddingLeft: 'calc(var(--sizer) * 0.5rem)',
                paddingRight: 'calc(var(--sizer) * 0.5rem)',
                fontSize: 'calc(var(--sizer) * 0.5rem)',
                gap: 'calc(var(--sizer) * 0.125rem)',
                fontWeight: 600,
              }}
            >
              {isFollowing ? (
                <>Following</>
              ) : (
                <>
                  <UserPlus style={{ width: 'calc(var(--sizer) * 0.5rem)', height: 'calc(var(--sizer) * 0.5rem)' }} />
                  Follow
                </>
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center text-white/90" style={{ gap: 'calc(var(--sizer) * 0.5rem)' }}>
            <div className="flex items-center" style={{ gap: 'calc(var(--sizer) * 0.125rem)' }}>
              <Heart style={{ width: 'calc(var(--sizer) * 0.625rem)', height: 'calc(var(--sizer) * 0.625rem)' }} fill="white" />
              <span style={{ fontSize: 'calc(var(--sizer) * 0.5rem)' }}>{likes}</span>
            </div>
            <div className="flex items-center" style={{ gap: 'calc(var(--sizer) * 0.125rem)' }}>
              <MessageCircle style={{ width: 'calc(var(--sizer) * 0.625rem)', height: 'calc(var(--sizer) * 0.625rem)' }} />
              <span style={{ fontSize: 'calc(var(--sizer) * 0.5rem)' }}>{comments}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
