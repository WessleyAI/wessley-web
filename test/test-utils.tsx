import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

interface WrapperProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: WrapperProps) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
