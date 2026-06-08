# Registro de Cambios y Documentación del Proyecto TRABGRAD

Este archivo documenta los cambios realizados en el proyecto y sirve como registro histórico. **Jamás se debe borrar contenido de este archivo**; los errores o características obsoletas se deben ~~tachar~~ y documentar con la corrección abajo.

## [2026-05-12] - Implementación Inicial del Panel de Administración

### Añadido
- **Diseño del Login**: Se implementó el diseño visual solicitado para la pantalla de inicio de sesión (`/login`), utilizando Tailwind CSS con los colores institucionales (Rojo UNICAES `#c92a2a`) y una tarjeta de demostración con credenciales de prueba.
- **Estructura del Panel de Administración (`/dashboard/admin`)**:
  - `layout.tsx`: Creado un Layout específico para el administrador que incluye el Sidebar lateral izquierdo y la barra superior superior, basado en el diseño proporcionado.
  - `page.tsx` (Dashboard Resumen): Implementación de tarjetas de estadísticas (Total Usuarios, Egresados Activos, Asesores Disponibles, TGs Registrados) y gráficas simuladas por ahora.
  - `usuarios/page.tsx`: Creada la vista de gestión de usuarios (Tabla CRUD) con columnas para nombre, correo, rol, facultad/carrera, estado, último acceso y botones de acción.
  - `usuarios/nuevo/page.tsx`: Formulario de creación de usuario (Create User) con secciones de Información Personal y Rol/Adscripción.
  - `carga-masiva/page.tsx`: Vista dedicada a la carga de datos vía archivos `.csv` para entidades como `carreras.csv`, `Facultades.csv`, `usuarios.csv` y `temas_historicos.csv`.

### Notas Técnicas
- **Base de Datos (Neon)**: Se detectó que en el archivo `sql1.5.sql` original, `facultad` y `carrera` son campos `VARCHAR`. Sin embargo, el requerimiento de carga masiva incluye archivos CSV con estructura relacional (`Facultades.csv` con `id, nombre...`). Para soportar la carga masiva y un CRUD real de facultades y carreras, el sistema requiere (o requerirá) crear dichas tablas en la base de datos para mantener integridad referencial, o procesar los CSV extrayendo solo los nombres para inyectarlos en los campos `VARCHAR` actuales.
- **Rutas API**: Se irán construyendo los *endpoints* en `/api/admin/...` para conectar el frontend con PostgreSQL (Neon) permitiendo leer, insertar y actualizar los usuarios.

---

## [2026-05-12] - Integración de Gestión de Usuarios con Base de Datos Real

### Añadido
- **API Route `GET /api/admin/usuarios`**: Se creó el endpoint necesario para obtener el listado real de usuarios directo desde la tabla `sistema_tg.usuarios` en Neon Database utilizando una consulta SQL cruda. Este endpoint cuenta con seguridad integrada para validar la sesión actual y confirmar que el usuario tiene el rol de `administrador`.
- **Conexión de Interfaz**: Se actualizó el componente cliente `/dashboard/admin/usuarios/page.tsx` para reemplazar los datos simulados por un `fetch()` asíncrono al nuevo endpoint. La tabla ahora refleja los datos en vivo.

---

## [2026-05-12] - Mejoras de Accesibilidad y Contraste Visual

### Correcciones
- **Contraste en Formularios y Tablas**: Se solucionaron problemas de legibilidad donde los colores de texto y *placeholders* se mezclaban con el fondo blanco/grisáceo. 
  - Se oscurecieron los textos en las tablas a tonos `text-gray-700` y `text-gray-600` o superiores, y se aplicaron negritas (`font-bold`, `font-medium`) en áreas críticas como Nombres Completos y Correos.
  - Los campos de entrada (inputs) de la pantalla "Nuevo Usuario" pasaron de usar `bg-gray-50` a fondos blancos sólidos `bg-white` con bordes definidos `border-gray-300`, y textos/marcadores mucho más contrastantes (`text-gray-900`, `placeholder-gray-500`).

---

## [2026-05-12] - CRUD de Facultades y Carreras

