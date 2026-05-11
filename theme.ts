'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Earthy & Organic 테마 - Sage Green 기반 팔레트
const sage: MantineColorsTuple = [
  '#f2f4ef',
  '#e3e7dc',
  '#c5cdb7',
  '#a6b390',
  '#8f9779',
  '#7a8563',
  '#6c7854',
  '#5b6643',
  '#4e5a38',
  '#424d2d',
];

// Terracotta 악센트 팔레트
const terracotta: MantineColorsTuple = [
  '#fef0ed',
  '#f8ddd6',
  '#f0b6a8',
  '#e88d77',
  '#e2725b',
  '#dc5a40',
  '#d94f33',
  '#c14025',
  '#ac381f',
  '#962e17',
];

// Warm Beige 팔레트
const warmBeige: MantineColorsTuple = [
  '#fefdfb',
  '#faf9f6',
  '#f5f0e8',
  '#ede5d6',
  '#e3d7c2',
  '#d8c8ad',
  '#cdb99a',
  '#b9a27e',
  '#a68e67',
  '#937b54',
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
    bgWarm: '#FAF9F6',
    textDark: '#3D3229',
    textMuted: '#6B5E50',
  },
});
