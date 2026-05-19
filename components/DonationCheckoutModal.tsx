'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  TextInput,
  Box,
  Badge,
  Divider,
  Stack,
  Checkbox,
  ThemeIcon,
  SimpleGrid,
  Loader,
  Alert,
  Select,
} from '@mantine/core';
import {
  IconHeart,
  IconShieldCheck,
  IconLock,
  IconArrowRight,
  IconReceipt,
  IconAlertCircle,
  IconAlertTriangle,
} from '@tabler/icons-react';
import type { Campaign } from '@/data/campaigns';
import { createCheckoutSession } from '@/lib/api';
import classes from './DonationCheckoutModal.module.css';

// ============================================================
// 타입
// ============================================================
interface DonationCheckoutModalProps {
  opened: boolean;
  onClose: () => void;
  campaign: Campaign;
  frequency?: 'one-time' | 'monthly';
}

const PRESET_AMOUNTS = ['10', '20', '50', '100', '250'];
const MIN_AMOUNT = 10; // 최소 기부금 $10 (NZD/AUD)
const PLATFORM_TIP_AMOUNT = 2; // 자발적 플랫폼 팁 $2

// 통화 옵션
const CURRENCY_OPTIONS = [
  { value: 'NZD', label: '🇳🇿 NZD — New Zealand Dollar' },
  { value: 'AUD', label: '🇦🇺 AUD — Australian Dollar' },
  { value: 'USD', label: '🇺🇸 USD — US Dollar' },
];