### Añadido
- **Nuevas Rutas API (`/api/admin/facultades` y `/api/admin/carreras`)**: Se construyeron los endpoints GET y POST para leer y crear Facultades y Carreras en la base de datos Neon. Estos endpoints cuentan con la protección de autenticación (rol de administrador).
- **Vista de Gestión (`/dashboard/admin/facultades-carreras`)**: Se creó una nueva página interactiva para visualizar las tablas de facultades y carreras lado a lado.
  - La interfaz permite **crear** rápidamente una facultad con su nombre y código.
  - Permite **crear** una carrera, vinculándola directamente a una facultad existente (cumpliendo la regla: una carrera pertenece a una facultad).
  - Incluye manejo de errores amigable en caso de que las tablas en Neon aún no hayan sido creadas (para alertar al usuario).
- **Navegación Sidebar**: Se agregó el enlace de "Facultades y Carreras" con el icono de un edificio (`Building` de `lucide-react`) en el menú lateral de administrador.

---

## [2026-05-12] - Creación Dinámica de Usuarios y Autocalculo de Facultad

### Modificado
- **Formulario de Nuevo Usuario (`/dashboard/admin/usuarios/nuevo`)**:
  - Ahora obtiene dinámicamente la lista real de **Carreras** directamente desde la base de datos (vía `/api/admin/carreras`).
  - Se eliminó el menú de selección de "Facultad", ya que por reglas de negocio, la facultad se deriva de la carrera escogida.
  - Se incorporó el nuevo campo **"Carnet"** en el diseño visual del formulario, el cual es opcional pero se envía si se llena.
- **Ruta API (`POST /api/admin/usuarios`)**:
  - Añadido soporte para registrar nuevos usuarios con contraseña hasheada (usando `bcryptjs`).
  - Incluye la lógica inteligente en el backend para que, si el administrador envía un `carrera_id`, el sistema busque automáticamente qué `facultad_id` le corresponde a dicha carrera y guarde ambos identificadores relacionales correctamente en la tabla `usuarios`.
  - Soporta la nueva columna `carnet` en el Query de inserción.

---

## [2026-05-12] - Funcionalidad Completa del CRUD de Usuarios

### Modificado
- **Tabla de Gestión de Usuarios (`/dashboard/admin/usuarios`)**:
  - **Relaciones Visualizadas**: La consulta a base de datos (`GET /api/admin/usuarios`) ahora ejecuta `LEFT JOIN` con las tablas `facultades` y `carreras`. Ya no se muestran datos falsos, sino los nombres reales vinculados a la base de datos de Neon.
  - **Estado "Activo" Interactivo**: El botón de switch visual en la tabla (color verde/gris) ahora es funcional. Al hacer clic, hace un llamado `PATCH` silencioso para activar/desactivar el usuario en tiempo real en la base de datos.
  - **Último Acceso Real**: Se configuró para que el valor de la base de datos `ultimo_acceso` se formatee a una fecha legible en español. Si el usuario jamás se ha logueado y el valor es nulo, la tabla indicará *"No ha accedido"* de forma elegante.
- **Edición de Usuario (`/dashboard/admin/usuarios/[id]/editar`)**:
  - Creada la nueva vista para editar la información de cualquier usuario registrado.
  - Recupera la información específica (`GET /api/admin/usuarios/[id]`) y permite modificar Nombre, Correo, Carnet, Rol y cambiarlo de Carrera, actualizando automáticamente su adscripción de Facultad tras guardar.
  - Al igual que la creación, envía una solicitud `PUT` y captura errores de registros duplicados (correo/carnet).

---

## [2026-05-12] - Rediseño Total de Carga Masiva (CSV Preview)

