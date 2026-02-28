import { google } from 'googleapis';
import type { SheetRow, MemberFormData } from '@/types';

// Column order — NEVER rely on object key order
export const SHEET_COLUMNS = [
  'rowId',
  'processingStatus',
  'submittedAt',
  'gymSlug',
  'firstName',
  'lastName',
  'email',
  'phone',
  'age',
  'gender',
  'city',
  'primaryGoal',
  'goalUrgency',
  'timelineMonths',
  'goalDetails',
  'weightKg',
  'heightCm',
  'bodyFatPercent',
  'selfRatedFitness',
  'gymExperience',
  'dietType',
  'sleepHoursPerNight',
  'stressLevel',
  'occupationType',
  'medicalConditions',
  'injuries',
  'foodAllergies',
  'daysPerWeekAvailable',
  'sessionDurationMinutes',
  'hasHomeEquipment',
  'interestedInPT',
  'budgetForSupplements',
  'pushUpCount',
  'plankHoldSeconds',
  'flexibilityTest',
  'restingHeartRate',
  'mealPlanGenerated',
  'emailSent',
  'day3Sent',
  'day7Sent',
  'day30Sent',
] as const;

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error(
      'Google Sheets credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.',
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuthClient() });
}

function rowToArray(row: Partial<SheetRow>): string[] {
  return SHEET_COLUMNS.map((col) => {
    const val = (row as Record<string, unknown>)[col];
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
  });
}

function arrayToRow(values: string[]): SheetRow {
  const obj: Record<string, unknown> = {};
  SHEET_COLUMNS.forEach((col, i) => {
    obj[col] = values[i] ?? '';
  });

  // Type coercions
  return {
    ...(obj as unknown as SheetRow),
    age: Number(obj.age),
    weightKg: Number(obj.weightKg),
    heightCm: Number(obj.heightCm),
    bodyFatPercent: obj.bodyFatPercent ? Number(obj.bodyFatPercent) : undefined,
    selfRatedFitness: Number(obj.selfRatedFitness) as 1 | 2 | 3 | 4 | 5,
    sleepHoursPerNight: Number(obj.sleepHoursPerNight),
    stressLevel: Number(obj.stressLevel) as 1 | 2 | 3 | 4 | 5,
    timelineMonths: Number(obj.timelineMonths) as 3 | 6 | 12 | 24,
    daysPerWeekAvailable: Number(obj.daysPerWeekAvailable) as 2 | 3 | 4 | 5 | 6,
    sessionDurationMinutes: Number(obj.sessionDurationMinutes) as 30 | 45 | 60 | 90,
    hasHomeEquipment: obj.hasHomeEquipment === 'true',
    pushUpCount: obj.pushUpCount ? Number(obj.pushUpCount) : undefined,
    plankHoldSeconds: obj.plankHoldSeconds ? Number(obj.plankHoldSeconds) : undefined,
    restingHeartRate: obj.restingHeartRate ? Number(obj.restingHeartRate) : undefined,
    mealPlanGenerated: obj.mealPlanGenerated === 'true',
    emailSent: obj.emailSent === 'true',
    day3Sent: obj.day3Sent === 'true',
    day7Sent: obj.day7Sent === 'true',
    day30Sent: obj.day30Sent === 'true',
  };
}

async function ensureHeaders(sheetId: string): Promise<void> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A1:AO1',
  });

  const firstRow = response.data.values?.[0] ?? [];
  if (firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_COLUMNS as unknown as string[]] },
    });
  }
}

export async function appendRow(sheetId: string, rowData: SheetRow): Promise<void> {
  const sheets = getSheetsClient();
  await ensureHeaders(sheetId);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'A:AO',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [rowToArray(rowData)] },
  });
}

export async function updateRow(
  sheetId: string,
  rowId: string,
  updates: Partial<SheetRow>,
): Promise<void> {
  const sheets = getSheetsClient();

  // Find the row number
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A:A',
  });

  const rows = response.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === rowId);
  if (rowIndex === -1) {
    console.error(`[google-sheets] Row not found for rowId: ${rowId}`);
    return;
  }

  // Get the full existing row
  const existingResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `A${rowIndex + 1}:AO${rowIndex + 1}`,
  });

  const existingValues = existingResponse.data.values?.[0] ?? [];
  const existingObj: Record<string, string> = {};
  SHEET_COLUMNS.forEach((col, i) => {
    existingObj[col] = existingValues[i] ?? '';
  });

  // Merge updates
  const merged = { ...existingObj, ...updates };
  const newRow = rowToArray(merged as unknown as SheetRow);

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `A${rowIndex + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: [newRow] },
  });
}

export async function getRow(sheetId: string, rowId: string): Promise<SheetRow | null> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A:AO',
  });

  const rows = response.data.values ?? [];
  // Skip header row (index 0)
  const found = rows.slice(1).find((r) => r[0] === rowId);
  if (!found) return null;

  return arrayToRow(found as string[]);
}

export async function getAllRows(sheetId: string): Promise<SheetRow[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A:AO',
  });

  const rows = response.data.values ?? [];
  if (rows.length <= 1) return [];

  // Skip header row
  return rows.slice(1).map((row) => arrayToRow(row as string[]));
}

export function memberFormDataToSheetRow(
  data: MemberFormData,
  rowId: string,
): SheetRow {
  return {
    ...data,
    rowId,
    processingStatus: 'pending',
    mealPlanGenerated: false,
    emailSent: false,
    day3Sent: false,
    day7Sent: false,
    day30Sent: false,
  };
}
