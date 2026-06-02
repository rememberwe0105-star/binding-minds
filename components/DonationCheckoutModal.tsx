'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  TextInput,
  Textarea,
  Box,
  Badge,
  Divider,
  Stack,
  Checkbox,
  Switch,
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
  IconGift,
  IconRepeat,
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

  // 선물 기부
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftRecipientEmail, setGiftRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // 로딩/에러
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const amount = selectedPreset === 'custom' ? Number(customAmount) || 0 : Number(selectedPreset);
  const refund = currency === 'NZD' ? taxRefund(amount) : 0;
  // DearGiver 플랫폼 수수료: MAX($0.50, 기부금의 1%)
  const platformFee = Math.max(0.50, Math.round(amount * 0.01 * 100) / 100);
  // Stripe 수수료: ~1.5% (Stripe NZ 요금 기준)
  const stripeFee = coverFee ? Math.round((amount * 0.027 + 0.30) * 100) / 100 : 0;
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
    setIsGift(false);
    setGiftRecipientName('');
    setGiftRecipientEmail('');
    setGiftMessage('');
    setApiError(null);
    onClose();
  }, [onClose]);

  // Checkout Session 생성 → Stripe 리다이렉트
  const handleCheckout = async () => {
    if (!isAmountValid) return;
    setIsLoading(true);
    setApiError(null);

    try {
      // 백엔드 API: amount는 기부 원금(달러 단위, 소수점 가능). 수수료는 백엔드가 계산.
      const charityAccountId = campaign.stripeAccountId ?? 'acct_1TLekBRHr11OamkF';

      // 선물 기부 데이터를 localStorage에 저장 (Stripe 리디렉트 후 사용)
      if (isGift && giftRecipientName.trim()) {
        localStorage.setItem('deargiver_gift', JSON.stringify({
          recipientName: giftRecipientName.trim(),
          recipientEmail: giftRecipientEmail.trim() || null,
          message: giftMessage.trim() || null,
          charityName: campaign.name,
          amount,
          currency,
          timestamp: new Date().toISOString(),
        }));
      } else {
        localStorage.removeItem('deargiver_gift');
      }

      const session = await createCheckoutSession({
        amount,
        currency: currency as 'NZD' | 'AUD' | 'USD',
        charityAccountId,
        charityName: campaign.name,
        coverStripeFee: coverFee,
        addSupport: tipPlatform,
        recurring: frequency === 'monthly',
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

          {/* 월간 기부 혜택 배너 */}
          {frequency === 'monthly' && (
            <Alert
              icon={<IconRepeat size={16} />}
              color="sage"
              variant="light"
              radius="md"
              mb={16}
            >
              <Text size="sm" fw={600}>Monthly Giving Benefits</Text>
              <Text size="xs" mt={2} lh={1.5}>
                {amount >= MIN_AMOUNT ? (
                  <>Your <strong>{formatAmount(amount, currency)}/mo</strong> = <strong>{formatAmount(amount * 12, currency)}/year</strong> of sustained impact.
                  {currency === 'NZD' && <> Est. annual tax credit: <strong>{formatAmount(taxRefund(amount * 12), 'NZD')}</strong>.</>}
                  </>
                ) : (
                  'Set a monthly amount to see your annual impact projection.'
                )}
              </Text>
            </Alert>
          )}

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
                Cover the Stripe processing fee (~2.7% + $0.30)
                {stripeFee > 0 ? ` (+${formatAmount(stripeFee, currency)})` : ''}
                <Text size="xs" c="dimmed" mt={2}>International cards: ~3.5% + $0.30</Text>
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

          {/* ── 선물 기부 토글 ── */}
          <Box
            mt={16}
            p={16}
            style={{
              background: isGift
                ? 'linear-gradient(135deg, rgba(196,114,74,0.06) 0%, rgba(74,124,113,0.04) 100%)'
                : 'rgba(0,0,0,0.02)',
              borderRadius: 12,
              border: isGift ? '1px solid rgba(196,114,74,0.2)' : '1px solid rgba(0,0,0,0.06)',
              transition: 'all 0.2s ease',
            }}
          >
            <Switch
              checked={isGift}
              onChange={(e) => setIsGift(e.currentTarget.checked)}
              color="terracotta"
              label={
                <Group gap={6}>
                  <IconGift size={16} color={isGift ? 'var(--bm-terracotta)' : 'var(--bm-text-muted)'} />
                  <Text size="sm" fw={600} c={isGift ? 'var(--bm-text-dark)' : 'var(--bm-text-muted)'}>
                    Gift this donation
                  </Text>
                </Group>
              }
              description="Dedicate this donation to someone special"
            />

            {isGift && (
              <Stack gap={10} mt={12}>
                <TextInput
                  label="Recipient's name"
                  placeholder="e.g. Sarah Kim"
                  value={giftRecipientName}
                  onChange={(e) => setGiftRecipientName(e.currentTarget.value)}
                  radius="md"
                  size="sm"
                  required
                />
                <TextInput
                  label="Recipient's email (optional)"
                  placeholder="e.g. sarah@email.com"
                  value={giftRecipientEmail}
                  onChange={(e) => setGiftRecipientEmail(e.currentTarget.value)}
                  radius="md"
                  size="sm"
                  description="We'll send them a beautiful gift card"
                />
                <Textarea
                  label="Personal message (optional)"
                  placeholder="Happy birthday! I donated in your name 🎉"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.currentTarget.value)}
                  radius="md"
                  size="sm"
                  maxLength={200}
                  autosize
                  minRows={2}
                  maxRows={3}
                />
              </Stack>
            )}
          </Box>

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
          {/* 선물 기부 표시 */}
          {isGift && giftRecipientName.trim() && (
            <Box
              mb={16}
              p={14}
              style={{
                background: 'linear-gradient(135deg, rgba(196,114,74,0.06) 0%, rgba(74,124,113,0.04) 100%)',
                borderRadius: 12,
                border: '1px solid rgba(196,114,74,0.15)',
              }}
            >
              <Group gap={8} mb={4}>
                <IconGift size={16} color="var(--bm-terracotta)" />
                <Text size="sm" fw={700} c="var(--bm-terracotta)">Gift Donation</Text>
              </Group>
              <Text size="xs" c="var(--bm-text-muted)" lh={1.5}>
                Dedicated to <strong>{giftRecipientName.trim()}</strong>
                {giftMessage.trim() ? ` — "${giftMessage.trim()}"` : ''}
              </Text>
            </Box>
          )}
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
