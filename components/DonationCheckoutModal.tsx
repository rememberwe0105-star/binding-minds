'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  SegmentedControl,
  Box,
  Badge,
  Stepper,
  Divider,
  Stack,
  Checkbox,
  ThemeIcon,
  SimpleGrid,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import {
  IconHeart,
  IconCreditCard,
  IconCheck,
  IconShieldCheck,
  IconLock,
  IconArrowRight,
  IconArrowLeft,
  IconConfetti,
  IconReceipt,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { Campaign } from '@/data/campaigns';
import { formatCurrency } from '@/data/campaigns';
import { getStripe } from '@/lib/stripe';
import classes from './DonationCheckoutModal.module.css';

// ============================================================
// 타입
// ============================================================
interface DonationCheckoutModalProps {
  opened: boolean;
  onClose: () => void;
  campaign: Campaign;
}

interface DonationData {
  amount: number;
  isMonthly: boolean;
  name: string;
  email: string;
  anonymous: boolean;
  taxReceipt: boolean;
  message: string;
}

const PRESET_AMOUNTS = ['25', '50', '100', '250', '500'];

// ============================================================
// PaymentForm — Stripe Elements 내부 컴포넌트
// ============================================================
function PaymentForm({
  donationData,
  campaign,
  onSuccess,
  onBack,
}: {
  donationData: DonationData;
  campaign: Campaign;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const taxRefund = Math.round(donationData.amount * 0.3333);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/campaigns/${campaign.slug}?donation=success`,
          receipt_email: donationData.email || undefined,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else {
        // 결제 성공 (3D Secure 없이 즉시 완료)
        onSuccess();
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className={classes.stepContent}>
      {/* 카드 입력 폼 (Stripe Payment Element) */}
      <Box mb={20}>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: donationData.name || undefined,
                email: donationData.email || undefined,
              },
            },
          }}
        />
      </Box>

      {errorMessage && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          radius="md"
          mb={16}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Payment preview */}
      <div className={classes.paymentPreview}>
        <Group justify="space-between" mb={4}>
          <Text size="sm" c="var(--bm-text-muted)">Donation amount</Text>
          <Text size="sm" fw={600}>{formatCurrency(donationData.amount)}</Text>
        </Group>
        <Group justify="space-between" mb={4}>
          <Text size="sm" c="var(--bm-text-muted)">Frequency</Text>
          <Badge size="sm" variant="light" color="sage">
            {donationData.isMonthly ? 'Monthly' : 'One-time'}
          </Badge>
        </Group>
        <Group justify="space-between" mb={4}>
          <Text size="sm" c="var(--bm-text-muted)">Tax refund</Text>
          <Text size="sm" fw={600} c="var(--bm-sage-dark)">
            {formatCurrency(taxRefund)}
          </Text>
        </Group>
        <Divider my={8} />
        <Group justify="space-between">
          <Text size="sm" fw={700} c="var(--bm-text-dark)">Your effective cost</Text>
          <Text size="md" fw={800} c="var(--bm-terracotta)">
            {formatCurrency(donationData.amount - taxRefund)}
          </Text>
        </Group>
      </div>

      <Group justify="space-between" mt={20}>
        <Button
          variant="subtle"
          color="dark"
          size="md"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          color="terracotta"
          size="md"
          radius="xl"
          leftSection={isProcessing ? <Loader size={16} color="white" /> : <IconLock size={16} />}
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          className={classes.nextBtn}
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(donationData.amount)}`}
        </Button>
      </Group>

      <Text ta="center" size="xs" c="dimmed" mt={12}>
        <IconShieldCheck size={12} style={{ verticalAlign: 'middle' }} /> Encrypted & secure via Stripe
      </Text>
    </div>
  );
}

// ============================================================
// StripePaymentStep — Elements Provider Wrapper
// ============================================================
function StripePaymentStep({
  clientSecret,
  donationData,
  campaign,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  donationData: DonationData;
  campaign: Campaign;
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#8F9779',
            colorBackground: '#FFFFFF',
            colorText: '#2D2A26',
            colorDanger: '#E2725B',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm
        donationData={donationData}
        campaign={campaign}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </Elements>
  );
}

