import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table'
import { Button, Skeleton, Space, Tag, Pagination, Tooltip } from 'antd'
import { CampaignListItem } from '../types/campaign'
import { format } from 'date-fns'

interface CampaignTableProps {
  data: CampaignListItem[]
  loading: boolean
  onViewDetail: (campaign: CampaignListItem) => void
  pagination: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
}


const THEME = {
  HEADER_BG: '#2F3136',
  ROW_BG: '#36393F',
  ROW_HOVER: '#32353B',
  TEXT_MAIN: '#FFFFFF',
  TEXT_MUTED: '#B9BBBE',
  BORDER: '#202225',
  ACCENT_BLUE: '#3B82F6'
}

const GoogleIcon = ({ name, style }: { name: string; style?: React.CSSProperties }) => (
  <span className="material-icons-outlined" style={{ verticalAlign: 'middle', fontSize: '18px', ...style }}>
    {name}
  </span>
)

export const CampaignTable = ({
  data,
  loading,
  onViewDetail,
  pagination
}: CampaignTableProps) => {
  const columnHelper = createColumnHelper<CampaignListItem>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: (info) => (
          <span style={{ fontWeight: 600, color: THEME.TEXT_MAIN }}>{info.getValue()}</span>
        )
      }),
      columnHelper.accessor('campaignType', {
        header: 'Tipo',
        cell: (info) => {
          const type = info.getValue()
          const color = type === 'mensual' ? '#3B82F6' : '#3BA55C'
          return (
            <Tag
              style={{
                background: '#2F3136',
                border: `1px solid ${color}`,
                color: color,
                fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              {type?.toUpperCase() || ''}
            </Tag>
          )
        }
      }),
      columnHelper.accessor('peopleImpacts', {
        header: 'Impactos',
        cell: (info) => (
          <span style={{ color: THEME.TEXT_MAIN, fontFamily: 'monospace' }}>
            {(info.getValue() ?? 0).toLocaleString()}
          </span>
        )
      }),
      columnHelper.accessor('reach', {
        header: 'Alcance',
        cell: (info) => (
          <span style={{ color: THEME.TEXT_MAIN, fontFamily: 'monospace' }}>
            {(info.getValue() ?? 0).toLocaleString()}
          </span>
        )
      }),
      columnHelper.accessor('sitesCount', {
        header: 'Sitios',
        cell: (info) => (
          <Tag style={{ background: '#202225', border: '1px solid #40444B', color: '#dcddde', borderRadius: '12px' }}>
            {info.getValue() ?? 0}
          </Tag>
        )
      }),
      columnHelper.accessor('periodsCount', {
        header: 'Períodos',
        cell: (info) => (
          <Tag style={{ background: '#202225', border: '1px solid #40444B', color: '#dcddde', borderRadius: '12px' }}>
            {info.getValue() ?? 0}
          </Tag>
        )
      }),

      columnHelper.accessor('startDate', {
        header: 'Inicio',
        cell: (info) =>
          info.getValue() ? (
            <span style={{ color: THEME.TEXT_MUTED }}>
              {format(new Date(info.getValue()), 'dd/MM/yyyy')}
            </span>
          ) : ''
      }),
      columnHelper.accessor('endDate', {
        header: 'Fin',
        cell: (info) =>
          info.getValue() ? (
            <span style={{ color: THEME.TEXT_MUTED }}>
              {format(new Date(info.getValue()), 'dd/MM/yyyy')}
            </span>
          ) : ''
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        size: 60, // Set narrow width for actions column
        cell: (info) => (
          <div style={{ textAlign: 'center' }}>
            <Tooltip title="Ver Detalles">
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetail(info.row.original)
                }}
                style={{
                  color: THEME.TEXT_MUTED,
                  borderColor: 'transparent',
                  background: 'transparent'
                }}
                icon={<GoogleIcon name="visibility" style={{ fontSize: '18px' }} />}
              />
            </Tooltip>
          </div>
        )
      })
    ],
    [onViewDetail, columnHelper]
  )

  const paginationState: PaginationState = useMemo(
    () => ({
      pageIndex: pagination.current - 1,
      pageSize: pagination.pageSize
    }),
    [pagination.current, pagination.pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(pagination.total / pagination.pageSize),
    state: {
      pagination: paginationState
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater(paginationState)
        pagination.onChange(newState.pageIndex + 1, newState.pageSize)
      } else {
        pagination.onChange(updater.pageIndex + 1, updater.pageSize)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })


  const emptyRows = Math.max(0, pagination.pageSize - data.length)
  const ROW_HEIGHT = 65

  if (loading) return <Skeleton active paragraph={{ rows: 5 }} style={{ padding: 20 }} />

  return (
    <div style={{ width: '100%', background: THEME.ROW_BG, borderRadius: 8, overflow: 'hidden' }}>
      <div className="custom-scroll" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '800px', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ background: THEME.HEADER_BG }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '16px 20px',
                      fontWeight: 700,
                      fontSize: 11,
                      color: THEME.TEXT_MUTED,
                      borderBottom: `1px solid ${THEME.BORDER}`,
                      letterSpacing: '0.05em',
                      width: header.getSize() !== 150 ? header.getSize() : 'auto' // Apply custom width if set
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onViewDetail(row.original)}
                    style={{ borderBottom: `1px solid ${THEME.BORDER}`, cursor: 'pointer', transition: 'background 0.2s' }}
                    className="ant-table-row"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isAction = cell.column.id === 'actions';
                      return (
                        <td
                          key={cell.id}
                          style={{
                            padding: '16px 20px',
                            color: THEME.TEXT_MAIN,
                            width: cell.column.getSize() !== 150 ? cell.column.getSize() : 'auto' // Apply custom width
                          }}
                          onClick={(e) => {
                            if (isAction) {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {Array.from({ length: emptyRows }).map((_, index) => (
                  <tr key={`empty-${index}`} style={{ height: ROW_HEIGHT, borderBottom: `1px solid ${THEME.BORDER}` }}>
                    <td colSpan={columns.length}>&nbsp;</td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '48px 16px', textAlign: 'center', height: pagination.pageSize * ROW_HEIGHT }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <GoogleIcon name="search_off" style={{ fontSize: '48px', color: '#72767d' }} />
                    <span style={{ color: '#72767d' }}>No se encontraron campañas</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: THEME.HEADER_BG,
          borderTop: `1px solid ${THEME.BORDER}`
        }}
      >
        <div style={{ fontSize: 12, color: THEME.TEXT_MUTED }}>
          Mostrando{' '}
          {Math.min(
            pagination.current * pagination.pageSize,
            pagination.total
          ) === 0
            ? 0
            : (pagination.current - 1) * pagination.pageSize + 1}{' '}
          -{' '}
          {Math.min(
            pagination.current * pagination.pageSize,
            pagination.total
          )}{' '}
          de {pagination.total}
        </div>
        <Pagination
          simple={false}
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={pagination.onChange}
          showSizeChanger={false}
          size="small"
        />
      </div>
    </div>
  )
}
