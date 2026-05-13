-- =========================================================
-- CREACIÓN DE ESQUEMA BASE
-- PostgreSQL
-- =========================================================

CREATE SCHEMA IF NOT EXISTS sistema_tg;
SET search_path TO sistema_tg;

-- =========================================================
-- TIPOS ENUM
-- =========================================================

CREATE TYPE rol_usuario AS ENUM (
    'egresado',
    'asesor',
    'coordinador',
    'administrador'
);

CREATE TYPE estado_disponibilidad_asesor AS ENUM (
    'disponible',
    'no_disponible'
);

CREATE TYPE tipo_tg AS ENUM (
    'proyecto',
    'pasantia',
    'investigacion'
);

CREATE TYPE estado_tg AS ENUM (
    'borrador',
    'enviada',
    'rechazada',
    'aprobada',
    'en_progreso',
    'finalizada',
    'abandonada'
);

CREATE TYPE rol_grupo_tg AS ENUM (
    'lider',
    'integrante'
);

CREATE TYPE estado_participacion_tg AS ENUM (
    'activo',
    'retirado',
    'finalizado'
);

CREATE TYPE estado_actividad AS ENUM (
    'pendiente',
    'entregada',
    'tardia',
    'no_entregada'
);

CREATE TYPE estado_entrega AS ENUM (
    'pendiente',
    'entregada',
    'revisada'
);

CREATE TYPE resultado_revision AS ENUM (
    'aprobado',
    'rechazado',
    'con_observaciones'
);

CREATE TYPE tipo_evento AS ENUM (
    'rechazo',
    'abandono',
    'reasignacion',
    'notificacion',
    'documento',
    'cambio_plan'
);

-- =========================================================
-- TABLA: usuarios
-- =========================================================

