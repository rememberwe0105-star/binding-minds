'use client';

import { ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useFavorites, type FavoriteType } from '@/contexts/FavoritesContext';
import classes from './FavoriteButton.module.css';

interface FavoriteButtonProps {
  type: FavoriteType;
  id: string;
  /** 카드 오버레이 스타일 (이미지 위 절대 위치) */
  overlay?: boolean;
  /** 큰 사이즈 (상세 페이지용) */
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ type, id, overlay = false, size = 'sm' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(type, id);

  const iconSize = size === 'lg' ? 22 : size === 'md' ? 18 : 16;
  const btnSize = size === 'lg' ? 40 : size === 'md' ? 34 : 28;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();  // Link 클릭 전파 방지
    e.stopPropagation();
    toggleFavorite(type, id);
  };

  return (
    <ActionIcon
      variant="subtle"
      radius="xl"
      size={btnSize}
      onClick={handleClick}
      className={`${classes.btn} ${overlay ? classes.overlay : ''} ${active ? classes.active : ''}`}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      {active ? (
        <IconHeartFilled size={iconSize} className={classes.iconFilled} />
      ) : (
        <IconHeart size={iconSize} className={classes.iconOutline} />
      )}
    </ActionIcon>
  );
}
