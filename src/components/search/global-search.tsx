"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  IconUser,
  IconFolder,
  IconPhoto,
  IconCar,
  IconTool,
  IconFileText,
  IconSearch,
  IconUsers,
  IconSettings,
  IconMap,
  IconPlus
} from "@tabler/icons-react"
import { NewWorkspaceDialog } from "@/components/project/new-workspace-dialog"

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'person' | 'project' | 'workspace' | 'part' | 'picture' | 'post' | 'vehicle' | 'tool' | 'document' | 'component'
  url?: string
  score?: number
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  shortcut: string
  action: () => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = useState(false)

  // Real search via API
  const performRealSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20,
          types: ['person', 'workspace', 'component', 'document']
        })
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()

      // Map API response to SearchResult type
      return (data.results || []).map((item: {
        id: string
        title: string
        description?: string
        type: string
        url?: string
        score?: number
      }) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as SearchResult['type'],
        url: item.url,
        score: item.score
      }))
    } catch (error) {
      console.error('Search API error:', error)
      return []
    }
  }, [])

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await performRealSearch(query)
        setResults(searchResults)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, performRealSearch])

  const getIcon = (type: SearchResult['type']) => {
    const iconProps = { size: 16, className: "mr-2" }
    switch (type) {
      case 'person': return <IconUser {...iconProps} />
      case 'project': return <IconFolder {...iconProps} />
      case 'workspace': return <IconMap {...iconProps} />
      case 'part': return <IconTool {...iconProps} />
      case 'picture': return <IconPhoto {...iconProps} />
      case 'post': return <IconFileText {...iconProps} />
      case 'vehicle': return <IconCar {...iconProps} />
      case 'tool': return <IconSettings {...iconProps} />
      case 'document': return <IconFileText {...iconProps} />
      case 'component': return <IconSettings {...iconProps} />
      default: return <IconSearch {...iconProps} />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'person': return 'People'
      case 'project': return 'Projects'
      case 'workspace': return 'Workspaces'
      case 'part': return 'Parts'
      case 'picture': return 'Pictures'
      case 'post': return 'Posts'
      case 'vehicle': return 'Vehicles'
      case 'tool': return 'Tools'
      case 'document': return 'Documents'
      case 'component': return 'Components'
      default: return 'Results'
    }
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false)
    if (result.url) {
      router.push(result.url)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: "new-workspace",
      title: "New Workspace",
      icon: <IconPlus className="h-4 w-4" />,
      shortcut: "⌘N",
      action: () => {
        onOpenChange(false)
        setShowNewWorkspaceDialog(true)
      }
    },
    {
      id: "browse-people",
      title: "Browse People",
      icon: <IconUsers className="h-4 w-4" />,
      shortcut: "⌘P",
      action: () => {
        onOpenChange(false)
        // TODO: Implement browse people navigation
      }
    },
    {
      id: "find-workspaces",
      title: "Find Workspaces",
      icon: <IconMap className="h-4 w-4" />,
      shortcut: "⌘W",
      action: () => {
        onOpenChange(false)
        // TODO: Implement find workspaces navigation
      }
    }
  ]

  return (
    <>
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search people, projects, workspaces, parts..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <IconSearch className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </div>
        ) : (
          <>
            {query && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}
            
            {!query && (
              <CommandGroup heading="Quick Actions">
                {quickActions.map((action) => (
                  <CommandItem key={action.id} onSelect={action.action}>
                    <span className="mr-2">{action.icon}</span>
                    {action.title}
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {Object.entries(groupedResults).map(([type, items]) => (
              <div key={type}>
                <CommandSeparator />
                <CommandGroup heading={getTypeLabel(type as SearchResult['type'])}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer"
                    >
                      {getIcon(result.type)}
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        {result.description && (
                          <span className="text-sm text-muted-foreground">
                            {result.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}

            {query && results.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem className="text-center text-sm text-muted-foreground">
                    Press ↵ to select • ↑↓ to navigate
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
    
    {/* New Workspace Dialog */}
    <NewWorkspaceDialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
      <div />
    </NewWorkspaceDialog>
  </>
  )
}