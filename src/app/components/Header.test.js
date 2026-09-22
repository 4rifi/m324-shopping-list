import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
