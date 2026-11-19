import jwt from 'jsonwebtoken';

const ALGORITMO = 'HS256';
const EMISOR = 'nutrivida-api';
const DESTINATARIO = 'nutrivida-web';

function secreto() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe estar configurado con al menos 32 caracteres.');
  }
  return process.env.JWT_SECRET;
}

export function segundosDeVigencia() {
  return Number(process.env.JWT_EXPIRA_SEGUNDOS || 3600);
}

export function emitirToken(usuario) {
  return jwt.sign({ rol: usuario.rol }, secreto(), {
    algorithm: ALGORITMO,
    subject: String(usuario.id),
    issuer: EMISOR,
    audience: DESTINATARIO,
    expiresIn: segundosDeVigencia()
  });
}

export function verificarToken(token) {
  return jwt.verify(token, secreto(), {
    algorithms: [ALGORITMO],
    issuer: EMISOR,
    audience: DESTINATARIO
  });
}
