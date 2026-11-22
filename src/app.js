import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { documentoOpenApi } from './docs/openapi.js';
import { crearUsuarioRepository } from './repositories/usuario.repository.js';
import { crearAuthService } from './services/auth.service.js';
import { crearAuthRouter } from './routes/auth.routes.js';
import { crearAutenticacion } from './middlewares/autenticacion.js';
import { crearUsuarioService } from './services/usuario.service.js';
import { crearUsuarioRouter } from './routes/usuario.routes.js';

export function crearApp(opciones) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: opciones.origenes, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/v1/health', async (req, res) => {
    try {
      await opciones.pool.query('SELECT 1');
      res.json({ estado: 'ok', baseDeDatos: 'conectada' });
    } catch (error) {
      res.status(503).json({ estado: 'error', baseDeDatos: 'sin conexión' });
    }
  });

  app.get('/api/docs/openapi.json', (req, res) => {
    res.json(documentoOpenApi);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(documentoOpenApi, { customSiteTitle: 'API de NutriVida' }));

  const usuarios = crearUsuarioRepository(opciones.pool);
  const seguridad = crearAutenticacion(usuarios);
  app.use('/api/v1/auth', crearAuthRouter(crearAuthService(usuarios), seguridad));
  app.use('/api/v1/usuarios', crearUsuarioRouter(crearUsuarioService(usuarios), seguridad));

  app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.', detalles: [] });
  });

  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ mensaje: 'JSON mal formado.', detalles: [] });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ mensaje: 'El cuerpo supera el límite permitido.', detalles: [] });
    }
    const status = error.status || 500;
    if (status >= 500) console.error('Error interno al procesar la solicitud:', error.message);
    res.status(status).json({
      mensaje: status >= 500 ? 'No fue posible procesar la solicitud.' : error.message,
      detalles: error.detalles || []
    });
  });

  return app;
}