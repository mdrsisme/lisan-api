import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'sukses',
    pesan: 'LISAN API v1 berjalan dengan normal'
  });
});

app.use('/api/v1', routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    sukses: false,
    pesan: 'Endpoint tidak ditemukan'
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Galat Server:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    sukses: false,
    pesan: message,
    galat: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;