import { Router } from 'express';
import { crearRegistroEntradaDto, crearUsuarioSalidaDto } from '../dto/usuario.dto.js';

export function crearAuthRouter(service) {
  const router = Router();

  router.post('/register', async (req, res) => {
    const entrada = crearRegistroEntradaDto(req.body);
    const creado = await service.registrar(entrada);
    res.status(201).location('/api/v1/usuarios/' + creado.id).json(crearUsuarioSalidaDto(creado));
  });

  return router;
}
