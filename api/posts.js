const RATE_LIMITS = {
  post: 10,    // 새 글 작성: 10초에 1회
  comment: 5,  // 댓글 작성: 5초에 1회
};

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // 로컬 개발 환경이거나 KV 설정이 안 되어 있는 경우의 Fallback
  if (!url || !token) {
    if (req.method === 'POST') {
      return res.status(201).json({
        id: Date.now(),
        createdAt: Date.now(),
        type: req.body?.type || "clip",
        author: req.body?.author || "Unknown",
        content: "[에러] Vercel KV 데이터베이스가 아직 연결되지 않았습니다!",
        upvotes: 0,
        comments: 0
      });
    }
    if (req.method === 'DELETE' || req.method === 'PATCH') {
      return res.status(200).json({ ok: true });
    }
    return res.status(200).json([]);
  }

  const getPosts = async () => {
    const getRes = await fetch(`${url}/get/posts_v3`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    let posts = [];
    if (getData.result) {
      try {
        posts = JSON.parse(getData.result);
        if (typeof posts === 'string') {
          posts = JSON.parse(posts);
        }
      } catch (e) {
        posts = [];
      }
    }
    return Array.isArray(posts) ? posts : [];
  };

  const savePosts = async (posts) => {
    const setRes = await fetch(`${url}/set/posts_v3`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(posts)
    });
    if (!setRes.ok) {
      throw new Error('Failed to save to KV database');
    }
  };

  // IP + action 단위로 짧은 쿨다운을 둬서 스팸성 연타 작성을 막는다.
  // 이미 쿨다운 중이면 false를 반환한다.
  const checkRateLimit = async (action, windowSec) => {
    const ip = getClientIp(req);
    const key = `ratelimit_${action}_${ip}`;
    const getRes = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    if (getData.result) return false;

    await fetch(`${url}/set/${key}?EX=${windowSec}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: '1'
    });
    return true;
  };

  try {
    if (req.method === 'GET') {
      const posts = await getPosts();
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      const allowed = await checkRateLimit('post', RATE_LIMITS.post);
      if (!allowed) {
        return res.status(429).json({ error: `너무 빠릅니다. ${RATE_LIMITS.post}초 후 다시 시도해주세요.` });
      }

      const posts = await getPosts();

      const newPost = {
        id: Date.now(),
        createdAt: Date.now(),
        ...req.body,
        upvotes: 0,
        comments: 0
      };

      posts.unshift(newPost);
      const trimmed = posts.length > 100 ? posts.slice(0, 100) : posts;

      await savePosts(trimmed);
      return res.status(201).json(newPost);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      const posts = await getPosts();
      const filtered = posts.filter(p => String(p.id) !== String(id));

      await savePosts(filtered);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      const posts = await getPosts();
      const idx = posts.findIndex(p => String(p.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const { action } = req.body || {};

      if (action === 'vote') {
        const delta = req.body?.delta === -1 ? -1 : 1;
        posts[idx].upvotes = (posts[idx].upvotes || 0) + delta;
      } else if (action === 'comment') {
        const allowed = await checkRateLimit('comment', RATE_LIMITS.comment);
        if (!allowed) {
          return res.status(429).json({ error: `너무 빠릅니다. ${RATE_LIMITS.comment}초 후 다시 시도해주세요.` });
        }

        const author = (req.body?.author || 'Guest').toString().slice(0, 50);
        const text = (req.body?.text || '').toString().trim().slice(0, 500);
        if (!text) {
          return res.status(400).json({ error: 'Empty comment' });
        }
        const comment = { id: Date.now(), author, text };
        posts[idx].commentsList = [...(posts[idx].commentsList || []), comment];
        posts[idx].comments = posts[idx].commentsList.length;
      } else if (action === 'deleteComment') {
        const commentId = req.body?.commentId;
        if (!commentId) {
          return res.status(400).json({ error: 'Missing commentId' });
        }
        posts[idx].commentsList = (posts[idx].commentsList || []).filter(
          c => String(c.id) !== String(commentId)
        );
        posts[idx].comments = posts[idx].commentsList.length;
      } else {
        return res.status(400).json({ error: 'Unknown action' });
      }

      await savePosts(posts);
      return res.status(200).json(posts[idx]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (req.method === 'POST') {
      return res.status(201).json({
        id: Date.now(),
        createdAt: Date.now(),
        type: "clip",
        author: "System Error",
        content: `[에러 발생]: ${err.message}`,
        upvotes: 0,
        comments: 0
      });
    }
    if (req.method === 'DELETE' || req.method === 'PATCH') {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json([]);
  }
}
