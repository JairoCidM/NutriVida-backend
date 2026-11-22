const error = (descripcion, mensaje) => ({
  description: descripcion,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { mensaje: mensaje, detalles: [] } } }
});

const usuario = {
  description: 'Usuario',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } }
};

const idParametro = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id del usuario',
  schema: { type: 'integer', minimum: 1, example: 6 }
};

const errores = {
  400: error('Datos inválidos', 'Datos del usuario inválidos.'),
  401: error('Sin token, token alterado o vencido', 'Debes iniciar sesión para acceder a este recurso.'),
  403: error('El rol no tiene permiso o el registro es de otra persona', 'No tienes permiso para realizar esta acción.'),
  404: error('No existe el usuario', 'Usuario no encontrado.'),
  409: error('Conflicto con una regla del negocio', 'Ya existe un usuario con ese RUN o correo.')
};

export const documentoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'API de NutriVida',
    version: '1.0.0',
    description: 'API REST de la Clínica Nutricional NutriVida. DSY1104 · Equipo 6. Los datos de los ejemplos son ficticios.'
  },
  servers: [{ url: '/', description: 'Este mismo servidor' }],
  tags: [
    { name: 'Estado', description: 'Comprobación del servicio' },
    { name: 'Autenticación', description: 'Registro, inicio de sesión y usuario actual' },
    { name: 'Usuarios', description: 'Gestión de usuarios y roles' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token obtenido en POST /api/v1/auth/login' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { mensaje: { type: 'string' }, detalles: { type: 'array', items: { type: 'string' } } }
      },
      Usuario: {
        type: 'object',
        description: 'DTO de salida. Nunca incluye la contraseña ni su hash.',
        properties: {
          id: { type: 'integer', example: 6, description: 'Generado por el servidor' },
          run: { type: 'string', example: '196789014' },
          nombre: { type: 'string', example: 'Ana' },
          apellidos: { type: 'string', example: 'Pérez Soto' },
          correo: { type: 'string', example: 'ana.perez@correo.cl' },
          telefono: { type: 'string', example: '+56 9 8412 3367' },
          direccion: { type: 'string', example: 'Los Aromos 455, Temuco' },
          rol: { type: 'string', enum: ['administrador', 'nutricionista', 'paciente'], example: 'paciente', description: 'Asignado por el servidor' },
          nutricionistaCodigo: { type: 'string', nullable: true, example: null },
          activo: { type: 'boolean', example: true }
        }
      },
      Registro: {
        type: 'object',
        required: ['run', 'nombre', 'apellidos', 'correo', 'contrasena', 'direccion'],
        description: 'Si llega un campo rol, se ignora: el servidor siempre asigna paciente.',
        properties: {
          run: { type: 'string', example: '123456785', description: 'Sin puntos ni guion, 7 a 9 caracteres, con dígito verificador válido' },
          nombre: { type: 'string', maxLength: 50, example: 'Paula' },
          apellidos: { type: 'string', maxLength: 100, example: 'Muñoz Ríos' },
          correo: { type: 'string', maxLength: 100, example: 'paula.munoz@correo.cl' },
          contrasena: { type: 'string', minLength: 8, maxLength: 72, example: 'segura123' },
          telefono: { type: 'string', maxLength: 20, example: '+56 9 1234 5678' },
          direccion: { type: 'string', maxLength: 300, example: 'Prat 500, Temuco' }
        }
      },
      Login: {
        type: 'object',
        required: ['correo', 'contrasena'],
        properties: {
          correo: { type: 'string', example: 'ana.perez@correo.cl' },
          contrasena: { type: 'string', example: 'paciente123' }
        }
      },
      Sesion: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          tipo: { type: 'string', example: 'Bearer' },
          expiraEn: { type: 'integer', example: 3600, description: 'Segundos de vigencia del token' },
          usuario: { $ref: '#/components/schemas/Usuario' }
        }
      },
      Alta: {
        type: 'object',
        required: ['run', 'nombre', 'apellidos', 'correo', 'contrasena', 'rol'],
        properties: {
          run: { type: 'string', example: '98765433' },
          nombre: { type: 'string', example: 'Tomás' },
          apellidos: { type: 'string', example: 'Vega R.' },
          correo: { type: 'string', example: 'tomas.vega@nutrivida.cl' },
          contrasena: { type: 'string', example: 'nutri12345' },
          telefono: { type: 'string', example: '' },
          direccion: { type: 'string', example: 'Temuco' },
          rol: { type: 'string', enum: ['administrador', 'nutricionista', 'paciente'], example: 'nutricionista' },
          nutricionistaCodigo: { type: 'string', enum: ['NUT001', 'NUT002', 'NUT003', 'NUT004'], example: 'NUT004', description: 'Obligatorio solo para el rol nutricionista' }
        }
      },
      Actualizacion: {
        type: 'object',
        required: ['nombre', 'apellidos'],
        description: 'PUT reemplaza los datos personales. rol, nutricionistaCodigo y activo solo los puede enviar el administrador.',
        properties: {
          nombre: { type: 'string', example: 'Ana' },
          apellidos: { type: 'string', example: 'Pérez Soto' },
          telefono: { type: 'string', example: '+56 9 8412 3368' },
          direccion: { type: 'string', example: 'Los Aromos 455, Temuco' },
          contrasena: { type: 'string', description: 'Opcional. Si se envía, se cambia la contraseña.' },
          rol: { type: 'string', enum: ['administrador', 'nutricionista', 'paciente'] },
          nutricionistaCodigo: { type: 'string', enum: ['NUT001', 'NUT002', 'NUT003', 'NUT004'] },
          activo: { type: 'boolean' }
        }
      }
    }
  },
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Estado'],
        summary: 'Comprueba que la API y la base de datos respondan',
        responses: {
          200: { description: 'Servicio disponible', content: { 'application/json': { example: { estado: 'ok', baseDeDatos: 'conectada' } } } },
          503: { description: 'Sin conexión a la base de datos' }
        }
      }
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registra un paciente nuevo',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Registro' } } } },
        responses: { 201: usuario, 400: errores[400], 409: errores[409] }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Inicia sesión y entrega un JWT',
        description: 'Máximo 10 intentos cada 15 minutos por dirección IP. Ante credenciales incorrectas responde un mensaje genérico.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } },
        responses: {
          200: { description: 'Sesión iniciada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Sesion' } } } },
          400: error('Faltan datos', 'Datos de inicio de sesión inválidos.'),
          401: error('Credenciales incorrectas o cuenta desactivada', 'Correo o contraseña incorrectos.'),
          429: error('Demasiados intentos', 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.')
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Autenticación'],
        summary: 'Datos del usuario autenticado',
        description: 'El usuario se obtiene del token validado, nunca de un id enviado por el cliente.',
        security: [{ bearerAuth: [] }],
        responses: { 200: usuario, 401: errores[401] }
      }
    },
    '/api/v1/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Lista los usuarios (solo administrador)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'rol', in: 'query', required: false, schema: { type: 'string', enum: ['administrador', 'nutricionista', 'paciente'] } }],
        responses: {
          200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } } },
          400: errores[400],
          401: errores[401],
          403: errores[403]
        }
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crea un usuario con su rol (solo administrador)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Alta' } } } },
        responses: { 201: usuario, 400: errores[400], 401: errores[401], 403: errores[403], 409: errores[409] }
      }
    },
    '/api/v1/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Ve un usuario (el administrador o la misma persona)',
        security: [{ bearerAuth: [] }],
        parameters: [idParametro],
        responses: { 200: usuario, 400: errores[400], 401: errores[401], 403: errores[403], 404: errores[404] }
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Modifica un usuario (el administrador o la misma persona)',
        security: [{ bearerAuth: [] }],
        parameters: [idParametro],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Actualizacion' } } } },
        responses: { 200: usuario, 400: errores[400], 401: errores[401], 403: errores[403], 404: errores[404], 409: error('No puedes cambiar tu propio rol ni desactivarte', 'No puedes desactivar tu propia cuenta ni cambiar tu propio rol.') }
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Desactiva un usuario (solo administrador)',
        description: 'No borra el registro: lo marca como inactivo, así se conserva el historial y la cuenta ya no puede iniciar sesión.',
        security: [{ bearerAuth: [] }],
        parameters: [idParametro],
        responses: { 204: { description: 'Usuario desactivado' }, 400: errores[400], 401: errores[401], 403: errores[403], 404: errores[404], 409: error('No puedes desactivar tu propia cuenta', 'No puedes desactivar tu propia cuenta.') }
      }
    }
  }
};