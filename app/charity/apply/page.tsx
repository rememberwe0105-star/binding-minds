'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Box, Group, Button, TextInput,
  Textarea, Select, Stepper, Card, ThemeIcon, SimpleGrid,
  Badge, Divider, Alert, Checkbox, Timeline
} from '@mantine/core';
import {
  IconBuilding, IconFileText, IconCheck,
  IconArrowRight, IconArrowLeft, IconShieldCheck,
  IconInfoCircle, IconSearch, IconHeartHandshake,
  IconClock, IconMail, IconCreditCard
} from '@tabler/icons-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import classes from './page.module.css';

const CATEGORIES = [
  { value: 'Community', label: '🏘️ Community & Social Services' },
  { value: 'Health', label: '🏥 Health & Medical' },
  { value: 'Education', label: '📚 Education & Youth' },
  { value: 'Environment', label: '🌿 Environment & Conservation' },
  { value: 'Animal Welfare', label: '🐾 Animal Welfare' },
  { value: 'Arts', label: '🎨 Arts & Culture' },
  { value: 'Emergency', label: '🚨 Emergency Relief & Disaster' },
  { value: 'International', label: '🌍 International Aid' },
  { value: 'Religious', label: '⛪ Religious & Faith-Based' },
  { value: 'Other', label: '📌 Other' },
];

interface FormData {
  ccNumber: string;
  legalName: string;
  website: string;
  
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  
  category: string;
  mission: string;
  description: string;
  
  agreed: boolean;
}

const INITIAL: FormData = {
  ccNumber: '',
  legalName: '',
  website: '',
  
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  
  category: '',
  mission: '',
  description: '',
  
  agreed: false,
};

