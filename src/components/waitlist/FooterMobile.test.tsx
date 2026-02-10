import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Need to check what FooterMobile exports
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div>{children}</div>,
    button: ({ children, onClick, ...props }: any) => <button onClick={onClick}>{children}</button>,
    footer: ({ children, ...props }: any) => <footer>{children}</footer>,
  },
}))

import { FooterMobile } from './FooterMobile'

describe('FooterMobile', () => {
  it('renders without crashing', () => {
    const { container } = render(<FooterMobile />)
    expect(container).toBeTruthy()
  })
})
