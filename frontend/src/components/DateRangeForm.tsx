import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DatePicker, message } from 'antd'
import type { Dayjs } from 'dayjs'
import { forwardRef, useImperativeHandle } from 'react'

const { RangePicker } = DatePicker

const GoogleIcon = (
  { name, style }: { name: string; style?: React.CSSProperties }
) => (
  <span
    className='material-icons-outlined'
    style={{ verticalAlign: 'middle', fontSize: '20px', ...style }}
  >
    {name}
  </span>
)

const dateRangeSchema = z.object({
  dateRange: z
    .tuple([z.custom<Dayjs>().nullable(), z.custom<Dayjs>().nullable()])
    .nullable()
})

type DateRangeFormData = z.infer<typeof dateRangeSchema>

interface DateRangeFormProps {
  onSubmit: (startDate: string | null, endDate: string | null) => void
}

export interface DateRangeFormRef {
  reset: () => void
}

export const DateRangeForm = forwardRef<DateRangeFormRef, DateRangeFormProps>(
  ({ onSubmit }, ref) => {
    const { control, reset } = useForm<DateRangeFormData>({
      resolver: zodResolver(dateRangeSchema),
      defaultValues: { dateRange: null }
    })

    useImperativeHandle(ref, () => ({
      reset: () => {
        reset()
        onSubmit(null, null)
      }
    }))

    const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        if (dates[1].isBefore(dates[0])) {
          message.error('La fecha fin no puede ser menor a la fecha inicial')
          return
        }
      }

      if (dates && dates[0] && dates[1]) {
        onSubmit(
          dates[0].format('YYYY-MM-DD'),
          dates[1].format('YYYY-MM-DD')
        )
      } else if (!dates || (!dates[0] && !dates[1])) {
        onSubmit(null, null)
      }
    }

    return (
      <Controller
        name='dateRange'
        control={control}
        render={({ field }) => (
          <RangePicker
            format='DD/MM/YYYY'
            value={field.value}
            onChange={(dates) => {
              field.onChange(dates)
              handleDateChange(dates)
            }}
            placeholder={['Fecha Inicio', 'Fecha Fin']}
            suffixIcon={
              <GoogleIcon
                name='calendar_today'
                style={{ fontSize: 16, color: '#B9BBBE' }}
              />
            }
            style={{
              background: '#202225',
              border: '1px solid #202225',
              color: 'white'
            }}
            className='discord-datepicker'
          />
        )}
      />
    )
  }
)

DateRangeForm.displayName = 'DateRangeForm'
