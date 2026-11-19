import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { crearRegistroEntradaDto, crearLoginEntradaDto, crearUsuarioSalidaDto } from '../dto/usuario.dto.js';

const limiteDeLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.', detalles: [] }
});

export function crearAuthRouter(service, seguridad) {
  const router = Router();

  router.post('/register', async (req, res) => {
    const entrada = crearRegistroEntradaDto(req.body);
    const creado = await service.registrar(entrada);
    res.status(201).location('/api/v1/usuarios/' + creado.id).json(crearUsuarioSalidaDto(creado));
  });

  router.post('/login', limiteDeLogin, async (req, res) => {
    const entrada = crearLoginEntradaDto(req.body);
    const sesion = await service.iniciarSesion(entrada);
    res.json({
      accessToken: sesion.accessToken,
      tipo: 'Bearer',
      expiraEn: sesion.expiraEn,
      usuario: crearUsuarioSalidaDto(sesion.usuario)
    });
  });

  router.get('/me', seguridad.autenticar, (req, res) => {
    res.json(crearUsuarioSalidaDto(req.usuario));
  });

  return router;
}
