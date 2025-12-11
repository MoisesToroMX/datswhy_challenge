# Campaign Analytics - Instrucciones de Instalación

## Requisitos

- **Docker** (recomendado) O
- **Python 3.11+** y **Node.js 20+**

---

## Opción 1: Docker Compose (Recomendado)

> **IMPORTANTE**: Debido a que la red es compartida, debes iniciar el backend **PRIMERO**.

### 1. Iniciar Backend
Esto creará la red `app-network` y levantará el servicio de API.

```bash
cd backend
docker compose up -d --build
```

### 2. Iniciar Frontend
Una vez que el backend esté corriendo, inicia el frontend.

```bash
cd frontend
docker compose up -d --build
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

---

## Opción 2: Desarrollo Local

### Configuración del Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Poblar la base de datos (solo la primera vez)
python seed.py

# Ejecutar el servidor
uvicorn app.main:app --reload --port 8000
```

### Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

---

## Estructura del Proyecto

```
prueba_tecnica_full_1/
├── backend/
│   ├── app/
│   │   ├── main.py          # Aplicación FastAPI
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py       # Esquemas Pydantic
│   │   ├── crud.py          # Operaciones de Base de Datos
│   │   └── database.py      # Configuración de BD
│   ├── data/                # Archivos de datos CSV
│   ├── Dockerfile
│   ├── requirements.txt
│   └── seed.py              # Sembrador de Base de Datos
│
└── frontend/
    ├── src/
    │   ├── api/             # Cliente API
    │   ├── components/      # Componentes React
    │   ├── types/           # Tipos TypeScript
    │   ├── App.tsx          # App Principal
    │   └── main.tsx         # Punto de entrada
    ├── Dockerfile
    └── package.json
```

---

## Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/campaigns/` | GET | Listar campañas (paginado) |
| `/campaigns/{id}` | GET | Detalles de campaña |
| `/campaigns/{id}/sites/summary` | GET | Datos de gráfica de sitios |
| `/campaigns/{id}/periods/summary` | GET | Datos de gráfica de periodos |
| `/campaigns/{id}/summary` | GET | Datos de gráfica demográfica |

### Parámetros de Consulta para `/campaigns/`

- `skip`: Desplazamiento (default: 0)
- `limit`: Tamaño de página (default: 5)
- `tipo_campania`: Filtrar por tipo (mensual/catorcenal)
- `fecha_inicio`: Filtro de fecha de inicio
- `fecha_fin`: Filtro de fecha de fin