CREATE TABLE usuarios (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    facultad VARCHAR(150),
    carrera VARCHAR(150),
    carreras_asignadas_json JSONB,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    estado estado_disponibilidad_asesor,
    rendimiento_pct NUMERIC(5,2),
    proyectos_activos INT NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- =========================================================
-- TABLA: tg
-- =========================================================

CREATE TABLE tg (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    asesor_id INT,
    coordinador_id INT,
    carrera VARCHAR(150) NOT NULL,
    facultad VARCHAR(150) NOT NULL,
    tipo tipo_tg NOT NULL,
    estado estado_tg NOT NULL DEFAULT 'borrador',
    -- documento_propuesta_url, motivo_rechazo e intento_actual
    -- se trasladan a tg_propuestas para soportar histórico de intentos
    fecha_envio TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    fecha_inicio DATE,
    fecha_fin DATE,

    CONSTRAINT fk_tg_asesor
        FOREIGN KEY (asesor_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_tg_coordinador
        FOREIGN KEY (coordinador_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================================================
-- TABLA INTERMEDIA: tg_egresados
-- =========================================================

CREATE TABLE tg_egresados (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tg_id INT NOT NULL,
    egresado_id INT NOT NULL,
    rol_grupo rol_grupo_tg NOT NULL DEFAULT 'integrante',
    estado_participacion estado_participacion_tg NOT NULL DEFAULT 'activo',
    fecha_union TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_tg_egresado UNIQUE (tg_id, egresado_id),
    CONSTRAINT uq_tg_egresados_id_tg UNIQUE (id, tg_id),

    CONSTRAINT fk_tg_egresados_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_tg_egresados_egresado
        FOREIGN KEY (egresado_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Un egresado solo puede tener una participación activa a la vez
CREATE UNIQUE INDEX uq_egresado_un_tg_activo
ON tg_egresados (egresado_id)
WHERE estado_participacion = 'activo';

-- =========================================================
-- TABLA: actividades
-- =========================================================

CREATE TABLE actividades (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tg_id INT NOT NULL,
    actividad_padre_id INT,
    version_plan INT NOT NULL DEFAULT 1,
    nombre VARCHAR(300) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado estado_actividad NOT NULL DEFAULT 'pendiente',
    es_extra BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT NOT NULL,

    CONSTRAINT uq_actividades_id_tg UNIQUE (id, tg_id),

    CONSTRAINT fk_actividades_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_actividades_padre
        FOREIGN KEY (actividad_padre_id)
        REFERENCES actividades(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================================================
-- TABLA: entregas
-- Ahora la entrega apunta a la membresía del egresado dentro
-- del TG, no directamente al usuario
-- =========================================================

CREATE TABLE entregas (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actividad_id INT NOT NULL,
    tg_id INT NOT NULL,
    tg_egresado_id INT NOT NULL,
    documento_url VARCHAR(500) NOT NULL,
    mensaje TEXT,
    estado_entrega estado_entrega NOT NULL DEFAULT 'pendiente',
    feedback TEXT,
    resultado_revision resultado_revision,
    revisor_id INT,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    es_tardia BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_entregas_actividad_tg
        FOREIGN KEY (actividad_id, tg_id)
        REFERENCES actividades(id, tg_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_entregas_tg_egresado_tg
        FOREIGN KEY (tg_egresado_id, tg_id)
        REFERENCES tg_egresados(id, tg_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_entregas_revisor
        FOREIGN KEY (revisor_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================================================
-- TABLA: eventos
-- =========================================================

CREATE TABLE eventos (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tg_id INT NOT NULL,
    actor_id INT NOT NULL,
    destinatario_id INT,
    tipo_evento tipo_evento NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    archivo_url VARCHAR(500),
    metadata_json JSONB,
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eventos_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventos_actor
        FOREIGN KEY (actor_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eventos_destinatario
        FOREIGN KEY (destinatario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- =========================================================
-- TABLA: evaluaciones_asesor
-- Evaluación individual por integrante, referenciando la
-- membresía específica del egresado dentro del TG
-- =========================================================

CREATE TABLE evaluaciones_asesor (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tg_id INT NOT NULL,
    tg_egresado_id INT NOT NULL,
    asesor_id INT NOT NULL,
    puntuacion NUMERIC(5,2) NOT NULL,
    comentario TEXT,
    fecha_evaluacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_eval_unica UNIQUE (tg_id, tg_egresado_id, asesor_id),

    CONSTRAINT chk_eval_puntuacion
        CHECK (puntuacion BETWEEN 0 AND 100),

    CONSTRAINT fk_eval_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eval_tg_egresado_tg
        FOREIGN KEY (tg_egresado_id, tg_id)
        REFERENCES tg_egresados(id, tg_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_eval_asesor
        FOREIGN KEY (asesor_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
-- =========================================================
-- TIPO ENUM: tipo_notificacion
-- =========================================================

CREATE TYPE tipo_notificacion AS ENUM (
    'propuesta_enviada',
    'propuesta_aprobada',
    'propuesta_rechazada',
    'documento_revisado',
    'actividad_vencida',
    'asesor_asignado',
    'asesor_reasignado',
    'plan_modificado',
    'evaluacion_registrada',
    'egresado_retirado'
);

-- =========================================================
-- TABLA: notificaciones
-- Registro individual de notificación por destinatario.
-- Desacopla la lectura del sistema de eventos general.
-- =========================================================

CREATE TABLE notificaciones (
    id               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Usuario que recibe la notificación
    usuario_id       INT NOT NULL,

    -- Evento que originó la notificación (opcional; NULL si es generada
    -- directamente sin pasar por la tabla eventos)
    evento_id        INT,

    -- TG relacionado (puede ser NULL para notificaciones del sistema)
    tg_id            INT,

    tipo             tipo_notificacion NOT NULL,
    titulo           VARCHAR(200) NOT NULL,
    mensaje          TEXT NOT NULL,

    -- Control de lectura
    leida            BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura    TIMESTAMP,

    fecha_creacion   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Garantiza que un mismo evento no genere notificación duplicada
    -- para el mismo usuario
    CONSTRAINT uq_notif_evento_usuario
        UNIQUE (evento_id, usuario_id),

    CONSTRAINT fk_notif_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_notif_evento
        FOREIGN KEY (evento_id)
        REFERENCES eventos(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_notif_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- fecha_lectura solo puede existir si leida = TRUE
    CONSTRAINT chk_notif_fecha_lectura
        CHECK (leida = TRUE OR fecha_lectura IS NULL)
);

-- Índice para consultar notificaciones no leídas de un usuario
CREATE INDEX idx_notif_usuario_no_leidas
    ON notificaciones (usuario_id)
    WHERE leida = FALSE;

-- Índice para listar todas las notificaciones de un usuario ordenadas
CREATE INDEX idx_notif_usuario_fecha
    ON notificaciones (usuario_id, fecha_creacion DESC);

-- =========================================================
-- TIPO ENUM: estado_propuesta
-- =========================================================

CREATE TYPE estado_propuesta AS ENUM (
    'borrador',     -- en edición, aún no enviada
    'pendiente',    -- enviada, esperando resolución
    'rechazada',    -- rechazada por coordinador; pasa a inactiva
    'aprobada'      -- aprobada; inicia el proceso TG
);

-- =========================================================
-- TABLA: tg_propuestas
-- Histórico de intentos de propuesta por TG.
-- Cada fila representa un intento (máx. 3).
-- Solo una propuesta puede estar activa por TG a la vez.
-- Las propuestas rechazadas quedan como histórico inactivo.
-- =========================================================

CREATE TABLE tg_propuestas (
    id                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tg_id                 INT NOT NULL,

    -- Número de intento: 1, 2 o 3
    intento_num           INT NOT NULL,

    -- URL del documento de propuesta de este intento específico
    documento_url         VARCHAR(500) NOT NULL,

    -- Mensaje o descripción adicional enviada por el egresado
    descripcion           TEXT,

    estado                estado_propuesta NOT NULL DEFAULT 'borrador',

    -- TRUE solo en la propuesta actual (vigente). Las rechazadas
    -- quedan con activa = FALSE como histórico consultable.
    activa                BOOLEAN NOT NULL DEFAULT TRUE,

    -- Observaciones del coordinador al rechazar o aprobar
    motivo_rechazo        TEXT,

    -- Quién resolvió (coordinador o administrador)
    resuelto_por_id       INT,

    fecha_envio           TIMESTAMP,
    fecha_resolucion      TIMESTAMP,
    fecha_creacion        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- No más de 3 intentos por TG
    CONSTRAINT chk_propuesta_intento_num
        CHECK (intento_num BETWEEN 1 AND 3),

    -- Un intento_num único por TG (no puede haber dos "intento 2" en el mismo TG)
    CONSTRAINT uq_propuesta_intento_tg
        UNIQUE (tg_id, intento_num),

    -- motivo_rechazo requerido si estado = 'rechazada'
    CONSTRAINT chk_propuesta_motivo_rechazo
        CHECK (estado <> 'rechazada' OR motivo_rechazo IS NOT NULL),

    -- fecha_resolucion requerida si fue resuelta
    CONSTRAINT chk_propuesta_fecha_resolucion
        CHECK (estado NOT IN ('aprobada', 'rechazada') OR fecha_resolucion IS NOT NULL),

    CONSTRAINT fk_propuesta_tg
        FOREIGN KEY (tg_id)
        REFERENCES tg(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_propuesta_resuelto_por
        FOREIGN KEY (resuelto_por_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Solo UNA propuesta activa por TG en cualquier momento
CREATE UNIQUE INDEX uq_tg_una_propuesta_activa
    ON tg_propuestas (tg_id)
    WHERE activa = TRUE;

-- Índice para consultar el histórico de un TG ordenado por intento
CREATE INDEX idx_propuestas_tg_historial
    ON tg_propuestas (tg_id, intento_num);
