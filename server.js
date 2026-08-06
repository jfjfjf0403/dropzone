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

// IP + action 단위 쿨다운 (로컬 개발용 in-memory 구현, 서버 재시작 시 초기화됨)
const RATE_LIMITS = { post: 10, comment: 5 };
const lastActionAt = new Map();

function checkRateLimit(req, action, windowSec) {
  const key = `${action}_${req.ip}`;
  const now = Date.now();
  const last = lastActionAt.get(key) || 0;
  if (now - last < windowSec * 1000) return false;
  lastActionAt.set(key, now);
  return true;
}

app.get('/api/posts', (req, res) => {
  const db = getDB();
  res.json(db.posts);
});

app.post('/api/posts', (req, res) => {
  if (!checkRateLimit(req, 'post', RATE_LIMITS.post)) {
    return res.status(429).json({ error: `너무 빠릅니다. ${RATE_LIMITS.post}초 후 다시 시도해주세요.` });
  }

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

app.patch('/api/posts', (req, res) => {
  const db = getDB();
  const id = req.query.id;
  const idx = db.posts.findIndex(p => String(p.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { action } = req.body || {};

  if (action === 'vote') {
    const delta = req.body?.delta === -1 ? -1 : 1;
    db.posts[idx].upvotes = (db.posts[idx].upvotes || 0) + delta;
  } else if (action === 'comment') {
    if (!checkRateLimit(req, 'comment', RATE_LIMITS.comment)) {
      return res.status(429).json({ error: `너무 빠릅니다. ${RATE_LIMITS.comment}초 후 다시 시도해주세요.` });
    }

    const author = (req.body?.author || 'Guest').toString().slice(0, 50);
    const text = (req.body?.text || '').toString().trim().slice(0, 500);
    if (!text) {
      return res.status(400).json({ error: 'Empty comment' });
    }
    const comment = { id: Date.now(), author, text };
    db.posts[idx].commentsList = [...(db.posts[idx].commentsList || []), comment];
    db.posts[idx].comments = db.posts[idx].commentsList.length;
  } else if (action === 'deleteComment') {
    const commentId = req.body?.commentId;
    if (!commentId) {
      return res.status(400).json({ error: 'Missing commentId' });
    }
    db.posts[idx].commentsList = (db.posts[idx].commentsList || []).filter(
      c => String(c.id) !== String(commentId)
    );
    db.posts[idx].comments = db.posts[idx].commentsList.length;
  } else {
    return res.status(400).json({ error: 'Unknown action' });
  }

  saveDB(db);
  res.json(db.posts[idx]);
});

app.listen(PORT, () => {
  console.log(`Local API server running on port ${PORT}`);
});
