import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import type { GymConfig, GeneratedMealPlan } from '@/types';
import { goalLabel, formatDate } from '@/lib/utils';

interface WelcomeEmailProps {
  memberName: string;
  gymConfig: GymConfig;
  mealPlan: GeneratedMealPlan;
}

export default function WelcomeEmail({ memberName, gymConfig, mealPlan }: WelcomeEmailProps) {
  const firstName = memberName.split(' ')[0];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';
  const day1 = mealPlan.days[0];

  return (
    <Html>
      <Head />
      <Preview>
        Hi {firstName}! Your personalised meal plan from {gymConfig.name} is here. 🎉
      </Preview>
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: primaryColor, padding: '32px 24px', textAlign: 'center' }}>
          {gymConfig.logoUrl && (
            <Img
              src={gymConfig.logoUrl}
              alt={gymConfig.name}
              height={48}
              style={{ margin: '0 auto 12px' }}
            />
          )}
          <Heading
            style={{ color: '#ffffff', fontSize: '24px', fontWeight: '700', margin: 0 }}
          >
            Welcome to {gymConfig.name}! 🎉
          </Heading>
        </Section>

        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
          {/* Greeting */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginTop: '16px' }}>
            <Text style={{ fontSize: '16px', color: '#111827', lineHeight: '1.6' }}>
              Hi <strong>{firstName}</strong>,
            </Text>
            <Text style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6' }}>
              Your personalised 7-day meal plan is ready! Our nutritionist has crafted it
              specifically for your <strong>{goalLabel(mealPlan.goal)}</strong> goal. You&apos;ll find the
              full PDF attached to this email.
            </Text>
          </Section>

          {/* Day 1 Preview */}
          {day1 && (
            <Section
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '28px',
                marginTop: '16px',
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              <Heading style={{ fontSize: '18px', color: '#111827', marginTop: 0 }}>
                📅 Day 1 Preview — {day1.day}
              </Heading>
              <Row>
                <Column>
                  <Text style={{ margin: '4px 0', color: '#374151', fontSize: '14px' }}>
                    🌅 <strong>Breakfast:</strong> {day1.breakfast.name}
                  </Text>
                  <Text style={{ margin: '4px 0', color: '#374151', fontSize: '14px' }}>
                    ☀️ <strong>Lunch:</strong> {day1.lunch.name}
                  </Text>
                  <Text style={{ margin: '4px 0', color: '#374151', fontSize: '14px' }}>
                    🌙 <strong>Dinner:</strong> {day1.dinner.name}
                  </Text>
                </Column>
              </Row>
              <Hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />
              <Row>
                <Column style={{ textAlign: 'center' }}>
                  <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Calories</Text>
                  <Text style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: primaryColor }}>
                    {day1.calories}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'center' }}>
                  <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Protein</Text>
                  <Text style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: primaryColor }}>
                    {day1.proteinG}g
                  </Text>
                </Column>
                <Column style={{ textAlign: 'center' }}>
                  <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Carbs</Text>
                  <Text style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: primaryColor }}>
                    {day1.carbsG}g
                  </Text>
                </Column>
                <Column style={{ textAlign: 'center' }}>
                  <Text style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Fats</Text>
                  <Text style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: primaryColor }}>
                    {day1.fatsG}g
                  </Text>
                </Column>
              </Row>
            </Section>
          )}

          {/* What to expect */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginTop: '16px' }}>
            <Heading style={{ fontSize: '18px', color: '#111827', marginTop: 0 }}>
              🗓️ What to Expect This Week
            </Heading>
            <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
              ✅ <strong>Day 1–2:</strong> Settle into your new meal rhythm. Focus on prep time.
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
              ✅ <strong>Day 3–5:</strong> Your trainer will check in on your progress.
            </Text>
            <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
              ✅ <strong>Day 6–7:</strong> Review how you felt. Celebrate consistency!
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
            <Text style={{ color: '#374151', fontSize: '14px' }}>
              Questions? Your trainer {gymConfig.trainerName} is here to help.
            </Text>
            <Button
              href={`mailto:${gymConfig.trainerEmail}`}
              style={{
                backgroundColor: primaryColor,
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Message Your Trainer
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <Text style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              {gymConfig.name} • Powered by GymSync
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: '11px', margin: '4px 0 0' }}>
              You received this because you joined {gymConfig.name}.{' '}
              <Link href="#" style={{ color: '#9ca3af' }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
