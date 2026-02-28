import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (token: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const onScanRef = useRef(onScan)

  useEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    if (scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    )
    scanner.render(
      (decodedText) => onScanRef.current(decodedText),
      () => {
        // Scan error — ignore, camera keeps trying
      },
    )
    scannerRef.current = scanner

    return () => {
      scannerRef.current?.clear().catch(() => undefined)
      scannerRef.current = null
    }
  }, [])

  return <div id="qr-reader" data-testid="qr-scanner-container" />
}
