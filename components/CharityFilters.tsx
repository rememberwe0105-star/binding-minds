'use client';

import { Chip, Group, Select, Text, Box, Button, Drawer, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFilter, IconX, IconHeartFilled } from '@tabler/icons-react';
import { CATEGORIES, REGIONS, type Region } from '@/data/campaigns';
import classes from './FiltersShared.module.css';

interface CharityFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedRegion: Region | '';
  onRegionChange: (region: Region | '') => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (value: boolean) => void;
  favoriteCount: number;
}

export function CharityFilters({
  search,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  selectedRegion,
  onRegionChange,
  resultCount,
  totalCount,
  onClearAll,
  showFavoritesOnly,
  onFavoritesToggle,
  favoriteCount,
}: CharityFiltersProps) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const hasActiveFilters = selectedCategories.length > 0 || selectedRegion !== '' || search !== '' || showFavoritesOnly;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== cat));
    } else {
      onCategoriesChange([...selectedCategories, cat]);
    }
  };

  const filterContent = (
    <>
      {/* 찜 필터 */}
      <Box mb={24}>
        <Button
          fullWidth
          variant={showFavoritesOnly ? 'filled' : 'outline'}
          color={showFavoritesOnly ? 'terracotta' : 'dark'}
          radius="xl"
          size="sm"
          leftSection={<IconHeartFilled size={14} />}
          rightSection={
            favoriteCount > 0 ? (
              <Badge size="xs" circle color={showFavoritesOnly ? 'white' : 'terracotta'} c={showFavoritesOnly ? 'var(--bm-terracotta)' : 'white'}>
                {favoriteCount}
              </Badge>
            ) : null
          }
          onClick={() => onFavoritesToggle(!showFavoritesOnly)}
          className={classes.favoritesBtn}
        >
          My Favorites
        </Button>
      </Box>

      {/* 카테고리 */}
      <Box mb={24}>
        <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={12}>
          Category
        </Text>
        <Group gap={8}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
              color="sage"
              variant="outline"
              size="sm"
            >
              {cat}
            </Chip>
          ))}
        </Group>
      </Box>

      {/* 지역 */}
      <Box mb={24}>
        <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={12}>
          Region
        </Text>
        <Select
          placeholder="All regions"
          data={[{ value: '', label: 'All Regions' }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
          value={selectedRegion}
          onChange={(v) => onRegionChange((v || '') as Region | '')}
          clearable
          size="sm"
        />
      </Box>

      {/* 필터 초기화 */}
      {hasActiveFilters && (
        <Button
          variant="subtle"
          color="terracotta"
          size="sm"
          leftSection={<IconX size={14} />}
          onClick={() => {
            onClearAll();
            closeDrawer();
          }}
          fullWidth
        >
          Clear All Filters
        </Button>
      )}
    </>
  );

  return (
    <>
      <div className={classes.topBar}>
        <Button
          variant="outline"
          color="dark"
          leftSection={<IconFilter size={16} />}
          onClick={openDrawer}
          className={classes.mobileFilterBtn}
          radius="xl"
        >
          Filters {hasActiveFilters && `(${selectedCategories.length + (selectedRegion ? 1 : 0)})`}
        </Button>
      </div>

      <div className={classes.resultBar}>
        <Text size="sm" c="dimmed">
          Showing <strong>{resultCount}</strong> of {totalCount} charities
        </Text>
        {hasActiveFilters && (
          <Button
            variant="subtle"
            color="terracotta"
            size="xs"
            leftSection={<IconX size={12} />}
            onClick={onClearAll}
            className={classes.desktopClear}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <aside className={classes.sidebar}>
        {filterContent}
      </aside>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Filter Results"
        position="bottom"
        size="75%"
        hiddenFrom="md"
      >
        {filterContent}
        <Button color="sage" fullWidth mt="md" radius="xl" onClick={closeDrawer}>
          Show {resultCount} Results
        </Button>
      </Drawer>
    </>
  );
}
