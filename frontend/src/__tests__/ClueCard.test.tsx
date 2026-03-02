import { render, screen, waitFor } from '@testing-library/react'
import { ClueCard } from '../components/ClueCard'

test('starts empty before typewriter begins', () => {
  render(<ClueCard clue="Hi" />)
  expect(screen.queryByText('Hi')).not.toBeInTheDocument()
})

test('renders the clue text after typing completes', async () => {
  render(<ClueCard clue="Find the gift table" />)
  await waitFor(() => expect(screen.getByText('Find the gift table')).toBeInTheDocument(), { timeout: 5000 })
})

test('renders multiline clue text after typing completes', async () => {
  const clue = 'Line one\nLine two\nLine three'
  render(<ClueCard clue={clue} />)
  await waitFor(() => {
    expect(screen.getByText(/Line one/)).toBeInTheDocument()
    expect(screen.getByText(/Line two/)).toBeInTheDocument()
  }, { timeout: 5000 })
})

test('renders smiley face instead of clue text when isFinal', () => {
  render(<ClueCard clue="Find the cats" isFinal />)
  expect(screen.queryByText(/Find the cats/)).not.toBeInTheDocument()
  expect(screen.getByTestId('clue-card-smiley')).toBeInTheDocument()
})
