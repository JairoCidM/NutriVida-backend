import { Router } from 'express';
import { HttpError } from '../errors/HttpError.js';
import { crearAltaEntradaDto, crearActualizacionEntradaDto, crearUsuarioSalidaDto } from '../dto/usuario.dto.js';

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un número entero positivo.');
  return id;
}

export function crearUsuarioRouter(service, seguridad) {
  const router = Router();
  const soloAdministrador = seguridad.requerirRol('administrador');

  router.use(seguridad.autenticar);

  router.get('/', soloAdministrador, async (req, res) => {
    const lista = await service.listar({ rol: req.query.rol });
    res.json(lista.map(crearUsuarioSalidaDto));
  });

  router.get('/:id', async (req, res) => {
    const usuario = await service.buscar(req.usuario, leerId(req.params.id));
    res.json(crearUsuarioSalidaDto(usuario));
  });

  router.post('/', soloAdministrador, async (req, res) => {
    const creado = await service.crear(crearAltaEntradaDto(req.body));
    res.status(201).location('/api/v1/usuarios/' + creado.id).json(crearUsuarioSalidaDto(creado));
  });

  router.put('/:id', async (req, res) => {
    const id = leerId(req.params.id);
    const entrada = crearActualizacionEntradaDto(req.body, req.usuario.rol === 'administrador');
    const actualizado = await service.actualizar(req.usuario, id, entrada);
    res.json(crearUsuarioSalidaDto(actualizado));
  });

  router.delete('/:id', soloAdministrador, async (req, res) => {
    await service.desactivar(req.usuario, leerId(req.params.id));
    res.status(204).end();
  });

  return router;
}
