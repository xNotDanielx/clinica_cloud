# Backend — Clínica Cloud

API REST de Clínica Renacer construida con FastAPI, SQLAlchemy y PostgreSQL.

## Estructura

```text
app/
├── common/       # enums, constantes, seguridad y excepciones
├── core/         # configuración y lifespan
├── db/           # engine y sesiones SQLAlchemy
├── models/       # modelos ORM
├── routes/       # endpoints FastAPI
├── schemas/      # contratos Pydantic
├── services/     # lógica de negocio
├── scripts/      # bootstrap, seeds y calidad
└── seed_data/    # datos iniciales

migrations/
└── versions/     # migraciones Alembic

tests/            # pruebas unitarias y de contrato
```

## Instalación

### Producción

```bash
python -m pip install -r requirements.txt
```

### Desarrollo

```bash
python -m pip install -r requirements-dev.txt
```

## Variables de entorno

El backend requiere:

```text
DATABASE_URL
ADMIN_AUTH_SECRET
```

Opcionales, pero deben configurarse juntos:

```text
INITIAL_ADMIN_USER
INITIAL_ADMIN_PASSWORD
```

También puede configurarse:

```text
CORS_ORIGINS
```

`ADMIN_AUTH_SECRET` debe tener al menos 32 caracteres.
`INITIAL_ADMIN_PASSWORD` debe tener al menos 12 caracteres.

Las URLs antiguas `postgresql://...` se convierten internamente al driver Psycopg 3.

## Migraciones

Aplicar migraciones:

```bash
alembic upgrade head
```

Crear una nueva migración:

```bash
alembic revision --autogenerate -m "descripcion"
```

No se deben realizar cambios de esquema mediante `create_all()` en el arranque de la aplicación.

## Bootstrap

El comando usado por Docker:

```bash
python -m app.scripts.seed_procedimientos
```

ejecuta primero `alembic upgrade head` y después carga de forma idempotente los procedimientos iniciales.

## Ejecutar localmente

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Calidad

Ejecutar:

```bash
python -m app.scripts.quality
```

Esto ejecuta:

1. Ruff.
2. Pytest.
3. `compileall`.

Formato opcional del código:

```bash
python -m ruff format app tests
```

Auditoría de dependencias:

```bash
python -m pip_audit -r requirements.txt
```

## Seguridad

- Contraseñas nuevas: Argon2.
- Hashes PBKDF2 existentes: compatibles y migrados a Argon2 al iniciar sesión correctamente.
- Sesiones administrativas: JWT HS256.
- Endpoints administrativos: Bearer Token.
- `POST /pacientes` requiere autenticación.
- El frontend no decide valores monetarios para citas públicas.
- Máximo de dos procedimientos validado también en backend.

## Importante

Al desplegar esta versión, los tokens administrativos emitidos por la implementación anterior dejan de ser válidos. Los administradores deberán iniciar sesión nuevamente.

Los hashes de contraseña existentes no necesitan migración manual.
