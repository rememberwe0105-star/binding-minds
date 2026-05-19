// ==============================
// DearGiver — GiveBack Rewards 뱃지 정의
// ==============================

// --- 타입 ---
export type BadgeTier = 'beginner' | 'intermediate' | 'advanced';

export interface BadgeDefinition {
  id: string;
  name: string;
  /** Tabler icon name (IconXxx 형태) */
  icon: string;
  /** 뱃지 이모지 — UI 표시용 */
  emoji: string;
  tier: BadgeTier;
  /** 사용자에게 보여주는 획득 조건 요약 */
  conditionLabel: string;
  /** 획득 시 표시할 메시지 */
  unlockMessage: string;
  /** 뱃지 색상 (Mantine color) */
  color: string;
}

// --- 뱃지 12개 정의 (GIVEBACK_REWARDS.md 기준) ---
export const BADGES: BadgeDefinition[] = [
  // ── Beginner Tier (4개) ──
  {
    id: 'welcome-giver',
    name: 'Welcome Giver',
    icon: 'IconSeedling',
    emoji: '🌱',
    tier: 'beginner',
    conditionLabel: 'Sign up for DearGiver',
    unlockMessage: '🌱 Welcome to DearGiver! Your giving journey starts right here.',
    color: 'green',
  },
  {
    id: 'first-light',
    name: 'First Light',
    icon: 'IconSparkles',
    emoji: '✨',
    tier: 'beginner',
    conditionLabel: 'Make your first donation',
    unlockMessage: '✨ Your first donation — what a brilliant first step! You\'re already making a difference.',
    color: 'yellow',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    icon: 'IconCompass',
    emoji: '🔍',
    tier: 'beginner',
    conditionLabel: 'Donate to 2+ different categories',
    unlockMessage: '🔍 You\'re exploring across different causes — a wider lens means wider impact!',
    color: 'blue',
  },
  {
    id: 'neighbour',
    name: 'Neighbour',
    icon: 'IconHome',
    emoji: '🏠',
    tier: 'beginner',
    conditionLabel: 'Donate to a local project',
    unlockMessage: '🏠 Supporting your local community — that\'s the Kiwi spirit right there.',
    color: 'teal',
  },

  // ── Intermediate Tier (4개) ──
  {
    id: 'steady-heart',
    name: 'Steady Heart',
    icon: 'IconHeartHandshake',
    emoji: '💚',
    tier: 'intermediate',
    conditionLabel: 'Donate 3 months in a row',
    unlockMessage: '💚 Three months in a row! Consistency is one of the most powerful gifts you can give.',
    color: 'green',
  },
  {
    id: 'bridge-builder',
    name: 'Bridge Builder',
    icon: 'IconBridge',
    emoji: '🌉',
    tier: 'intermediate',
    conditionLabel: 'Donate to 5 different charities',
    unlockMessage: '🌉 Five charities and counting! You\'re building bridges right across Aotearoa.',
    color: 'indigo',
  },
  {
    id: 'centurion',
    name: 'Centurion',
    icon: 'IconMoneybag',
    emoji: '💯',
    tier: 'intermediate',
    conditionLabel: 'Reach $100 in total donations',
    unlockMessage: '💯 $100 donated! Your giving is creating real, lasting change out there.',
    color: 'orange',
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    icon: 'IconTargetArrow',
    emoji: '🎯',
    tier: 'intermediate',
    conditionLabel: 'Donate across all 6 categories',
    unlockMessage: '🎯 All six categories — your generosity truly knows no bounds!',
    color: 'grape',
  },

  // ── Advanced Tier (4개) ──
  {
    id: 'kiwi-champion',
    name: 'Kiwi Champion',
    icon: 'IconTrophy',
    emoji: '🥝',
    tier: 'advanced',
    conditionLabel: 'Donate 12 months in a row',
    unlockMessage: '🥝 Twelve months in a row! You\'re a true Kiwi Champion — Aotearoa is warmer for it.',
    color: 'green',
  },
  {
    id: 'thousand-star',
    name: 'Thousand Star',
    icon: 'IconStar',
    emoji: '⭐',
    tier: 'advanced',
    conditionLabel: 'Reach $1,000 in total donations',
    unlockMessage: '⭐ $1,000 donated! You\'re a shining star in New Zealand\'s giving community.',
    color: 'yellow',
  },
  {
    id: 'impact-leader',
    name: 'Impact Leader',
    icon: 'IconWorld',
    emoji: '🌍',
    tier: 'advanced',
    conditionLabel: 'Donate to 10+ different projects',
    unlockMessage: '🌍 Over 10 projects supported — you\'re an Impact Leader changing lives across New Zealand.',
    color: 'cyan',
  },
  {
    id: 'legendary-giver',
    name: 'Legendary Giver',
    icon: 'IconCrown',
    emoji: '🏆',
    tier: 'advanced',
    conditionLabel: 'Collect all other badges',
    unlockMessage: '🏆 All badges collected! You truly are a Legendary Giver — Aotearoa is better for it.',
    color: 'orange',
  },
];

// --- Tier 메타 ---
export const TIER_META: Record<BadgeTier, { label: string; color: string; description: string }> = {
  beginner: {
    label: 'Beginner',
    color: 'green',
    description: 'Start your giving journey',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'blue',
    description: 'Build lasting habits',
  },
  advanced: {
    label: 'Advanced',
    color: 'orange',
    description: 'Become a champion of change',
  },
};

// --- 기부자 등급 (Tier) ---
export type GiverTier = 'seedling' | 'grower' | 'bloomer' | 'guardian';

export interface GiverTierInfo {
  id: GiverTier;
  label: string;
  emoji: string;
  minBadges: number;
  color: string;
  description: string;
}

export const GIVER_TIERS: GiverTierInfo[] = [
  { id: 'seedling', label: 'Seedling', emoji: '🌱', minBadges: 0, color: 'green', description: 'Just getting started' },
  { id: 'grower', label: 'Grower', emoji: '🌿', minBadges: 3, color: 'teal', description: 'Growing your impact' },
  { id: 'bloomer', label: 'Bloomer', emoji: '🌸', minBadges: 6, color: 'pink', description: 'Blossoming generosity' },
  { id: 'guardian', label: 'Guardian', emoji: '🛡️', minBadges: 10, color: 'orange', description: 'Guardian of giving' },
];

/** 획득한 뱃지 수로 기부자 등급 계산 */
export function getGiverTier(unlockedCount: number): GiverTierInfo {
  // 역순으로 순회하여 가장 높은 자격을 반환
  for (let i = GIVER_TIERS.length - 1; i >= 0; i--) {
    if (unlockedCount >= GIVER_TIERS[i].minBadges) return GIVER_TIERS[i];
  }
  return GIVER_TIERS[0];
}

/** 다음 기부자 등급 정보 (진행도 표시용) */
export function getNextGiverTier(unlockedCount: number): GiverTierInfo | null {
  const current = getGiverTier(unlockedCount);
  const idx = GIVER_TIERS.findIndex((t) => t.id === current.id);
  return idx < GIVER_TIERS.length - 1 ? GIVER_TIERS[idx + 1] : null;
}
