# Clinica Renacer

Aplicacion web academica con frontend en React + Vite, API en FastAPI y base de
datos PostgreSQL. El entorno local se ejecuta con Docker Compose.

## Ejecutar localmente

Requisitos: Git y Docker Desktop con el motor Linux activo.

```bash
git clone https://github.com/xNotDanielx/clinica_cloud.git
cd clinica_cloud
docker compose up --build -d
docker compose ps
```

- Web: http://localhost:5173
- API: http://localhost:8000
- Documentacion API: http://localhost:8000/docs
- Panel administrativo: http://localhost:5173/#admin

Para detener los servicios sin borrar la base de datos:

```bash
docker compose down
```

## Asistente virtual

El endpoint `POST /asistente/chat` tiene dos proveedores intercambiables:

- `local`: modo predeterminado, gratuito y sin credenciales. Responde preguntas
  basicas sobre procedimientos, citas, valores y ubicacion.
- `bedrock`: utiliza Amazon Bedrock mediante la API Converse y el SDK de AWS.

La interfaz web incluye un chat flotante. El asistente es informativo: no emite
diagnosticos, no confirma citas y no reemplaza una valoracion medica.

Para preparar la configuracion local:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Para probar Bedrock, cambia `AI_PROVIDER=bedrock`. En AWS se recomienda asignar
un rol IAM a la instancia con permiso minimo `bedrock:InvokeModel`. No almacenes
claves de AWS en el repositorio ni dentro de la imagen Docker.

## Base propuesta para AWS

Para la demostracion academica y un presupuesto pequeno:

1. Construir las imagenes en CI o en el equipo local y publicarlas en un registro.
2. Crear una instancia EC2 Linux marcada como elegible para Free Tier.
3. Instalar Docker y ejecutar los tres servicios con Docker Compose.
4. Mantener PostgreSQL en un volumen Docker de la instancia durante la etapa de clase.
5. Usar un dominio o IP publica con HTTPS y un proxy inverso antes de exponer la app.
6. Activar Bedrock solo para pruebas controladas y configurar AWS Budgets.

Esta topologia prioriza simplicidad y costo. Si el proyecto crece, PostgreSQL debe
migrarse a RDS y el frontend puede publicarse como sitio estatico en S3/CloudFront.

El repositorio incluye `docker-compose.prod.yml`, que sirve el frontend compilado
con Nginx, mantiene PostgreSQL fuera de los puertos publicos y ejecuta Uvicorn sin
recarga automatica. Para preparar ese entorno:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

En una instancia EC2, el acceso a Bedrock debe hacerse mediante un rol IAM. Si el
backend se ejecuta dentro de Docker sobre EC2, configura el limite de saltos de
IMDSv2 de forma que el contenedor pueda obtener las credenciales temporales del rol.

## Variables principales

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexion del backend a PostgreSQL |
| `CORS_ORIGINS` | Origenes web permitidos por la API |
| `VITE_BACKEND_URL` | URL publica de la API usada por el frontend |
| `AI_PROVIDER` | `local` o `bedrock` |
| `AI_FALLBACK_TO_LOCAL` | Mantiene respuestas basicas si Bedrock falla |
| `AWS_REGION` | Region del runtime de Bedrock |
| `BEDROCK_MODEL_ID` | Modelo habilitado en la cuenta AWS |

Antes de desplegar publicamente deben cambiarse las credenciales de ejemplo,
restringir los puertos de PostgreSQL, agregar HTTPS, limites de solicitudes y
autenticacion administrativa segura.

El archivo de produccion exige contrasenas para PostgreSQL y el administrador.
No uses `admin/admin` fuera del entorno local.
