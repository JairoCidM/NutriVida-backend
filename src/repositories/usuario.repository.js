import { HttpError } from '../errors/HttpError.js';

const COLUMNAS = 'u.id, u.run, u.nombre, u.apellidos, u.correo, u.contrasena_hash, u.telefono, u.direccion, r.codigo AS rol, u.nutricionista_codigo, u.activo';
const DESDE = ' FROM usuarios u JOIN roles r ON r.id = u.rol_id';

function traducirDuplicado(error) {
  if (error.code === '23505') {
    throw new HttpError(409, 'Ya existe un usuario con ese RUN o correo.');
  }
  throw error;
}

export function crearUsuarioRepository(pool) {
  async function buscarPorId(id) {
    const resultado = await pool.query('SELECT ' + COLUMNAS + DESDE + ' WHERE u.id = $1', [id]);
    return resultado.rows[0] || null;
  }

  async function buscarPorCorreo(correo) {
    const resultado = await pool.query('SELECT ' + COLUMNAS + DESDE + ' WHERE LOWER(u.correo) = LOWER($1)', [correo]);
    return resultado.rows[0] || null;
  }

  async function crear(datos) {
    try {
      const resultado = await pool.query(
        'INSERT INTO usuarios (run, nombre, apellidos, correo, contrasena_hash, telefono, direccion, rol_id, nutricionista_codigo) ' +
          'SELECT $1, $2, $3, $4, $5, $6, $7, roles.id, $9 FROM roles WHERE roles.codigo = $8 RETURNING id',
        [datos.run, datos.nombre, datos.apellidos, datos.correo, datos.contrasenaHash, datos.telefono, datos.direccion, datos.rol, datos.nutricionistaCodigo || null]
      );
      return buscarPorId(resultado.rows[0].id);
    } catch (error) {
      return traducirDuplicado(error);
    }
  }

  return { buscarPorId: buscarPorId, buscarPorCorreo: buscarPorCorreo, crear: crear, traducirDuplicado: traducirDuplicado };
}
