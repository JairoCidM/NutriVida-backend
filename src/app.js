import express from 'express';
import cors from 'cors';

export function crearApp(opciones) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: opciones.origenes, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/v1/health', (req, res) => {
    res.json({ estado: 'ok' });
  });

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
