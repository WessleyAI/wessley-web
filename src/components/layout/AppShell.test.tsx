import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell } from './AppShell'

let mockPathname = '/vehicle'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock child components to simplify
vi.mock('./TopNav', () => ({
  TopNav: ({ onDashboardOpen }: any) => (
    <nav data-testid="top-nav">TopNav</nav>
  ),
}))

vi.mock('./FloatingButtons', () => ({
  FloatingButtons: () => <div data-testid="floating-buttons">FloatingButtons</div>,
}))

describe('AppShell', () => {
  it('renders children content', () => {
    mockPathname = '/vehicle'
    render(<AppShell><div>Page Content</div></AppShell>)
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('shows TopNav and FloatingButtons on normal routes', () => {
    mockPathname = '/vehicle'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.getByTestId('top-nav')).toBeInTheDocument()
    expect(screen.getByTestId('floating-buttons')).toBeInTheDocument()
  })

  it('hides TopNav and FloatingButtons on root path', () => {
    mockPathname = '/'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.queryByTestId('top-nav')).not.toBeInTheDocument()
    expect(screen.queryByTestId('floating-buttons')).not.toBeInTheDocument()
  })

  it('hides nav on /chat route', () => {
    mockPathname = '/chat'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.queryByTestId('top-nav')).not.toBeInTheDocument()
  })

  it('hides nav on /setup route', () => {
    mockPathname = '/setup'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.queryByTestId('top-nav')).not.toBeInTheDocument()
  })

  it('hides nav on /g/ prefixed routes', () => {
    mockPathname = '/g/some-group'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.queryByTestId('top-nav')).not.toBeInTheDocument()
  })

  it('hides nav on /auth/ prefixed routes', () => {
    mockPathname = '/auth/login'
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.queryByTestId('top-nav')).not.toBeInTheDocument()
  })

  it('applies h-screen to main when nav is hidden', () => {
    mockPathname = '/'
    const { container } = render(<AppShell><div>Content</div></AppShell>)
    const main = container.querySelector('main')
    expect(main?.className).toContain('h-screen')
  })

  it('applies container classes to main when nav is visible', () => {
    mockPathname = '/vehicle'
    const { container } = render(<AppShell><div>Content</div></AppShell>)
    const main = container.querySelector('main')
    expect(main?.className).toContain('container')
  })
})
