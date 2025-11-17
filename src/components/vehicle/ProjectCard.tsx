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
      className="group relative bg-[#161616] rounded-2xl overflow-hidden cursor-pointer h-full border border-[#808080]/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{
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
                className="bg-[#161616]/95 backdrop-blur-sm text-white border border-[#808080]/30 px-2.5 py-1 shadow-lg text-xs font-['DM_Sans']"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8BE196]/95 backdrop-blur-sm rounded-full shadow-lg shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#000000]" />
            <span className="text-xs text-[#000000] font-['DM_Sans'] font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Bottom Section - Title & User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Title */}
          <motion.h3
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-white drop-shadow-lg text-base leading-tight font-['DM_Sans'] font-semibold"
          >
            {title}
          </motion.h3>

          {/* User Info Row */}
          <div className="flex items-center justify-between gap-2">
            {/* User */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-8 h-8 ring-2 ring-[#8BE196]/30 shrink-0">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-[#8BE196] text-[#000000] text-xs font-['DM_Sans'] font-semibold">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs truncate font-['DM_Sans']">{userName}</p>
                <div className="flex items-center gap-1 text-white/80 font-['DM_Sans']">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="text-xs truncate">{location}</span>
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
              className={`shrink-0 h-7 px-3 text-xs gap-1 font-['DM_Sans'] ${
                isFollowing
                  ? "bg-[#161616]/50 text-white border-[#808080]/30 hover:bg-[#161616]/70 backdrop-blur-sm"
                  : "bg-[#8BE196] text-[#000000] hover:bg-[#9DF4A8] font-semibold"
              }`}
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
          <div className="flex items-center gap-3 text-white/90 font-['DM_Sans']">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" fill="white" />
              <span className="text-xs">{likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-xs">{comments}</span>
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
            className="px-6 py-2.5 bg-[#8BE196] text-[#000000] rounded-full shadow-2xl hover:shadow-xl transition-shadow text-sm font-['DM_Sans'] font-semibold hover:bg-[#9DF4A8]"
          >
            View Project
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
