# DropZone

PUBG(배틀그라운드) 전적 검색 및 커뮤니티 웹앱. 닉네임으로 실제 PUBG 전적을 조회하고, 클립/디스커션 피드를 공유할 수 있습니다.

- **배포**: [dropzone-eosin-iota.vercel.app](https://dropzone-eosin-iota.vercel.app/)
- **저장소**: [jfjfjf0403/dropzone](https://github.com/jfjfjf0403/dropzone)

## 주요 기능

- PUBG 닉네임 검색 → 실제 전적/랭크 조회 (PUBG 공식 API)
- 즐겨찾기 프로필 저장 (localStorage)
- 피드: 게시글/클립 작성 및 조회
- 프로게이머 세팅(Pro Sens), 맵 정보, 멤버 목록, 뉴스

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS 4, Framer Motion, lucide-react
- 로컬 개발: Express (`server.js`) + `db.json` 파일 DB
- 배포(Vercel): Serverless Function (`api/posts.js`) + Vercel KV

## 로컬 실행

```bash
npm install
```

`.env` 파일에 PUBG API 키 설정 (`.env.example` 참고):

```
VITE_PUBG_API_KEY=발급받은_API_KEY
```

```bash
npm run dev
```

`vite:dev`(5173)와 로컬 API 서버(`server.js`, 3001)가 동시에 실행됩니다.

## 배포

Vercel에 GitHub 연동 배포되어 있습니다. `vercel.json`이 `/api/pubg`, `/api/steam`, `/api/translate`를 외부 API로 프록시하며, 피드 게시글은 `api/posts.js`를 통해 Vercel KV에 저장됩니다 (환경변수 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 필요).
