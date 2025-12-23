import app from './app';
import dotenv from 'dotenv';
import { Server } from 'http';

dotenv.config();

const PORT: number = parseInt(process.env.PORT || '5000', 10);
const ENV: string = process.env.NODE_ENV || 'development';

const server: Server = app.listen(PORT, () => {
  const divider = '='.repeat(45);
  console.log(divider);
  console.log(`SISTEM BACKEND LISAN`);
  console.log(divider);
  console.log(`Status : Aktif`);
  console.log(`Port   : ${PORT}`);
  console.log(`Mode   : ${ENV}`);
  console.log(`URL    : http://localhost:${PORT}`);
  console.log(divider);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') throw error;

  switch (error.code) {
    case 'EACCES':
      console.error(`Gagal: Port ${PORT} membutuhkan hak akses admin`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Gagal: Port ${PORT} sudah digunakan oleh aplikasi lain`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});