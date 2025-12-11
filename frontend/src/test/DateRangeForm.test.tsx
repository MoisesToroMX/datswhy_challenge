import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateRangeForm } from '../components/DateRangeForm'

describe('DateRangeForm', () => {
  let handleSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleSubmit = vi.fn()
  })

  describe('Rendering', () => {
    it('renders RangePicker component', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.ant-picker-range')
      expect(picker).toBeInTheDocument()
    })

    it('renders with correct placeholders', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)
      expect(screen.getByPlaceholderText('Fecha Inicio')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Fecha Fin')).toBeInTheDocument()
    })

    it('renders start date input', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const startInput = container.querySelector(
        '.ant-picker-input-start input'
      )
      expect(startInput).toBeInTheDocument()
    })

    it('renders end date input', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const endInput = container.querySelector('.ant-picker-input-end input')
      expect(endInput).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('uses discord-datepicker class', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.discord-datepicker')
      expect(picker).toBeInTheDocument()
    })

    it('has correct styling', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.ant-picker-range')
      expect(picker).toHaveStyle({ background: '#202225' })
    })
  })
})
