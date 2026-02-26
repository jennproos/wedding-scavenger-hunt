import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(function (
    this: { render: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> },
  ) {
    this.render = vi.fn()
    this.clear = vi.fn().mockResolvedValue(undefined)
  }),
}))

import { QRScanner } from '../components/QRScanner'
import { Html5QrcodeScanner } from 'html5-qrcode'

test('renders scanner container', () => {
  const onScan = vi.fn()
  render(<QRScanner onScan={onScan} />)
  expect(screen.getByTestId('qr-scanner-container')).toBeInTheDocument()
})

test('calls onScan when a QR code is scanned', () => {
  // Override mock so render immediately invokes the success callback
  vi.mocked(Html5QrcodeScanner).mockImplementation(function (
    this: { render: (cb: (text: string) => void) => void; clear: ReturnType<typeof vi.fn> },
  ) {
    this.render = (onSuccess: (text: string) => void) => {
      onSuccess('scanned-token-value')
    }
    this.clear = vi.fn().mockResolvedValue(undefined)
  })

  const onScan = vi.fn()
  render(<QRScanner onScan={onScan} />)
  expect(onScan).toHaveBeenCalledWith('scanned-token-value')
})