### Añadido y Modificado
- **Vista Interactiva de Carga (`/dashboard/admin/carga-masiva`)**:
  - Se rediseñó el flujo de carga masiva en un proceso guiado de 3 pasos (1. Seleccionar Formato -> 2. Subir Archivo -> 3. Previsualización).
  - **Columnas Actualizadas**: Las estructuras requeridas para los CSV ahora reflejan los esquemas reales y la nueva normalización relacional:
    - *Facultades*: `nombre, codigo, activa`
    - *Carreras*: `nombre, codigo, facultad_id, activa`
    - *Usuarios*: `nombre_completo, correo, password_hash, rol, activo, estado, rendimiento_pct, proyectos_activos, carnet, carrera_id, facultad_id, carreras_asignadas_json`
    - *Temas Históricos*: `titulo, asesor_id, coordinador_id, tipo, estado, carrera_id, facultad_id, fecha_envio, fecha_aprobacion, fecha_inicio, fecha_fin`
  - **Lector de CSV en Navegador (`FileReader`)**: Se implementó una función local en JavaScript que lee el contenido del archivo `.csv` subido por el administrador de forma instantánea.
  - **Tabla de Previsualización (Preview)**: Antes de tocar la base de datos, el sistema renderiza una tabla con las cabeceras encontradas y los primeros 10 registros del archivo. Esto permite al administrador comprobar que el orden de las columnas es el correcto antes de darle a "Confirmar y Subir a Base de Datos".
  - **Validación Estricta de Duplicados en Memoria**: Para evitar fallos y envíos innecesarios de red, el parseador local en el navegador verifica que no existan duplicados dentro del mismo archivo (validando el `codigo` único para Facultades y Carreras, y el `correo` para Usuarios) abortando la carga si encuentra uno e indicando al usuario el identificador duplicado.

*(Los siguientes cambios se añadirán debajo de esta línea)*

---

## [2026-05-24] - Corrección de UI en Carga Masiva

### Modificado
- **Vista Interactiva de Carga (`/dashboard/admin/carga-masiva`)**:
  - Se corrigió un problema de *overflow* (desbordamiento visual) en el recuadro informativo de las columnas requeridas (el cuadro azul claro). 
  - Anteriormente, las columnas largas (como en el archivo `usuarios.csv`) generaban una sola línea de texto continuo sin espacios que sobrepasaba la tarjeta. 
  - Se implementó un diseño basado en *Tags / Píldoras* (`flex-wrap`). Ahora cada nombre de columna se renderiza individualmente en un pequeño recuadro blanco, envolviéndose automáticamente a la siguiente línea si no hay espacio, brindando una estética mucho más limpia y profesional.
  - **Panel de Errores de Validación (UX/UI)**: Se eliminó la alerta intrusiva que bloqueaba la carga de archivos cuando había duplicados. Ahora, el sistema procesa el CSV, carga la tabla de previsualización y, si encuentra errores (como duplicados en claves únicas o campos obligatorios vacíos), muestra un **Panel Rojo Detallado** encima de la tabla indicando el número total de errores, la fila exacta y la descripción del problema. El botón de subida se deshabilitará hasta que se suba un archivo corregido.

*(Los siguientes cambios se añadirán debajo de esta línea)*

---

## [2026-05-24] - Módulo de Trabajos de Graduación (TG)

### Añadido
- **Nueva Vista de Administración (`/dashboard/admin/trabajos-graduacion`)**:
  - Se incorporó un nuevo apartado en el Sidebar (con icono de `BookOpen`) exclusivo para visualizar todos los Proyectos y Temas Históricos registrados.
  - **Tabla de Gestión**: Renderiza el título, tipo, estado con *badges* colorizados, fecha de envío y los nombres (no IDs) del Asesor y Coordinador asignado realizando `LEFT JOIN` a la tabla de `usuarios`.
  - **Eliminación Física (DELETE)**: Se añadió el botón de "basurero" (`Trash2`) que permite al administrador eliminar permanentemente un trabajo de la base de datos previa confirmación visual, enviando un request a `/api/admin/trabajos-graduacion/[id]`.
- **Rutas API para TG**:
  - `GET /api/admin/trabajos-graduacion`: Extrae todo el histórico de `sistema_tg.tg` con los nombres relacionales.
  - `DELETE /api/admin/trabajos-graduacion/[id]`: Endpoint encargado de purgar de la base de datos el registro.
- **Ampliación del CRUD (Eliminación Física Universal)**:
  - Se extendió la misma capacidad de borrado (`DELETE`) hacia los módulos de **Usuarios**, **Facultades** y **Carreras**.
  - Ahora cada fila de estas tablas posee su propio icono de basurero con confirmación.
  - **Seguridad Relacional (Foreign Keys)**: Las APIs de eliminación de Facultades y Carreras incluyen captura de errores SQL (Código `23503`). Si un administrador intenta borrar una Facultad que aún tiene Carreras asignadas, o una Carrera que tiene Usuarios, la base de datos abortará la operación de forma segura y el Frontend mostrará una alerta explicativa, protegiendo la integridad referencial.
