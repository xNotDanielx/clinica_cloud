# Asistente de IA: alcance y caminos felices

## Objetivo

El asistente no debe duplicar botones de la interfaz. Su valor está en reducir
varios pasos a una conversación, consultar información actual y preparar una
acción que la persona confirma en la interfaz normal.

## Camino feliz público

1. La persona expresa una necesidad en lenguaje natural, por ejemplo:
   "Quiero mejorar el contorno del abdomen y tengo disponibilidad el 15 de octubre".
2. El asistente explica qué procedimientos del catálogo podrían estar
   relacionados, sin diagnosticar ni recomendar clínicamente uno como definitivo.
3. Consulta disponibilidad real para la fecha solicitada.
4. Resume las opciones y abre el formulario con fecha y hasta dos procedimientos
   precargados.
5. La persona revisa, completa sus datos y confirma el envío por el flujo normal.

Beneficio: combina orientación, búsqueda en el catálogo y disponibilidad en una
sola interacción. El formulario sigue siendo el punto de confirmación.

## Camino feliz administrativo

1. El administrador inicia sesión en el panel.
2. Desde un asistente exclusivo del panel solicita un resumen operativo, por
   ejemplo: "Muéstrame las citas pendientes de esta semana".
3. El backend valida el token antes de ejecutar cualquier herramienta privada.
4. El asistente consulta datos autorizados y presenta un resumen con enlaces o
   acciones para abrir el registro correspondiente.
5. Aprobar, rechazar, modificar o eliminar exige una confirmación explícita en la
   interfaz administrativa y usa los endpoints protegidos existentes.

Beneficio: permite consultar y priorizar trabajo mediante lenguaje natural, sin
reemplazar los controles administrativos ni ejecutar cambios silenciosos.

## Separación de permisos

### Asistente público

Puede acceder únicamente a:

- catálogo de procedimientos activos;
- información pública de la clínica;
- horarios disponibles sin datos de pacientes;
- preparación del formulario de solicitud.

No puede acceder a pacientes, citas existentes, identificaciones, teléfonos,
correos, notas clínicas, administradores ni estadísticas internas.

### Asistente administrativo

- Debe vivir en una ruta distinta, por ejemplo `/asistente/admin/chat`.
- Debe depender de `get_current_administrador` antes de consultar datos privados.
- Debe reutilizar las reglas de autorización de los servicios existentes.
- Debe registrar herramienta, administrador, fecha y resultado de cada operación.
- Debe comenzar en modo de solo lectura.
- Las acciones de escritura necesitan confirmación explícita fuera del modelo.

El mensaje nunca concede permisos. Escribir "soy administrador" en el chat público
no cambia la identidad ni habilita herramientas privadas.

## IA real frente a automatización

El proveedor local actual es una automatización conversacional basada en reglas:
detecta intención, fecha y procedimiento, y ejecuta consultas controladas. Es útil,
pero no es un modelo generativo.

Al configurar Amazon Bedrock, el componente de comprensión y redacción sí usa un
modelo de IA. Aun así, las consultas y acciones deben seguir pasando por
herramientas deterministas del backend con permisos explícitos. Un producto serio
combina ambos componentes:

- modelo de IA para comprender lenguaje y redactar;
- backend para identidad, permisos, datos, validaciones y auditoría.

## Orden de implementación

1. Completar y probar el asistente público de solo lectura y precarga.
2. Ampliar las herramientas administrativas de solo lectura ya protegidas.
3. Añadir trazabilidad de consultas administrativas.
4. Conectar Bedrock con respuestas estructuradas y lista cerrada de herramientas.
5. Evaluar precisión, fugas de datos, instrucciones maliciosas y costos antes del
   despliegue en AWS.
