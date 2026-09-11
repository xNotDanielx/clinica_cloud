# Clínica Cloud — Clínica Renacer

Aplicación web para la **gestión y agendamiento de servicios de Clínica Renacer**.

Repositorio: <https://github.com/xNotDanielx/clinica_cloud>

El proyecto incluye:

- Web pública para pacientes.
- Panel administrativo.
- API REST.
- Base de datos PostgreSQL.
- Migraciones con Alembic.
- Contenedores Docker.
- Healthchecks.
- Validaciones de calidad para frontend y backend.
- Preparación para migración **Lift & Shift a AWS**.
- Preparación para **CI/CD con GitHub Actions + GHCR + AWS EC2**.

> **Objetivo de este README:** ser la fuente de verdad técnica para que cualquier integrante del equipo —o una IA que lo asista— entienda el estado real del proyecto y continúe la migración sin cambiar arquitectura, seguridad o herramientas de forma arbitraria.

---

## 1. Estado actual

Baseline validado localmente antes de comenzar AWS/CI/CD:

| Componente | Estado |
| --- | --- |
| Web pública | ✅ Funcional |
| Panel administrativo | ✅ Funcional |
| API FastAPI | ✅ Funcional |
| PostgreSQL | ✅ Funcional |
| Alembic | ✅ Implementado |
| Docker | ✅ Build validado |
| Docker Compose | ✅ Preparado |
| Healthchecks | ✅ Implementados |
| Frontend quality | ✅ ESLint + tests + typecheck + build |
| Tests frontend | ✅ 9/9 |
| Backend quality | ✅ Ruff + pytest |
| Tests backend | ✅ 20/20 |
| Seguridad backend | ✅ Endurecida |
| AWS Lift & Shift | ⏳ Siguiente fase |
| GitHub Actions CI | ⏳ Pendiente |
| GHCR | ⏳ Pendiente |
| CD hacia EC2 | ⏳ Pendiente |
| Dominio / HTTPS | ⏳ Pendiente |
| IA / Agentes | ⏳ Fase futura |

El build local de las dos imágenes Docker fue validado correctamente:

```text
frontend  Built
backend   Built
```

---

## 2. REGLA PRINCIPAL PARA AWS Y CI/CD

Antes de crear, modificar o desplegar infraestructura:

1. **Leer este README completo.**
2. **Inspeccionar el estado real de la rama objetivo del repositorio.**
3. Comparar el repositorio con este README.
4. Ejecutar las validaciones del **Gate 0**.
5. Si existe una contradicción entre el README y el código actual, **detenerse y reportarla antes de implementar**.
6. No cambiar arquitectura, proveedor, registry, estrategia de despliegue o base de datos por iniciativa propia.

### Una IA NO debe hacer automáticamente lo siguiente

Sin aprobación explícita del equipo, **NO** debe:

- Cambiar EC2 por ECS, EKS, Lambda, Elastic Beanstalk u otro servicio.
- Cambiar GHCR por Docker Hub o ECR.
- Mover PostgreSQL a RDS durante el primer Lift & Shift.
- Introducir Kubernetes.
- Introducir Terraform, Pulumi o CloudFormation en la primera iteración.
- Eliminar Docker Compose.
- Sustituir FastAPI, React, PostgreSQL o Alembic.
- Cambiar nombres de variables de entorno sin necesidad.
- Crear secretos dentro del repositorio.
- Subir `.env`, contraseñas, tokens, claves privadas o credenciales AWS.
- Abrir PostgreSQL (`5432`) a Internet.
- Abrir el backend (`8000`) directamente a Internet en producción.
- Abrir SSH (`22`) a `0.0.0.0/0`.
- Ejecutar `docker compose down -v` sobre producción.
- Ejecutar migraciones destructivas sin backup.
- Hacer deploy directo si CI está fallando.
- Hacer push directo a `main` para implementar cambios de infraestructura.

La estrategia aprobada inicialmente es:

