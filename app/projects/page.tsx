'use client';

import { useState, useMemo, useEffect } from 'react';
import { Container, Title, Text, SimpleGrid, Button, Box, Loader, Alert } from '@mantine/core';

import { IconArrowDown, IconAlertCircle } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { ProjectFilters } from '@/components/ProjectFilters';
import { RichSearchInput } from '@/components/RichSearchInput';
import {
  CAMPAIGNS_PER_PAGE,
  type Category,
  type Region,
  type SortOption,
} from '@/data/campaigns';
import { getPublicProjects } from '@/lib/api';
import { adaptProject, type AdaptedProject } from '@/lib/adapters';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fraunces } from '@/lib/fonts';
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

  // 백엔드 실데이터 (FE-009) — 목업 대신 GET /projects
  const [allCampaigns, setAllCampaigns] = useState<AdaptedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublicProjects({ pageSize: 200 })
      .then((res) => {
        if (cancelled) return;
        setAllCampaigns(res.items.map(adaptProject));
        setLoadError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : 'Failed to load projects.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // 필터 + 정렬 (클라이언트 — 로드된 실데이터 대상)
  const filteredProjects = useMemo(() => {
    let result = allCampaigns;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.organizer.toLowerCase().includes(q),
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }
    if (selectedRegion) {
      result = result.filter((c) => c.region === selectedRegion);
    }
    const progress = (c: AdaptedProject) => (c.goal > 0 ? (c.raised / c.goal) * 100 : 0);
    const sorted = [...result];
    switch (sort) {
      case 'most-funded': sorted.sort((a, b) => progress(b) - progress(a)); break;
      case 'ending-soon': sorted.sort((a, b) => a.daysLeft - b.daysLeft); break;
      case 'newest': sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: sorted.sort((a, b) => b.donorCount - a.donorCount); break;
    }
    return sorted;
  }, [allCampaigns, search, selectedCategories, selectedRegion, sort]);

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
            <Text size="md" fw={800} tt="uppercase" c="#eba98c" mb={8} style={{ letterSpacing: '1.5px' }}>
              Explore
            </Text>
            <Title order={1} className={`${classes.pageTitle} ${fraunces.className}`}>
              Browse Projects
            </Title>
            <Text fz={19} c="var(--dg-hero-muted)" maw={640} mt={10} mx="auto" lh={1.7}>
              See the work organisations are sharing, understand what&apos;s needed,
              and learn how you can help.
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

              {loading ? (
                <Box ta="center" py={80}>
                  <Loader color="sage" size="lg" />
                  <Text size="sm" c="var(--bm-text-muted)" mt={16}>Loading projects…</Text>
                </Box>
              ) : loadError ? (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">
                  {loadError}
                </Alert>
              ) : finalItems.length === 0 ? (
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
