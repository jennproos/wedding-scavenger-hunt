import { useRef, useState } from 'react'

interface CodeInputProps {
  onSubmit: (code: string) => void
}

export function CodeInput({ onSubmit }: CodeInputProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const allFilled = digits.every(d => d !== '')

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  function handleSubmit() {
    if (!allFilled) return
    onSubmit(digits.join(''))
    setDigits(['', '', '', ''])
    inputRefs[0].current?.focus()
  }

  return (
    <div className="code-input-wrapper">
      <div className="code-digits">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={inputRefs[i]}
            className="code-digit"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <button onClick={handleSubmit} disabled={!allFilled}>
        Unlock
      </button>
    </div>
  )
}