export default function CharityApplyPage() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // 상태 변수 (API 시뮬레이션용)
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const STEP_LABELS = ['Identify', 'Verify', 'Profile', 'Review'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < active) {
      setActive(stepIndex);
    } else if (stepIndex > active) {
      showToast(`Please complete "${STEP_LABELS[active]}" before moving to "${STEP_LABELS[stepIndex]}".`);
    }
  };

  const handleSearchCC = async () => {
    if (!form.ccNumber) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchSuccess(false);

    try {
      const res = await fetch(`/api/charities/search?cc=${encodeURIComponent(form.ccNumber)}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || 'Could not connect to the Charities Register. Please try again.');
        setIsSearching(false);
        return;
      }

      if (!data.found) {
        setSearchError(`No charity found with registration number "${form.ccNumber}". Please double-check your CC number.`);
        setIsSearching(false);
        return;
      }

      // 탈퇴한 단체인지 확인
      if (data.data.status === 'Deregistered') {
        setSearchError(`"${data.data.name}" is currently deregistered from the Charities Register. Only registered charities can claim a profile.`);
        setIsSearching(false);
        return;
      }

      setForm(prev => ({
        ...prev,
        legalName: data.data.name,
        website: data.data.website || '',
      }));
      setSearchSuccess(true);
    } catch {
      setSearchError('Network error — could not reach the Charities Register. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const canNext = () => {
    if (active === 0) return searchSuccess;
    if (active === 1) return !!(form.contactName && form.contactTitle && form.contactEmail);
    if (active === 2) return !!(form.category && form.mission);
    if (active === 3) return form.agreed;
    return true;
  };

  const handleSubmit = () => {
    // TODO: POST /api/v1/charities/claim 
    setSubmitted(true);
  };

  // 이메일 도메인 매칭 확인 유틸리티
  const isDomainMatch = () => {
    if (!form.website || !form.contactEmail) return false;
    const websiteDomain = form.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
    const emailDomain = form.contactEmail.split('@')[1]?.toLowerCase();
    return websiteDomain === emailDomain;
  };

  // 문의 이메일 생성 유틸리티
  const contactMailto = `mailto:hello@deargiver.nz?subject=${encodeURIComponent(`Charity Claim Enquiry — ${form.ccNumber || 'CC Number'}`)}&body=${encodeURIComponent(`Hi DearGiver Team,\n\nI am trying to claim a profile for my organisation but encountered an issue during the CC number search.\n\nCC Number: ${form.ccNumber}\nOrganisation Name: \nMy Name: \nMy Email: \n\nPlease assist me with the claim process.\n\nKind regards`)}`;

  if (submitted) {
    return (
      <>
        <Header />
        <main className={classes.page}>
          <Container size="sm" py={80}>
            <Card shadow="sm" radius="md" p={40} ta="center" withBorder>
              <ThemeIcon size={80} radius="100%" color="sage" variant="light" mx="auto" mb={24}>
                <IconCheck size={40} />
              </ThemeIcon>
              <Title order={2} mb={8} c="var(--bm-text-dark)">
                Application Submitted!
              </Title>
              <Text size="md" c="var(--bm-text-muted)" mb={40}>
                We&apos;re reviewing your claim for <strong>{form.legalName || 'your charity'}</strong>.<br/>
                We will contact you via email within 1-2 business days.
              </Text>

              <Box ta="left" maw={400} mx="auto" mb={40}>
                <Title order={4} mb={24} c="var(--bm-text-dark)">What happens next?</Title>
                <Timeline active={0} bulletSize={32} lineWidth={2} color="sage">
                  <Timeline.Item bullet={<IconCheck size={16} />} title="Application Received">
                    <Text c="dimmed" size="xs" mt={4}>You&apos;ve successfully submitted your claim.</Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconClock size={16} />} title="Under Review" lineVariant="dashed">
                    <Text c="dimmed" size="xs" mt={4}>Our team verifies your details.</Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconMail size={16} />} title="Look out for an email" lineVariant="dashed">
                    <Text c="dimmed" size="xs" mt={4}>We&apos;ll send an invitation to {form.contactEmail || 'your email'}.</Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={<IconCreditCard size={16} />} title="Connect & Go Live">
                    <Text c="dimmed" size="xs" mt={4}>
                      Click the link in the email to securely add your bank details via Stripe.
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Box>

              <Group justify="center">
                <Button component={Link} href="/" variant="outline" color="dark" radius="xl" size="md">
                  Return to Home
                </Button>
              </Group>
            </Card>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={classes.page}>
        <div className={classes.hero}>
          <Container size="md">
            <Title order={1} className={classes.heroTitle}>
              Claim Your Profile
            </Title>
            <Text className={classes.heroSubtitle}>
              Join DearGiver to manage your public profile and start receiving donations securely.
            </Text>
          </Container>
        </div>

        <Container size="md" className={classes.contentArea}>
          <Card shadow="sm" radius="md" p={{ base: 20, sm: 40 }} withBorder>
            {toastMessage && (
              <Alert
                color="orange"
                variant="light"
                icon={<IconInfoCircle size={16} />}
                mb={16}
                withCloseButton
                onClose={() => setToastMessage(null)}
                style={{ animation: 'fadeSlideDown 0.3s ease' }}
              >
                <Text size="sm">{toastMessage}</Text>
              </Alert>
            )}
            <Stepper
              active={active}
              onStepClick={handleStepClick}
              color="sage"
              classNames={{
                stepIcon: classes.stepIcon,
                separator: classes.stepSeparator,
              }}
              mb={48}
            >
              <Stepper.Step label="Identify" description="Find your charity" icon={<IconSearch size={18} />} />
              <Stepper.Step label="Verify" description="Representative details" icon={<IconShieldCheck size={18} />} />
              <Stepper.Step label="Profile" description="Basic information" icon={<IconFileText size={18} />} />
              <Stepper.Step label="Review" description="Finalise claim" icon={<IconCheck size={18} />} />
            </Stepper>

            <Box className={classes.stepContent}>
              {/* STEP 0: Identify */}
              {active === 0 && (
                <div className={classes.animateFadeIn}>
                  <Title order={3} mb={8} c="var(--bm-text-dark)">Find Your Charity</Title>
                  <Text c="var(--bm-text-muted)" size="sm" mb={24}>
                    Enter your New Zealand Charities Services registration number to find your public profile.
                  </Text>

                  <Group align="flex-end" mb={24}>
                    <TextInput
                      label="Charities Services Number (CC Number)"
                      placeholder="e.g. CC12345"
                      required
                      value={form.ccNumber}
                      onChange={(e) => {
                        set('ccNumber')(e.target.value.toUpperCase());
                        setSearchSuccess(false);
                        setSearchError(null);
                      }}
                      size="md"
                      style={{ flex: 1 }}
                    />
                    <Button 
                      size="md" 
                      color="sage" 
                      onClick={handleSearchCC}
                      loading={isSearching}
                      disabled={!form.ccNumber}
                    >
                      Find Charity
                    </Button>
                  </Group>

                  {searchSuccess && (
                    <Alert color="sage" variant="light" title="Charity Found!" icon={<IconBuilding size={16} />}>
                      <SimpleGrid cols={2} spacing="sm" mt={12}>
                        <Box>
                          <Text size="xs" c="dimmed">Legal Name</Text>
                          <Text fw={600}>{form.legalName}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Website</Text>
                          <Text fw={600}>{form.website || '(Not listed)'}</Text>
                        </Box>
                      </SimpleGrid>
                      <Text size="xs" mt={12} c="dimmed">
                        If this is your charity, proceed to the next step to verify your identity.
                      </Text>
                    </Alert>
                  )}

                  {searchError && (
                    <Alert color="red" variant="light" title="Search Issue" icon={<IconInfoCircle size={16} />} mb={16}>
                      <Text size="sm" mb={16}>{searchError}</Text>
                      <Divider mb={12} />
                      <Text size="xs" c="dimmed" mb={8}>
                        Having trouble? Our team can help you manually.
                      </Text>
                      <Button
                        component="a"
                        href={contactMailto}
                        variant="light"
                        color="blue"
                        size="sm"
                        radius="xl"
                        leftSection={<IconMail size={14} />}
                      >
                        Contact DearGiver Support
                      </Button>
                    </Alert>
                  )}
                </div>
              )}

              {/* STEP 1: Verify */}
              {active === 1 && (
                <div className={classes.animateFadeIn}>
                  <Title order={3} mb={8} c="var(--bm-text-dark)">Representative Verification</Title>
                  <Text c="var(--bm-text-muted)" size="sm" mb={24}>
                    Please provide your details. For the fastest approval, use an email address that matches your official website domain.
                  </Text>

                  <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb={24}>
                    <Text size="sm">
                      <strong>Official Email Verification:</strong> If your email domain matches your website (e.g., <code>you@{form.website || 'yourcharity.org.nz'}</code>), your application can be processed much faster. If domains do not match, our team will contact you for manual verification.
                    </Text>
                  </Alert>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <TextInput
                      label="Your Name"
                      placeholder="Jane Doe"
                      required
                      value={form.contactName}
                      onChange={(e) => set('contactName')(e.target.value)}
                      size="md"
                    />
                    <TextInput
                      label="Your Role / Title"
                      placeholder="e.g. CEO, Fundraising Manager"
                      required
                      value={form.contactTitle}
                      onChange={(e) => set('contactTitle')(e.target.value)}
                      size="md"
                    />
                    <TextInput
                      label="Official Email Address"
                      placeholder={`e.g. hello@${form.website || 'yourcharity.org.nz'}`}
                      type="email"
                      required
                      value={form.contactEmail}
                      onChange={(e) => set('contactEmail')(e.target.value)}
                      size="md"
                    />
                    <TextInput
                      label="Phone Number"
                      placeholder="Optional"
                      value={form.contactPhone}
                      onChange={(e) => set('contactPhone')(e.target.value)}
                      size="md"
                    />
                  </SimpleGrid>
                  
                  {form.contactEmail && form.website && (
                    <Box mt={16}>
                      {isDomainMatch() ? (
                        <Badge color="sage" variant="light" leftSection={<IconCheck size={12} />}>
                          Domain Match: Fast Approval Enabled
                        </Badge>
                      ) : (
                        <Badge color="orange" variant="light" leftSection={<IconInfoCircle size={12} />}>
                          Domain Mismatch: Manual Verification Required
                        </Badge>
                      )}
                    </Box>
                  )}
                </div>
              )}

              {/* STEP 2: Profile */}
              {active === 2 && (
                <div className={classes.animateFadeIn}>
                  <Title order={3} mb={8} c="var(--bm-text-dark)">Profile Settings</Title>
                  <Text c="var(--bm-text-muted)" size="sm" mb={24}>
                    Review and update your public profile information. You can always change this later in your dashboard.
                  </Text>

                  <Select
                    label="Primary Category"
                    placeholder="Select category"
                    data={CATEGORIES}
                    required
                    value={form.category}
                    onChange={(val) => set('category')(val || '')}
                    size="md"
                    mb="lg"
                  />

                  <Textarea
                    label="Short Mission Statement"
                    placeholder="In one or two sentences, what is your charity's main goal?"
                    description="This appears on your profile card."
                    required
                    value={form.mission}
                    onChange={(e) => set('mission')(e.target.value)}
                    size="md"
                    minRows={2}
                    mb="lg"
                  />

                  <Textarea
                    label="Detailed Description (Optional)"
                    placeholder="Tell donors more about your impact, history, and current projects."
                    value={form.description}
                    onChange={(e) => set('description')(e.target.value)}
                    size="md"
                    minRows={4}
                  />
                </div>
              )}

              {/* STEP 3: Review */}
              {active === 3 && (
                <div className={classes.animateFadeIn}>
                  <Title order={3} mb={8} c="var(--bm-text-dark)">Review & Submit</Title>
                  <Text c="var(--bm-text-muted)" size="sm" mb={24}>
                    Please review your information before submitting. Our team will review your claim to ensure platform trust and safety.
                  </Text>

                  <Card withBorder bg="var(--mantine-color-gray-0)" mb={24}>
                    <SimpleGrid cols={2} spacing="md">
                      <Box>
                        <Text size="xs" c="dimmed">Charity</Text>
                        <Text fw={600}>{form.legalName}</Text>
                        <Text size="sm">{form.ccNumber}</Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">Representative</Text>
                        <Text fw={600}>{form.contactName}</Text>
                        <Text size="sm">{form.contactEmail}</Text>
                      </Box>
                    </SimpleGrid>
                  </Card>

                  <Alert color="terracotta" variant="light" title="What happens next?" icon={<IconHeartHandshake size={16} />} mb={24}>
                    <Text size="sm" mb={8}>
                      1. Our team will review your claim (usually within 24 hours).
                    </Text>
                    <Text size="sm" mb={8}>
                      2. If approved, you will receive an invitation to connect your bank and tax details securely via <strong>Stripe Connect</strong>.
                    </Text>
                    <Text size="sm">
                      3. Once connected, your profile will be fully active and ready to receive donations!
                    </Text>
                  </Alert>

                  <Box bg="var(--bm-sage-light)" p={20} style={{ borderRadius: 8 }} mb={32}>
                    <Checkbox
                      label="I confirm that I am an authorised representative of this charity and agree to the DearGiver Terms of Service."
                      checked={form.agreed}
                      onChange={(event) => set('agreed')(event.currentTarget.checked)}
                      color="sage"
                      size="md"
                    />
                  </Box>
                </div>
              )}
            </Box>

            <Divider my={32} />

            <Group justify="space-between">
              {active > 0 ? (
                <Button
                  variant="subtle"
                  color="dark"
                  onClick={() => setActive((c) => c - 1)}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {active < 3 ? (
                <Button
                  color="sage"
                  onClick={() => setActive((c) => c + 1)}
                  rightSection={<IconArrowRight size={16} />}
                  disabled={!canNext()}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  color="terracotta"
                  onClick={handleSubmit}
                  disabled={!canNext()}
                  rightSection={<IconCheck size={16} />}
                >
                  Submit Claim Request
                </Button>
              )}
            </Group>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
