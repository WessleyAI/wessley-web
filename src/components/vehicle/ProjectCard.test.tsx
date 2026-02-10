import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, unoptimized, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill ? 'true' : undefined} />
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, animate, transition, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
    h3: ({ children, animate, transition, ...props }: Record<string, unknown>) => (
      <h3 {...props}>{children as React.ReactNode}</h3>
    ),
    button: ({ children, initial, animate, transition, ...props }: Record<string, unknown>) => (
      <button {...props}>{children as React.ReactNode}</button>
    ),
  },
}))

const defaultProps = {
  image: '/test-image.jpg',
  title: '1969 Mustang Fastback',
  userName: 'JohnDoe',
  userAvatar: '/avatar.jpg',
  location: 'Austin, TX',
  progress: 75,
  followers: 120,
  likes: 45,
  comments: 12,
  tags: ['Mustang', 'Classic', 'V8'],
}

describe('ProjectCard', () => {
  it('renders title and username', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('1969 Mustang Fastback')).toBeInTheDocument()
    expect(screen.getByText('JohnDoe')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Austin, TX')).toBeInTheDocument()
  })

  it('renders progress percentage', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders likes and comments counts', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders only first 2 tags', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Mustang')).toBeInTheDocument()
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.queryByText('V8')).not.toBeInTheDocument()
  })

  it('renders the project image', () => {
    render(<ProjectCard {...defaultProps} />)
    const img = screen.getByAltText('1969 Mustang Fastback')
    expect(img).toHaveAttribute('src', '/test-image.jpg')
  })

  it('renders Follow button and toggles to Following on click', () => {
    render(<ProjectCard {...defaultProps} />)
    const followBtn = screen.getByText('Follow')
    expect(followBtn).toBeInTheDocument()

    fireEvent.click(followBtn.closest('button')!)
    expect(screen.getByText('Following')).toBeInTheDocument()
  })

  it('renders avatar fallback with first letter of username', () => {
    render(<ProjectCard {...defaultProps} userAvatar={undefined} />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders View Project button', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('View Project')).toBeInTheDocument()
  })
})