```text
GitHub
   │
   ├── Pull Request
   │      │
   │      ▼
   │   CI / Quality
   │
   ▼
main
   │
   ├── Build Docker
   │
   ▼
GHCR
   │
   ▼
AWS EC2
   │
   └── Docker Compose
          ├── Frontend
          ├── Backend
          └── PostgreSQL
```

Esto es intencionalmente un **Lift & Shift conservador**.

---

## 3. Prompt recomendado para trabajar con IA

Antes de pedirle a una IA que implemente AWS o CI/CD, utilizar un prompt parecido a este:

```text
Rectifica el README y el estado actual del repositorio:

https://github.com/xNotDanielx/clinica_cloud

antes de empezar a integrar el Lift & Shift y CI/CD.

REGLAS:

1. Lee completamente el README.
2. Inspecciona la rama main, Dockerfiles, docker-compose, workflows existentes,
   .env.example, frontend y backend.
3. Compara el estado real del repositorio con el README.
4. Ejecuta o plantea primero el Gate 0 definido en el README.
5. No cambies la arquitectura aprobada.
6. No reemplaces EC2, Docker Compose, GHCR ni PostgreSQL por otras tecnologías.
7. No introduzcas ECS, EKS, Kubernetes, RDS, Terraform, Pulumi o CloudFormation
   salvo que se solicite explícitamente.
8. No expongas secretos ni puertos internos.
9. Realiza los cambios en fases pequeñas y verificables.
10. Antes de modificar archivos, indícame:
    - qué encontraste,
    - qué fase vas a implementar,
    - qué archivos vas a tocar,
    - qué riesgos existen.
11. Después de cada fase, valida el resultado antes de continuar.
12. Si el README contradice el código actual, detente y repórtalo.
```

---

## 4. Arquitectura actual

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

> En modo de despliegue PostgreSQL **no debe publicar `5432` hacia Internet**.

---

## 5. Tecnologías

### Frontend

- React 18
- TypeScript
- Vite 8
- Tailwind CSS
- ESLint
- Vitest
- React Testing Library

### Backend

- Python 3.11
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- Alembic
- Ruff
- Pytest
- Argon2 para contraseñas
- JWT para autenticación administrativa

### Infraestructura

- PostgreSQL 15
- Docker
- Docker Compose
- GitHub
- GitHub Actions
- GitHub Container Registry — GHCR
- AWS EC2
- AWS IAM
- AWS Systems Manager / Session Manager
- EBS
- Security Groups

---

## 6. Funcionalidades

### Sitio público

La aplicación pública permite:

- Visualizar información de la clínica.
- Consultar procedimientos.
- Consultar horarios disponibles.
- Solicitar citas.
- Registrar solicitudes mediante la API.
- Continuar comunicación mediante WhatsApp.
- Consultar información de contacto y ubicación.

### Administración

El panel administrativo permite:

- Iniciar sesión.
- Consultar pacientes.
- Buscar pacientes.
- Crear y editar pacientes.
- Eliminar pacientes.
- Consultar citas.
- Crear y editar citas.
- Aprobar o rechazar solicitudes.
- Eliminar citas.

Acceso local:

```text
http://localhost:5173/#admin
```

---

## 7. API

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

## 8. Endpoints principales

### Públicos

| Método | Endpoint |
| --- | --- |
| `GET` | `/health` |
| `GET` | `/catalogos` |
| `GET` | `/procedimientos/activos` |
| `GET` | `/citas/horarios-disponibles` |
| `POST` | `/citas/publica` |
| `GET` | `/codigos-promocionales/validar` |
| `GET` | `/codigos-promocionales/calcular-descuento` |

### Administración

