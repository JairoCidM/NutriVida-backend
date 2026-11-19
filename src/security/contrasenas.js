import bcrypt from 'bcryptjs';

const COSTO = 12;

export function generarHash(contrasena) {
  return bcrypt.hash(contrasena, COSTO);
}

export function compararContrasena(contrasena, hash) {
  return bcrypt.compare(contrasena, hash);
}
