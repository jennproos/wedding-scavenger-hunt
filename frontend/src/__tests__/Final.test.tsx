import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Final } from '../pages/Final'

test('renders the prize message', () => {
  render(
    <MemoryRouter>
      <Final />
    </MemoryRouter>,
  )
  expect(screen.getByText(/You have unlocked/i)).toBeInTheDocument()
  expect(screen.getByText(/TRUE MASTERS OF THE HOUSE/i)).toBeInTheDocument()
})

test('renders claim instruction', () => {
  render(
    <MemoryRouter>
      <Final />
    </MemoryRouter>,
  )
  expect(screen.getByText(/Show this screen/i)).toBeInTheDocument()
})

test('renders confetti', () => {
  const { container } = render(
    <MemoryRouter>
      <Final />
    </MemoryRouter>,
  )
  expect(container.querySelector('.confetti')).toBeInTheDocument()
})
