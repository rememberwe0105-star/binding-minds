// ==============================
// DearGiver — 카테고리 아이콘 매핑
// 사이트 전체에서 일관된 아이콘을 사용하기 위해 중앙화
// ==============================

import {
  IconLeaf,
  IconPaw,
  IconSchool,
  IconUsers,
  IconHeartPlus,
  IconPalette,
  IconMoodKid,
  IconHomeHeart,
  IconWheelchair,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';
import type { Category } from '@/data/campaigns';

export interface CategoryMeta {
  icon: TablerIcon;
  /** Mantine color token */
  color: string;
  /** Raw hex / CSS var for direct use */
  hex: string;
  label: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  'Environment': {
    icon: IconLeaf,
    color: 'sage',
    hex: 'var(--bm-sage)',
    label: 'Environment',
  },
  'Animal Welfare': {
    icon: IconPaw,
    color: 'teal',
    hex: '#4a7c71',
    label: 'Animal Welfare',
  },
  'Education': {
    icon: IconSchool,
    color: 'blue',
    hex: '#4a6fa5',
    label: 'Education',
  },
  'Community': {
    icon: IconUsers,
    color: 'orange',
    hex: 'var(--bm-terracotta)',
    label: 'Community',
  },
  'Health & Wellbeing': {
    icon: IconHeartPlus,
    color: 'red',
    hex: '#c0392b',
    label: 'Health & Wellbeing',
  },
  'Arts & Culture': {
    icon: IconPalette,
    color: 'violet',
    hex: '#7b5ea7',
    label: 'Arts & Culture',
  },
  'Children & Youth': {
    icon: IconMoodKid,
    color: 'pink',
    hex: '#c75d8a',
    label: 'Children & Youth',
  },
  'Food & Housing': {
    icon: IconHomeHeart,
    color: 'yellow',
    hex: '#b07d2b',
    label: 'Food & Housing',
  },
  'Disability': {
    icon: IconWheelchair,
    color: 'cyan',
    hex: '#2b7a8c',
    label: 'Disability',
  },
  'Māori, Pasifika & Ethnic Communities': {
    icon: IconUsersGroup,
    color: 'grape',
    hex: '#9c4d97',
    label: 'Māori, Pasifika & Ethnic Communities',
  },
};
