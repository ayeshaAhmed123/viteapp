#!/usr/bin/env node

// Direct import of vite's server
import { createServer } from './node_modules/vite/dist/node/index.js';

async function startServer() {
  try {
    const server = await createServer({
      // You can add your vite config options here
      configFile: './vite.config.ts',
      root: process.cwd(),
      server: {
        port: 8080
      }
    });
    
    await server.listen();
    
    server.printUrls();
    console.log('Vite server started successfully');
  } catch (e) {
    console.error('Failed to start Vite server:', e);
    process.exit(1);
  }
}

startServer();

