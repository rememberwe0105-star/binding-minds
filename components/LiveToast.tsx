'use client';

import { useState, useEffect, useCallback } from 'react';
import { Group, Text, Avatar, Box } from '@mantine/core';
import classes from './LiveToast.module.css';

const donations = [
  { name: 'Sarah', amount: 25, campaign: 'Nurturing Nature', time: '2m ago' },
  { name: 'James', amount: 50, campaign: 'Education For All', time: '4m ago' },
  { name: 'Aroha', amount: 100, campaign: 'Clean Water Southland', time: '6m ago' },
  { name: 'Liam', amount: 30, campaign: 'Coastal Cleanup NZ', time: '8m ago' },
  { name: 'Mei', amount: 75, campaign: 'Music for Youth', time: '11m ago' },
];

export function LiveToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const cycleDonation = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % donations.length);
      setVisible(true);
    }, 500);
  }, []);

  useEffect(() => {
    // 첫 표시를 1.5초 후에 시작
    const showTimer = setTimeout(() => setVisible(true), 1500);
    // 7초마다 다음 기부로 전환
    const interval = setInterval(cycleDonation, 7000);
    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, [cycleDonation]);

  const donation = donations[currentIndex];

  return (
    <Box className={`${classes.toast} ${visible ? classes.visible : classes.hidden}`}>
      <Group gap={10} wrap="nowrap">
        <Avatar color="terracotta" radius="xl" size={32}>
          {donation.name[0]}
        </Avatar>
        <div>
          <Text size="xs" lh={1.4}>
            <Text component="span" fw={700} c="var(--bm-text-dark)">{donation.name}</Text>
            {' donated '}
            <Text component="span" fw={700} c="var(--bm-terracotta)">${donation.amount}</Text>
            {' to '}
            <Text component="span" fw={600}>{donation.campaign}</Text>
          </Text>
          <Text size="xs" c="dimmed">{donation.time}</Text>
        </div>
      </Group>
    </Box>
  );
}
