# Clínica Cloud — Clínica Renacer

Aplicación web para la **gestión y agendamiento de servicios de Clínica Renacer**.

El proyecto incluye:

* Web pública para pacientes.
* Panel administrativo.
* API REST.
* Base de datos PostgreSQL.
* Contenedores Docker.
* Healthchecks de servicios.

Actualmente, el proyecto se encuentra en proceso de **migración Lift & Shift hacia AWS**, seguido de la implementación de **CI/CD** y futuras funcionalidades de **IA y agentes**.

---

## Estado actual

| Componente            | Estado            |
| --------------------- | ----------------- |
| Web pública           | ✅ Funcional      |
| Panel administrativo  | ✅ Funcional      |
| API FastAPI           | ✅ Funcional      |
| PostgreSQL            | ✅ Funcional      |
| Docker                | ✅ Preparado      |
| Healthchecks          | ✅ Implementados  |
| AWS                   | ⏳ Pendiente      |
| CI/CD                 | ⏳ Pendiente      |
| Copilot / IA / Agente | ⏳ Pendiente      |

---

## Arquitectura

```text
┌──────────────────────────┐
│        Frontend          │
│      React + Vite        │
│          :5173           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│         Backend          │
│        FastAPI           │
│          :8000           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
│          :5432           │
└──────────────────────────┘
```

Los componentes se ejecutan mediante **Docker Compose**.

> En modo de despliegue, PostgreSQL no publica el puerto `5432` hacia el host.

---

## Tecnologías

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python 3.11
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Infraestructura

* PostgreSQL 15
* Docker
* Docker Compose
* GitHub
* AWS
* GitHub Actions
* GitHub Container Registry (GHCR)

---

## Funcionalidades

### Sitio público

La aplicación pública permite:

* Visualizar información de la clínica.
* Consultar procedimientos.
* Consultar horarios disponibles.
* Solicitar citas.
* Registrar solicitudes mediante la API.
* Continuar la comunicación mediante WhatsApp.
* Consultar información de contacto y ubicación.

### Administración

El panel administrativo permite:

* Iniciar sesión.
* Consultar pacientes.
* Buscar pacientes.
* Crear y editar pacientes.
* Eliminar pacientes.
* Consultar citas.
* Crear y editar citas.
* Aprobar o rechazar solicitudes.
* Eliminar citas.

El acceso administrativo está disponible desde el sitio público o directamente en:

```text
http://localhost:5173/#admin
```

---

## API

### URL local

```text
http://localhost:8000
```

### Healthcheck

```text
http://localhost:8000/health
```

### Swagger UI

```text
http://localhost:8000/docs
```

### OpenAPI

```text
http://localhost:8000/openapi.json
```

---

## Endpoints principales

### Públicos

| Método | Endpoint                                    |
| ------ | ------------------------------------------- |
| `GET`  | `/health`                                   |
| `GET`  | `/catalogos`                                |
| `GET`  | `/procedimientos/activos`                   |
| `GET`  | `/citas/horarios-disponibles`               |
| `POST` | `/citas/publica`                            |
| `GET`  | `/codigos-promocionales/validar`            |
| `GET`  | `/codigos-promocionales/calcular-descuento` |

### Administracion

| Método   | Endpoint                       |
| -------- | ------------------------------ |
| `POST`   | `/administradores/login`       |
| `GET`    | `/administradores/me`          |
| `POST`   | `/administradores`             |
| `GET`    | `/pacientes`                   |
| `POST`   | `/pacientes`                   |
| `GET`    | `/pacientes/filtrar`           |
| `GET`    | `/pacientes/{identificacion}`  |
| `PATCH`  | `/pacientes/{identificacion}`  |
| `DELETE` | `/pacientes/{identificacion}`  |
| `GET`    | `/citas/todas`                 |
| `GET`    | `/citas/filtrar`               |
| `GET`    | `/citas/pendientes-aprobacion` |
| `POST`   | `/citas`                       |
| `PATCH`  | `/citas/{id}`                  |
| `PATCH`  | `/citas/{id}/aprobar`          |
| `PATCH`  | `/citas/{id}/rechazar`         |
| `DELETE` | `/citas/{id}`                  |

> Los endpoints administrativos requieren autenticación mediante **Bearer Token**, excepto `/administradores/login`.

Para consultar los contratos completos de la API, utilizar **Swagger** u **OpenAPI**.

---

## Ejecutar localmente

