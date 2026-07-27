// src/services/pubgApi.ts

const API_BASE_URL = '/api/pubg/shards/steam';
const API_KEY = import.meta.env.VITE_PUBG_API_KEY;

export interface PlayerData {
  accountId: string;
  name: string;
}

// Add tier and rankPoints
export interface PlayerStats {
  kills: number;
  deaths: number;
  wins: number;
  roundsPlayed: number;
  top10s: number;
  headshotKills: number;
  damageDealt: number;
  kd: string;
  winRate: string;
  top10Rate: string;
  avgDamage: string;
  headshotRate: string;
  rawWins: number;
  rawAvgDamage: number;
  roundMostKills: number;
  longestKill: number;
  revives: number;
  assists: number;
  teamKills: number;
  roadKills: number;
  heals: number;
  walkDistance: number;
  vehicleDestroys: number;
  timeSurvived: number;
  avgTimeSurvived: string;
  tier: string;
  rankPoints: number;
  
  modes?: {
    rankedSquad: Partial<PlayerStats> | null;
    normalSolo: Partial<PlayerStats> | null;
    normalDuo: Partial<PlayerStats> | null;
    normalSquad: Partial<PlayerStats> | null;
  };
  
  recentMatches?: RecentMatch[];
}

export interface MatchPlayer {
  name: string;
  kills: number;
  damageDealt: number;
  walkDistance: number;
  timeSurvived: number;
}

export interface MatchTeam {
  rank: number;
  players: MatchPlayer[];
  totalKills: number;
  totalDamage: number;
}

export interface RecentMatch {
  id: string;
  mapName: string;
  gameMode: string;
  createdAt: string;
  duration: number;
  stats: {
    kills: number;
    damageDealt: number;
    winPlace: number;
    timeSurvived: number;
  };
  teams?: MatchTeam[];
}

function formatGameMode(mode: string, type: string): string {
  let modeStr = mode;
  if (mode.includes('squad')) modeStr = '스쿼드';
  else if (mode.includes('duo')) modeStr = '듀오';
  else if (mode.includes('solo')) modeStr = '솔로';
  
  if (mode.includes('fpp')) modeStr += ' (1인칭)';
  
  if (type === 'custom') return `커스텀 ${modeStr}`;
  if (type === 'event' || type === 'arcade') return `아케이드/이벤트`;
  if (type === 'training') return `훈련장`;
  
  return modeStr;
}

async function fetchWithCache(url: string, options: any, ttlSeconds = 300, forceRefresh = false): Promise<any> {
  const cacheKey = `pubg_api_${url}`;
  
  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { time, data } = JSON.parse(cached);
        if (Date.now() - time < ttlSeconds * 1000) {
          return data;
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }
  
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  
  const data = await res.json();
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data }));
  } catch (e) {
    console.warn('LocalStorage quota exceeded');
  }
  
  return data;
}

let cachedSeasonId: string | null = null;
async function getCurrentSeasonId(forceRefresh: boolean = false): Promise<string> {
  if (cachedSeasonId && !forceRefresh) return cachedSeasonId;
  const data = await fetchWithCache(`${API_BASE_URL}/seasons`, {
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/vnd.api+json' }
  }, 3600, forceRefresh);
  const current = data.data.find((s: any) => s.attributes.isCurrentSeason);
  cachedSeasonId = current.id;
  return current.id;
}

