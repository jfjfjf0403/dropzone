export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // 로컬 개발 환경이거나 KV 설정이 안 되어 있는 경우의 Fallback
  if (!url || !token) {
    return res.status(200).json([
      {
        "id": 1785142298914,
        "createdAt": 1785142646464,
        "type": "clip",
        "author": "JELLFI-_-",
        "content": "테스트 데이터입니다! Vercel KV 데이터베이스를 연결해주세요.",
        "upvotes": 100,
        "comments": 0
      }
    ]);
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      let posts = [];
      if (data.result) {
        posts = JSON.parse(data.result);
      }
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      // 1. 기존 게시글 가져오기
      const getRes = await fetch(`${url}/get/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const getData = await getRes.json();
      let posts = getData.result ? JSON.parse(getData.result) : [];

      // 2. 새 게시글 추가 (가장 앞에)
      const newPost = {
        id: Date.now(),
        createdAt: Date.now(),
        ...req.body,
        upvotes: 0,
        comments: 0
      };
      
      posts.unshift(newPost);

      // 최대 100개까지만 저장 (용량 관리)
      if (posts.length > 100) {
        posts = posts.slice(0, 100);
      }

      // 3. 다시 저장
      const setRes = await fetch(`${url}/set/posts`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([JSON.stringify(posts)])
      });

      if (!setRes.ok) {
        throw new Error('Failed to save to KV database');
      }

      return res.status(201).json(newPost);
    }

    // 그 외 메서드 처리
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
