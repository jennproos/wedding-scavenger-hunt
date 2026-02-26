import { render, screen } from '@testing-library/react'
import { ClueCard } from '../components/ClueCard'

test('renders the clue text', () => {
  render(<ClueCard clue="Find the gift table" />)
  expect(screen.getByText('Find the gift table')).toBeInTheDocument()
})

test('renders multiline clue text', () => {
  const clue = 'Line one\nLine two\nLine three'
  render(<ClueCard clue={clue} />)
  expect(screen.getByText(/Line one/)).toBeInTheDocument()
  expect(screen.getByText(/Line two/)).toBeInTheDocument()
})