// ============================================================
// 메인 모달 컴포넌트
// ============================================================
export function DonationCheckoutModal({ opened, onClose, campaign }: DonationCheckoutModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [taxReceipt, setTaxReceipt] = useState(true);
  const [message, setMessage] = useState('');

  // Stripe 관련 상태
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const amount = selectedAmount === 'custom' ? Number(customAmount) || 0 : Number(selectedAmount);
  const taxRefund = Math.round(amount * 0.3333);

  const resetAndClose = useCallback(() => {
    setActiveStep(0);
    setSelectedAmount('50');
    setCustomAmount('');
    setName('');
    setEmail('');
    setAnonymous(false);
    setTaxReceipt(true);
    setMessage('');
    setClientSecret(null);
    setApiError(null);
    onClose();
  }, [onClose]);

  const handleNext = () => {
    if (activeStep < 2) setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setClientSecret(null); // Reset payment intent when going back
      setActiveStep((s) => s - 1);
    }
  };

  // Step 1 → Step 2: 상세 정보 입력으로 이동
  const goToDetails = () => {
    handleNext();
  };

  // Step 2 → Step 3: Stripe PaymentIntent 생성 후 결제 단계로 이동
  const goToPayment = async () => {
    setIsCreatingIntent(true);
    setApiError(null);

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          campaignName: campaign.name,
          campaignSlug: campaign.slug,
          donorName: name,
          donorEmail: email,
          isMonthly,
          anonymous,
          taxReceipt,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
      setActiveStep(2); // Move to payment step
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.';
      setApiError(errorMsg);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // 결제 성공 → 확인 화면
  const handlePaymentSuccess = () => {
    setActiveStep(3);
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      size="lg"
      radius="lg"
      centered
      withCloseButton={activeStep < 3}
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      title={
        activeStep < 3 ? (
          <Group gap={8}>
            <IconHeart size={20} color="var(--bm-terracotta)" />
            <Text fw={700} size="lg" c="var(--bm-text-dark)">
              Donate to {campaign.name}
            </Text>
          </Group>
        ) : undefined
      }
      classNames={{ content: classes.modal, body: classes.modalBody }}
    >
      {/* Stepper */}
      {activeStep < 3 && (
        <Stepper
          active={activeStep}
          color="sage"
          size="sm"
          mb={24}
          classNames={{ stepIcon: classes.stepIcon }}
        >
          <Stepper.Step label="Amount" icon={<IconHeart size={16} />} />
          <Stepper.Step label="Details" icon={<IconCreditCard size={16} />} />
          <Stepper.Step label="Payment" icon={<IconLock size={16} />} />
          <Stepper.Step label="Done" icon={<IconCheck size={16} />} />
        </Stepper>
      )}

      {/* ── Step 1: Amount Selection ── */}
      {activeStep === 0 && (
        <div className={classes.stepContent}>
          {/* Monthly/One-time toggle */}
          <SegmentedControl
            value={isMonthly ? 'monthly' : 'once'}
            onChange={(v) => setIsMonthly(v === 'monthly')}
            data={[
              { value: 'once', label: '💝 One-time' },
              { value: 'monthly', label: '🔄 Monthly' },
            ]}
            fullWidth
            size="md"
            radius="xl"
            mb={24}
            className={classes.frequencyToggle}
          />

          {/* Amount presets */}
          <Text size="sm" fw={600} c="var(--bm-text-dark)" mb={12}>
            Select an amount
          </Text>
          <SimpleGrid cols={5} spacing={8} mb={12}>
            {PRESET_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                variant={selectedAmount === amt ? 'filled' : 'outline'}
                color={selectedAmount === amt ? 'terracotta' : 'dark'}
                radius="md"
                size="md"
                onClick={() => setSelectedAmount(amt)}
                className={selectedAmount === amt ? classes.amountBtnActive : classes.amountBtn}
              >
                ${amt}
              </Button>
            ))}
          </SimpleGrid>

          <Button
            variant={selectedAmount === 'custom' ? 'filled' : 'outline'}
            color={selectedAmount === 'custom' ? 'terracotta' : 'dark'}
            radius="md"
            size="md"
            fullWidth
            onClick={() => setSelectedAmount('custom')}
            mb={selectedAmount === 'custom' ? 12 : 0}
          >
            Custom Amount
          </Button>

          {selectedAmount === 'custom' && (
            <TextInput
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.currentTarget.value)}
              leftSection={<Text size="sm" fw={600}>$</Text>}
              size="lg"
              radius="md"
              type="number"
              min={5}
              autoFocus
            />
          )}

          {/* Tax refund info */}
          {amount > 0 && (
            <div className={classes.taxInfoBox}>
              <Group gap={8}>
                <ThemeIcon size={28} radius="xl" color="sage" variant="light">
                  <IconReceipt size={14} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600} c="var(--bm-sage-dark)">
                    Tax refund: {formatCurrency(taxRefund)}
                  </Text>
                  <Text size="xs" c="var(--bm-text-muted)">
                    Your effective cost is just {formatCurrency(amount - taxRefund)}
                    {isMonthly ? '/month' : ''}
                  </Text>
                </Box>
              </Group>
            </div>
          )}

          <Divider my={20} />

          <Group justify="flex-end">
            <Button
              color="terracotta"
              size="md"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              onClick={goToDetails}
              disabled={amount < 5}
              className={classes.nextBtn}
            >
              Continue — {formatCurrency(amount)}{isMonthly ? '/mo' : ''}
            </Button>
          </Group>
        </div>
      )}

      {/* ── Step 2: Details ── */}
      {activeStep === 1 && (
        <div className={classes.stepContent}>
          <Stack gap={16}>
            <TextInput
              label="Full Name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              size="md"
              radius="md"
              disabled={anonymous}
            />
            <TextInput
              label="Email Address"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
              radius="md"
              type="email"
              description="We'll send your receipt here"
            />

            <TextInput
              label="Leave a message (optional)"
              placeholder="Keep up the great work!"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              size="md"
              radius="md"
            />

            <Checkbox
              label="Donate anonymously"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.currentTarget.checked)}
              color="sage"
            />
            <Checkbox
              label="Send me a tax receipt (IRD-approved)"
              checked={taxReceipt}
              onChange={(e) => setTaxReceipt(e.currentTarget.checked)}
              color="sage"
            />
          </Stack>

          {apiError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              radius="md"
              mt={16}
            >
              {apiError}
            </Alert>
          )}

          <Group justify="space-between" mt={20}>
            <Button
              variant="subtle"
              color="dark"
              size="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              color="terracotta"
              size="md"
              radius="xl"
              leftSection={isCreatingIntent ? <Loader size={16} color="white" /> : <IconArrowRight size={16} />}
              onClick={goToPayment}
              disabled={isCreatingIntent}
              className={classes.nextBtn}
            >
              {isCreatingIntent ? 'Preparing...' : 'Proceed to Payment'}
            </Button>
          </Group>
        </div>
      )}

      {/* ── Step 3: Payment (Stripe Payment Element) ── */}
      {activeStep === 2 && clientSecret && (
        <StripePaymentStep
          clientSecret={clientSecret}
          donationData={{ amount, isMonthly, name, email, anonymous, taxReceipt, message }}
          campaign={campaign}
          onSuccess={handlePaymentSuccess}
          onBack={handleBack}
        />
      )}

      {activeStep === 2 && !clientSecret && (
        <Center py={60}>
          <Stack align="center" gap={16}>
            <Loader size="lg" color="sage" />
            <Text c="var(--bm-text-muted)">Initializing secure payment...</Text>
          </Stack>
        </Center>
      )}

      {/* ── Step 4: Confirmation ── */}
      {activeStep === 3 && (
        <div className={classes.confirmationStep}>
          <div className={classes.confettiIcon}>
            <IconConfetti size={56} color="var(--bm-terracotta)" stroke={1.5} />
          </div>
          <Title order={2} ta="center" c="var(--bm-text-dark)" mt={16}>
            Thank You! 🎉
          </Title>
          <Text ta="center" c="var(--bm-text-muted)" size="md" mt={8} mb={24} maw={400} mx="auto">
            Your donation of <strong>{formatCurrency(amount)}</strong> to{' '}
            <strong>{campaign.name}</strong> will make a real difference.
          </Text>

          <div className={classes.confirmationCard}>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="var(--bm-text-muted)">Amount</Text>
              <Text size="sm" fw={700}>{formatCurrency(amount)}{isMonthly ? '/month' : ''}</Text>
            </Group>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="var(--bm-text-muted)">Campaign</Text>
              <Text size="sm" fw={600} lineClamp={1} maw={200} ta="right">{campaign.name}</Text>
            </Group>
            <Group justify="space-between" mb={8}>
              <Text size="sm" c="var(--bm-text-muted)">Tax refund</Text>
              <Text size="sm" fw={600} c="var(--bm-sage-dark)">{formatCurrency(taxRefund)}</Text>
            </Group>
            {taxReceipt && (
              <Group justify="space-between">
                <Text size="sm" c="var(--bm-text-muted)">Receipt</Text>
                <Badge size="sm" color="sage" variant="light" leftSection={<IconCheck size={10} />}>
                  Sent to {email || 'your email'}
                </Badge>
              </Group>
            )}
          </div>

          <Stack gap={12} mt={28}>
            <Button
              color="terracotta"
              fullWidth
              size="md"
              radius="xl"
              onClick={resetAndClose}
            >
              Done
            </Button>
            <Button
              variant="outline"
              color="dark"
              fullWidth
              size="md"
              radius="xl"
              onClick={() => {
                setActiveStep(0);
                setClientSecret(null);
              }}
            >
              Donate Again
            </Button>
          </Stack>
        </div>
      )}
    </Modal>
  );
}
