import { render } from '@testing-library/react'
import { Confetti } from '../components/Confetti'

test('renders without crashing', () => {
  const { container } = render(<Confetti />)
  expect(container.firstChild).not.toBeNull()
})
