import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const THEME = {
  BACKGROUND: '#202225',
  CARD: '#36393F',
  TEXT_MAIN: '#FFFFFF',
  TEXT_MUTED: '#B9BBBE',
  ACCENT_BLUE: '#3B82F6'
}

const GoogleIcon = (
  { name, style }: { name: string; style?: React.CSSProperties }
) => (
  <span
    className='material-icons-outlined'
    style={{ verticalAlign: 'middle', ...style }}
  >
    {name}
  </span>
)

export const NotFoundPage = () => {
  const [countdown, setCountdown] = useState(3)
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/campaigns')
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)

    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: THEME.BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
        color: THEME.TEXT_MAIN
      }}
    >
      <GoogleIcon
        name='error_outline'
        style={{ fontSize: 80, color: THEME.ACCENT_BLUE }}
      />
      <h1 style={{ margin: 0, fontSize: 48, fontWeight: 700 }}>404</h1>
      <p style={{ margin: 0, color: THEME.TEXT_MUTED, fontSize: 18 }}>
        Página no encontrada
      </p>
      <p style={{ margin: 0, color: THEME.TEXT_MUTED }}>
        Redirigiendo a campañas en {countdown}...
      </p>
      <div
        style={{
          marginTop: 16,
          padding: '12px 24px',
          background: THEME.CARD,
          borderRadius: 8,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/campaigns')}
      >
        <span style={{ color: THEME.ACCENT_BLUE }}>
          Ir a campañas ahora
        </span>
      </div>
    </div>
  )
}
