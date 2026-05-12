'use client';

import { useState, useMemo } from 'react';
import { Container, Title, Text, SimpleGrid, Button, Box } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignCard } from '@/components/CampaignCard';
import { OrganizationCard } from '@/components/OrganizationCard';
import { CampaignFilters } from '@/components/CampaignFilters';
import {
  campaigns as allCampaigns,
  filterAndSortCampaigns,
  CAMPAIGNS_PER_PAGE,
  type Category,
  type Region,
  type SortOption,
} from '@/data/campaigns';
import { organizations as allOrganizations, filterOrganizations } from '@/data/organizations';
import type { Organization } from '@/data/organizations';
import type { Campaign } from '@/data/campaigns';
import classes from './page.module.css';

// 혼합 아이템 타입
type MixedItem =
  | { type: 'project'; data: Campaign }
  | { type: 'organization'; data: Organization };

export type ListingType = 'all' | 'projects' | 'organizations';

/** Projects 와 Organizations를 자연스럽게 섞는 함수 (Project 2~3개 → Org 1개 비율) */
function interleaveItems(projects: Campaign[], orgs: Organization[]): MixedItem[] {
  const result: MixedItem[] = [];
  let pi = 0;
  let oi = 0;
  let projectsInRow = 0;

  while (pi < projects.length || oi < orgs.length) {
    // 프로젝트 2~3개 후 기관 1개 삽입
    if (pi < projects.length && (oi >= orgs.length || projectsInRow < 3)) {
      result.push({ type: 'project', data: projects[pi] });
      pi++;
      projectsInRow++;
    } else if (oi < orgs.length) {
      result.push({ type: 'organization', data: orgs[oi] });
      oi++;
      projectsInRow = 0;
    }
  }

  return result;
}

export default function CampaignsPage() {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [sort, setSort] = useState<SortOption>('popular');
  const [listingType, setListingType] = useState<ListingType>('all');

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

  // 필터링된 Organizations
  const filteredOrgs = useMemo(() => {
    return filterOrganizations({
      search,
      categories: selectedCategories as string[],
      region: selectedRegion,
    });
  }, [search, selectedCategories, selectedRegion]);

  // 최종 혼합 아이템 목록
  const mixedItems = useMemo((): MixedItem[] => {
    if (listingType === 'projects') {
      return filteredProjects.map((p) => ({ type: 'project' as const, data: p }));
    }
    if (listingType === 'organizations') {
      return filteredOrgs.map((o) => ({ type: 'organization' as const, data: o }));
    }
    // 'all' — 자연스럽게 섞기
    return interleaveItems(filteredProjects, filteredOrgs);
  }, [listingType, filteredProjects, filteredOrgs]);

  const visibleItems = mixedItems.slice(0, visibleCount);
  const hasMore = visibleCount < mixedItems.length;
  const totalCount = allCampaigns.length + allOrganizations.length;

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

  const handleListingTypeChange = (type: ListingType) => {
    setListingType(type);
    setVisibleCount(CAMPAIGNS_PER_PAGE);
  };

  const handleClearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedRegion('');
    setSort('popular');
    setListingType('all');
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
              Browse Projects & Organisations
            </Title>
            <Text size="lg" c="var(--bm-text-muted)" maw={600} mt={8}>
              Discover verified campaigns and trusted organisations across Aotearoa.
              Every donation earns you a 33.33% tax credit.
            </Text>
          </Box>

          {/* 레이아웃: 사이드바 + 그리드 */}
          <div className={classes.layout}>
            {/* 필터 사이드바 */}
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
                resultCount={mixedItems.length}
                totalCount={totalCount}
                onClearAll={handleClearAll}
                listingType={listingType}
                onListingTypeChange={handleListingTypeChange}
              />
            </div>

            {/* 그리드 */}
            <div className={classes.gridColumn}>
              {/* 모바일용 필터 */}
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
                  resultCount={mixedItems.length}
                  totalCount={totalCount}
                  onClearAll={handleClearAll}
                  listingType={listingType}
                  onListingTypeChange={handleListingTypeChange}
                />
              </div>

              {mixedItems.length === 0 ? (
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
                    {visibleItems.map((item) =>
                      item.type === 'project' ? (
                        <CampaignCard key={item.data.id} campaign={item.data} />
                      ) : (
                        <OrganizationCard key={item.data.id} organization={item.data} />
                      )
                    )}
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
                        Load More ({mixedItems.length - visibleCount} remaining)
                      </Button>
                    </Box>
                  )}

                  {!hasMore && mixedItems.length > CAMPAIGNS_PER_PAGE && (
                    <Text ta="center" size="sm" c="dimmed" mt={32}>
                      You&apos;ve seen all {mixedItems.length} results 🎉
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