| Método | Endpoint |
| --- | --- |
| `POST` | `/administradores/login` |
| `GET` | `/administradores/me` |
| `POST` | `/administradores` |
| `GET` | `/pacientes` |
| `POST` | `/pacientes` |
| `GET` | `/pacientes/filtrar` |
| `GET` | `/pacientes/{identificacion}` |
| `PATCH` | `/pacientes/{identificacion}` |
| `DELETE` | `/pacientes/{identificacion}` |
| `GET` | `/citas/todas` |
| `GET` | `/citas/filtrar` |
| `GET` | `/citas/pendientes-aprobacion` |
| `POST` | `/citas` |
| `PATCH` | `/citas/{id}` |
| `PATCH` | `/citas/{id}/aprobar` |
| `PATCH` | `/citas/{id}/rechazar` |
| `DELETE` | `/citas/{id}` |

Los endpoints administrativos requieren **Bearer Token**, excepto:

```text
POST /administradores/login
```

La referencia definitiva de contratos debe ser Swagger/OpenAPI generado por el backend actual.

---

## 9. Variables de entorno

El repositorio incluye `.env.example`.

Crear `.env` local:

### PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux / macOS

```bash
cp .env.example .env
```

Variables actuales:

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

### Reglas

- `ADMIN_AUTH_SECRET` debe tener mínimo **32 caracteres**.
- `INITIAL_ADMIN_PASSWORD` debe tener mínimo **12 caracteres**.
- `.env` nunca debe subirse a Git.
- Un workflow nunca debe imprimir secretos.
- No colocar secretos dentro del `Dockerfile`.
- No colocar secretos dentro de `docker-compose.yml`.
- No convertir secretos en variables `VITE_*`: las variables Vite quedan incorporadas en el frontend compilado y son públicas.

---

## 10. Ejecutar localmente

### Requisitos

- Git
- Docker Desktop
- Docker Compose
- Node.js 22 para trabajo directo sobre frontend
- Python 3.11 para trabajo directo sobre backend

### Clonar

```bash
git clone https://github.com/xNotDanielx/clinica_cloud.git
cd clinica_cloud
```

---

## 11. Calidad del frontend

Desde `frontend/`:

```bash
npm ci
npm run quality
```

`npm run quality` debe ejecutar como mínimo:

```text
ESLint
   ↓
Vitest
   ↓
TypeScript
   ↓
Vite build
```

Baseline validado:

```text
Test Files  3 passed
Tests       9 passed
```

No se debe hacer merge si `npm run quality` falla.

---

## 12. Calidad del backend

Crear entorno virtual si se trabaja fuera de Docker:

```bash
python -m venv .venv
```

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias de desarrollo:

```bash
python -m pip install -r requirements-dev.txt
```

Ejecutar:

```bash
python -m app.scripts.quality
```

Baseline validado:

```text
All checks passed
20 passed
```

No se debe hacer merge si el quality backend falla.

---

## 13. Docker local

### Desarrollo

Desde la raíz:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Estado:

```bash
docker compose ps
```

Logs:

```bash
docker compose logs backend --tail=100
docker compose logs frontend --tail=100
docker compose logs db --tail=100
```

### Build limpio

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
```

El baseline validado debe producir:

```text
frontend  Built
backend   Built
```

### Detener

```bash
docker compose down
```

Nunca ejecutar en un entorno con datos importantes:

```bash
docker compose down -v
```

salvo que se quiera eliminar deliberadamente la persistencia de PostgreSQL.

---

## 14. Alembic y base de datos

Las modificaciones de esquema deben gestionarse mediante **Alembic**.

Consultar versión:

```bash
docker compose exec backend alembic current
```

Aplicar migraciones:

```bash
docker compose exec backend alembic upgrade head
```

### Reglas

- No volver a introducir `Base.metadata.create_all()` como mecanismo de migración de producción.
- No ejecutar `ALTER TABLE` dispersos desde el arranque de FastAPI.
- Toda modificación de esquema debe quedar versionada.
- Antes de una migración potencialmente destructiva debe existir backup.
- Las migraciones deben probarse primero fuera de producción.

---

## 15. Flujo Git

No desarrollar directamente en `main`.

```text
Rama
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
  ├── CI
  ├── revisión
  └── quality
       │
       ▼
      main
