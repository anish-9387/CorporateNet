import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { designService } from '../services/design';
import { initialDesign } from './seed-data';

async function main() {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri('corporatenet_demo');
  process.env.MONGODB_URI = uri;
  process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
  await mongoose.connect(uri);
  await designService.create(initialDesign);
  const { app } = await import('../app.js');
  const port = Number(process.env.PORT ?? 3000);
  const server = app.listen(port, '127.0.0.1', () => console.log(`Seeded demo API ready at http://localhost:${port}/api/v1 (temporary data)`));
  const shutdown = () => server.close(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => { console.error(error); process.exit(1); });
