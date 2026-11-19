import { HttpError } from '../errors/HttpError.js';
import { verificarToken } from '../security/jwt.js';

export function crearAutenticacion(usuarios) {
  async function autenticar(req, res, next) {
    const encabezado = req.get('Authorization') || '';
    const [tipo, token] = encabezado.split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new HttpError(401, 'Debes iniciar sesión para acceder a este recurso.');
    }

    let datos;
    try {
      datos = verificarToken(token);
    } catch (error) {
      const mensaje = error.name === 'TokenExpiredError' ? 'La sesión expiró. Vuelve a iniciar sesión.' : 'El token no es válido.';
      throw new HttpError(401, mensaje);
    }

    const usuario = await usuarios.buscarPorId(Number(datos.sub));
    if (!usuario || !usuario.activo) {
      throw new HttpError(401, 'La cuenta no está disponible.');
    }
    req.usuario = usuario;
    next();
  }

  function requerirRol(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.usuario.rol)) {
        throw new HttpError(403, 'No tienes permiso para realizar esta acción.');
      }
      next();
    };
  }

  return { autenticar: autenticar, requerirRol: requerirRol };
}