```

Ejemplo:

```bash
git checkout -b ci/github-actions-baseline
```

Después:

```bash
git add .
git commit -m "ci: add baseline quality workflow"
git push origin ci/github-actions-baseline
```

Crear Pull Request hacia `main`.

---

## 16. GATE 0 — obligatorio antes de AWS o CI/CD

Una persona o IA debe ejecutar estas comprobaciones antes de crear infraestructura.

### 16.1 Sincronizar repositorio

```bash
git status
git branch --show-current
git fetch origin
git log --oneline --decorate -10
```

Verificar que la rama de trabajo parte del último `origin/main`.

No continuar si existen cambios locales importantes sin commit.

### 16.2 Frontend

```bash
cd frontend
npm ci
npm run quality
cd ..
```

Resultado esperado:

```text
9 tests passed
typecheck passed
vite build passed
```

### 16.3 Backend

```bash
cd backend
python -m app.scripts.quality
cd ..
```

Resultado esperado:

```text
20 passed
```

### 16.4 Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
```

Resultado esperado:

```text
frontend  Built
backend   Built
```

### 16.5 Runtime local

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose ps
```

Verificar healthcheck:

```bash
curl http://localhost:8000/health
```

o PowerShell:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

### 16.6 Alembic

```bash
docker compose exec backend alembic current
```

Solo cuando **todo el Gate 0** sea correcto se puede comenzar AWS/CI/CD.

---

## 17. Objetivo del Lift & Shift

El primer despliegue AWS debe conservar la arquitectura actual lo máximo posible.

### Arquitectura objetivo inicial

```text
                    Internet
                       │
                       ▼
                ┌──────────────┐
                │  80 / 443    │
                │ Reverse Proxy│
                └──────┬───────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        ┌───────────┐      ┌───────────┐
        │ Frontend  │      │ Backend   │
        │ container │      │ FastAPI   │
        └───────────┘      └─────┬─────┘
                                  │
                                  ▼
                           ┌────────────┐
                           │ PostgreSQL │
                           │ container  │
                           └─────┬──────┘
                                 │
                                 ▼
                           EBS persistence
```

Todo corre inicialmente en **una instancia EC2 mediante Docker Compose**.

### Primera fase

- EC2.
- Docker.
- Docker Compose.
- Frontend.
- Backend.
- PostgreSQL containerizado.
- Persistencia en EBS.
- GHCR.
- GitHub Actions.

### No corresponde al primer Lift & Shift

- ECS.
- EKS.
- RDS.
- Kubernetes.
- Serverless.
- Microservicios.
- Auto Scaling.
- Multi-AZ.
- Terraform.

Esas decisiones pertenecen a una fase posterior de modernización.

---

## 18. Recursos AWS mínimos

La implementación inicial debe considerar:

- 1 instancia EC2.
- 1 Security Group.
- EBS persistente.
- IAM Role para EC2.
- AWS Systems Manager.
- Elastic IP si se requiere IP estable antes del dominio.
- Route 53 solo si el dominio será gestionado desde AWS.
- HTTPS en una fase posterior del Lift & Shift.

Seleccionar una imagen Linux soportada y mantener la decisión documentada.

No cambiar de distribución después de crear automatizaciones sin revisar scripts de instalación.

---

## 19. Seguridad de red AWS

### Security Group

Entradas permitidas en producción:

```text
80/tcp   HTTP
443/tcp  HTTPS
```

No exponer públicamente:

```text
5432 PostgreSQL
8000 FastAPI
5173 frontend interno
```

Preferir **AWS Systems Manager Session Manager** para administración de EC2.

La meta es no requerir:

```text
22/tcp SSH
```

abierto a Internet.

Si se utiliza SSH temporalmente para bootstrap:

- limitarlo únicamente a IPs autorizadas;
- nunca usar `0.0.0.0/0`;
- cerrarlo cuando Session Manager quede operativo.

---

## 20. Persistencia PostgreSQL

Durante el Lift & Shift inicial PostgreSQL permanece containerizado.

La persistencia no debe depender del ciclo de vida del contenedor.

### Reglas

- Mantener volumen persistente sobre almacenamiento EBS.
- Nunca usar `docker compose down -v` en producción.
- Crear backup antes de migraciones importantes.
- Comprobar restauración antes de considerar el backup confiable.

Ejemplo de backup lógico:

```bash
docker compose exec -T db pg_dump \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" > backup.sql
```

El mecanismo definitivo de backup debe documentarse durante la fase AWS.

---

## 21. Frontend de producción — advertencia importante

`vite preview` sirve para **previsualizar localmente** un build y **no debe considerarse el servidor de producción definitivo**.

Antes del despliegue público final, el frontend debe utilizar una estrategia de servicio estático adecuada, por ejemplo:

```text
Node 22
   │
   └── npm ci + npm run build
             │
             ▼
           dist/
             │
             ▼
      servidor estático
        Nginx