- **Dashboard de Administrador Dinámico (React Server Components)**:
  - Se transformó el componente estático `/dashboard/admin/page.tsx` en un componente de servidor asíncrono.
  - Se incorporaron 4 consultas SQL simultáneas (`Promise.all()`) para extraer en tiempo real la cantidad de: Usuarios Activos, Asesores Registrados, Facultades y Carreras.
  - Las tarjetas resumen de la cabecera ahora reflejan el pulso exacto de la base de datos.

- **Trabajos de Graduación y Egresados (Relación N:M)**:
  - Se modificó la interfaz y la API de listado (`GET /api/admin/trabajos-graduacion`) para integrar la información desde `tg_egresados`. 
  - La tabla ahora muestra los nombres y carnets de todos los estudiantes vinculados a un solo Proyecto o Tesis (soportando múltiples alumnos por proyecto).
- **Carga Masiva de TGs Históricos**:
  - Se habilitó la opción `temas_historicos.csv` en `/dashboard/admin/carga-masiva`.
  - Columnas esperadas actualizadas: Se reemplazaron `fecha_envio` y `fecha_aprobacion` por un campo `estudiantes_carnets`. Este campo permite subir múltiples carnets separados por comas.
  - La ruta POST (`/api/admin/carga-masiva`) realiza la creación del TG y, mediante un bucle, busca a los alumnos por carnet y los enlaza automáticamente creando las filas correspondientes en `tg_egresados` en estado 'finalizado' e 'integrante'.
- **Panel del Egresado Funcional**:
  - Se construyó toda la UI en `/dashboard/egresado` y su propio `layout.tsx` para un entorno aislado del panel de administrador.
  - Se creó el endpoint `GET /api/egresado/propuestas` para verificar si el alumno ya tiene un Trabajo de Graduación asignado o propuestas en curso.
  - Se implementó `POST /api/egresado/propuestas` (soportando subida `multipart/form-data`) que permite al estudiante subir 3 propuestas de texto, el tipo de proyecto (Proyecto/Tesis/Pasantía) y 1 archivo PDF de justificación en una sola acción.
  - Automáticamente, si el alumno no tenía proyecto, el backend crea un TG nuevo en estado "enviada", lo enlaza como 'lider' en `tg_egresados` (buscando su carrera y facultad base) e inserta el intento 1 en `tg_propuestas`.
- **Sistema de Equipos e Invitaciones (Egresados)**:
  - Se añadió la capacidad de formar equipos (hasta 3 estudiantes).
  - El alumno líder puede hacer clic en "Invitar Integrante", ingresar el carnet de un compañero, y la API (`POST /api/egresado/invitaciones`) validará al usuario y le creará una invitación pendiente en la tabla `tg_egresados`.
  - Cuando el compañero inicie sesión, en lugar del dashboard normal, verá una pantalla de alerta indicando que fue invitado al proyecto, con opciones para "Aceptar" o "Rechazar" (`PUT /api/egresado/invitaciones`).
  - Al aceptar, ambos visualizarán exactamente el mismo dashboard, con el mismo historial de propuestas y comentarios, y el panel lateral mostrará al equipo completo con sus carnets y roles (Líder / Integrante).
  - *Nota Técnica*: Fue necesario ejecutar `ALTER TYPE sistema_tg.estado_participacion_tg ADD VALUE IF NOT EXISTS 'invitado';` en la base de datos para habilitar este flujo, dado que el campo es un ENUM.
- **Hub de Comunicación (Foro Global)**:
  - Se transformó la pestaña estática de "Comentarios" en un chat en tiempo real.
  - Se creó la tabla `sistema_tg.tg_comentarios` para guardar el historial ordenado por fecha.
  - La API genérica (`/api/comentarios`) permite adjuntar archivos (fotos o documentos) junto con los mensajes.
  - El diseño diferencia visualmente los mensajes enviados por el egresado (a la derecha en rojo) de los enviados por coordinadores, asesores u otros compañeros (a la izquierda en blanco/azul).
