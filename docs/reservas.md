# Solicitudes de valoracion

## Flujo

1. El orientador filtra el catalogo activo por zona y tema. No diagnostica ni recomienda una intervencion.
2. El visitante selecciona uno o dos procedimientos y consulta el calendario.
3. El backend publica exclusivamente dias y horas disponibles, sin datos de pacientes.
4. Al enviar el formulario se crea una solicitud pendiente de aprobacion. Se muestra un comprobante con numero, fecha y hora; no se envian datos automaticamente a WhatsApp.
5. La solicitud pendiente aparta el horario. Aprobarla mantiene el espacio ocupado. Rechazarla o eliminarla lo libera.
6. El comprobante de las nuevas solicitudes incluye un codigo privado aleatorio. En "Mi solicitud" se consulta el estado sin introducir datos personales.

## Reglas actuales

- Una agenda compartida para toda la clinica.
- Valoraciones de una hora, de 09:00 a 19:00, todos los dias, conservando los horarios del proyecto.
- Zona horaria: America/Santiago, correspondiente a la sede mostrada en el sitio.
- Anticipacion: de 2 a 90 dias, validada por el servidor.
- No hay aun festivos, agendas por profesional ni notificaciones automaticas.
- El administrador debe revisar las solicitudes: no caducan automaticamente.

## Integridad y privacidad

Los escritores de la agenda adquieren un bloqueo transaccional de PostgreSQL antes de comprobar solapamientos. Dos solicitudes simultaneas no pueden ocupar el mismo horario. El indice unico parcial ignora registros cancelados o eliminados; el ajuste de compatibilidad reemplaza la restriccion anterior sin borrar citas.

El comprobante publico no contiene documento, nombre, contacto, notas ni montos. Los endpoints administrativos siguen requiriendo autenticacion.

El seguimiento requiere un codigo de 256 bits y en la base se conserva solo su hash SHA-256, no el codigo original. Se envia en el cuerpo de un POST, nunca en una URL, y la respuesta usa Cache-Control: no-store. Devuelve solo estado, fecha, hora y zona horaria. El numero de cita no concede acceso. Los registros anteriores a esta funcionalidad no reciben codigos retroactivamente. La recuperacion de un codigo perdido requiere contactar con la clinica; no hay recuperacion publica por documento.

## Verificacion

En Docker:

```sh
docker compose exec -T backend python -m unittest discover -s tests -v
docker compose exec -T frontend node --test tests/admin.test.cjs
docker compose exec -T frontend npx tsc --noEmit
docker compose exec -T frontend npm run build
```

Las pruebas de reservas crean y eliminan esquemas PostgreSQL exclusivos con datos ficticios. No escriben en las tablas public de la aplicacion. Cubren reserva pendiente, aprobacion, rechazo, eliminacion, limites, solapamiento parcial y concurrencia.
