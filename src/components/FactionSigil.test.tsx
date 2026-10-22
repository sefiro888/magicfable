import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FactionSigil } from './FactionSigil'

afterEach(cleanup)

describe('emblemas de facción', () => {
  it('un fallo de imagen no obliga a la facción siguiente a usar su respaldo', () => {
    const { container, rerender } = render(<FactionSigil faction="forja" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('svg')).toBeInTheDocument()
    rerender(<FactionSigil faction="fimbul" />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('sigil-fimbul.webp'))
    expect(screen.getByRole('img', { name: 'Símbolo de Fimbul' })).toBeVisible()
  })

  it('mantiene completo el relieve asimétrico y evita anuncios decorativos', () => {
    const { container } = render(<FactionSigil faction="marea" decorative />)
    expect(container.firstElementChild).toHaveAttribute('data-relief', 'true')
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
