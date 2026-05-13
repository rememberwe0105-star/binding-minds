'use client';

import { TextInput, Chip, Group, Select, Text, Box, Button, Drawer, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconFilter, IconX, IconHeartFilled } from '@tabler/icons-react';
import { CATEGORIES, REGIONS, SORT_OPTIONS, type Category, type Region, type SortOption } from '@/data/campaigns';
import classes from './CampaignFilters.module.css';

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  selectedRegion: Region | '';
  onRegionChange: (region: Region | '') => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
  showFavoritesOnly: boolean;
  onFavoritesToggle: (value: boolean) => void;
  favoriteCount: number;
}

export function ProjectFilters({
  search,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  selectedRegion,
  onRegionChange,
  sort,
  onSortChange,
  resultCount,
  totalCount,
  onClearAll,
  showFavoritesOnly,
  onFavoritesToggle,
  favoriteCount,
}: ProjectFiltersProps) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const hasActiveFilters = selectedCategories.length > 0 || selectedRegion !== '' || search !== '' || showFavoritesOnly;

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== cat));
    } else {
      onCategoriesChange([...selectedCategories, cat]);
    }
  };

  const FilterContent = () => (
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

      {/* 정렬 */}
      <Box mb={24}>
        <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={12}>
          Sort By
        </Text>
        <Select
          data={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={sort}
          onChange={(v) => onSortChange((v || 'popular') as SortOption)}
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
      {/* 상단: 검색 + 모바일 필터 버튼 + 결과 수 */}
      <div className={classes.topBar}>
        <TextInput
          placeholder="Search projects..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="md"
          radius="xl"
          className={classes.searchInput}
        />
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
          Showing <strong>{resultCount}</strong> of {totalCount} projects
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

      {/* 데스크톱 사이드바 */}
      <aside className={classes.sidebar}>
        <FilterContent />
      </aside>

      {/* 모바일 드로어 */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Filter Results"
        position="bottom"
        size="75%"
        hiddenFrom="md"
      >
        <FilterContent />
        <Button
          color="sage"
          fullWidth
          mt="md"
          radius="xl"
          onClick={closeDrawer}
        >
          Show {resultCount} Results
        </Button>
      </Drawer>
    </>
  );
}
