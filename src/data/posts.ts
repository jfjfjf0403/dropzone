export type PostType = 'discussion' | 'clip';

export interface Post {
  id: number;
  type: PostType;
  author: string;
  createdAt: number;
  content: string; // Used as title/short caption
  body?: string;   // Extended detailed text for modal
  upvotes: number;
  comments: number;
  tag: string;
  image?: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  commentsList?: CommentType[];
}

export const NOW = Date.now();
export const HOUR = 1000 * 60 * 60;
export const DAY = HOUR * 24;

export interface CommentType {
  id: number;
  author: string;
  text: string;
}

export const generateDummyComments = (count: number): CommentType[] => {
  const dummyTexts = [
    '완전 동감합니다!! 저도 요즘 똑같이 느끼고 있었어요.', 
    '와 폼 미쳤다 ㄷㄷㄷ', 
    '이건 진짜 레전드네요', 
    '나도 저렇게 쏘고싶다', 
    '핵 아님? 에임이 말이 안되는데', 
    '이 맵 언제부터 이렇게 바뀜?', 
    '공략 감사합니다! 바로 써먹어볼게요', 
    'ㅋㅋㅋ 반응속도 미쳤네'
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: NOW - Math.floor(Math.random() * 1000000) + i,
    author: `User_${Math.floor(Math.random() * 10000)}`,
    text: dummyTexts[Math.floor(Math.random() * dummyTexts.length)]
  }));
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    type: 'discussion',
    author: 'Erangel_King',
    createdAt: NOW - 2 * HOUR,
    content: 'M416 너프 체감 심한가요? 패치노트 보니까 반동이 많이 늘어난 것 같은데...',
    upvotes: 0,
    comments: 5,
    tag: 'Discussion'
  },
  {
    id: 2,
    type: 'clip',
    author: 'LootGblin',
    createdAt: NOW - 4 * HOUR,
    content: '배틀그라운드 트레일러 (유튜브 연동 테스트)',
    upvotes: 0,
    comments: 8,
    tag: 'Highlights',
    youtubeId: 'u1oqfdh4xBY', // PUBG Trailer
    duration: '2:15'
  },
  {
    id: 3,
    type: 'discussion',
    author: 'JELLFI-_-',
    createdAt: NOW - 1 * DAY,
    content: '[공지] 신규 맵 Rondo 업데이트 상세 안내',
    upvotes: 4500,
    comments: 120,
    tag: 'Official'
  },
  {
    id: 4,
    type: 'discussion',
    author: 'SniperElite',
    createdAt: NOW - 2 * DAY,
    content: '요즘 핫한 SMG 메타 정리해 드립니다.',
    upvotes: 0,
    comments: 4,
    tag: 'Guide'
  },
  {
    id: 5,
    type: 'clip',
    author: 'TGLTN_fan',
    createdAt: NOW - 5 * HOUR,
    content: 'TGLTN 미친 반사신경 모음.zip 🤯',
    upvotes: 100,
    comments: 7,
    tag: 'Highlights',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800',
    duration: '1:20'
  },
  {
    id: 6,
    type: 'discussion',
    author: 'Mokoko',
    createdAt: NOW - 30 * 60 * 1000,
    content: '이번 패치로 샷건 너무 사기 된 거 아닌가요? 근접에서 이길 수가 없음;;',
    upvotes: 0,
    comments: 6,
    tag: 'Discussion'
  },
  {
    id: 7,
    type: 'clip',
    author: 'GenG_Pio',
    createdAt: NOW - 2 * DAY + 4 * HOUR,
    content: 'PGC 결승전 마지막 페이즈 1v3 클러치 풀영상',
    upvotes: 3600,
    comments: 15,
    tag: 'Esports',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    duration: '3:15'
  },
  {
    id: 8,
    type: 'discussion',
    author: 'ChickenDinner',
    createdAt: NOW - 1.5 * DAY,
    content: '다들 경쟁전 돌리실 때 어떤 맵 밴하시나요? 저는 태이고가 영 안 맞네요.',
    upvotes: 0,
    comments: 9,
    tag: 'Question'
  },
  {
    id: 9,
    type: 'clip',
    author: 'Drive_By_Pro',
    createdAt: NOW - 6 * HOUR,
    content: '150km/h 주행 중 권총 헤드샷 킬! 영화 한 편 찍었습니다 🎬',
    upvotes: 1100,
    comments: 24,
    tag: 'Highlights',
    image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800',
    duration: '0:28'
  },
  {
    id: 10,
    type: 'discussion',
    author: 'SoloSurvivor',
    createdAt: NOW - 3 * DAY,
    content: '솔로 랭크 올리기 너무 힘드네요. 초반 교전 피하는 게 답일까요?',
    upvotes: 0,
    comments: 42,
    tag: 'Question'
  },
  {
    id: 11,
    type: 'clip',
    author: 'Beryl_Master',
    createdAt: NOW - 12 * HOUR,
    content: '베릴 무반동 스프레이 세팅 공유합니다 (수직/하프 비교)',
    upvotes: 0,
    comments: 55,
    tag: 'Guide',
    image: 'https://images.unsplash.com/photo-1595590424283-b8f1784cb2c8?auto=format&fit=crop&q=80&w=800',
    duration: '2:10'
  },
  {
    id: 12,
    type: 'discussion',
    author: 'PUBG_Leak',
    createdAt: NOW - 1 * HOUR,
    content: '🔥 [단독] 다음 달 출시 예정인 신규 총기 모델링 유출!',
    upvotes: 4200,
    comments: 310,
    tag: 'News',
    image: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 13,
    type: 'clip',
    author: 'GrenadeGod',
    createdAt: NOW - 2 * DAY,
    content: '수류탄 하나로 스쿼드 전멸시키는 각폭 장인 💥',
    upvotes: 2200,
    comments: 89,
    tag: 'Highlights',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
    duration: '0:55'
  },
  {
    id: 14,
    type: 'discussion',
    author: 'NoobSaibot',
    createdAt: NOW - 45 * 60 * 1000,
    content: '복귀 유저인데 요새 어떤 AR이 1티어인가요? AUG 아직 쓸만한가요?',
    upvotes: 0,
    comments: 21,
    tag: 'Question'
  },
  {
    id: 15,
    type: 'discussion',
    author: 'PUBG_Ari',
    createdAt: NOW - 5 * HOUR,
    content: '불법 프로그램 사용자 제보 캠페인 결과(260708-260721)',
    body: '[안내] 불법 프로그램 사용자 제보 캠페인 결과 안내(260708-260721)\n캠페인 기간 총 제보 수량: 104건\n제재 완료 수량: 32건\n제재 비율: 34%\n*검수 불가 건: 11건\n\n이전 캠페인을 통해 제보되었으나 제재되지 않았던 계정들에 대해서도 주목하여 지속적으로 살펴보고 있으며, 그 결과 지난 캠페인에서 제재되지 않았던 계정 중 1개 계정이 안티치트 솔루션에 의해 추가로 제재되었음을 안내드립니다.\n\n공지를 통해 안내드린 것처럼 불법 프로그램 사용자 제보 캠페인은 별도의 종료 안내가 있을 때까지 지속 운영되오니 플레이 중 불법 프로그램으로 인해 불편한 경험을 하실 경우, 인게임 신고와 더불어 캠페인을 통해 제보해 주시면 감사하겠습니다.',
    upvotes: 0,
    comments: 45,
    tag: 'Official'
  },
  {
    id: 16,
    type: 'discussion',
    author: 'DIFX',
    createdAt: NOW - 1 * DAY,
    content: 'pgc 2025 스킨',
    body: '재출시 희망합니다!!! 대회 스킨 갖고 싶은분들 많을 것 같아요\n\n[출처] pgc 2025 스킨 (배틀그라운드 공식카페 - PUBG: BATTLEGROUNDS) | 작성자 DIFX',
    upvotes: 0,
    comments: 18,
    tag: 'Discussion'
  },
  {
    id: 17,
    type: 'discussion',
    author: 'dakzzim',
    createdAt: NOW - 2 * DAY,
    content: '여러분 PUBG 판타지 보상 수령하셨나요?',
    body: '다들 PNC 판타지리그 투표하신거 보상받으셨나요?\n보상기간이라 안 받으신 분들은 확인해보세요~\n\n잊지 말고 지코인 챙겨가자구요~\n\n[출처] 여러분 PUBG 판타지 보상 수령하셨나요? (배틀그라운드 공식카페 - PUBG: BATTLEGROUNDS) | 작성자 서포터즈 dakzzim',
    upvotes: 0,
    comments: 52,
    tag: 'Question'
  }
];
