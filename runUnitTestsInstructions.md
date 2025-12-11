# Instrucciones para Ejecutar Pruebas Unitarias

Este documento detalla cómo ejecutar las pruebas unitarias para el Frontend y el Backend de la aplicación.

## Requisitos Previos

Asegúrate de tener instalados:
- Node.js 20+
- Python 3.11+
- Dependencias del proyecto instaladas (ver `installationInstructions.md`)

---

## 1. Pruebas de Frontend (React/Vitest)

Las pruebas de frontend utilizan **Vitest** y **React Testing Library**.

### Ejecutar todas las pruebas

Desde el directorio `frontend`:

```bash
cd frontend
npm test
```

Esto ejecutará `vitest` en modo watch. Para una ejecución única (CI/CD):

```bash
npm run test:run
```
*(Nota: Asegúrate de que el script `test:run` exista en `package.json` o usa `npx vitest run`)*

### Ejecutar pruebas específicas

Puedes filtrar por nombre de archivo:

```bash
npx vitest run CampaignTable
```

### Notas sobre los Tests de Frontend
- Se utiliza `vi.fn()` para mockear funciones.
- Las pruebas cubren renderizado, interacciones y llamadas a API simuladas.
- Se ha eliminado el uso de `toBeInTheDocument` en favor de `toBeTruthy` con `findBy*` para mejor manejo de asincronía.

---

## 2. Pruebas de Backend (FastAPI/Pytest)

Las pruebas de backend utilizan **pytest**.

### Configuración

Asegúrate de estar en el directorio `backend` y tener el entorno virtual activado.

```bash
cd backend
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

### Ejecutar todas las pruebas

```bash
pytest
```

### Ejecutar con cobertura (Coverage)

Si tienes `pytest-cov` instalado:

```bash
pytest --cov=app tests/
```

### Estructura de Tests Backend
- **Unit Tests**: Pruebas aisladas de funciones CRUD y utilidades.
- **Integration Tests**: Pruebas de endpoints usando `TestClient`.