// 1. 닉네임으로 Account ID 가져오기
export async function getPlayerAccountId(nickname: string, forceRefresh: boolean = false): Promise<PlayerData | null> {
  if (nickname === 'JELLFI-_-') {
    return { accountId: 'account.60467965e3234f00bd9b9fa29d2b1990', name: 'JELLFI-_-' };
  }

  if (!API_KEY) {
    console.warn('No PUBG API KEY found. Returning mock data for:', nickname);
    return { accountId: `mock.${nickname}`, name: nickname };
  }

  try {
    const data = await fetchWithCache(`${API_BASE_URL}/players?filter[playerNames]=${nickname}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/vnd.api+json'
      }
    }, 3600, forceRefresh); // Cache player ids for 1 hour
    return {
      accountId: data.data[0].id,
      name: data.data[0].attributes.name
    };
  } catch (error) {
    console.error(`Error or Rate Limit fetching player ${nickname}:`, error);
    throw error;
  }
}

function parseModeStats(statsObj: any, tier: string = 'Unranked', rankPoints: number = 0): Partial<PlayerStats> | null {
  if (!statsObj || (statsObj.roundsPlayed === 0 && statsObj.losses === 0 && statsObj.wins === 0)) {
    return null;
  }
  
  const rounds = statsObj.roundsPlayed || 1;
  const deaths = statsObj.losses || (rounds - (statsObj.wins || 0)) || 1;

  return {
    kills: statsObj.kills || 0,
    deaths: deaths,
    wins: statsObj.wins || 0,
    roundsPlayed: rounds,
    top10s: statsObj.top10s || 0,
    headshotKills: statsObj.headshotKills || 0,
    damageDealt: statsObj.damageDealt || 0,
    kd: ((statsObj.kills || 0) / deaths).toFixed(2),
    winRate: (((statsObj.wins || 0) / rounds) * 100).toFixed(1) + '%',
    top10Rate: (((statsObj.top10s || 0) / rounds) * 100).toFixed(1) + '%',
    avgDamage: ((statsObj.damageDealt || 0) / rounds).toFixed(1),
    headshotRate: (((statsObj.headshotKills || 0) / (statsObj.kills || 1)) * 100).toFixed(1) + '%',
    rawWins: statsObj.wins || 0,
    rawAvgDamage: (statsObj.damageDealt || 0) / rounds,
    roundMostKills: statsObj.roundMostKills || 0,
    longestKill: statsObj.longestKill || 0,
    revives: statsObj.revives || 0,
    assists: statsObj.assists || 0,
    teamKills: statsObj.teamKills || 0,
    roadKills: statsObj.roadKills || 0,
    heals: statsObj.heals || 0,
    walkDistance: statsObj.walkDistance || 0,
    vehicleDestroys: statsObj.vehicleDestroys || 0,
    timeSurvived: statsObj.timeSurvived || 0,
    avgTimeSurvived: ((statsObj.timeSurvived || 0) / rounds / 60).toFixed(2),
    tier,
    rankPoints
  };
}

// 2. Account ID로 시즌 통계 가져오기 (현재 시즌)
export async function getPlayerStats(accountId: string, fullProfile: boolean = false, forceRefresh: boolean = false): Promise<PlayerStats | null> {
  if (!API_KEY) {
    throw new Error('PUBG API Key missing.');
  }

  try {
    if (accountId.startsWith('mock.')) throw new Error('Mock account');

    // 1. 현재 시즌 ID 가져오기
    const seasonId = await getCurrentSeasonId(forceRefresh);

    // 2. 현재 시즌의 일반(Normal) 통계 가져오기
    let gameModes: any = {};
    try {
      const data = await fetchWithCache(`${API_BASE_URL}/players/${accountId}/seasons/${seasonId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/vnd.api+json' }
      }, 300, forceRefresh);
      gameModes = data.data?.attributes?.gameModeStats || {};
    } catch (e) {
      console.warn('Normal stats not found for this season', e);
    }
    
    // 3. 현재 시즌의 랭크(Ranked) 통계 가져오기
    let tier = 'Unranked';
    let rankPoints = 0;
    let rankedSquadMode: Partial<PlayerStats> | null = null;
    try {
      const rankedData = await fetchWithCache(`${API_BASE_URL}/players/${accountId}/seasons/${seasonId}/ranked`, {
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/vnd.api+json' }
      }, 300, forceRefresh);
      const rankedGameModes = rankedData.data?.attributes?.rankedGameModeStats || {};
      const fppStats = rankedGameModes['squad-fpp'];
      const tppStats = rankedGameModes['squad'];
      
      let stats = tppStats; // Default to TPP
      if (fppStats && tppStats) {
        stats = (fppStats.roundsPlayed > tppStats.roundsPlayed) ? fppStats : tppStats;
      } else if (fppStats) {
        stats = fppStats;
      }
      
      if (stats) {
        tier = stats.currentTier ? `${stats.currentTier.tier} ${stats.currentTier.subTier}` : 'Unranked';
        rankPoints = stats.currentRankPoint || 0;
        rankedSquadMode = parseModeStats(stats, tier, rankPoints);
      }
    } catch (e) {
      console.warn('Ranked stats failed', e);
    }
    
    // 4. 일반 모드 파싱 (현재 시즌)
    // Choose the best primary mode for backward compatibility
    let bestMode = 'squad-fpp';
    let maxRounds = 0;
    for (const [mode, stats] of Object.entries(gameModes)) {
      const modeStats = stats as any;
      if (modeStats.roundsPlayed && modeStats.roundsPlayed > maxRounds) {
        maxRounds = modeStats.roundsPlayed;
        bestMode = mode;
      }
    }
    const primaryStats = parseModeStats(gameModes[bestMode], tier, rankPoints) || rankedSquadMode || {
      kills: 0, deaths: 1, wins: 0, roundsPlayed: 0, top10s: 0, headshotKills: 0, damageDealt: 0,
      kd: '0.00', winRate: '0.0%', top10Rate: '0.0%', avgDamage: '0.0', headshotRate: '0.0%',
      rawWins: 0, rawAvgDamage: 0, roundMostKills: 0, longestKill: 0, revives: 0, assists: 0,
      teamKills: 0, roadKills: 0, heals: 0, walkDistance: 0, vehicleDestroys: 0, tier: tier, rankPoints: rankPoints
    };
    
    const getMode = (fppKey: string, tppKey: string) => {
      const fpp = gameModes[fppKey];
      const tpp = gameModes[tppKey];
      const fppRounds = fpp?.roundsPlayed || 0;
      const tppRounds = tpp?.roundsPlayed || 0;
      
      if (fppRounds > 0 && fppRounds >= tppRounds) return parseModeStats(fpp);
      if (tppRounds > 0) return parseModeStats(tpp);
      // If both 0, just pass fpp to get null
      return parseModeStats(fpp);
    };

    const modes = {
      rankedSquad: rankedSquadMode,
      normalSolo: getMode('solo-fpp', 'solo'),
      normalDuo: getMode('duo-fpp', 'duo'),
      normalSquad: getMode('squad-fpp', 'squad'),
    };

    // 3. Fetch Recent Matches (Up to 3) - ONLY IF fullProfile is true to save API rate limits
    const recentMatches: RecentMatch[] = [];
    if (fullProfile) {
      try {
        // First get player matches list
        const playerData = await fetchWithCache(`${API_BASE_URL}/players/${accountId}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/vnd.api+json' }
        }, 300, forceRefresh);
        
        const matchIds = playerData.data?.relationships?.matches?.data?.map((m: any) => m.id) || [];
        
        // Fetch up to 5 recent matches
        const matchesToFetch = matchIds.slice(0, 5);
        for (const matchId of matchesToFetch) {
          try {
            const matchData = await fetchWithCache(`${API_BASE_URL}/matches/${matchId}`, {
              headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/vnd.api+json' }
            }, 86400); // Matches never change, cache for 24h (don't pass forceRefresh)
            
            const matchInfo = matchData.data.attributes;
            
            // Collect all participants for building teams
            const participantsMap = new Map<string, any>();
            matchData.included?.forEach((item: any) => {
              if (item.type === 'participant') {
                participantsMap.set(item.id, item);
              }
            });

            // Build teams from rosters
            const teams: MatchTeam[] = [];
            matchData.included?.forEach((item: any) => {
              if (item.type === 'roster') {
                const rank = item.attributes.stats.rank || 999;
                const pIds = item.relationships?.participants?.data?.map((p: any) => p.id) || [];
                
                let totalKills = 0;
                let totalDamage = 0;
                const players: MatchPlayer[] = [];
                
                for (const pid of pIds) {
                  const pData = participantsMap.get(pid);
                  if (pData) {
                    const stats = pData.attributes.stats;
                    totalKills += stats.kills;
                    totalDamage += stats.damageDealt;
                    players.push({
                      name: stats.name,
                      kills: stats.kills,
                      damageDealt: stats.damageDealt,
                      walkDistance: stats.walkDistance,
                      timeSurvived: stats.timeSurvived
                    });
                  }
                }
                
                if (players.length > 0) {
                  teams.push({ rank, players, totalKills, totalDamage });
                }
              }
            });
            
            // Sort teams by rank ascending
            teams.sort((a, b) => a.rank - b.rank);
            
            // Find the player's participant in included telemetry
            const participant = matchData.included?.find((item: any) => 
              item.type === 'participant' && item.attributes.stats.playerId === accountId
            );
            
            if (participant) {
              recentMatches.push({
                id: matchId,
                mapName: matchInfo.mapName,
                gameMode: formatGameMode(matchInfo.gameMode, matchInfo.matchType),
                createdAt: matchInfo.createdAt,
                duration: matchInfo.duration,
                stats: {
                  kills: participant.attributes.stats.kills,
                  damageDealt: participant.attributes.stats.damageDealt,
                  winPlace: participant.attributes.stats.winPlace,
                  timeSurvived: participant.attributes.stats.timeSurvived
                },
                teams
              });
            }
          } catch (e) {
            console.warn(`Failed to fetch match ${matchId}`, e);
          }
        }
      } catch (e) {
        console.warn('Recent matches failed', e);
      }
    }

    return {
      ...(primaryStats as PlayerStats),
      modes,
      recentMatches
    };
  } catch (error) {
    console.error(`Error fetching stats for ${accountId}:`, error);
    throw error;
  }
}

// 3. 커뮤니티(다수 유저) 통계 일괄 가져오기
export async function getCommunityStats(nicknames: string[], forceRefresh: boolean = false): Promise<Array<{ name: string, stats: PlayerStats }>> {
  const promises = nicknames.map(async (nickname) => {
    try {
      const account = await getPlayerAccountId(nickname, forceRefresh);
      if (account) {
        const stats = await getPlayerStats(account.accountId, false, forceRefresh);
        if (stats) {
          return { name: nickname, stats };
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch stats for ${nickname}`, e);
    }
    return null;
  });

  const results = await Promise.all(promises);
  return results.filter((r): r is { name: string, stats: PlayerStats } => r !== null);
}
