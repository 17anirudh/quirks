import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'

// 1. Create a minimal router setup for tests
const rootRoute = createRootRoute()
const routeTree = rootRoute.addChildren([]) // Add mock routes here if needed

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const history = createMemoryHistory()
    const router = createRouter({ routeTree, history })

    return (
        <RouterProvider router={router} defaultComponent={() => children} />
        // Add your ThemeProvider or QueryClientProvider here too!
    )
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }