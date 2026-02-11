import '@testing-library/jest-dom'
import { vi, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Mock @tabler/icons-react to avoid React version mismatch
// (parent node_modules has React 18, web has React 19)
function createIconMock(name: string) {
  const IconComponent = React.forwardRef(({ size = 24, ...props }: any, ref: any) =>
    React.createElement('svg', {
      ref,
      width: String(size),
      height: String(size),
      viewBox: '0 0 24 24',
      'data-testid': `icon-${name}`,
      ...props,
    })
  )
  IconComponent.displayName = name
  return IconComponent
}

vi.mock('@tabler/icons-react', () => {
  const iconNames = [
    'IconAdjustmentsHorizontal', 'IconAlertTriangle', 'IconBell', 'IconBellOff',
    'IconBolt', 'IconBrandGithub', 'IconBrandGoogle', 'IconBrandInstagram', 'IconBrandX',
    'IconBuilding', 'IconBuildingWarehouse', 'IconCalculator', 'IconCar',
    'IconCaretDownFilled', 'IconCaretRightFilled', 'IconCheck', 'IconChevronCompactRight',
    'IconChevronDown', 'IconChevronLeft', 'IconChevronRight',
    'IconCircleArrowDownFilled', 'IconCircleArrowUpFilled', 'IconCircleCheckFilled',
    'IconCircleFilled', 'IconCircleXFilled', 'IconCircuitCapacitor', 'IconClipboard',
    'IconCompass', 'IconComponent', 'IconCopy', 'IconCreditCard', 'IconCurrency',
    'IconDashboard', 'IconDownload', 'IconEdit', 'IconExclamationCircle',
    'IconExternalLink', 'IconFile', 'IconFileFilled', 'IconFileText', 'IconFileTypeCsv',
    'IconFileTypeDocx', 'IconFileTypePdf', 'IconFolder', 'IconGitFork', 'IconHelpCircle',
    'IconHierarchy', 'IconHierarchy3', 'IconHome', 'IconInfoCircle', 'IconJson',
    'IconLayoutSidebar', 'IconLayoutSidebarLeftCollapse', 'IconLayoutSidebarLeftExpand',
    'IconLeft', 'IconLibrary', 'IconList', 'IconLoader2', 'IconLogout', 'IconMap',
    'IconMarkdown', 'IconMenu2', 'IconMessage', 'IconMessagePlus', 'IconMicrophone',
    'IconMoodSmile', 'IconMoon', 'IconPencil', 'IconPhoto', 'IconPlayerRecord',
    'IconPlus', 'IconQuestionMark', 'IconRepeat', 'IconRight', 'IconRobotFace',
    'IconRocket', 'IconSearch', 'IconSend', 'IconSettings', 'IconShoppingCart',
    'IconSparkles', 'IconSpeakerphone', 'IconSun', 'IconTool', 'IconTrash',
    'IconUpload', 'IconUser', 'IconUsers', 'IconX',
  ]
  const mocks: Record<string, any> = {}
  iconNames.forEach(name => {
    mocks[name] = createIconMock(name)
  })
  return mocks
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

window.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  root = null
  rootMargin = ''
  thresholds = []
}

window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

// Mock framer-motion to avoid React version mismatch with parent node_modules
vi.mock('framer-motion', () => {
  const motionHandler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === '__esModule') return true
      // Return a forwardRef component for any HTML element
      if (typeof prop === 'string') {
        const Comp = React.forwardRef(({ children, ...props }: any, ref: any) => {
          // Filter out framer-motion-specific props
          const {
            initial, animate, exit, transition, variants, whileHover, whileTap,
            whileFocus, whileDrag, whileInView, onAnimationComplete,
            layout, layoutId, drag, dragConstraints, ...domProps
          } = props
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 0)
          }
          return React.createElement(prop, { ...domProps, ref }, children)
        })
        Comp.displayName = `motion.${prop}`
        return Comp
      }
      return undefined
    },
  }
  
  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
    useTransform: (value: any) => value,
    useScroll: () => ({ scrollY: { get: () => 0 } }),
    useInView: () => true,
  }
})