- **Gestor de Archivos Inteligente (Vercel-Proof)**:
  - Dado que Vercel utiliza un sistema de archivos de solo lectura en producción, se desarrolló un sistema para guardar archivos PDF e Imágenes nativamente dentro de la base de datos PostgreSQL de Neon usando el tipo de dato `BYTEA`.
  - Se creó la tabla `sistema_tg.archivos` para almacenar el binario, el nombre y el tipo MIME.
  - Se habilitó la ruta dinámica `GET /api/archivos/[id]` para servir estos binarios en tiempo real al usuario de la misma forma que un enlace directo, permitiendo previsualizaciones completas y descargas sin servicios externos.
  - El sistema detecta cuando el binario pertenece a una imagen gracias al parámetro `?ext=`, para previsualizarlo automáticamente dentro del Foro.
- **Resumen Dinámico de Egresado**:
  - Tras enviar las propuestas, el dashboard del estudiante cambia a modo "Esperando Dictamen".
  - Muestra un desglose visual de los textos de la Propuesta 1, 2 y 3, así como un enlace directo para que el alumno pueda volver a descargar su PDF adjunto.
- **Panel de Evaluación del Administrador (Coordinador)**:
  - Se habilitó la vista detallada de cada trabajo de graduación en `/dashboard/admin/trabajos-graduacion/[id]`.
  - El panel cuenta con un sistema de pestañas para dividir la información entre la **Evaluación de Propuestas** y el **Foro del Proyecto**.
  - El administrador ahora tiene total acceso al Foro privado de cada grupo para dar retroalimentación asíncrona antes de emitir un dictamen.
- **Flujo de Dictamen de Propuestas**:
  - **Aprobación Selectiva**: El administrador revisa las tres opciones y hace clic en la tarjeta de la propuesta ganadora. Esto la preselecciona como el **Título Definitivo**. Al aprobar, el TG cambia su estado a "en_progreso" y se actualiza su título oficial en la base de datos, mientras que las demás propuestas quedan archivadas históricamente.
  - **Rechazo**: El administrador redacta el motivo del rechazo en el campo de Feedback. Esto devuelve el proyecto al estado "borrador", marca el intento actual como rechazado y habilita al grupo para que agote su segundo/tercer intento de propuestas desde su dashboard.
- **Parches Técnicos y Estabilidad**:
  - Actualización global a `Next.js 15+ Async Params` en las rutas de API dinámicas (`[id]`) para asegurar compatibilidad con la estructura estricta `Promise<{ id: string }>` requerida por el entorno de compilación de Vercel.
  - Script manual ejecutado (`fix_borrador.ts`) para sincronizar el estado antiguo de proyectos que se habían quedado huérfanos entre las fases de validación de base de datos.
- **Asignación de Asesor y Carga de Trabajo (Workload)**:
  - En la vista de administrador, se implementó un botón para asignar un Asesor a los proyectos que ya están "En progreso".
  - Se añadió una consulta dinámica (`COUNT(*)`) a la BD para mostrar en tiempo real la cantidad de proyectos activos que tiene cada asesor, previniendo sobrecargas de trabajo.
- **Actualización de Interfaz del Egresado Post-Dictamen**:
  - Se rediseñó el dashboard del alumno cuando el proyecto es aprobado (`tg.estado === 'en_progreso'`).
  - En lugar de mantener el letrero de revisión, aparece un panel de éxito verde ("¡Proyecto Aprobado y Activo!") que muestra el Título Definitivo otorgado y, de existir, el nombre del Asesor a cargo del seguimiento.
- **Correcciones Estrictas de Base de Datos**:
  - Se corrigió el error `violates check constraint "chk_propuesta_fecha_resolucion"` garantizando que, al aprobar o rechazar una propuesta desde el dashboard administrativo, el campo `fecha_resolucion` reciba un timestamp actual de PostgreSQL, cumpliendo con la integridad de la base de datos.
  - Se incorporó una validación extra de `maxLength={255}` para prevenir caídas de servidor si el administrador insertaba un título mayor a la columna de la base de datos, manejando el error mediante un mensaje `inline` amigable.

### Actualización 08-06-2026: Mejoras Masivas al Dashboard Administrativo

- **Layout Global y Visualización**:
  - Se eliminó la barra de búsqueda estática del layout principal del administrador, despejando la cabecera.
  - Los gráficos principales ("TGs por Estado" y "Distribución General") en `/dashboard/admin` ahora están completamente enlazados a la base de datos mediante un conteo agrupado real (`GROUP BY estado`), con contraste mejorado y re-escalado automático.
