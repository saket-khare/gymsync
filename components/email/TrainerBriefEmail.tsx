import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import type { GymConfig, TrainerBrief } from '@/types';

interface TrainerBriefEmailProps {
  memberName: string;
  gymConfig: GymConfig;
  trainerBrief: TrainerBrief;
}

const UPSELL_COLORS = {
  HIGH: '#dc2626',
  MEDIUM: '#d97706',
  LOW: '#6b7280',
};

export default function TrainerBriefEmail({ memberName, gymConfig, trainerBrief }: TrainerBriefEmailProps) {
  const { memberSnapshot, upsellSignal } = trainerBrief;
  const signalColor = UPSELL_COLORS[upsellSignal];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';

  return (
    <Html>
      <Head />
      <Preview>
        New Member: {memberName} — {upsellSignal} PT Lead 🏋️
      </Preview>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif', margin: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: '#1f2937', padding: '20px 24px' }}>
          <Heading style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '500', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
            TRAINER BRIEF — {gymConfig.name}
          </Heading>
          <Heading style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: '8px 0 0' }}>
            {memberName}
          </Heading>
        </Section>

        {/* Upsell badge */}
        <Section
          style={{
            backgroundColor: signalColor,
            padding: '10px 24px',
            textAlign: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', margin: 0, fontWeight: '700', fontSize: '14px' }}>
            🎯 PT UPSELL SIGNAL: {upsellSignal}
          </Text>
        </Section>

        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
          {/* Quick Stats */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginTop: '16px' }}>
            <Heading style={{ fontSize: '16px', color: '#374151', marginTop: 0, marginBottom: '16px' }}>
              Member Snapshot
            </Heading>
            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Goal</Text>
                <Text style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.goal}
                </Text>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Experience</Text>
                <Text style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.experienceLevel}
                </Text>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Age</Text>
                <Text style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.age} years
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Urgency</Text>
                <Text style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.goalUrgency}
                </Text>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Timeline</Text>
                <Text style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.timeline}
                </Text>
                <Text style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>Fitness Score</Text>
                <Text style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {memberSnapshot.fitnessScore}/5
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Gap Analysis */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginTop: '12px', borderLeft: `4px solid ${primaryColor}` }}>
            <Heading style={{ fontSize: '15px', color: '#374151', marginTop: 0 }}>Gap Analysis</Heading>
            <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
              {trainerBrief.gapAnalysis}
            </Text>
          </Section>

          {/* Conversation Starters */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginTop: '12px' }}>
            <Heading style={{ fontSize: '15px', color: '#374151', marginTop: 0 }}>
              💬 Conversation Starters
            </Heading>
            {trainerBrief.conversationStarters.map((starter, i) => (
              <Text key={i} style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>
                {i + 1}. {starter}
              </Text>
            ))}
          </Section>

          {/* Upsell Signal */}
          <Section
            style={{
              backgroundColor: `${signalColor}15`,
              border: `2px solid ${signalColor}`,
              borderRadius: '12px',
              padding: '20px 24px',
              marginTop: '12px',
            }}
          >
            <Heading style={{ fontSize: '15px', color: signalColor, marginTop: 0 }}>
              🎯 PT Upsell Signal: {upsellSignal}
            </Heading>
            <Text style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              {trainerBrief.upsellReasoning}
            </Text>
          </Section>

          {/* Red Flags */}
          {trainerBrief.redFlags.length > 0 && (
            <Section
              style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px 24px',
                marginTop: '12px',
              }}
            >
              <Heading style={{ fontSize: '15px', color: '#92400e', marginTop: 0 }}>
                ⚠️ Red Flags — Read Before Session
              </Heading>
              {trainerBrief.redFlags.map((flag, i) => (
                <Text key={i} style={{ fontSize: '14px', color: '#78350f', margin: '4px 0' }}>
                  • {flag}
                </Text>
              ))}
            </Section>
          )}

          {/* Suggested modifications */}
          {trainerBrief.suggestedModifications.length > 0 && (
            <Section style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginTop: '12px' }}>
              <Heading style={{ fontSize: '15px', color: '#374151', marginTop: 0 }}>
                🔧 Suggested Modifications
              </Heading>
              {trainerBrief.suggestedModifications.map((mod, i) => (
                <Text key={i} style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                  • {mod}
                </Text>
              ))}
            </Section>
          )}

          {/* Baseline Test */}
          {trainerBrief.baselineTestSummary && (
            <Section style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px 24px', marginTop: '12px' }}>
              <Heading style={{ fontSize: '15px', color: '#166534', marginTop: 0 }}>
                📊 Baseline Test Summary
              </Heading>
              <Text style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                {trainerBrief.baselineTestSummary}
              </Text>
            </Section>
          )}

          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0 16px' }} />
          <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center' }}>
            Generated by GymSync for {gymConfig.name}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
