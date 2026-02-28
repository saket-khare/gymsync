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

interface Day7FollowUpProps {
  memberName: string;
  gymConfig: GymConfig;
}

export default function Day7FollowUp({ memberName, gymConfig }: Day7FollowUpProps) {
  const firstName = memberName.split(' ')[0];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';

  return (
    <Html>
      <Head />
      <Preview>Week 1 done 🎉 — here&apos;s what&apos;s next, {firstName}!</Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: primaryColor, padding: '24px', textAlign: 'center' }}>
          <Heading style={{ color: '#ffffff', fontSize: '22px', margin: 0 }}>
            Week 1 Complete! 🎉
          </Heading>
          <Text style={{ color: '#ffffff', opacity: 0.85, fontSize: '14px', margin: '6px 0 0' }}>
            You showed up. That&apos;s everything.
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginTop: '16px' }}>
            <Text style={{ fontSize: '16px', color: '#111827', lineHeight: '1.7' }}>
              <strong>{firstName}</strong>, you made it through Week 1! 🙌
            </Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              Whether it felt easy or tough, you did it — and that consistency is exactly what
              builds lasting results.
            </Text>

            <Section
              style={{
                backgroundColor: `${primaryColor}10`,
                borderRadius: '10px',
                padding: '20px',
                margin: '20px 0',
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: '14px', color: '#111827', margin: '0 0 8px' }}>
                📝 Key Reminders From Your Meal Plan:
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Hit your protein target every day — it&apos;s the most important macro.
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Drink at least 2.5L of water — especially on training days.
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                • Meal prep Sunday saves your whole week. Try it.
              </Text>
            </Section>

            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              Ready to level up? Book a personal training session with{' '}
              <strong>{gymConfig.trainerName}</strong> to get a customised workout program
              built around your progress so far.
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                href={`mailto:${gymConfig.trainerEmail}?subject=Book PT Session — ${memberName}`}
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                }}
              >
                Book a PT Session 🏋️
              </Button>
            </Section>

            <Text style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginTop: '16px' }}>
              Keep your meal plan handy for Week 2 — same structure, adjust portions if needed.
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
