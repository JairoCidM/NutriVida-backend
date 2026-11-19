import { crearApp } from './app.js';
import { crearPool } from './db/pool.js';

const puerto = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const origenes = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

const app = crearApp({ origenes: origenes, pool: crearPool() });

app.listen(puerto, host, () => {
  console.log('API de NutriVida escuchando en el puerto ' + puerto);
});
