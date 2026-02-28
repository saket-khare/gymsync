import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TrainerBrief, GymConfig } from '@/types';

interface TrainerBriefPDFProps {
  trainerBrief: TrainerBrief;
  gymConfig: GymConfig;
}

const UPSELL_COLORS = {
  HIGH: '#dc2626',
  MEDIUM: '#d97706',
  LOW: '#6b7280',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    paddingBottom: 32,
  },
  header: {
    padding: '20 24',
    backgroundColor: '#1f2937',
  },
  headerLabel: {
    fontSize: 9,
    color: '#9ca3af',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  upsellBadge: {
    padding: '8 24',
    flexDirection: 'row',
    alignItems: 'center',
  },
  upsellText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  section: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableLabel: {
    width: 100,
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
  },
  tableValue: {
    flex: 1,
    fontSize: 9,
    color: '#111827',
  },
  bodyText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 10,
  },
  redFlagBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 16,
  },
  redFlagTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

export default function TrainerBriefPDF({ trainerBrief, gymConfig }: TrainerBriefPDFProps) {
  const { memberSnapshot, upsellSignal } = trainerBrief;
  const signalColor = UPSELL_COLORS[upsellSignal];
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document title={`Trainer Brief — ${memberSnapshot.name}`} author={gymConfig.name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>TRAINER BRIEF — {gymConfig.name}</Text>
          <Text style={styles.headerName}>{memberSnapshot.name}</Text>
          <Text style={styles.headerSub}>Generated: {today} • Trainer: {gymConfig.trainerName}</Text>
        </View>

        {/* Upsell signal badge */}
        <View style={[styles.upsellBadge, { backgroundColor: signalColor }]}>
          <Text style={styles.upsellText}>
            PT UPSELL SIGNAL: {upsellSignal} — {trainerBrief.upsellReasoning}
          </Text>
        </View>

        {/* Member Snapshot Table */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Member Snapshot</Text>
          {[
            ['Goal', memberSnapshot.goal],
            ['Goal Urgency', memberSnapshot.goalUrgency],
            ['Timeline', memberSnapshot.timeline],
            ['Experience', memberSnapshot.experienceLevel],
            ['Fitness Score', `${memberSnapshot.fitnessScore} / 5`],
            ['Age', `${memberSnapshot.age} years`],
          ].map(([label, value]) => (
            <View key={label} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Gap Analysis */}
        <View style={[styles.section, { borderLeftWidth: 3, borderLeftColor: primaryColor, paddingLeft: 12 }]}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: primaryColor }]}>
            Gap Analysis
          </Text>
          <Text style={styles.bodyText}>{trainerBrief.gapAnalysis}</Text>
        </View>

        {/* Conversation Starters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#374151' }]}>Conversation Starters</Text>
          {trainerBrief.conversationStarters.map((starter, i) => (
            <Text key={i} style={styles.listItem}>
              {i + 1}. {starter}
            </Text>
          ))}
        </View>

        {/* Suggested Modifications */}
        {trainerBrief.suggestedModifications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#374151' }]}>Suggested Modifications</Text>
            {trainerBrief.suggestedModifications.map((mod, i) => (
              <Text key={i} style={styles.listItem}>• {mod}</Text>
            ))}
          </View>
        )}

        {/* Red Flags */}
        {trainerBrief.redFlags.length > 0 && (
          <View style={styles.redFlagBox}>
            <Text style={styles.redFlagTitle}>⚠ RED FLAGS — Read Before First Session</Text>
            {trainerBrief.redFlags.map((flag, i) => (
              <Text key={i} style={[styles.listItem, { color: '#78350f' }]}>• {flag}</Text>
            ))}
          </View>
        )}

        {/* Baseline Test */}
        {trainerBrief.baselineTestSummary && (
          <View style={[styles.section, { backgroundColor: '#f0fdf4', borderRadius: 6, padding: 12 }]}>
            <Text style={[styles.sectionTitle, { color: '#166534', borderBottomColor: '#86efac' }]}>
              Baseline Test Results
            </Text>
            <Text style={[styles.bodyText, { color: '#374151' }]}>
              {trainerBrief.baselineTestSummary}
            </Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CONFIDENTIAL — {gymConfig.name} Trainer Brief
          </Text>
          <Text style={styles.footerText}>{trainerBrief.generatedAt.slice(0, 10)}</Text>
        </View>
      </Page>
    </Document>
  );
}
