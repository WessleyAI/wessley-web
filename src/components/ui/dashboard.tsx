"use client"

import "@/styles/app-design-system.css"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ContentType } from "@/types"
import { IconChevronCompactRight, IconLayoutSidebar, IconLayoutSidebarLeftExpand, IconLayoutSidebarLeftCollapse } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { FC, useState, useEffect, useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { motion, AnimatePresence } from "framer-motion"
import { Explore } from "../vehicle/explore"
import { Gallery } from "../vehicle/gallery"
import { ProjectSpace } from "../project/project-space"
import { Marketplace } from "../vehicle/marketplace"
import { AutoTuning } from "../vehicle/auto-tuning"

export const SIDEBAR_WIDTH = 238

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  useHotkey("s", () => setShowSidebar(prevState => !prevState))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mainTabValue = searchParams.get("view") || "chat"

  const { workspaces, selectedWorkspace, setSelectedWorkspace } = useContext(ChatbotUIContext)

  const [mainView, setMainView] = useState<ContentType>(mainTabValue as ContentType)
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(false)

  // Detect if we just navigated from onboarding (check URL param)
  // Only set entrance animation ONCE on mount if onboarding=complete is present
  useEffect(() => {
    const fromOnboarding = searchParams.get('onboarding') === 'complete'
    if (fromOnboarding && !showEntranceAnimation) {
      setShowEntranceAnimation(true)
      // Reset after animation completes
      setTimeout(() => setShowEntranceAnimation(false), 3500)

      // Clean up URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('onboarding')
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Get current workspace - for now use the first one or selected one
  const currentWorkspace = selectedWorkspace || workspaces[0]

  // Sync mainView with URL changes
  useEffect(() => {
    setMainView(mainTabValue as ContentType)
  }, [mainTabValue])

  const handleMainViewChange = (view: ContentType) => {
    setMainView(view)
    router.replace(`${pathname}?view=${view}`)
  }
  const [showSidebar, setShowSidebar] = useState(true) // Default to open
  const [isMinimized, setIsMinimized] = useState(false) // Add minimized state

  // Auto-minimize sidebar when entering marketplace, explore, gallery, or bench views
  useEffect(() => {
    const viewsRequiringMinimizedSidebar = ['marketplace', 'explore', 'gallery']
    const isBenchView = pathname?.includes('/demo/bench')

    if (viewsRequiringMinimizedSidebar.includes(mainView) || isBenchView) {
      setIsMinimized(true)
    } else if (!isBenchView) {
      // Don't auto-expand if we're in bench view
      setIsMinimized(false)
    }
  }, [mainView, pathname])
  
  // Safely access localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem("showSidebar")
    if (saved !== null) {
      setShowSidebar(saved === "true")
    } else {
      // If no saved preference, default to open
      setShowSidebar(true)
    }
  }, [])
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("showSidebar", showSidebar.toString())
  }, [showSidebar])


  const handleToggleSidebar = () => {
    const isBenchView = pathname?.includes('/demo/bench')

    if (showSidebar && !isMinimized) {
      // From expanded: minimize first
      setIsMinimized(true)
    } else if (showSidebar && isMinimized) {
      // From minimized: expand back to full (now allowed in bench view too)
      setIsMinimized(false)
    } else {
      // Hidden: show expanded (or minimized if bench view)
      setShowSidebar(true)
      setIsMinimized(isBenchView)
    }
  }

  // Separate handler for hiding sidebar completely
  const handleHideSidebar = () => {
    setShowSidebar(false)
    setIsMinimized(false)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* Unified Sidebar - With entrance animation */}
      <motion.div
        className="shrink-0"
        initial={showEntranceAnimation ? { x: -100, opacity: 0 } : false}
        animate={{
          width: showSidebar ? (isMinimized ? "72px" : `${SIDEBAR_WIDTH}px`) : "0px",
          x: 0,
          opacity: 1
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
          delay: showEntranceAnimation ? 0.7 : 0
        }}
      >
        <Sidebar
          showSidebar={showSidebar}
          onMainViewChange={handleMainViewChange}
          currentView={mainView}
          onToggleSidebar={handleToggleSidebar}
          isMinimized={isMinimized}
        />
      </motion.div>

      {/* Main Content Area - With entrance animation */}
      <motion.div
        className="flex-1 flex flex-col relative min-w-0 overflow-hidden"
        initial={showEntranceAnimation ? { y: -100, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: showEntranceAnimation ? 0 : 0
        }}
      >
        {mainView === "chat" && (
          <div className="flex-1 bg-background w-full overflow-hidden">
            {children}
          </div>
        )}

        {mainView === "explore" && (
          <div className="flex-1 overflow-hidden">
            <Explore />
          </div>
        )}

        {mainView === "gallery" && (
          <div className="flex-1 overflow-hidden">
            <Gallery />
          </div>
        )}

        {mainView === "project" && (
          <div className="flex-1 overflow-hidden">
            {currentWorkspace ? (
              <ProjectSpace 
                projectName={currentWorkspace.name} 
                projectId={currentWorkspace.id} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No project selected
              </div>
            )}
          </div>
        )}

        {mainView === "marketplace" && (
          <div className="flex-1 overflow-hidden">
            <Marketplace />
          </div>
        )}

        {mainView === "auto-tuning" && (
          <div className="flex-1 overflow-hidden">
            <AutoTuning />
          </div>
        )}
      </motion.div>

      {/* Sidebar Toggle Button - Only show when sidebar is hidden */}
      {!showSidebar && (
        <button
          className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors duration-200 group border border-gray-200"
          onClick={handleToggleSidebar}
        >
          <IconLayoutSidebar 
            size={16} 
            className="text-gray-600"
          />
        </button>
      )}
    </div>
  )
}
