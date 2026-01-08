import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MapPin, TrendingUp, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Image from "next/image";

interface ProjectCardProps {
  image: string;
  title: string;
  userName: string;
  userAvatar?: string;
  location: string;
  progress: number;
  followers: number;
  likes: number;
  comments: number;
  tags: string[];
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
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{
        backgroundColor: 'var(--app-bg-secondary)',
        border: '1px solid var(--app-border)',
        boxShadow: isHovered
          ? "0 20px 40px rgba(139, 225, 150, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Image Container with Overlay Content */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Background Image */}
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full h-full absolute inset-0"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
        </motion.div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top Section - Tags & Progress */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                className="backdrop-blur-sm px-2.5 py-1 shadow-lg app-caption"
                style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.95)',
                  color: 'var(--app-text-primary)',
                  border: '1px solid var(--app-border)'
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 backdrop-blur-sm rounded-full shadow-lg shrink-0"
            style={{ backgroundColor: 'rgba(139, 225, 150, 0.95)' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#000000' }} />
            <span className="app-caption app-fw-semibold" style={{ color: '#000000' }}>{progress}%</span>
          </div>
        </div>

        {/* Bottom Section - Title & User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Title */}
          <motion.h3
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ duration: 0.3 }}
            className="drop-shadow-lg app-h6 app-text-primary"
          >
            {title}
          </motion.h3>

          {/* User Info Row */}
          <div className="flex items-center justify-between gap-2">
            {/* User */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-8 h-8 shrink-0" style={{ boxShadow: '0 0 0 2px rgba(139, 225, 150, 0.3)' }}>
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="app-caption app-fw-semibold" style={{ backgroundColor: 'var(--app-accent)', color: '#000000' }}>
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="app-caption app-text-primary truncate">{userName}</p>
                <div className="flex items-center gap-1 app-text-secondary">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="app-caption truncate">{location}</span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(!isFollowing);
              }}
              className="shrink-0 h-7 px-3 app-caption gap-1"
              style={isFollowing ? {
                backgroundColor: 'rgba(26, 26, 26, 0.5)',
                color: 'var(--app-text-primary)',
                border: '1px solid var(--app-border)'
              } : {
                backgroundColor: 'var(--app-accent)',
                color: '#000000',
                fontWeight: 600
              }}
              onMouseEnter={(e) => {
                if (!isFollowing) {
                  e.currentTarget.style.backgroundColor = 'var(--app-accent-hover)'
                } else {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.7)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isFollowing) {
                  e.currentTarget.style.backgroundColor = 'var(--app-accent)'
                } else {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.5)'
                }
              }}
            >
              {isFollowing ? (
                <>Following</>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  Follow
                </>
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 app-text-primary">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              <span className="app-caption">{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="app-caption">{comments}</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay - View Project CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center"
        >
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: isHovered ? 1 : 0.9,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="px-6 py-2.5 rounded-full shadow-2xl transition-shadow app-body-sm app-fw-semibold"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: '#000000'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-accent-hover)'
              e.currentTarget.style.boxShadow = 'var(--app-shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--app-accent)'
            }}
          >
            View Project
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
