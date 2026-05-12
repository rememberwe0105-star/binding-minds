// ==============================
// Binding Minds — 기부 내역 & 영수증 데이터 모듈
// ==============================

// --- 타입 정의 ---
export interface Donation {
  id: string;
  campaignSlug: string;
  campaignName: string;
  charityName: string;
  category: string;
  amount: number;
  date: string;        // ISO date string
  status: 'completed' | 'pending' | 'refunded';
  receiptId: string;
}

export interface Receipt {
  id: string;
  donationId: string;
  campaignName: string;
  charityName: string;
  amount: number;
  date: string;
  irdApproved: boolean;
  downloadUrl: string;  // 목업 URL
}

export interface MonthlyTotal {
  month: string;     // e.g. "Jan", "Feb"
  monthFull: string; // e.g. "January"
  total: number;
}

// --- 목업 기부 데이터 (10건) ---
export const mockDonations: Donation[] = [
  {
    id: 'don-001',
    campaignSlug: 'restore-aotearoas-native-forest',
    campaignName: "Restore Aotearoa's Native Forest",
    charityName: 'Trees That Count',
    category: 'Environment',
    amount: 50,
    date: '2026-05-10',
    status: 'completed',
    receiptId: 'rcpt-001',
  },
  {
    id: 'don-002',
    campaignSlug: 'feed-the-community-kitchen',
    campaignName: 'Feed the Community Kitchen',
    charityName: 'City Mission Auckland',
    category: 'Community',
    amount: 25,
    date: '2026-05-05',
    status: 'completed',
    receiptId: 'rcpt-002',
  },
  {
    id: 'don-003',
    campaignSlug: 'education-for-all-nz',
    campaignName: 'Education For All NZ',
    charityName: 'KidsCan',
    category: 'Education',
    amount: 100,
    date: '2026-04-28',
    status: 'completed',
    receiptId: 'rcpt-003',
  },
  {
    id: 'don-004',
    campaignSlug: 'clean-waters-initiative',
    campaignName: 'Clean Waters Initiative',
    charityName: 'Fish & Game NZ',
    category: 'Environment',
    amount: 75,
    date: '2026-04-15',
    status: 'completed',
    receiptId: 'rcpt-004',
  },
  {
    id: 'don-005',
    campaignSlug: 'music-for-young-minds',
    campaignName: 'Music for Young Minds',
    charityName: 'Sistema Aotearoa',
    category: 'Arts & Culture',
    amount: 30,
    date: '2026-04-02',
    status: 'completed',
    receiptId: 'rcpt-005',
  },
  {
    id: 'don-006',
    campaignSlug: 'restore-aotearoas-native-forest',
    campaignName: "Restore Aotearoa's Native Forest",
    charityName: 'Trees That Count',
    category: 'Environment',
    amount: 50,
    date: '2026-03-20',
    status: 'completed',
    receiptId: 'rcpt-006',
  },
  {
    id: 'don-007',
    campaignSlug: 'coastal-guardians-beach-cleanup',
    campaignName: 'Coastal Guardians: Beach Cleanup',
    charityName: 'Sustainable Coastlines',
    category: 'Environment',
    amount: 40,
    date: '2026-03-08',
    status: 'completed',
    receiptId: 'rcpt-007',
  },
  {
    id: 'don-008',
    campaignSlug: 'feed-the-community-kitchen',
    campaignName: 'Feed the Community Kitchen',
    charityName: 'City Mission Auckland',
    category: 'Community',
    amount: 25,
    date: '2026-02-14',
    status: 'completed',
    receiptId: 'rcpt-008',
  },
  {
    id: 'don-009',
    campaignSlug: 'education-for-all-nz',
    campaignName: 'Education For All NZ',
    charityName: 'KidsCan',
    category: 'Education',
    amount: 150,
    date: '2026-01-30',
    status: 'completed',
    receiptId: 'rcpt-009',
  },
  {
    id: 'don-010',
    campaignSlug: 'community-mural-project',
    campaignName: 'Community Mural Project',
    charityName: 'Creative Communities NZ',
    category: 'Arts & Culture',
    amount: 35,
    date: '2026-01-12',
    status: 'pending',
    receiptId: 'rcpt-010',
  },
];

// --- 목업 영수증 데이터 ---
export const mockReceipts: Receipt[] = mockDonations
  .filter((d) => d.status === 'completed')
  .map((d) => ({
    id: d.receiptId,
    donationId: d.id,
    campaignName: d.campaignName,
    charityName: d.charityName,
    amount: d.amount,
    date: d.date,
    irdApproved: true,
    downloadUrl: `#receipt-${d.receiptId}`,
  }));

// --- 유틸리티 함수 ---

/** NZD 포맷 ($1,234) */
export function formatNZD(amount: number): string {
  return `$${amount.toLocaleString('en-NZ')}`;
}

/** 날짜를 읽기 좋은 형식으로 변환 (e.g. "10 May 2026") */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** 총 기부액 계산 */
export function getTotalDonated(donations: Donation[]): number {
  return donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
}

/** 33.33% 세금 환급 예상액 */
export function getEstimatedTaxRefund(totalDonated: number): number {
  return Math.round(totalDonated * 0.3333);
}

/** 지원한 고유 캠페인 수 */
export function getUniqueCampaigns(donations: Donation[]): number {
  return new Set(donations.map((d) => d.campaignSlug)).size;
}

/** 월별 집계 (올해 기준) */
export function getMonthlyTotals(donations: Donation[]): MonthlyTotal[] {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentYear = new Date().getFullYear();
  const totals: MonthlyTotal[] = months.map((m, i) => ({
    month: m,
    monthFull: monthsFull[i],
    total: 0,
  }));

  donations
    .filter((d) => d.status === 'completed')
    .forEach((d) => {
      const date = new Date(d.date);
      if (date.getFullYear() === currentYear) {
        totals[date.getMonth()].total += d.amount;
      }
    });

  return totals;
}

/** 카테고리별 집계 */
export function getCategoryTotals(
  donations: Donation[]
): { category: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();

  donations
    .filter((d) => d.status === 'completed')
    .forEach((d) => {
      const existing = map.get(d.category) || { total: 0, count: 0 };
      existing.total += d.amount;
      existing.count += 1;
      map.set(d.category, existing);
    });

  return Array.from(map.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);
}
