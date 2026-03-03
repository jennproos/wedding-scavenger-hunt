import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Final } from '../pages/Final'
import { SessionProvider } from '../context/SessionContext'

test('renders the prize message', () => {
  render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(screen.getByText(/You have unlocked/i)).toBeInTheDocument()
  expect(screen.getByText(/TRUE MASTERS OF THE HOUSE/i)).toBeInTheDocument()
})

test('renders claim instruction', () => {
  render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(screen.getByText(/Take 1 treat per guest below/i)).toBeInTheDocument()
})

test('renders confetti', () => {
  const { container } = render(
    <MemoryRouter>
      <SessionProvider>
        <Final />
      </SessionProvider>
    </MemoryRouter>,
  )
  expect(container.querySelector('.confetti')).toBeInTheDocument()
})
