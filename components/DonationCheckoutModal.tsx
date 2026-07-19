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
  SimpleGrid,
  Loader,
  Alert,
  Select,
  SegmentedControl,
} from '@mantine/core';
import {
  IconHeart,
  IconShieldCheck,
  IconLock,
  IconArrowRight,
  IconAlertCircle,
  IconAlertTriangle,
  IconGift,
  IconRepeat,
  IconBuilding,
  IconEyeOff,
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

const PRESET_AMOUNTS = ['5', '10', '20', '50', '100'];
const MIN_AMOUNT = 5; // 최소 기부금 $5 — NZ 세액공제(donation tax credit) 최소 기준액에 맞춤
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

// ============================================================
// 메인 모달 컴포넌트 — 2단계 간소화
// 정책: 결제 시점에는 세액공제 예상액을 노출하지 않는다 (기부 의도 존중).
//       세액공제 안내는 랜딩/기부완료/대시보드에서만 노출.
// 정책: 기부자는 선택한 금액만 결제한다 — Stripe 수수료 커버 옵션 없음,
//       플랫폼 수수료는 기부자가 아닌 단체 측 수수료로 처리 (백엔드).
// ============================================================
export function DonationCheckoutModal({ opened, onClose, campaign, frequency = 'one-time' }: DonationCheckoutModalProps) {
  // 단계: 0=금액선택, 1=확인, 2=성공(리다이렉트중)
  const [step, setStep] = useState(0);

  // 금액 / 통화
  const [selectedPreset, setSelectedPreset] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('NZD');
  const [tipPlatform, setTipPlatform] = useState(false); // 자발적 플랫폼 팁

  // 기부자 유형 (개인 / 회사·단체)
  const [donorType, setDonorType] = useState<'individual' | 'organization'>('individual');
  const [organizationName, setOrganizationName] = useState('');

  // 익명 기부
  const [anonymous, setAnonymous] = useState(false);

  // 선물 기부
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftRecipientEmail, setGiftRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // 로딩/에러
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const amount = selectedPreset === 'custom' ? Number(customAmount) || 0 : Number(selectedPreset);
  const tipAmount = tipPlatform ? PLATFORM_TIP_AMOUNT : 0;
  // 기부자는 선택한 금액(+선택적 팁)만 결제한다
  const totalCharge = amount + tipAmount;

  const isNonNZD = currency !== 'NZD';
  const isAmountValid = amount >= MIN_AMOUNT;
  const isOrgValid = donorType === 'individual' || organizationName.trim().length > 0;

  // 유료 플랜 단체가 설정한 금액별 안내 티어 (없으면 undefined)
  const tiers = campaign.donationTiers;

  const resetAndClose = useCallback(() => {
    setStep(0);
    setSelectedPreset('50');
    setCustomAmount('');
    setCurrency('NZD');
    setTipPlatform(false);
    setDonorType('individual');
    setOrganizationName('');
    setAnonymous(false);
    setIsGift(false);
    setGiftRecipientName('');
    setGiftRecipientEmail('');
    setGiftMessage('');
    setApiError(null);
    onClose();
  }, [onClose]);

  // Checkout Session 생성 → Stripe 리다이렉트
  const handleCheckout = async () => {
    if (!isAmountValid || !isOrgValid) return;
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
        addSupport: tipPlatform,
        recurring: frequency === 'monthly',
        anonymous,
        donorType,
        organizationName: donorType === 'organization' ? organizationName.trim() : undefined,
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
          {/* 월간 기부 혜택 배너 — 세액공제 예상액은 노출하지 않음 */}
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
                  <>Your <strong>{formatAmount(amount, currency)}/mo</strong> = <strong>{formatAmount(amount * 12, currency)}/year</strong> of sustained impact — steady support charities can plan around.</>
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

          {/* NZD 아닌 경우 안내 */}
          {isNonNZD && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="orange"
              variant="light"
              radius="md"
              mb={16}
            >
              <Text size="xs">
                Donations in {currency} do not qualify for the NZ donation tax credit.
              </Text>
            </Alert>
          )}

          {/* 기부자 유형 — 개인 / 회사·단체 */}
          <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={6}>
            Who is donating?
          </Text>
          <SegmentedControl
            fullWidth
            radius="md"
            color="sage"
            value={donorType}
            onChange={(v) => setDonorType(v as 'individual' | 'organization')}
            data={[
              { label: 'Personal', value: 'individual' },
              { label: 'As an Organisation', value: 'organization' },
            ]}
            mb={donorType === 'organization' ? 10 : 16}
          />

          {donorType === 'organization' && (
            <Box mb={16}>
              <TextInput
                label="Organisation name"
                placeholder="e.g. OSOPRO Ltd"
                description="Your donation receipt will be issued in this legal name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.currentTarget.value)}
                leftSection={<IconBuilding size={16} />}
                radius="md"
                size="sm"
                required
              />
              <Alert
                icon={<IconAlertCircle size={14} />}
                color="blue"
                variant="light"
                radius="md"
                mt={8}
              >
                <Text size="xs" lh={1.5}>
                  Organisation donations are generally claimed as an <strong>income tax deduction</strong>,
                  not the 33.33% personal donation tax credit. Please check with your accountant.
                </Text>
              </Alert>
            </Box>
          )}

          {/* 금액 선택 — 티어가 설정된 캠페인이면 티어 카드, 아니면 프리셋 */}
          <Group gap={8} mb={8}>
            <Text size="sm" fw={600} c="var(--bm-text-dark)">Select amount</Text>
            <Badge size="xs" color="orange" variant="light">Min. ${MIN_AMOUNT}</Badge>
          </Group>

          {tiers && tiers.length > 0 ? (
            <Stack gap={8} mb={8}>
              {tiers.map((tier) => {
                const isActive = selectedPreset === String(tier.amount);
                return (
                  <Box
                    key={tier.amount}
                    onClick={() => { setSelectedPreset(String(tier.amount)); setCustomAmount(''); }}
                    p={12}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 10,
                      border: isActive
                        ? '2px solid var(--bm-terracotta)'
                        : '1px solid rgba(0,0,0,0.1)',
                      background: isActive ? 'rgba(226,114,91,0.06)' : 'white',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Group justify="space-between" mb={2}>
                      <Text size="sm" fw={700} c={isActive ? 'var(--bm-terracotta)' : 'var(--bm-text-dark)'}>
                        ${tier.amount}
                      </Text>
                      <Text size="sm" fw={600} c="var(--bm-text-dark)">{tier.title}</Text>
                    </Group>
                    <Text size="xs" c="var(--bm-text-muted)" lh={1.5}>{tier.description}</Text>
                  </Box>
                );
              })}
            </Stack>
          ) : (
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
          )}

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

          {/* 익명 기부 */}
          <Checkbox
            mt={16}
            label={
              <Group gap={6}>
                <IconEyeOff size={14} color="var(--bm-text-muted)" />
                <Text size="sm">Donate anonymously</Text>
              </Group>
            }
            description="We won't display your name in any public feeds or supporter lists"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.currentTarget.checked)}
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
            description="Help us keep DearGiver running — 100% optional"
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

          <Divider my={20} />

          <Group justify="flex-end">
            <Button
              color="terracotta"
              size="md"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => setStep(1)}
              disabled={!isAmountValid || !isOrgValid}
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
              {donorType === 'organization' && (
                <Group justify="space-between" mb={8}>
                  <Group gap={6}>
                    <IconBuilding size={14} color="var(--bm-sage-dark)" />
                    <Text size="sm" c="var(--bm-text-muted)">Donating as</Text>
                  </Group>
                  <Text size="sm" fw={600} ta="right" maw={200} lineClamp={1}>{organizationName.trim()}</Text>
                </Group>
              )}
              {anonymous && (
                <Group justify="space-between" mb={8}>
                  <Group gap={6}>
                    <IconEyeOff size={14} color="var(--bm-sage-dark)" />
                    <Text size="sm" c="var(--bm-text-muted)">Visibility</Text>
                  </Group>
                  <Badge size="sm" color="sage" variant="light">Anonymous</Badge>
                </Group>
              )}
              <Group justify="space-between" mb={8}>
                <Text size="sm" c="var(--bm-text-muted)">
                  Donation amount {frequency === 'monthly' && <Badge size="xs" color="sage" variant="light" ml={4}>Monthly</Badge>}
                </Text>
                <Text size="sm" fw={600}>{formatAmount(amount, currency)}{frequency === 'monthly' ? '/mo' : ''}</Text>
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
              <Group justify="space-between">
                <Text size="sm" fw={700} c="var(--bm-text-dark)">Total charge</Text>
                <Text size="md" fw={800} c="var(--bm-terracotta)">
                  {formatAmount(totalCharge, currency)}{frequency === 'monthly' ? '/mo' : ''}
                </Text>
              </Group>
            </div>

            {donorType === 'organization' && (
              <Alert icon={<IconAlertCircle size={14} />} color="blue" variant="light" radius="md" mt={12}>
                <Text size="xs">
                  Your receipt will be issued to <strong>{organizationName.trim()}</strong> for
                  business tax deduction purposes.
                </Text>
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
