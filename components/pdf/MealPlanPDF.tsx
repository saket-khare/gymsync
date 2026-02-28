import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { GeneratedMealPlan, GymConfig, MealPlanDay } from '@/types';

interface MealPlanPDFProps {
  mealPlan: GeneratedMealPlan;
  gymConfig: GymConfig;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    paddingTop: 0,
    paddingBottom: 20,
  },
  coverHeader: {
    padding: '32 24',
    alignItems: 'center',
  },
  gymName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginTop: 12,
  },
  generatedDate: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 4,
  },
  divider: {
    height: 2,
    marginHorizontal: 24,
    marginVertical: 12,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 24,
  },
  mealRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mealType: {
    width: 90,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#6b7280',
  },
  mealName: {
    flex: 1,
    fontSize: 9,
  },
  mealPortion: {
    width: 65,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  macroRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    marginTop: 4,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  macroLabel: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 2,
  },
  guidelineItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 12,
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
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

function DaySection({ day, primaryColor }: { day: MealPlanDay; primaryColor: string }) {
  const meals = [
    { type: 'Breakfast', meal: day.breakfast },
    day.midMorningSnack ? { type: 'Morning Snack', meal: day.midMorningSnack } : null,
    { type: 'Lunch', meal: day.lunch },
    day.eveningSnack ? { type: 'Evening Snack', meal: day.eveningSnack } : null,
    { type: 'Dinner', meal: day.dinner },
  ].filter(Boolean) as { type: string; meal: { name: string; description: string; portionSize: string; prepTimeMinutes: number } }[];

  return (
    <View>
      <Text style={[styles.dayHeader, { color: primaryColor }]}>{day.day}</Text>
      {meals.map((m, i) => (
        <View key={i} style={[styles.mealRow, { backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }]}>
          <Text style={styles.mealType}>{m.type}</Text>
          <Text style={styles.mealName}>{m.meal.name}</Text>
          <Text style={styles.mealPortion}>{m.meal.portionSize}</Text>
        </View>
      ))}
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: primaryColor }]}>{day.calories}</Text>
          <Text style={styles.macroLabel}>kcal</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: primaryColor }]}>{day.proteinG}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: primaryColor }]}>{day.carbsG}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: primaryColor }]}>{day.fatsG}g</Text>
          <Text style={styles.macroLabel}>Fats</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: primaryColor }]}>{day.waterLitres}L</Text>
          <Text style={styles.macroLabel}>Water</Text>
        </View>
      </View>
      {day.notes && (
        <Text style={{ paddingHorizontal: 24, fontSize: 8, color: '#6b7280', marginTop: 4 }}>
          Note: {day.notes}
        </Text>
      )}
    </View>
  );
}

export default function MealPlanPDF({ mealPlan, gymConfig }: MealPlanPDFProps) {
  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Split days across pages (3-4 days per page)
  const firstHalf = mealPlan.days.slice(0, 4);
  const secondHalf = mealPlan.days.slice(4);

  return (
    <Document
      title={`${mealPlan.memberName} — 7-Day Meal Plan`}
      author={gymConfig.name}
    >
      {/* Cover / First page */}
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={[styles.coverHeader, { backgroundColor: primaryColor }]}>
          <Text style={[styles.gymName, { color: '#ffffff' }]}>{gymConfig.name}</Text>
          <Text style={[styles.coverTitle, { color: '#ffffffcc' }]}>
            Personalised 7-Day Meal Plan
          </Text>
          <Text style={[styles.memberName, { color: '#ffffff' }]}>{mealPlan.memberName}</Text>
          <Text style={[styles.generatedDate, { color: '#ffffffaa' }]}>
            Goal: {mealPlan.goal} • Generated: {today}
          </Text>
        </View>

        {/* Calorie target summary */}
        <View style={[styles.section]}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#f9fafb',
              borderRadius: 8,
              padding: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: primaryColor }}>
                {mealPlan.weeklyCalorieTarget}
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>Daily kcal target</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: primaryColor }}>
                {mealPlan.days.length}
              </Text>
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>Days planned</Text>
            </View>
          </View>
        </View>

        {/* First 4 days */}
        {firstHalf.map((day, i) => (
          <DaySection key={i} day={day} primaryColor={primaryColor} />
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{gymConfig.name} — Confidential Meal Plan</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>

      {/* Second page: remaining days + guidelines */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.coverHeader, { backgroundColor: primaryColor, padding: '16 24' }]}>
          <Text style={{ color: '#ffffff', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>
            {mealPlan.memberName} — Meal Plan (continued)
          </Text>
        </View>

        {secondHalf.map((day, i) => (
          <DaySection key={i} day={day} primaryColor={primaryColor} />
        ))}

        {/* General Guidelines */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>General Guidelines</Text>
          {mealPlan.generalGuidelines.map((g, i) => (
            <Text key={i} style={styles.guidelineItem}>• {g}</Text>
          ))}
        </View>

        {/* Foods to Avoid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Foods to Limit / Avoid</Text>
          {mealPlan.foodsToAvoid.map((f, i) => (
            <Text key={i} style={[styles.guidelineItem, { color: '#b91c1c' }]}>• {f}</Text>
          ))}
        </View>

        {/* Supplements */}
        {mealPlan.supplementSuggestions && mealPlan.supplementSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#059669' }]}>Supplement Suggestions</Text>
            {mealPlan.supplementSuggestions.map((s, i) => (
              <Text key={i} style={[styles.guidelineItem, { color: '#065f46' }]}>• {s}</Text>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{gymConfig.name} — Confidential Meal Plan</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
