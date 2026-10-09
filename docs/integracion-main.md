# Integracion con main

Base: main cbc303e y experiencia Renacer d2bb418.

## Decisiones

- Se conserva la experiencia publica y administrativa Renacer: orientador, calendario,
  reemplazo de procedimientos, avisos, comprobante, seguimiento privado y asistentes.
- Se conservan JWT/Argon2 (incluida compatibilidad PBKDF2), configuracion de secretos,
  Alembic, servicios de precios/agenda, validaciones y pruebas de main.
- La interfaz administrativa usa el hook de autenticacion de main con mensajes
  inline y restauracion de sesion. Sus otros componentes/hooks siguen disponibles;
  la modularizacion completa de nuestras pantallas queda como trabajo posterior.
- El importe de consulta existente se mantiene al editar. El precio publico se
  establece en el servidor, no con el valor enviado por el navegador.
- La respuesta publica solo contiene el comprobante; no expone la ficha del paciente.
  El codigo privado se entrega una vez; solo se almacena su hash.
- Calendario y backend aplican la politica de 2 a 90 dias. Los tests anteriores
  que reservaban el mismo dia se adaptaron a esta politica.
- Las rutas API usan /api tanto en desarrollo como en produccion. Vite tiene proxy
  para desarrollo/preview; el contenedor de produccion conserva Nginx.
- Las migraciones conservan la exclusion PostgreSQL contra solapamientos.
  El bloqueo transaccional de agenda tambien se mantiene.

## Actualizacion de una instalacion existente

1. Respaldar la base de datos antes de actualizar; no borrar volumenes.
2. Configurar DATABASE_URL y ADMIN_AUTH_SECRET (minimo 32 caracteres).
   Las URL antiguas postgresql+psycopg2 se normalizan al driver Psycopg 3.
3. INITIAL_ADMIN_USER e INITIAL_ADMIN_PASSWORD reemplazan DEFAULT_ADMIN_*.
   Son opcionales, pero deben proporcionarse juntos; la clave requiere 12 caracteres.
   No se restablecen contrasenas de administradores existentes.
4. Los contenedores ejecutan alembic upgrade head antes de arrancar la API.
   La revision 20261009_02 agrega seguimiento_hash si falta y su indice unico;
   no altera citas ni genera codigos retroactivos. Si la baseline detecta citas
   solapadas, aborta: no elimina registros para forzar la migracion.
5. Los tokens de sesiones anteriores pueden requerir iniciar sesion de nuevo.

Desarrollo con recarga:

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Produccion con Nginx y sin publicar la base de datos:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

## Verificacion

```sh
# backend, con requirements-dev.txt instalado
python -m app.scripts.quality
# frontend
npm run quality
npm run test:legacy
```

Los tests test_booking.py requieren PostgreSQL y crean esquemas temporales
aislados. Con SQLite se muestran explicitamente como omitidos; no validan
concurrencia ni migraciones PostgreSQL. Para ejecutarlos, definir DATABASE_URL
de una base de pruebas PostgreSQL y ADMIN_AUTH_SECRET antes de ejecutar pytest.

En esta integracion se verifican compilacion, lint, tests SQLite/API, autenticacion,
seguimiento y los tests frontend de ambas ramas. Quedan pendientes la ejecucion
de migraciones sobre PostgreSQL y las ocho pruebas PostgreSQL: Docker Desktop
falla al iniciar su servicio interno dockerInference. No se han modificado
volumenes ni datos de la instalacion original.