```

La modificación debe hacerse de forma controlada y validarse nuevamente con:

```bash
npm run quality
docker compose build --no-cache
```

No cambiar esto simultáneamente con otras reformas grandes de arquitectura.

---

## 22. Orden recomendado para implementar AWS + CI/CD

Seguir **exactamente este orden**.

### Fase A — Baseline remoto

- [ ] Gate 0 aprobado.
- [ ] Último código validado integrado en `main`.
- [ ] README actualizado.
- [ ] `.env` fuera de Git.
- [ ] `package-lock.json` sincronizado.
- [ ] `requirements*.txt` sincronizados.
- [ ] Docker build limpio.

### Fase B — CI

Crear:

```text
.github/workflows/ci.yml
```

El CI debe ejecutarse en:

```text
pull_request -> main
push -> main
```

Debe contener jobs independientes para:

#### Frontend

```text
checkout
↓
Node 22
↓
npm ci
↓
npm run quality
```

#### Backend

```text
checkout
↓
Python 3.11
↓
pip install requirements-dev.txt
↓
python -m app.scripts.quality
```

#### Docker

```text
docker build frontend
docker build backend
```

o una validación equivalente de Docker Compose.

No publicar imágenes desde Pull Requests externos.

---

## 23. Branch protection

Cuando CI esté estable, configurar protección de `main`.

Objetivo:

- Require Pull Request.
- Require CI status checks.
- Bloquear merge si frontend falla.
- Bloquear merge si backend falla.
- Bloquear merge si Docker build falla.
- Evitar push directo a `main`.

No activar reglas que el equipo no pueda satisfacer todavía.

---

## 24. GHCR — Container Registry

Registry aprobado:

```text
ghcr.io
```

Imágenes esperadas:

```text
ghcr.io/xnotdanielx/clinica-cloud-frontend
ghcr.io/xnotdanielx/clinica-cloud-backend
```

Convención recomendada:

```text
:sha-<commit>
:main
:latest
```

Para producción debe poder identificarse exactamente qué commit está desplegado.

Ejemplo:

```text
ghcr.io/xnotdanielx/clinica-cloud-backend:sha-a1b2c3d
```

### Reglas

- No depender únicamente de `latest`.
- Conservar tag por SHA.
- `latest` es un alias de conveniencia, no evidencia de versión.
- Usar `GITHUB_TOKEN` para publicar desde GitHub Actions cuando sea posible.
- `packages: write` solo para el job que publica.
- Mantener permisos del workflow en mínimo privilegio.
- Preferir acciones de GitHub/Docker fijadas a una versión o SHA revisada.

---

## 25. Workflow de publicación

Crear después de que `ci.yml` sea estable:

```text
.github/workflows/publish.yml
```

Trigger recomendado:

```text
push a main
```

Flujo:

```text
main
  │
  ▼
CI aprobado
  │
  ▼
Login GHCR
  │
  ▼
