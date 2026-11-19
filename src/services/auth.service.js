import { HttpError } from '../errors/HttpError.js';
import { generarHash, compararContrasena } from '../security/contrasenas.js';
import { emitirToken, segundosDeVigencia } from '../security/jwt.js';

export function crearAuthService(usuarios) {
  const hashDeRelleno = generarHash('cuenta-inexistente');

  async function registrar(dto) {
    const contrasenaHash = await generarHash(dto.contrasena);
    return usuarios.crear({
      run: dto.run,
      nombre: dto.nombre,
      apellidos: dto.apellidos,
      correo: dto.correo,
      contrasenaHash: contrasenaHash,
      telefono: dto.telefono,
      direccion: dto.direccion,
      rol: 'paciente',
      nutricionistaCodigo: null
    });
  }

  async function iniciarSesion(dto) {
    const usuario = await usuarios.buscarPorCorreo(dto.correo);
    const coincide = await compararContrasena(dto.contrasena, usuario ? usuario.contrasena_hash : await hashDeRelleno);
    if (!usuario || !coincide || !usuario.activo) {
      throw new HttpError(401, 'Correo o contraseña incorrectos.');
    }
    return { usuario: usuario, accessToken: emitirToken(usuario), expiraEn: segundosDeVigencia() };
  }

  return { registrar: registrar, iniciarSesion: iniciarSesion };
}
