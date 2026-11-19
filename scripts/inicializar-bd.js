import { readFile } from 'node:fs/promises';
import { crearPool } from '../src/db/pool.js';
import { generarHash } from '../src/security/contrasenas.js';
import { usuariosIniciales } from '../db/usuarios-iniciales.js';

const pool = crearPool();

try {
  const esquema = await readFile(new URL('../db/esquema.sql', import.meta.url), 'utf8');
  await pool.query(esquema);
  console.log('Tablas roles y usuarios listas.');

  let creados = 0;
  for (const usuario of usuariosIniciales) {
    const hash = await generarHash(usuario.contrasena);
    const resultado = await pool.query(
      'INSERT INTO usuarios (run, nombre, apellidos, correo, contrasena_hash, telefono, direccion, rol_id, nutricionista_codigo) ' +
        'SELECT $1, $2, $3, $4, $5, $6, $7, roles.id, $9 FROM roles WHERE roles.codigo = $8 ' +
        'ON CONFLICT DO NOTHING',
      [usuario.run, usuario.nombre, usuario.apellidos, usuario.correo, hash, usuario.telefono, usuario.direccion, usuario.rol, usuario.nutricionistaCodigo]
    );
    creados = creados + resultado.rowCount;
  }

  const total = await pool.query('SELECT COUNT(*)::INT AS cantidad FROM usuarios');
  console.log('Usuarios nuevos: ' + creados + '. Usuarios en la tabla: ' + total.rows[0].cantidad + '.');
} catch (error) {
  console.error('No fue posible inicializar la base de datos: ' + error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
