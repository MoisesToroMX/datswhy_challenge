import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateRangeForm } from '../components/DateRangeForm'

describe('DateRangeForm', () => {
  let handleSubmit: Mock

  beforeEach(() => {
    handleSubmit = vi.fn<(startDate: string | null, endDate: string | null) => void>()
  })

  describe('Rendering', () => {
    it('renders RangePicker component', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.ant-picker-range')

      expect(picker).toBeTruthy()
    })

    it('renders with correct placeholders', () => {
      render(<DateRangeForm onSubmit={handleSubmit} />)

      const startPlaceholder = screen.getByPlaceholderText('Fecha Inicio')
      const endPlaceholder = screen.getByPlaceholderText('Fecha Fin')

      expect(startPlaceholder).toBeTruthy()
      expect(endPlaceholder).toBeTruthy()
    })

    it('renders start date input', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const startInput = container.querySelector(
        '.ant-picker-input-start input'
      )

      expect(startInput).toBeTruthy()
    })

    it('renders end date input', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const endInput = container.querySelector('.ant-picker-input-end input')

      expect(endInput).toBeTruthy()
    })
  })

  describe('Component Structure', () => {
    it('uses discord-datepicker class', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.discord-datepicker')

      expect(picker).toBeTruthy()
    })

    it('has correct styling', () => {
      const { container } = render(<DateRangeForm onSubmit={handleSubmit} />)
      const picker = container.querySelector('.ant-picker-range')

      expect(picker).toBeTruthy()
    })
  })
})
