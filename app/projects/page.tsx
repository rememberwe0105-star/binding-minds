'use client';

import { useState, useMemo } from 'react';
import { Container, Title, Text, SimpleGrid, Button, Box } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { ProjectFilters } from '@/components/ProjectFilters';
import { RichSearchInput } from '@/components/RichSearchInput';
import {
  campaigns as allCampaigns,
  filterAndSortCampaigns,
  CAMPAIGNS_PER_PAGE,
  type Category,
  type Region,
  type SortOption,
} from '@/data/campaigns';
import { useFavorites } from '@/contexts/FavoritesContext';
import classes from './page.module.css';

export default function ProjectsPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [sort, setSort] = useState<SortOption>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { isFavorite, getFavoriteCount } = useFavorites();

  // 페이지네이션 상태
  const [visibleCount, setVisibleCount] = useState(CAMPAIGNS_PER_PAGE);

  // 필터링된 Projects
  const filteredProjects = useMemo(() => {
    return filterAndSortCampaigns({
      search,
      categories: selectedCategories,
      region: selectedRegion,
      sort,
    });
  }, [search, selectedCategories, selectedRegion, sort]);

  // favorites 필터 적용
  const finalItems = useMemo(() => {
    if (!showFavoritesOnly) return filteredProjects;
    return filteredProjects.filter((p) => isFavorite('project', p.id));
  }, [filteredProjects, showFavoritesOnly, isFavorite]);

  const visibleItems = finalItems.slice(0, visibleCount);
  const hasMore = visibleCount < finalItems.length;

  // 필터 변경 핸들러 (페이지네이션 리셋)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleCategoriesChange = (cats: Category[]) => {
    setSelectedCategories(cats);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleRegionChange = (region: Region | '') => {
    setSelectedRegion(region);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleClearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRegion('');
    setSort('popular');
    setShowFavoritesOnly(false);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + CAMPAIGNS_PER_PAGE);
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
              Browse Projects
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={640} mt={8} mx="auto">
              Discover verified fundraising projects across Aotearoa.
              Every donation earns you a 33.33% tax credit.
            </Text>
            <div className={classes.searchWrap}>
              <RichSearchInput
                value={search}
                onChange={handleSearchChange}
                onCategoryPick={(cat) => {
                  if (selectedCategories.length === 1 && selectedCategories[0] === cat) {
                    handleCategoriesChange([]);
                  } else {
                    handleCategoriesChange([cat as Category]);
                  }
                }}
                placeholder="Search projects & charities..."
              />
            </div>
          </Box>

          {/* 레이아웃: 사이드바 + 그리드 */}
          <div className={classes.layout}>
            {/* 필터 사이드바 */}
            <div className={classes.filterColumn}>
              <ProjectFilters
                search={search}
                onSearchChange={handleSearchChange}
                selectedCategories={selectedCategories}
                onCategoriesChange={handleCategoriesChange}
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                sort={sort}
                onSortChange={handleSortChange}
                resultCount={finalItems.length}
                totalCount={allCampaigns.length}
                onClearAll={handleClearAll}
                showFavoritesOnly={showFavoritesOnly}
                onFavoritesToggle={setShowFavoritesOnly}
                favoriteCount={getFavoriteCount()}
              />
            </div>

            {/* 그리드 */}
            <div className={classes.gridColumn}>
              {/* 모바일용 필터 */}
              <div className={classes.mobileFilters}>
                <ProjectFilters
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={handleCategoriesChange}
                  selectedRegion={selectedRegion}
                  onRegionChange={handleRegionChange}
                  sort={sort}
                  onSortChange={handleSortChange}
                  resultCount={finalItems.length}
                  totalCount={allCampaigns.length}
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
                  <Button
                    variant="outline"
                    color="sage"
                    radius="xl"
                    onClick={handleClearAll}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              ) : (
                <>
                  <SimpleGrid
                    cols={{ base: 1, xs: 2, lg: 3 }}
                    spacing={{ base: 16, sm: 20 }}
                  >
                    {visibleItems.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </SimpleGrid>

                  {/* Load More */}
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

                  {!hasMore && finalItems.length > CAMPAIGNS_PER_PAGE && (
                    <Text ta="center" size="sm" c="dimmed" mt={32}>
                      You&apos;ve seen all {finalItems.length} projects 🎉
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