Build frontend
  │
  ├── tag SHA
  └── tag main/latest
  │
  ▼
Build backend
  │
  ├── tag SHA
  └── tag main/latest
  │
  ▼
Push GHCR
```

No desplegar a EC2 hasta confirmar que ambas imágenes existen.

---

## 26. Docker Compose de producción

El despliegue en EC2 debe utilizar imágenes preconstruidas.

No volver a compilar la aplicación completa dentro de EC2 en cada deploy.

El compose de producción debe evolucionar de:

```yaml
build:
  context: ./backend
```

a:

```yaml
image: ghcr.io/xnotdanielx/clinica-cloud-backend:<tag>
```

y equivalente para frontend.

Se recomienda crear:

```text
docker-compose.prod.yml
```

sin romper los archivos usados en desarrollo.

Objetivo:

```text
GitHub Actions construye
        │
        ▼
      GHCR
        │
        ▼
EC2 solamente hace pull
        │
        ▼
docker compose up -d
```

---

## 27. CD hacia EC2

Implementar **después** de tener:

- CI estable.
- imágenes GHCR.
- EC2 configurado manualmente.
- despliegue manual exitoso.
- healthchecks correctos.

No automatizar un despliegue manual que todavía no funciona.

### Método preferido

```text
GitHub Actions
     │
     ▼
AWS OIDC
     │
     ▼
IAM Role
     │
     ▼
AWS Systems Manager
     │
     ▼
EC2
```

Esto evita guardar credenciales AWS de larga duración en GitHub y evita depender de SSH público.

Deploy conceptual en EC2:

```bash
cd /opt/clinica-cloud
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose ps
```

Después:

```bash
curl -f http://127.0.0.1:8000/health
```

Si el healthcheck falla, el workflow debe marcar el deploy como fallido.

---

## 28. Credenciales AWS desde GitHub Actions

Preferir **OpenID Connect (OIDC)**.

No crear por defecto:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

como secrets permanentes si OIDC está disponible.

Crear un IAM Role dedicado a GitHub Actions con:

- trust limitado al repositorio correcto;
- rama/environment correctos;
- permisos mínimos;
- solo las acciones AWS necesarias para el deploy.

No usar `AdministratorAccess`.

---

## 29. Secrets de producción

Los secretos de runtime no deben quedar dentro de una imagen.

Ejemplos:

```text
POSTGRES_PASSWORD
ADMIN_AUTH_SECRET
INITIAL_ADMIN_PASSWORD
```

Opciones aceptables durante el Lift & Shift:

1. Archivo `.env` creado directamente en EC2 con permisos restrictivos.
2. AWS Systems Manager Parameter Store / SecureString.
3. AWS Secrets Manager.

El workflow no debe imprimirlos.

Si se usa archivo:

```bash
chmod 600 /opt/clinica-cloud/.env
```

---

## 30. Estrategia de GHCR en EC2

Antes de implementar CD decidir una sola opción.

### Imágenes públicas

EC2 puede hacer pull directamente.

### Imágenes privadas

Utilizar credencial de **solo lectura** almacenada de forma segura.

No utilizar un token personal con permisos innecesarios.

No colocar el token dentro de:

- Git.
- Dockerfile.
- docker-compose.
- README.
- logs de GitHub Actions.

---

## 31. Migraciones durante deploy

Antes de levantar una versión que requiera una migración:

1. Backup.
2. Pull de imágenes.
3. Ejecutar migración.
4. Levantar servicios.
5. Ejecutar healthcheck.
6. Validar funcionalidad.

Ejemplo:

```bash
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
```

> Si el entrypoint actual ya aplica Alembic automáticamente, no agregar una segunda ejecución sin revisar primero el código. Debe existir **un solo responsable claro de las migraciones**.

---

## 32. Rollback

Nunca implementar CD sin estrategia de rollback.

Como cada build tiene tag por commit SHA:

```text
sha-a1b2c3d
sha-e4f5g6h
```

un rollback debe permitir volver a la imagen anterior.

Proceso conceptual:

```text
deploy nuevo
   │
   ▼
