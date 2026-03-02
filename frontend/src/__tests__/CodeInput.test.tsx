import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CodeInput } from '../components/CodeInput'

test('renders 4 digit input boxes', () => {
  render(<CodeInput onSubmit={vi.fn()} />)
  const inputs = screen.getAllByRole('textbox')
  expect(inputs).toHaveLength(4)
})

test('submit button is disabled when fewer than 4 digits entered', () => {
  render(<CodeInput onSubmit={vi.fn()} />)
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).toBeDisabled()

  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '2' } })
  expect(button).toBeDisabled()
})

test('submit button enabled when all 4 digits filled', () => {
  render(<CodeInput onSubmit={vi.fn()} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '2' } })
  fireEvent.change(inputs[2], { target: { value: '3' } })
  fireEvent.change(inputs[3], { target: { value: '4' } })
  const button = screen.getByRole('button', { name: /unlock/i })
  expect(button).not.toBeDisabled()
})

test('calls onSubmit with the 4-digit code when submitted', () => {
  const onSubmit = vi.fn()
  render(<CodeInput onSubmit={onSubmit} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '4' } })
  fireEvent.change(inputs[2], { target: { value: '8' } })
  fireEvent.change(inputs[3], { target: { value: '9' } })
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  expect(onSubmit).toHaveBeenCalledWith('1489')
})

test('clears inputs after submission', () => {
  render(<CodeInput onSubmit={vi.fn()} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: '1' } })
  fireEvent.change(inputs[1], { target: { value: '4' } })
  fireEvent.change(inputs[2], { target: { value: '8' } })
  fireEvent.change(inputs[3], { target: { value: '9' } })
  fireEvent.click(screen.getByRole('button', { name: /unlock/i }))
  inputs.forEach(input => {
    expect(input).toHaveValue('')
  })
})
