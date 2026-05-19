'use client';

import { useState, useRef, useEffect } from 'react';
import { Text, UnstyledButton, Box, Divider, Group } from '@mantine/core';
import { IconSearch, IconX, IconSparkles } from '@tabler/icons-react';
import { CATEGORIES, type Category } from '@/data/campaigns';
import { CATEGORY_META } from '@/data/categoryMeta';
import classes from './RichSearchInput.module.css';

interface RichSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onCategoryPick?: (cat: Category) => void;
  placeholder?: string;
}

export function RichSearchInput({
  value,
  onChange,
  onCategoryPick,
  placeholder = 'Search projects & charities...',
}: RichSearchInputProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCategoryClick = (cat: Category) => {
    onChange(''); // Clear any partial text
    onCategoryPick?.(cat);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const showDropdown = open && value.trim() === '';

  return (
    <div className={classes.wrap} ref={wrapRef}>
      {/* 검색창 */}
      <div className={`${classes.inputBox} ${open ? classes.focused : ''}`}>
        <IconSearch size={18} className={classes.iconLeft} />
        <input
          ref={inputRef}
          className={classes.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          aria-label="Search"
          autoComplete="off"
        />
        {value && (
          <button
            className={classes.clearBtn}
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      {/* 드롭다운 — 검색어가 없을 때만 */}
      {showDropdown && (
        <div className={classes.dropdown}>
          {/* 헤더 */}
          <Box px={16} pt={14} pb={6}>
            <Group gap={6}>
              <IconSparkles size={14} color="var(--bm-terracotta)" />
              <Text size="xs" fw={700} tt="uppercase" c="var(--bm-text-muted)" style={{ letterSpacing: '1px' }}>
                Explore Causes
              </Text>
            </Group>
          </Box>

          <Divider mx={16} mb={8} color="rgba(143,151,121,0.12)" />

          {/* 카테고리 그리드 */}
          <div className={classes.grid}>
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <UnstyledButton
                  key={cat}
                  className={classes.catChip}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ '--chip-color': meta.hex } as React.CSSProperties}
                >
                  <span className={classes.chipIcon}>
                    <Icon size={15} stroke={1.8} />
                  </span>
                  <span className={classes.chipText}>
                    {cat}
                  </span>
                </UnstyledButton>
              );
            })}
          </div>

          {/* 하단 힌트 */}
          <Box px={16} pt={6} pb={12}>
            <Text size="xs" c="dimmed" fs="italic">
              Or type to search by name, project, or cause.
            </Text>
          </Box>
        </div>
      )}
    </div>
  );
}