// 통화별 포맷
function formatAmount(amount: number, currency: string): string {
  if (!amount) return `${currency} $0`;
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// 세액공제 계산 (NZD만 해당)
function taxRefund(amount: number): number {
  return Math.round(amount * 0.3333);
}

// ============================================================
// 메인 모달 컴포넌트 — 2단계 간소화
// ============================================================
export function DonationCheckoutModal({ opened, onClose, campaign, frequency = 'one-time' }: DonationCheckoutModalProps) {
  // 단계: 0=금액선택, 1=확인, 2=성공(리다이렉트중)
  const [step, setStep] = useState(0);

  // 금액 / 통화
  const [selectedPreset, setSelectedPreset] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('NZD');
  const [coverFee, setCoverFee] = useState(false); // Stripe 수수료 부담 여부
  const [tipPlatform, setTipPlatform] = useState(false); // 자발적 플랫폼 팁

  // 로딩/에러
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const amount = selectedPreset === 'custom' ? Number(customAmount) || 0 : Number(selectedPreset);
  const refund = currency === 'NZD' ? taxRefund(amount) : 0;
  // DearGiver 플랫폼 수수료: MAX($0.50, 기부금의 1%)
  const platformFee = Math.max(0.50, Math.round(amount * 0.01 * 100) / 100);
  // Stripe 수수료: ~1.5% (Stripe NZ 요금 기준)
  const stripeFee = coverFee ? Math.round(amount * 0.015 * 100) / 100 : 0;
  // 자발적 플랫폼 팁
  const tipAmount = tipPlatform ? PLATFORM_TIP_AMOUNT : 0;
  const totalCharge = amount + stripeFee + platformFee + tipAmount;

  const isNonNZD = currency !== 'NZD';
  const isAmountValid = amount >= MIN_AMOUNT;

  const resetAndClose = useCallback(() => {
    setStep(0);
    setSelectedPreset('50');
    setCustomAmount('');
    setCurrency('NZD');
    setCoverFee(false);
    setTipPlatform(false);
    setApiError(null);
    onClose();
  }, [onClose]);

  // Checkout Session 생성 → Stripe 리다이렉트
  const handleCheckout = async () => {
    if (!isAmountValid) return;
    setIsLoading(true);
    setApiError(null);

    try {
      // 백엔드 API: amount는 AUD/NZD 정수 (달러 단위, 센트 아님)
      const charityAccountId = campaign.stripeAccountId ?? 'acct_1TLekBRHr11OamkF';

      const session = await createCheckoutSession({
        amount: Math.round(totalCharge),
        charityAccountId,
        charityName: campaign.name,
        frequency,
      });

      // Stripe Checkout 페이지로 리다이렉트
      window.location.href = session.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '결제를 시작할 수 없습니다. 다시 시도해주세요.';
      setApiError(msg);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      size="md"
      radius="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      title={
        step === 0 ? (
          <Group gap={8}>
            <IconHeart size={20} color="var(--bm-terracotta)" />
            <Text fw={700} size="lg" c="var(--bm-text-dark)">
              Donate to {campaign.name}
            </Text>
          </Group>
        ) : step === 1 ? (
          <Group gap={8}>
            <IconShieldCheck size={20} color="var(--bm-sage-dark)" />
            <Text fw={700} size="lg" c="var(--bm-text-dark)">
              Confirm Your {frequency === 'monthly' ? 'Monthly ' : ''}Donation
            </Text>
          </Group>
        ) : undefined
      }
      classNames={{ content: classes.modal, body: classes.modalBody }}
    >
      {/* ── Step 0: 금액 선택 ── */}
      {step === 0 && (
        <div className={classes.stepContent}>
          {/* 통화 선택 */}
          <Select
            label="Currency"
            data={CURRENCY_OPTIONS}
            value={currency}
            onChange={(v) => setCurrency(v ?? 'NZD')}
            radius="md"
            mb={16}
          />

          {/* NZD 아닌 경우 경고 */}
          {isNonNZD && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="orange"
              variant="light"
              radius="md"
              mb={16}
            >
              <Text size="sm" fw={600}>NZ Tax Credit Not Applicable</Text>
              <Text size="xs" mt={2}>
                Donations in {currency} do not qualify for the NZ 33.33% donation tax credit.
                Switch to NZD for tax credit eligibility.
              </Text>
            </Alert>
          )}

          {/* 금액 프리셋 */}
          <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={8}>
            Select amount <Badge size="xs" color="orange" variant="light">Min. ${MIN_AMOUNT}</Badge>
          </Text>
          <SimpleGrid cols={5} spacing={8} mb={8}>
            {PRESET_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                variant={selectedPreset === amt ? 'filled' : 'outline'}
                color={selectedPreset === amt ? 'terracotta' : 'dark'}
                radius="md"
                size="sm"
                onClick={() => { setSelectedPreset(amt); setCustomAmount(''); }}
                className={selectedPreset === amt ? classes.amountBtnActive : classes.amountBtn}
              >
                ${amt}
              </Button>
            ))}
          </SimpleGrid>

          <Button
            variant={selectedPreset === 'custom' ? 'filled' : 'outline'}
            color={selectedPreset === 'custom' ? 'terracotta' : 'dark'}
            radius="md"
            size="sm"
            fullWidth
            onClick={() => setSelectedPreset('custom')}
            mb={selectedPreset === 'custom' ? 10 : 0}
          >
            Custom Amount
          </Button>

          {selectedPreset === 'custom' && (
            <TextInput
              placeholder={`Enter amount (min $${MIN_AMOUNT})`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.currentTarget.value)}
              leftSection={<Text size="sm" fw={600}>$</Text>}
              size="md"
              radius="md"
              type="number"
              min={MIN_AMOUNT}
              autoFocus
              mt={4}
              error={Number(customAmount) > 0 && Number(customAmount) < MIN_AMOUNT
                ? `Minimum donation is $${MIN_AMOUNT}`
                : undefined}
            />
          )}

          {/* 세액공제 미리보기 (NZD만) */}
          {amount >= MIN_AMOUNT && currency === 'NZD' && (
            <div className={classes.taxInfoBox} style={{ marginTop: 16 }}>
              <Group gap={8}>
                <ThemeIcon size={28} radius="xl" color="sage" variant="light">
                  <IconReceipt size={14} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600} c="var(--bm-sage-dark)">
                    Est. tax refund: {formatAmount(refund, 'NZD')}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">
                    Your effective cost: {formatAmount(amount - refund, 'NZD')}
                  </Text>
                </Box>
              </Group>
            </div>
          )}

          {/* Stripe 수수료 체크박스 */}
          <Checkbox
            mt={16}
            label={
              <Text size="sm">
                Cover the ~1.5% Stripe processing fee
                {stripeFee > 0 ? ` (+${formatAmount(stripeFee, currency)})` : ''}
              </Text>
            }
            description="Helps more of your donation reach the charity directly"
            checked={coverFee}
            onChange={(e) => setCoverFee(e.currentTarget.checked)}
            color="sage"
          />

          {/* 자발적 플랫폼 팁 체크박스 */}
          <Checkbox
            mt={12}
            label={
              <Text size="sm">
                Add {formatAmount(PLATFORM_TIP_AMOUNT, currency)} to support DearGiver
              </Text>
            }
            description="Help us keep DearGiver free for charities — 100% optional"
            checked={tipPlatform}
            onChange={(e) => setTipPlatform(e.currentTarget.checked)}
            color="terracotta"
          />

          {/* 플랫폼 수수료 투명 표시 */}
          {amount >= MIN_AMOUNT && (
            <Box
              mt={14}
              p={12}
              style={{
                background: 'rgba(74,124,113,0.06)',
                borderRadius: 10,
                borderLeft: '3px solid var(--bm-sage)',
              }}
            >
              <Group justify="space-between" mb={4}>
                <Group gap={6}>
                  <IconShieldCheck size={14} color="var(--bm-sage-dark)" />
                  <Text size="xs" fw={600} c="var(--bm-sage-dark)">Platform fee (1%)</Text>
                </Group>
                <Text size="xs" fw={700} c="var(--bm-sage-dark)">{formatAmount(platformFee, currency)}</Text>
              </Group>
              <Text size="xs" c="var(--bm-text-muted)" lh={1.6}>
                1% of your donation (min $0.50) keeps DearGiver running.
                No hidden costs, ever.
              </Text>
            </Box>
          )}

          <Divider my={20} />

          <Group justify="flex-end">
            <Button
              color="terracotta"
              size="md"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => setStep(1)}
              disabled={!isAmountValid}
              className={classes.nextBtn}
            >
              Continue — {formatAmount(totalCharge, currency)}
            </Button>
          </Group>
        </div>
      )}

      {/* ── Step 1: 확인 및 결제 ── */}
      {step === 1 && (
        <div className={classes.stepContent}>
          <Stack gap={0} mb={20}>
            <div className={classes.paymentPreview}>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">Charity / Campaign</Text>
                <Text size="sm" fw={600} ta="right" maw={200} lineClamp={1}>{campaign.name}</Text>
              </Group>
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">
                  Donation amount {frequency === 'monthly' && <Badge size="xs" color="sage" variant="light" ml={4}>Monthly</Badge>}
                </Text>
                <Text size="sm" fw={600}>{formatAmount(amount, currency)}{frequency === 'monthly' ? '/mo' : ''}</Text>
              </Group>
              {coverFee && (
                <Group justify="space-between" mb={8}>
                  <Text size="sm" c="var(--bm-text-muted)">Stripe processing fee</Text>
                  <Text size="sm" c="dimmed">+{formatAmount(stripeFee, currency)}</Text>
                </Group>
              )}
              <Group justify="space-between" mb={8}>
                <Group gap={6}>
                  <IconShieldCheck size={14} color="var(--bm-sage)" />
                  <Text size="sm" c="var(--bm-text-muted)">Platform fee (1%)</Text>
                </Group>
                <Text size="sm" c="var(--bm-sage-dark)">{formatAmount(platformFee, currency)}</Text>
              </Group>
              {tipPlatform && (
                <Group justify="space-between" mb={8}>
                  <Group gap={6}>
                    <IconHeart size={14} color="var(--bm-terracotta)" />
                    <Text size="sm" c="var(--bm-text-muted)">Voluntary platform tip</Text>
                  </Group>
                  <Text size="sm" c="var(--bm-terracotta)">{formatAmount(tipAmount, currency)}</Text>
                </Group>
              )}
              <Divider my={8} />
              <Group justify="space-between" mb={8}>
                <Text size="sm" fw={700} c="var(--bm-text-dark)">Total charge</Text>
                <Text size="md" fw={800} c="var(--bm-terracotta)">
                  {formatAmount(totalCharge, currency)}{frequency === 'monthly' ? '/mo' : ''}
                </Text>
              </Group>
              {currency === 'NZD' && refund > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="var(--bm-text-muted)">Est. NZ tax credit (33.33%)</Text>
                  <Text size="sm" fw={600} c="var(--bm-sage-dark)">−{formatAmount(refund, 'NZD')}</Text>
                </Group>
              )}
            </div>

            {isNonNZD && (
              <Alert icon={<IconAlertTriangle size={14} />} color="orange" variant="light" radius="md" mt={12}>
                <Text size="xs">Donations in {currency} do not qualify for NZ tax credits.</Text>
              </Alert>
            )}
          </Stack>

          {apiError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md" mb={16}>
              {apiError}
            </Alert>
          )}

          <Text size="xs" c="dimmed" mb={16} ta="center">
            You will be redirected to Stripe&apos;s secure payment page.
          </Text>

          <Group justify="space-between">
            <Button
              variant="subtle"
              color="dark"
              size="md"
              onClick={() => { setStep(0); setApiError(null); }}
              disabled={isLoading}
            >
              ← Back
            </Button>
            <Button
              color="terracotta"
              size="md"
              radius="xl"
              leftSection={isLoading ? <Loader size={16} color="white" /> : <IconLock size={16} />}
              onClick={handleCheckout}
              disabled={isLoading}
              className={classes.nextBtn}
            >
              {isLoading ? 'Redirecting to Stripe...' : `Pay ${formatAmount(totalCharge, currency)}`}
            </Button>
          </Group>

          <Text ta="center" size="xs" c="dimmed" mt={12}>
            <IconShieldCheck size={12} style={{ verticalAlign: 'middle' }} /> Encrypted & secure via Stripe
          </Text>
        </div>
      )}
    </Modal>
  );
}