- **Gestión de Usuarios (`/dashboard/admin/usuarios`)**:
  - Se activaron los filtros dinámicos reales para buscar por **Nombre**, **Correo** y **Carnet**, además de filtrar por **Rol**, **Estado** y **Facultad**.
  - **Validaciones Estrictas**: Al crear un usuario, el servidor y el cliente verifican obligatoriamente que el correo termine en `@catolica.edu.sv`. Si el rol es Egresado, el **Carnet** es 100% requerido.
  - **Experiencia de Borrado Segura**: Se sustituyó el `toast` o `alert` por un componente visual en línea de éxito tras confirmar mediante una caja de diálogo nativa, mejorando la UX.
- **Protección Inteligente de Facultades y Carreras**:
  - Se reintrodujo el sistema CRUD (Crear, Leer, Actualizar, Borrar) en la vista de facultades/carreras, pero ahora de manera condicional.
  - La base de datos calcula automáticamente la cantidad de carreras asignadas a una facultad, y los estudiantes vinculados a una carrera.
  - El botón de borrado se deshabilita preventivamente si existen relaciones anidadas, protegiendo permanentemente la integridad referencial.
- **Gestión de Trabajos de Graduación (`/dashboard/admin/trabajos-graduacion`)**:
  - Se insertó un sistema robusto de multicapa de filtros locales: búsqueda por título del TG, filtrado específico por estudiante (nombre/carnet), filtro por Tipo (Pasantía, Investigación, Proyecto) y filtro por Estado oficial.
- **Sistema de Modales "No-Toasts"**:
  - En respuesta a una mejora crítica de UX, se erradicaron las alertas del navegador (`confirm()`, `prompt()`, `alert()`) en todo el panel de administración (Usuarios, TGs, Facultades/Carreras).
  - Todas las confirmaciones destructivas ahora utilizan una elegante ventana modal centrada renderizada de forma condicional, con notificaciones asíncronas en línea de éxito (verdes) y error (rojas), utilizando componentes de Tailwind.
- **Validación Estricta de Invitaciones por Tipo de TG y Estado**:
  - El botón de "Invitar Integrante" en el Dashboard del Egresado ahora evalúa en tiempo real tanto la modalidad ("¿Qué tipo de trabajo realizarás?") como el estado actual de la solicitud en la base de datos.
  - Solo permite invitar compañeros si la modalidad seleccionada es "Proyecto de Graduación" **Y** el proyecto no ha sido aprobado.
  - Si el usuario selecciona "Pasantía" o "Trabajo de Investigación (Tesis)", el botón se bloquea instantáneamente mostrando: *"Solo válido para Proyecto de Graduación"*.
  - **Bloqueo Definitivo de Grupo:** Si el proyecto ya fue revisado y su estado pasa a "Aprobada" o "En Progreso", el botón de invitaciones se deshabilita para siempre bajo la premisa de *"Grupo bloqueado (Proyecto Aprobado)"*, protegiendo la integridad del equipo original frente a manipulaciones posteriores a la aprobación del Coordinador.
- **Personalización del Cabezal de Usuario (Egresado)**:
  - La barra superior (`Header`) del portal del egresado ahora muestra dinámicamente el nombre real del estudiante y su carnet registrado.
  - Se implementó la recuperación de sesión en tiempo real asíncrona a través de `next-auth/react` (`getSession`) sustituyendo el texto estático anterior.
- **Mejoras Visuales en el Panel de Trabajo de Graduación (Admin)**:
  - **Flujo de Aprobación de Propuestas**: Al aprobar y dictaminar una propuesta, la seleccionada es la única que se mantiene en verde fuerte e incluye la leyenda "(Aceptada)". Las opciones descartadas o no seleccionadas se bloquean visualmente (`opacity-50`, `grayscale`, sin cursor de click).
  - **Accesibilidad en Información General**: Se mejoró radicalmente el nivel de contraste en el menú lateral derecho (Sidebar de "Información General"). Las etiquetas de Tipo, Facultad, Carrera y Estado General pasaron de un gris deslavado a un texto prominente y sólido (`text-gray-900` para los valores, y un identificador en negrita más claro para sus encabezados).