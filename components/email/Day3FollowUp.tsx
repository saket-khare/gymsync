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
import { goalLabel } from '@/lib/utils';

interface Day3FollowUpProps {
  memberName: string;
  gymConfig: GymConfig;
  primaryGoal?: string;
}

const GOAL_TIPS: Record<string, string> = {
  weight_loss: 'Stay in your calorie deficit — even by 200–300 kcal/day, you will see results within weeks. Don\'t skip breakfast.',
  muscle_gain: 'Protein timing matters. Try to eat within 30 minutes after training. Aim for 1.6–2g of protein per kg of body weight.',
  aesthetic: 'Focus on hitting your protein target first, then let calories fall into place naturally. Consistency beats perfection.',
  athletic_performance: 'Carbs are your friend on training days. Don\'t fear them — they fuel your performance.',
  general_fitness: 'Stay hydrated. Aim for at least 2.5 litres of water daily. It affects energy, recovery, and focus.',
  competition_prep: 'Document everything — photos, measurements, strength numbers. Your baseline today is your benchmark tomorrow.',
};

export default function Day3FollowUp({ memberName, gymConfig, primaryGoal }: Day3FollowUpProps) {
  const firstName = memberName.split(' ')[0];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';
  const tip = GOAL_TIPS[primaryGoal ?? 'general_fitness'] ?? GOAL_TIPS.general_fitness;

  return (
    <Html>
      <Head />
      <Preview>
        Day 3 check-in — how&apos;s it going, {firstName}?
      </Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        <Section style={{ backgroundColor: primaryColor, padding: '24px', textAlign: 'center' }}>
          <Heading style={{ color: '#ffffff', fontSize: '20px', margin: 0 }}>
            Day 3 Check-in ✅
          </Heading>
        </Section>

        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginTop: '16px' }}>
            <Text style={{ fontSize: '16px', color: '#111827', lineHeight: '1.7' }}>
              Hey <strong>{firstName}</strong>! 👋
            </Text>
            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              Three days in — you&apos;re doing great! Your goal of{' '}
              <strong>{goalLabel(primaryGoal ?? 'general_fitness')}</strong> doesn&apos;t happen overnight,
              but every meal, every session, every choice adds up.
            </Text>

            <Section style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', margin: '20px 0' }}>
              <Text style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 6px' }}>
                💡 Tip for Your Goal:
              </Text>
              <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {tip}
              </Text>
            </Section>

            <Text style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}>
              How&apos;s it going? Reply to this email with a quick rating:{' '}
              <strong>1 = struggling, 5 = crushing it</strong>. Your trainer {gymConfig.trainerName} will see your reply.
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                href={`mailto:${gymConfig.trainerEmail}?subject=Day 3 Check-in — ${memberName}`}
                style={{
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Reply to Trainer
              </Button>
            </Section>
          </Section>

          <Text style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
            {gymConfig.name} • Powered by GymSync
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
