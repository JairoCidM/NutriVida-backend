import { HttpError } from '../errors/HttpError.js';
import { generarHash } from '../security/contrasenas.js';
import { ROLES } from '../dto/usuario.dto.js';

export function crearUsuarioService(usuarios) {
  function puedeVer(solicitante, id) {
    return solicitante.rol === 'administrador' || solicitante.id === id;
  }

  async function buscar(solicitante, id) {
    if (!puedeVer(solicitante, id)) {
      throw new HttpError(403, 'No tienes permiso para ver los datos de otra persona.');
    }
    const usuario = await usuarios.buscarPorId(id);
    if (!usuario) throw new HttpError(404, 'Usuario no encontrado.');
    return usuario;
  }

  async function listar(filtros) {
    if (filtros.rol && !ROLES.includes(filtros.rol)) {
      throw new HttpError(400, 'El rol debe ser: ' + ROLES.join(', ') + '.');
    }
    return usuarios.listar(filtros);
  }

  async function crear(dto) {
    const contrasenaHash = await generarHash(dto.contrasena);
    return usuarios.crear({ ...dto, contrasenaHash: contrasenaHash });
  }

  async function actualizar(solicitante, id, dto) {
    if (!puedeVer(solicitante, id)) {
      throw new HttpError(403, 'No tienes permiso para modificar los datos de otra persona.');
    }
    const actual = await usuarios.buscarPorId(id);
    if (!actual) throw new HttpError(404, 'Usuario no encontrado.');
    if (solicitante.id === id && (dto.activo === false || (dto.rol && dto.rol !== actual.rol))) {
      throw new HttpError(409, 'No puedes desactivar tu propia cuenta ni cambiar tu propio rol.');
    }

    const cambios = { ...dto };
    if (cambios.contrasena) {
      cambios.contrasenaHash = await generarHash(cambios.contrasena);
    }
    delete cambios.contrasena;
    return usuarios.actualizar(id, cambios);
  }

  async function desactivar(solicitante, id) {
    if (solicitante.id === id) {
      throw new HttpError(409, 'No puedes desactivar tu propia cuenta.');
    }
    const actual = await usuarios.buscarPorId(id);
    if (!actual) throw new HttpError(404, 'Usuario no encontrado.');
    await usuarios.actualizar(id, { activo: false });
  }

  return { buscar: buscar, listar: listar, crear: crear, actualizar: actualizar, desactivar: desactivar };
}
