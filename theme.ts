'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// DearGiver 테마 — Deep Teal / Trust Green 기반 팔레트
const sage: MantineColorsTuple = [
  '#e8f5f1',
  '#d1ebe3',
  '#a3d7c7',
  '#7bbfaa',
  '#2E7D6B',   // [4] Trust Green — Primary
  '#267060',
  '#1F5A4C',
  '#1F4A5A',   // [7] Deep Teal
  '#163D4A',
  '#0E2F39',
];

// Warm Gold 악센트 팔레트
const terracotta: MantineColorsTuple = [
  '#fdf6ec',
  '#f8ecd5',
  '#f0d8a8',
  '#e8c47c',
  '#D8A95F',   // [4] Warm Gold — Accent
  '#C9973F',
  '#B8883A',
  '#A07530',
  '#8A6428',
  '#74541F',
];

// Mist / Sand 팔레트
const warmBeige: MantineColorsTuple = [
  '#FBFCFC',
  '#F5F7F7',   // [1] Mist
  '#F3EEE6',   // [2] Sand
  '#E8E0D4',
  '#DCD2C2',
  '#CFC3AE',
  '#C1B39A',
  '#AD9D82',
  '#9A8A6E',
  '#87775C',
];

export const theme = createTheme({
  primaryColor: 'sage',
  colors: {
    sage,
    terracotta,
    warmBeige,
  },
  defaultRadius: 'md',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },
  other: {
    // 커스텀 컬러 변수들
    bgMist: '#F5F7F7',
    bgSand: '#F3EEE6',
    textDark: '#1A2E35',
    textMuted: '#5A6B6F',
  },
});