healthcheck falla
   │
   ▼
usar tag anterior
   │
   ▼
docker compose pull
   │
   ▼
docker compose up -d
```

### Advertencia

Rollback de aplicación y rollback de base de datos son cosas distintas.

Una migración destructiva puede impedir volver simplemente a la imagen anterior.

---

## 33. Dominio y HTTPS

Realizar después de validar EC2 por IP.

Orden:

```text
EC2 estable
   │
   ▼
IP estable
   │
   ▼
DNS
   │
   ▼
HTTPS
```

Para el Lift & Shift inicial se puede utilizar Nginx + TLS/Let's Encrypt o una alternativa aprobada por el equipo.

No implementar simultáneamente:

- dominio,
- HTTPS,
- cambio de registry,
- cambio de base de datos,
- cambio de arquitectura.

Una fase por vez.

---

## 34. Observabilidad mínima

Antes de declarar producción lista:

- Healthcheck backend.
- Healthcheck frontend.
- Estado PostgreSQL.
- Logs accesibles.
- Espacio en disco.
- Uso de memoria.
- Reinicio automático de contenedores.

Comandos básicos:

```bash
docker compose ps
docker compose logs --tail=100
docker stats
df -h
```

Posteriormente se puede integrar CloudWatch.

---

## 35. Criterios de aceptación del CI

CI se considera terminado cuando:

- [ ] Se ejecuta en cada Pull Request hacia `main`.
- [ ] Frontend quality pasa.
- [ ] Backend quality pasa.
- [ ] Docker build pasa.
- [ ] Un fallo bloquea merge.
- [ ] No existen secretos hardcodeados.
- [ ] No se publican imágenes innecesariamente desde PR.
- [ ] El workflow usa permisos mínimos.

---

## 36. Criterios de aceptación del CD

CD se considera terminado cuando:

- [ ] Merge/push aprobado a `main`.
- [ ] Se generan imágenes identificables por SHA.
- [ ] Las imágenes se publican en GHCR.
- [ ] EC2 descarga las imágenes.
- [ ] Alembic queda en versión correcta.
- [ ] Docker Compose recrea solo lo necesario.
- [ ] Healthcheck final pasa.
- [ ] El workflow falla si la aplicación no queda healthy.
- [ ] Existe procedimiento de rollback documentado.
- [ ] No se exponen secretos.
- [ ] No se requiere acceso SSH público permanente.

---

## 37. Orden de implementación recomendado para el equipo

```text
1. Gate 0
2. Crear rama ci/github-actions-baseline
3. Implementar ci.yml
4. Abrir PR
5. Validar branch protection
6. Crear GHCR publish workflow
7. Provisionar EC2 manualmente
8. Configurar IAM + Session Manager
9. Hacer primer deploy manual en EC2
10. Validar DB + Alembic + healthchecks
11. Crear docker-compose.prod.yml
12. Integrar GitHub OIDC
13. Automatizar deploy con SSM
14. Probar rollback
15. Configurar dominio
16. Configurar HTTPS
17. Documentar resultado final
```

No saltar directamente al paso 13.

---

## 38. Roadmap

### Fase 1 — Baseline

- [x] Web pública.
- [x] Panel administrativo.
- [x] API REST.
- [x] PostgreSQL.
- [x] Dockerización.
- [x] Healthchecks.
- [x] Alembic.
- [x] Calidad frontend.
- [x] Calidad backend.
- [x] Tests frontend.
- [x] Tests backend.

### Fase 2 — Lift & Shift AWS

- [ ] Gate 0 remoto.
- [ ] EC2.
- [ ] IAM Role EC2.
- [ ] Session Manager.
- [ ] Security Group.
- [ ] Docker instalado.
- [ ] Docker Compose instalado.
- [ ] Persistencia EBS.
- [ ] Primer deploy manual.
- [ ] Backup PostgreSQL.
- [ ] Validación Alembic.
- [ ] Healthchecks AWS.
- [ ] IP/DNS.
- [ ] HTTPS.

### Fase 3 — CI/CD

- [ ] `ci.yml`.
- [ ] Branch protection.
- [ ] GHCR.
- [ ] Build automático.
- [ ] Tags por SHA.
- [ ] `docker-compose.prod.yml`.
- [ ] GitHub OIDC.
- [ ] Deploy vía Systems Manager.
- [ ] Healthcheck post-deploy.
- [ ] Rollback.

### Fase 4 — Modernización opcional

Solo después de Lift & Shift estable:

- [ ] Evaluar RDS.
- [ ] Evaluar ALB.
- [ ] Evaluar Secrets Manager.
- [ ] Evaluar CloudWatch.
- [ ] Evaluar IaC.
- [ ] Evaluar escalabilidad.

### Fase 5 — Producto

- [ ] Mejoras funcionales.
- [ ] Mejoras UX/UI.
- [ ] Optimización panel administrativo.
- [ ] Nuevas funcionalidades para pacientes.

### Fase 6 — Inteligencia Artificial

- [ ] Copilot Clínica Cloud.
- [ ] Integración de IA.
- [ ] Agente Clínica Cloud.
- [ ] Automatización administrativa.
- [ ] Asistencia inteligente.

---

## 39. Checklist antes de cualquier Pull Request de infraestructura

```text
[ ] Leí el README actual.
[ ] Revisé el código actual.
[ ] Mi rama parte del main actualizado.
[ ] No incluí secretos.
[ ] No cambié arquitectura sin aprobación.
[ ] Frontend quality pasa.
[ ] Backend quality pasa.
[ ] Docker build pasa.
[ ] Documenté nuevas variables.
[ ] Documenté nuevos recursos AWS.
[ ] Documenté nuevos secrets.
[ ] Documenté cómo probar.
[ ] Documenté cómo revertir.
```

---

## 40. Mantenimiento del README

Actualizar este archivo cuando cambien:

- arquitectura;
- ejecución local;
- variables de entorno;
- endpoints;
- autenticación;
- migraciones;
- Docker;
- AWS;
- GHCR;
- CI/CD;
- dominios;
- HTTPS;
- backups;
- observabilidad;
- funcionalidades;
- IA.

El README debe permitir responder rápidamente:

1. Qué es Clínica Cloud.
2. Cuáles son sus componentes.
3. Cómo ejecutar la aplicación.
4. Cómo validar su calidad.
5. Cómo migrar cambios de base de datos.
6. Qué está desplegado.
7. Qué parte del roadmap está activa.
8. Qué no se debe modificar sin aprobación.
9. Cómo se publica una versión.
10. Cómo se revierte un despliegue.

---

## 41. Referencias oficiales recomendadas

- GitHub Actions: <https://docs.github.com/actions>
- Publicar imágenes Docker en GHCR: <https://docs.github.com/actions/tutorials/publish-packages/publish-docker-images>
- AWS EC2: <https://docs.aws.amazon.com/ec2/>
- AWS Systems Manager Session Manager: <https:/>/docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html>
- Vite deployment: <https://vite.dev/guide/static-deploy>
- Alembic: <https://alembic.sqlalchemy.org/>
- Docker Compose: <https://docs.docker.com/compose/>

---

## 42. Principio final

**Lift & Shift primero. Modernización después.**

El objetivo inicial no es construir la arquitectura AWS “perfecta”.

El objetivo es:

```text
mismo sistema
+
misma lógica
+
mismos contenedores
+
infraestructura AWS controlada
+
CI/CD reproducible
+
seguridad mínima correcta
+
rollback
```

Cuando ese baseline sea estable, el equipo podrá evaluar RDS, ALB, IaC, escalabilidad y demás mejoras con evidencia real y sin introducir complejidad innecesaria.
