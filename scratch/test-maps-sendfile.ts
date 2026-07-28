import express from 'express';
import http from 'http';
import mapsRoutes from '../src/routes/maps.routes';

const app = express();
const router = express.Router();
mapsRoutes(router);
app.use(router);

const server = app.listen(0, () => {
  const address = server.address() as any;
  const port = address.port;
  console.log(`Test maps server running on port ${port}`);

  // Test requesting image file computer.png from /api/maps/computer.png
  http.get(`http://localhost:${port}/api/maps/computer.png`, (res) => {
    console.log('GET /api/maps/computer.png Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    let bytesRead = 0;
    res.on('data', chunk => bytesRead += chunk.length);
    res.on('end', () => {
      console.log(`Bytes received: ${bytesRead}`);
      server.close();
      if (res.statusCode === 200 && res.headers['content-type']?.includes('image/png') && bytesRead > 0) {
        console.log('Test PASSED!');
        process.exit(0);
      } else {
        console.error('Test FAILED!');
        process.exit(1);
      }
    });
  });
});
