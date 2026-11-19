import { HttpError } from '../errors/HttpError.js';

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_RUN = /^\d{6,8}[0-9Kk]$/;
export const ROLES = ['administrador', 'nutricionista', 'paciente'];
const NUTRICIONISTAS = ['NUT001', 'NUT002', 'NUT003', 'NUT004'];

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function digitoVerificador(numero) {
  let suma = 0;
  let multiplicador = 2;
  for (let i = numero.length - 1; i >= 0; i--) {
    suma = suma + Number(numero[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resultado = 11 - (suma % 11);
  if (resultado === 11) return '0';
  if (resultado === 10) return 'K';
  return String(resultado);
}

function validarObjeto(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new HttpError(400, 'Debes enviar un objeto JSON.');
  }
}

function validarRun(run, errores) {
  if (run === '') return errores.push('El RUN es requerido.');
  if (/[.-]/.test(run)) return errores.push('El RUN no debe contener puntos ni guion.');
  if (run.length < 7 || run.length > 9 || !PATRON_RUN.test(run)) return errores.push('El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.');
  if (digitoVerificador(run.slice(0, -1)) !== run.slice(-1).toUpperCase()) errores.push('El dígito verificador del RUN no es correcto.');
}

function validarCorreo(correo, errores) {
  if (correo === '') return errores.push('El correo es requerido.');
  if (correo.length > 100) return errores.push('El correo no puede superar los 100 caracteres.');
  if (!PATRON_CORREO.test(correo)) errores.push('El correo no es válido.');
}

function validarContrasena(contrasena, errores) {
  if (typeof contrasena !== 'string' || contrasena.length < 8) return errores.push('La contraseña debe tener al menos 8 caracteres.');
  if (contrasena.length > 72) errores.push('La contraseña no puede superar los 72 caracteres.');
}

function validarDatosPersonales(datos, errores, direccionObligatoria) {
  if (datos.nombre === '') errores.push('El nombre es requerido.');
  else if (datos.nombre.length > 50) errores.push('El nombre no puede superar los 50 caracteres.');
  if (datos.apellidos === '') errores.push('Los apellidos son requeridos.');
  else if (datos.apellidos.length > 100) errores.push('Los apellidos no pueden superar los 100 caracteres.');
  if (datos.telefono.length > 20) errores.push('El teléfono no puede superar los 20 caracteres.');
  if (direccionObligatoria && datos.direccion === '') errores.push('La dirección es requerida.');
  else if (datos.direccion.length > 300) errores.push('La dirección no puede superar los 300 caracteres.');
}

export function crearRegistroEntradaDto(cuerpo) {
  validarObjeto(cuerpo);
  const datos = {
    run: texto(cuerpo.run).toUpperCase(),
    nombre: texto(cuerpo.nombre),
    apellidos: texto(cuerpo.apellidos),
    correo: texto(cuerpo.correo).toLowerCase(),
    contrasena: cuerpo.contrasena,
    telefono: texto(cuerpo.telefono),
    direccion: texto(cuerpo.direccion)
  };
  const errores = [];
  validarRun(datos.run, errores);
  validarCorreo(datos.correo, errores);
  validarContrasena(datos.contrasena, errores);
  validarDatosPersonales(datos, errores, true);
  if (errores.length) throw new HttpError(400, 'Datos de registro inválidos.', errores);
  return datos;
}

export function crearLoginEntradaDto(cuerpo) {
  validarObjeto(cuerpo);
  const correo = texto(cuerpo.correo).toLowerCase();
  const contrasena = typeof cuerpo.contrasena === 'string' ? cuerpo.contrasena : '';
  const errores = [];
  if (correo === '') errores.push('El correo es requerido.');
  if (contrasena === '') errores.push('La contraseña es requerida.');
  if (errores.length) throw new HttpError(400, 'Datos de inicio de sesión inválidos.', errores);
  return { correo: correo, contrasena: contrasena };
}

export function crearUsuarioSalidaDto(fila) {
  return {
    id: fila.id,
    run: fila.run,
    nombre: fila.nombre,
    apellidos: fila.apellidos,
    correo: fila.correo,
    telefono: fila.telefono,
    direccion: fila.direccion,
    rol: fila.rol,
    nutricionistaCodigo: fila.nutricionista_codigo,
    activo: fila.activo
  };
}

export { texto, validarObjeto, validarRun, validarCorreo, validarContrasena, validarDatosPersonales, NUTRICIONISTAS };