### Requisitos

Antes de iniciar, asegúrate de tener instalado:

* Git
* Docker Desktop
* Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/xNotDanielx/clinica_cloud.git
cd clinica_cloud
```

### 2. Crear el archivo `.env`

El repositorio incluye un archivo `.env.example` que debe utilizarse como base.

#### PowerShell

```powershell
Copy-Item .env.example .env
```

#### Linux / macOS

```bash
cp .env.example .env
```

### 3. Configurar variables de entorno

Editar el archivo `.env`:

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

DATABASE_URL=

ADMIN_AUTH_SECRET=
INITIAL_ADMIN_USER=
INITIAL_ADMIN_PASSWORD=

CORS_ORIGINS=

VITE_BACKEND_URL=
```

### Requisitos de seguridad

* `ADMIN_AUTH_SECRET` debe tener mínimo **32 caracteres**.
* `INITIAL_ADMIN_PASSWORD` debe tener mínimo **12 caracteres**.
* El archivo `.env` **no debe subirse al repositorio**.

---

## Modo desarrollo

Ejecutar:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Este modo utiliza:

* Uvicorn con `--reload`.
* Vite Development Server.
* Bind mounts para desarrollo.
* PostgreSQL accesible desde `localhost:5432`.

Para consultar el estado de los servicios:

```bash
docker compose ps
```

---

## Modo similar a despliegue

Ejecutar:

```bash
docker compose up -d --build
```

Comprobar el estado de los servicios:

```bash
docker compose ps
```

Los servicios deberían aparecer con estado:

```text
healthy
```

---

## Detener los servicios

Para detener los contenedores:

```bash
docker compose down
```

### Importante

No utilizar:

```bash
docker compose down -v
```

salvo que se quiera eliminar deliberadamente el volumen persistente de PostgreSQL.

La base de datos utiliza el volumen:

```text
postgres_data
```

Esto permite conservar los datos aunque los contenedores sean detenidos o recreados.

---

## Flujo de trabajo con Git

No desarrollar directamente sobre la rama `main`.

El flujo recomendado es:

```text
Rama de trabajo
      │
      ▼
    Commit
      │
      ▼
     Push
      │
      ▼
Pull Request
      │
      ▼
   Revisión
      │
      ▼
     main
```

Ejemplo:

```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

Después de realizar los cambios:

```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-de-la-funcionalidad
```

Posteriormente se debe crear un **Pull Request** hacia `main`.

---

## Roadmap

### Fase 1 — Baseline

* [x] Web pública.
* [x] Panel administrativo.
* [x] API REST.
* [x] PostgreSQL.
* [x] Dockerización.
* [x] Healthchecks.

### Fase 2 — AWS

* [ ] Migración Lift & Shift hacia AWS.
* [ ] Configuración de EC2.
* [ ] Configuración de infraestructura.
* [ ] Persistencia y respaldo de datos.
* [ ] Configuración de dominio y HTTPS.

### Fase 3 — CI/CD

* [ ] GitHub Actions.
* [ ] GitHub Container Registry (GHCR).
* [ ] Build automático de imágenes.
* [ ] Despliegue automático en EC2.
* [ ] Validaciones previas al despliegue.

### Fase 4 — Producto

* [ ] Mejoras funcionales.
* [ ] Mejoras UX/UI.
* [ ] Optimización del panel administrativo.
* [ ] Nuevas funcionalidades para pacientes.

### Fase 5 — Inteligencia Artificial

* [ ] Copilot de Clínica Cloud.
* [ ] Integración de IA.
* [ ] Agente de Clínica Cloud.
* [ ] Automatización de procesos administrativos.
* [ ] Asistencia inteligente para pacientes y personal.

---

## Mantenimiento del README

Este archivo debe actualizarse cuando cambien aspectos relevantes del proyecto, incluyendo:

* Arquitectura.
* Forma de ejecución.
* Variables de entorno.
* Endpoints principales.
* Docker.
* Infraestructura AWS.
* CI/CD.
* Funcionalidades relevantes.
* Integraciones externas.
* Integración de IA.

El objetivo es que cualquier desarrollador que llegue al repositorio pueda entender rápidamente:

1. Qué es **Clínica Cloud**.
2. Qué componentes tiene.
3. Cómo está construido.
4. Cómo ejecutarlo localmente.
5. Cuál es el estado actual del proyecto.
6. Cuáles son los próximos pasos.

---
