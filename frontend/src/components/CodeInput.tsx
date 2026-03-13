import { useRef, useState } from 'react'
import { ChampagnePop } from './ChampagnePop'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'incomplete'

interface CodeInputProps {
  onSubmit: (code: string) => Promise<boolean>
  onSuccessReady?: () => void
}

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24">
      {/* Heart body */}
      <path
        fill="currentColor"
        stroke="none"
        d="M12 21 C7 17.5 2 14 2 10.5 C2 7.5 4.5 6 7.5 6 C9.5 6 11 7.5 12 9 C13 7.5 14.5 6 16.5 6 C19.5 6 22 7.5 22 10.5 C22 14 17 17.5 12 21 Z"
      />
      {/* Shackle */}
      {open ? (
        <path
          d="M8.5 8.5 V4 a3.5 3.5 0 0 1 6.9 -1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M8.5 8.5 V4 a3.5 3.5 0 0 1 7 0 V8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function CodeInput({ onSubmit, onSuccessReady }: CodeInputProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [status, setStatus] = useState<Status>('idle')
  const [showChampagne, setShowChampagne] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const allFilled = digits.every(d => d !== '')
  const isOpen = allFilled && status === 'idle'

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
    if (e.key === 'Enter') {
      void handleSubmit()
    }
  }

  async function handleSubmit() {
    if (status !== 'idle') return
    if (!allFilled) {
      setStatus('incomplete')
      await new Promise(r => setTimeout(r, 600))
      setStatus('idle')
      return
    }
    setStatus('submitting')
    const [success] = await Promise.all([
      onSubmit(digits.join('')),
      new Promise(r => setTimeout(r, 1200)), // minimum wiggle time
    ])
    if (success) {
      setStatus('success')
      setShowChampagne(true)
      await new Promise(r => setTimeout(r, 1400)) // champagne pop + explode
      setShowChampagne(false)
      onSuccessReady?.()
      await new Promise(r => setTimeout(r, 500)) // new clue fades in
      setDigits(['', '', '', ''])
      setStatus('idle')
    } else {
      setStatus('error')
      await new Promise(r => setTimeout(r, 800))
      setDigits(['', '', '', ''])
      setStatus('idle')
      inputRefs[0].current?.focus()
    }
  }

  return (
    <>
    {showChampagne && <ChampagnePop />}
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
            disabled={status !== 'idle'}
          />
        ))}
      </div>
      <button
        className={`lock-btn lock-btn--${status}${isOpen ? ' lock-btn--open' : ''}`}
        onClick={handleSubmit}
        disabled={status !== 'idle'}
        aria-label="Unlock"
      >
        <LockIcon open={isOpen} />
      </button>
    </div>
    </>
  )
}
