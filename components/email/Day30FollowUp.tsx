import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import type { GymConfig } from '@/types';

interface Day30FollowUpProps {
  memberName: string;
  gymConfig: GymConfig;
}

export default function Day30FollowUp({ memberName, gymConfig }: Day30FollowUpProps) {
  const firstName = memberName.split(' ')[0];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';

  return (
    <Html>
      <Head />
      <Preview>30 days in — time to measure your progress, {firstName}! 📊</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: primaryColor, padding: '28px', textAlign: 'center' }}>
          <Heading style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>
            30 Days In! 🏆
          </Heading>
          <Text style={{ color: '#ffffff', opacity: 0.9, fontSize: '15px', margin: '8px 0 0' }}>
            One month of showing up. That&apos;s massive.
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginTop: '16px' }}>
            <Text style={{ fontSize: '17px', color: '#111827', lineHeight: '1.7' }}>
              <strong>{firstName}</strong>, 30 days ago you took a step that most people only
              think about. And here you are — a whole month in. 💪
            </Text>

            <Section
              style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '10px',
                padding: '20px',
                margin: '20px 0',
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: '15px', color: '#166534', margin: '0 0 12px' }}>
                📊 Month 1 Milestone — Time to Measure
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Take your current weight (same time of day as Day 1)
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Take measurements: waist, hips, chest, arms
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Take progress photos (front and side)
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Note how you feel — energy, sleep, confidence
              </Text>
            </Section>

            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              Book a <strong>Progress Review Session</strong> with your trainer{' '}
              <strong>{gymConfig.trainerName}</strong>. They&apos;ll review your numbers, adjust your
              training, and set you up for Month 2.
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '8px' }}>
              <Button
                href={`mailto:${gymConfig.trainerEmail}?subject=30-Day Progress Review — ${memberName}`}
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                }}
              >
                Book Progress Review 📅
              </Button>
            </Section>

            <Text style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
              Your trainer {gymConfig.trainerName} has also been CC&apos;d on this email and is
              looking forward to your review.
            </Text>
          </Section>

          <Text style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
            {gymConfig.name} • Powered by GymSync
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
