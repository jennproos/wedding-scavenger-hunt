import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import { CodeInput } from '../components/CodeInput'

function fillDigits(inputs: HTMLElement[]) {
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '4' } })
  fireEvent.change(inputs[2], { target: { value: '8' } })
  fireEvent.change(inputs[3], { target: { value: '9' } })
}

test('renders 4 digit input boxes', () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const inputs = screen.getAllByRole('textbox')
  expect(inputs).toHaveLength(4)
})

test('lock button is enabled when fewer than 4 digits entered', () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).not.toBeDisabled()

  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '2' } })
  expect(button).not.toBeDisabled()
})

test('clicking lock with fewer than 4 digits applies incomplete class and clears it', async () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const button = screen.getByRole('button', { name: /unlock/i })

  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.click(button)

  expect(button).toHaveClass('lock-btn--incomplete')
  await waitFor(() => expect(button).not.toHaveClass('lock-btn--incomplete'), { timeout: 2000 })
})

test('does not call onSubmit when fewer than 4 digits entered', () => {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(<CodeInput onSubmit={onSubmit} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  expect(onSubmit).not.toHaveBeenCalled()
})

test('lock button enabled when all 4 digits filled', () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).not.toBeDisabled()
})

test('calls onSubmit with the 4-digit code when submitted', () => {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(<CodeInput onSubmit={onSubmit} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  expect(onSubmit).toHaveBeenCalledWith('1489')
})

test('shows champagne overlay after successful submission', async () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  await waitFor(() => expect(screen.getByTestId('champagne-pop')).toBeInTheDocument(), { timeout: 3000 })
})

test('calls onSuccessReady after successful submission', async () => {
  const onSuccessReady = vi.fn()
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} onSuccessReady={onSuccessReady} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  await waitFor(() => expect(onSuccessReady).toHaveBeenCalled(), { timeout: 4000 })
})

test('does not call onSuccessReady after failed submission', async () => {
  const onSuccessReady = vi.fn()
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(false)} onSuccessReady={onSuccessReady} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  await waitFor(() => inputs.forEach(input => expect(input).toHaveValue('')), { timeout: 3000 })
  expect(onSuccessReady).not.toHaveBeenCalled()
})

test('clears inputs after successful submission', async () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  await waitFor(() => inputs.forEach(input => expect(input).toHaveValue('')), { timeout: 4000 })
})

test('clears inputs after failed submission', async () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(false)} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  await waitFor(() => inputs.forEach(input => expect(input).toHaveValue('')), { timeout: 3000 })
})

test('pressing Enter on a digit input submits the code', () => {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(<CodeInput onSubmit={onSubmit} />)
  const inputs = screen.getAllByRole('textbox')
  fillDigits(inputs)
  fireEvent.keyDown(inputs[3], { key: 'Enter' })
  expect(onSubmit).toHaveBeenCalledWith('1489')
})

test('lock button has lock-btn--entering class on mount', () => {
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).toHaveClass('lock-btn--entering')
})

test('lock button loses lock-btn--entering class after 2600ms', async () => {
  vi.useFakeTimers()
  render(<CodeInput onSubmit={vi.fn().mockResolvedValue(true)} />)
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).toHaveClass('lock-btn--entering')
  await act(() => vi.advanceTimersByTimeAsync(2600))
  expect(button).not.toHaveClass('lock-btn--entering')
  vi.useRealTimers()
})

test('pressing Enter with incomplete digits does not call onSubmit', () => {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(<CodeInput onSubmit={onSubmit} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.keyDown(inputs[0], { key: 'Enter' })
  expect(onSubmit).not.toHaveBeenCalled()
})
