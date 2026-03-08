import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'local-db-api',
            configureServer(server) {
                // API to save data to database.json
                server.middlewares.use('/api/save', (req, res) => {
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', () => {
                        const dirPath = path.resolve(__dirname, 'src/data');
                        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

                        fs.writeFileSync(path.join(dirPath, 'database.json'), body);
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    });
                });

                // API to load data from database.json
                server.middlewares.use('/api/load', (req, res) => {
                    const dbPath = path.resolve(__dirname, 'src/data/database.json');
                    res.setHeader('Content-Type', 'application/json');
                    if (fs.existsSync(dbPath)) {
                        res.end(fs.readFileSync(dbPath));
                    } else {
                        res.end(JSON.stringify([]));
                    }
                });
            }
        }
    ]
});