// Mock @radix-ui packages that use React from parent node_modules (React 18)
vi.mock('@radix-ui/react-popover', () => ({
  Root: ({ children }: any) => React.createElement('div', { 'data-radix-popover-root': '' }, children),
  Trigger: React.forwardRef(({ children, asChild, ...props }: any, ref: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, { ref, ...props })
    }
    return React.createElement('button', { ...props, ref }, children)
  }),
  Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Content: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref, role: 'dialog' }, children)
  ),
  Arrow: () => null,
  Close: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('button', { ...props, ref }, children)
  ),
}))

vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open }: any) =>
    open !== false ? React.createElement('div', { 'data-radix-dialog-root': '' }, children) : null,
  Trigger: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('button', { ...props, ref }, children)
  ),
  Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Overlay: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref }, children)
  ),
  Content: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref, role: 'dialog' }, children)
  ),
  Title: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('h2', { ...props, ref }, children)
  ),
  Description: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('p', { ...props, ref }, children)
  ),
  Close: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('button', { ...props, ref }, children)
  ),
}))

vi.mock('@radix-ui/react-slot', () => ({
  Slot: React.forwardRef(({ children, ...props }: any, ref: any) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, { ...props, ref })
    }
    return React.createElement('span', { ...props, ref }, children)
  }),
}))

vi.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('label', { ...props, ref }, children)
  ),
}))

vi.mock('@radix-ui/react-avatar', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('span', { ...props, ref }, children)
  ),
  Image: React.forwardRef((props: any, ref: any) =>
    React.createElement('img', { ...props, ref })
  ),
  Fallback: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('span', { ...props, ref }, children)
  ),
}))

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Root: ({ children }: any) => React.createElement('div', null, children),
  Trigger: React.forwardRef(({ children, asChild, ...props }: any, ref: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, { ref, ...props })
    }
    return React.createElement('button', { ...props, ref }, children)
  }),
  Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Content: React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement('div', { ...props, ref }, children)
  ),
}))

// Mock lucide-react icons (also from parent node_modules)
vi.mock('lucide-react', () => {
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === '__esModule') return true
      if (typeof prop === 'string') {
        const IconComp = React.forwardRef(({ size = 24, ...props }: any, ref: any) =>
          React.createElement('svg', {
            ref,
            width: String(size),
            height: String(size),
            viewBox: '0 0 24 24',
            'data-testid': `lucide-${prop}`,
            ...props,
          })
        )
        IconComp.displayName = prop
        return IconComp
      }
      return undefined
    },
  }
  const iconNames = [
    'ArrowLeft', 'ArrowRight', 'Bell', 'Bold', 'BookOpen', 'Bot', 'Car', 'Check',
    'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Circle', 'Code',
    'Copy', 'Download', 'Edit', 'ExternalLink', 'Eye', 'File', 'FileText',
    'Filter', 'Folder', 'Globe', 'Hash', 'Heart', 'Home', 'Image', 'Info',
    'Italic', 'Key', 'Layout', 'Link', 'List', 'Loader2', 'Lock', 'LogOut',
    'Mail', 'MapPin', 'Menu', 'MessageCircle', 'MessageSquare', 'Mic',
    'MoreHorizontal', 'Moon', 'Palette', 'Pencil', 'Phone', 'Play', 'Plus',
    'RefreshCw', 'RotateCcw', 'Search', 'Send', 'Settings', 'Share', 'Shield',
    'Sparkles', 'Square', 'Star', 'Sun', 'ThumbsDown', 'ThumbsUp', 'Trash',
    'TrendingUp', 'Upload', 'User', 'UserPlus', 'Users', 'Video', 'X', 'Zap',
    'Wrench', 'FileText', 'XIcon', 'AlertCircle', 'CheckCircle', 'CircleAlert',
  ]
  const mocks: Record<string, any> = {}
  iconNames.forEach(name => {
    const IconComp = React.forwardRef(({ size = 24, ...props }: any, ref: any) =>
      React.createElement('svg', {
        ref,
        width: String(size),
        height: String(size),
        viewBox: '0 0 24 24',
        'data-testid': `lucide-${name}`,
        ...props,
      })
    )
    IconComp.displayName = name
    mocks[name] = IconComp
  })
  return mocks
})

// Suppress console errors during tests for cleaner output
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React act() warnings and known Next.js hydration warnings
    const message = args[0]?.toString() || ''
    if (
      message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: An update to') ||
      message.includes('act()')
    ) {
      return
    }
    originalError.apply(console, args)
  }
})
