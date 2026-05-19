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
import classes from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function CharitiesPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

  // favorites 필터 적용
  const finalItems = useMemo(() => {
    if (!showFavoritesOnly) return filteredOrgs;
    return filteredOrgs.filter((o) => isFavorite('organization', o.id));
  }, [filteredOrgs, showFavoritesOnly, isFavorite]);

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

  const handleClearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRegion('');
    setShowFavoritesOnly(false);
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
            <Text size="sm" fw={600} tt="uppercase" c="var(--bm-terracotta)" mb={8}>
              Explore
            </Text>
            <Title order={1} className={classes.pageTitle}>
              Browse Charities
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={640} mt={8} mx="auto">
              Explore registered charities across Aotearoa.
              Data sourced from NZ Charities Services.
            </Text>
            <div className={classes.searchWrap}>
              <RichSearchInput
                value={search}
                onChange={handleSearchChange}
                onCategoryPick={(cat) => {
                  if (!selectedCategories.includes(cat)) {
                    handleCategoriesChange([...selectedCategories, cat]);
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
