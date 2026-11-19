import { generarHash } from '../security/contrasenas.js';

export function crearAuthService(usuarios) {
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

  return { registrar: registrar };
}
