import express from 'express';
import http from 'http';
import polygonsRoutes from '../src/routes/polygons.routes';

const app = express();
const router = express.Router();
polygonsRoutes(router);
app.use(router);

const server = app.listen(0, () => {
  const address = server.address() as any;
  const port = address.port;
  console.log(`Test server running on port ${port}`);

  // Test requesting /api/polygons/tree/diagram3
  http.get(`http://localhost:${port}/api/polygons/tree/diagram3`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('GET /api/polygons/tree/diagrams Status:', res.statusCode);
      console.log('Response:', data);
      server.close();
      if (res.statusCode === 200 && data.includes('filename')) {
        console.log('Test PASSED!');
        process.exit(0);
      } else {
        console.error('Test FAILED!');
        process.exit(1);
      }
    });
  });
});
