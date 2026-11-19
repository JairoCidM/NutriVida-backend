CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run VARCHAR(9) NOT NULL UNIQUE,
  nombre VARCHAR(50) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  contrasena_hash VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL DEFAULT '',
  direccion VARCHAR(300) NOT NULL DEFAULT '',
  rol_id SMALLINT NOT NULL REFERENCES roles (id),
  nutricionista_codigo VARCHAR(6),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_correo_unico ON usuarios (LOWER(correo));

INSERT INTO roles (id, codigo, nombre) VALUES
  (1, 'administrador', 'Administrador'),
  (2, 'nutricionista', 'Nutricionista'),
  (3, 'paciente', 'Paciente')
ON CONFLICT (id) DO NOTHING;
