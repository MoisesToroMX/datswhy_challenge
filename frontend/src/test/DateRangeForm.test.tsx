import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateRangeForm } from '../components/DateRangeForm'

describe('DateRangeForm', () => {
  let handleSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleSubmit = vi.fn()
  })

  describe('Rendering', () => {
    it('renders the form container', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('renders clear button with correct text', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      expect(screen.getByText('Limpiar')).toBeInTheDocument()
    })

    it('renders clear button with X symbol', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      expect(screen.getByText('✕')).toBeInTheDocument()
    })

    it('renders RangePicker component', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.ant-picker-range')
      expect(picker).toBeInTheDocument()
    })

    it('renders with correct placeholders', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      expect(screen.getByPlaceholderText('Inicio')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Fin')).toBeInTheDocument()
    })
  })

  describe('Clear Button Interaction', () => {
    it('calls onSubmit with nulls when clear button clicked', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      fireEvent.click(screen.getByText('Limpiar'))
      expect(handleSubmit).toHaveBeenCalledWith(null, null)
    })

    it('calls onSubmit exactly once on clear', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      fireEvent.click(screen.getByText('Limpiar'))
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('clear button has type="button" to prevent form submit', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      const clearBtn = screen.getByText('Limpiar').closest('button')
      expect(clearBtn).toHaveAttribute('type', 'button')
    })
  })

  describe('Form Structure', () => {
    it('form has flexbox layout', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const form = container.querySelector('form')
      expect(form).toHaveStyle({ display: 'flex' })
    })
  })
})
