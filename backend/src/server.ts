import express from 'express';
import cors from 'cors';
import { getDatabase, closeDatabase } from './db/database';
import { productRoutes } from './routes/products';
import { scrapeRoutes } from './routes/scrape';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
getDatabase();

// Routes
app.use('/api/products', productRoutes);
app.use('/api/scrape', scrapeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`ShopTraf backend running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  closeDatabase();
  server.close();
  process.exit(0);
});
