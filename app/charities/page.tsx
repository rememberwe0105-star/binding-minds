'use client';

import { useState, useMemo } from 'react';
import { Container, Title, Text, SimpleGrid, Button, Box } from '@mantine/core';

import { IconArrowDown } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OrganizationCard } from '@/components/OrganizationCard';
import { CharityFilters } from '@/components/CharityFilters';
import { RichSearchInput } from '@/components/RichSearchInput';
import { organizations as allOrganizations, filterOrganizations } from '@/data/organizations';
import { type Region } from '@/data/campaigns';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fraunces } from '@/lib/fonts';
import classes from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function CharitiesPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);

  const { isFavorite, getFavoriteCount } = useFavorites();

  // 페이지네이션 상태
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // 필터링된 Organizations
  const filteredOrgs = useMemo(() => {
    return filterOrganizations({
      search,
      categories: selectedCategories,
      region: selectedRegion,
    });
  }, [search, selectedCategories, selectedRegion]);

  // favorites 필터 + 정렬 적용
  const finalItems = useMemo(() => {
    let items = showFavoritesOnly
      ? filteredOrgs.filter((o) => isFavorite('organization', o.id))
      : filteredOrgs;

    if (sortBy) {
      const claimedRank = (s: string) => (s === 'partnered' ? 0 : s === 'claimed' ? 1 : 2);
      items = [...items].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'en');
        if (sortBy === 'claimed') {
          const diff = claimedRank(a.status) - claimedRank(b.status);
          return diff !== 0 ? diff : a.name.localeCompare(b.name, 'en');
        }
        // 'updated' — 갱신일 최신순, 갱신 기록 없는 프로필은 뒤로
        const au = a.lastUpdated ?? '';
        const bu = b.lastUpdated ?? '';
        return bu.localeCompare(au) || a.name.localeCompare(b.name, 'en');
      });
    }
    return items;
  }, [filteredOrgs, showFavoritesOnly, isFavorite, sortBy]);

  const visibleItems = finalItems.slice(0, visibleCount);
  const hasMore = visibleCount < finalItems.length;

  // 필터 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleCategoriesChange = (cats: string[]) => {
    setSelectedCategories(cats);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleRegionChange = (region: Region | '') => {
    setSelectedRegion(region);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSortChange = (value: string | null) => {
    setSortBy(value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleClearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRegion('');
    setShowFavoritesOnly(false);
    setSortBy(null);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <>
      <Header />
      <main className={classes.page}>
        <Container size="xl">
          {/* 페이지 헤더 */}
          <Box className={classes.pageHeader}>
            <Text size="md" fw={800} tt="uppercase" c="#eba98c" mb={8} style={{ letterSpacing: '1.5px' }}>
              Explore
            </Text>
            <Title order={1} className={`${classes.pageTitle} ${fraunces.className}`}>
              Browse Charities
            </Title>
            <Text fz={19} c="var(--dg-hero-muted)" maw={640} mt={10} mx="auto" lh={1.7}>
              Explore registered charities across Aotearoa New Zealand.
              Data sourced from NZ Charities Services.
            </Text>
            <div className={classes.searchWrap}>
              <RichSearchInput
                value={search}
                onChange={handleSearchChange}
                onCategoryPick={(cat) => {
                  // 같은 카테고리 클릭 → 해제, 다른 카테고리 → 교체
                  if (selectedCategories.length === 1 && selectedCategories[0] === cat) {
                    handleCategoriesChange([]);
                  } else {
                    handleCategoriesChange([cat]);
                  }
                }}
                placeholder="Search charities & causes..."
              />
            </div>
          </Box>

          {/* 레이아웃 */}
          <div className={classes.layout}>
            <div className={classes.filterColumn}>
              <CharityFilters
                search={search}
                onSearchChange={handleSearchChange}
                selectedCategories={selectedCategories}
                onCategoriesChange={handleCategoriesChange}
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                resultCount={finalItems.length}
                totalCount={allOrganizations.length}
                onClearAll={handleClearAll}
                showFavoritesOnly={showFavoritesOnly}
                onFavoritesToggle={setShowFavoritesOnly}
                favoriteCount={getFavoriteCount()}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>

            <div className={classes.gridColumn}>
              <div className={classes.mobileFilters}>
                <CharityFilters
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={handleCategoriesChange}
                  selectedRegion={selectedRegion}
                  onRegionChange={handleRegionChange}
                  resultCount={finalItems.length}
                  totalCount={allOrganizations.length}
                  onClearAll={handleClearAll}
                  showFavoritesOnly={showFavoritesOnly}
                  onFavoritesToggle={setShowFavoritesOnly}
                  favoriteCount={getFavoriteCount()}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                />
              </div>

              {finalItems.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Text size="xl" fw={700} c="var(--bm-text-dark)" mb={8}>
                    No results found
                  </Text>
                  <Text size="md" c="var(--bm-text-muted)" mb={20}>
                    Try adjusting your filters or search terms.
                  </Text>
                  <Button variant="outline" color="sage" radius="xl" onClick={handleClearAll}>
                    Clear All Filters
                  </Button>
                </Box>
              ) : (
                <>
                  <SimpleGrid
                    cols={{ base: 1, xs: 2, lg: 3 }}
                    spacing={{ base: 16, sm: 20 }}
                  >
                    {visibleItems.map((org) => (
                      <OrganizationCard key={org.id} organization={org} />
                    ))}
                  </SimpleGrid>

                  {hasMore && (
                    <Box className={classes.loadMore}>
                      <Button
                        variant="outline"
                        color="sage"
                        size="md"
                        radius="xl"
                        rightSection={<IconArrowDown size={16} />}
                        onClick={handleLoadMore}
                      >
                        Load More ({finalItems.length - visibleCount} remaining)
                      </Button>
                    </Box>
                  )}

                  {!hasMore && finalItems.length > ITEMS_PER_PAGE && (
                    <Text ta="center" size="sm" c="dimmed" mt={32}>
                      You&apos;ve seen all {finalItems.length} charities 🎉
                    </Text>
                  )}
                </>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
