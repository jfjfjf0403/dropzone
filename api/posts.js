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
    if (req.method === 'DELETE') {
      return res.status(200).json({ ok: true });
    }
    return res.status(200).json([]);
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/posts_v3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      let posts = [];
      if (data.result) {
        try {
          posts = JSON.parse(data.result);
          // If it accidentally parsed into a string, parse again
          if (typeof posts === 'string') {
            posts = JSON.parse(posts);
          }
        } catch (e) {
          posts = [];
        }
      }
      return res.status(200).json(Array.isArray(posts) ? posts : []);
    }

    if (req.method === 'POST') {
      // 1. 기존 게시글 가져오기
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
      if (!Array.isArray(posts)) posts = [];

      // 2. 새 게시글 추가
      const newPost = {
        id: Date.now(),
        createdAt: Date.now(),
        ...req.body,
        upvotes: 0,
        comments: 0
      };
      
      posts.unshift(newPost);
      if (posts.length > 100) posts = posts.slice(0, 100);

      // 3. 다시 저장
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

      return res.status(201).json(newPost);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      // 1. 기존 게시글 가져오기
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
      if (!Array.isArray(posts)) posts = [];

      // 2. 대상 게시글 제거
      const filtered = posts.filter(p => String(p.id) !== String(id));

      // 3. 다시 저장
      const setRes = await fetch(`${url}/set/posts_v3`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filtered)
      });

      if (!setRes.ok) {
        throw new Error('Failed to save to KV database');
      }

      return res.status(200).json({ ok: true });
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
    if (req.method === 'DELETE') {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json([]);
  }
}
