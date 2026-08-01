import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

function getDB() {
  if (!fs.existsSync(dbPath)) {
    return { posts: [] };
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/posts', (req, res) => {
  const db = getDB();
  res.json(db.posts);
});

app.post('/api/posts', (req, res) => {
  const db = getDB();
  const newPost = {
    id: Date.now(),
    createdAt: Date.now(),
    ...req.body
  };

  // Add to the front
  db.posts = [newPost, ...db.posts];
  saveDB(db);

  res.json(newPost);
});

app.delete('/api/posts', (req, res) => {
  const db = getDB();
  const id = req.query.id;
  db.posts = db.posts.filter(p => String(p.id) !== String(id));
  saveDB(db);

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Local API server running on port ${PORT}`);
});
