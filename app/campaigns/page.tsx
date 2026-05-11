'use client';

import { useState, useMemo } from 'react';
import { Container, Title, Text, SimpleGrid, Button, Box } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignFilters } from '@/components/CampaignFilters';
import {
  campaigns as allCampaigns,
  filterAndSortCampaigns,
  CAMPAIGNS_PER_PAGE,
  type Category,
  type Region,
  type SortOption,
} from '@/data/campaigns';
import classes from './page.module.css';

export default function CampaignsPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [sort, setSort] = useState<SortOption>('popular');

  // 페이지네이션 상태 (Load More 방식)
  const [visibleCount, setVisibleCount] = useState(CAMPAIGNS_PER_PAGE);

  // 필터링 + 정렬된 결과
  const filteredCampaigns = useMemo(() => {
    // 필터 변경 시 보여주는 개수 리셋
    return filterAndSortCampaigns({
      search,
      categories: selectedCategories,
      region: selectedRegion,
      sort,
    });
  }, [search, selectedCategories, selectedRegion, sort]);

  // 현재 보여줄 캠페인 (Load More로 잘라서)
  const visibleCampaigns = filteredCampaigns.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCampaigns.length;

  // 필터 변경 시 페이지네이션 리셋
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
              Find a Campaign That Speaks to You
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={600} mt={8}>
              Browse verified campaigns across Aotearoa. Every donation makes a difference
              and earns you a 33.33% tax credit.
            </Text>
          </Box>

          {/* 레이아웃: 사이드바 + 그리드 */}
          <div className={classes.layout}>
            {/* 필터 사이드바 (데스크톱) */}
            <div className={classes.filterColumn}>
              <CampaignFilters
                search={search}
                onSearchChange={handleSearchChange}
                selectedCategories={selectedCategories}
                onCategoriesChange={handleCategoriesChange}
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                sort={sort}
                onSortChange={handleSortChange}
                resultCount={filteredCampaigns.length}
                totalCount={allCampaigns.length}
                onClearAll={handleClearAll}
              />
            </div>

            {/* 캠페인 그리드 */}
            <div className={classes.gridColumn}>
              {/* 모바일용 검색 + 필터 버튼 */}
              <div className={classes.mobileFilters}>
                <CampaignFilters
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={handleCategoriesChange}
                  selectedRegion={selectedRegion}
                  onRegionChange={handleRegionChange}
                  sort={sort}
                  onSortChange={handleSortChange}
                  resultCount={filteredCampaigns.length}
                  totalCount={allCampaigns.length}
                  onClearAll={handleClearAll}
                />
              </div>

              {filteredCampaigns.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Text size="xl" fw={700} c="var(--bm-text-dark)" mb={8}>
                    No campaigns found
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
                    {visibleCampaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </SimpleGrid>

                  {/* Load More 버튼 */}
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
                        Load More ({filteredCampaigns.length - visibleCount} remaining)
                      </Button>
                    </Box>
                  )}

                  {/* 모두 표시 완료 메시지 */}
                  {!hasMore && filteredCampaigns.length > CAMPAIGNS_PER_PAGE && (
                    <Text ta="center" size="sm" c="dimmed" mt={32}>
                      You&apos;ve seen all {filteredCampaigns.length} campaigns 🎉
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
