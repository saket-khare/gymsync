/**
 * setup-sheet.mjs
 * Writes headers, formats, and freezes the GymSync Google Sheet.
 * Run once: node scripts/setup-sheet.mjs
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------- Load .env.local manually ----------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
const envLines = readFileSync(envPath, 'utf8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

// ---------- Config ----------
const SHEET_ID = '1ch_3Alo-b9iTIIc-7DYzqkCs1UV3JP9iAoPB0P21ct8';

const SHEET_COLUMNS = [
  'rowId', 'processingStatus', 'submittedAt', 'gymSlug', 'firstName', 'lastName',
  'email', 'phone', 'age', 'gender', 'city', 'primaryGoal', 'goalUrgency',
  'timelineMonths', 'goalDetails', 'weightKg', 'heightCm', 'bodyFatPercent',
  'selfRatedFitness', 'gymExperience', 'dietType', 'sleepHoursPerNight',
  'stressLevel', 'occupationType', 'medicalConditions', 'injuries', 'foodAllergies',
  'daysPerWeekAvailable', 'sessionDurationMinutes', 'hasHomeEquipment', 'interestedInPT',
  'budgetForSupplements', 'pushUpCount', 'plankHoldSeconds', 'flexibilityTest',
  'restingHeartRate', 'mealPlanGenerated', 'emailSent', 'day3Sent', 'day7Sent', 'day30Sent',
];

// ---------- Auth ----------
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const rawKey = process.env.GOOGLE_PRIVATE_KEY;
if (!email || !rawKey) {
  console.error('❌  Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env.local');
  process.exit(1);
}
const privateKey = rawKey.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: email, private_key: privateKey },
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const sheets = google.sheets({ version: 'v4', auth });

// ---------- Main ----------
async function main() {
  console.log(`\n🔑  Service account : ${email}`);
  console.log(`📋  Sheet ID        : ${SHEET_ID}\n`);

  // 1. Test access
  console.log('1/4  Testing sheet access…');
  let spreadsheet;
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    spreadsheet = res.data;
    console.log(`     ✅  Access OK — "${spreadsheet.properties?.title}"`);
  } catch (err) {
    if (err.status === 403 || err.code === 403) {
      console.error('\n❌  The service account does not have access to this sheet.');
      console.error('    Please share the sheet with Editor permission:');
      console.error(`    👉  ${email}`);
      console.error('\n    Steps:');
      console.error('    1. Open https://docs.google.com/spreadsheets/d/' + SHEET_ID);
      console.error('    2. Click Share (top-right)');
      console.error('    3. Add ' + email + ' as Editor');
      console.error('    4. Click Send (uncheck "Notify people" if you like)');
      console.error('    5. Re-run this script\n');
    } else {
      console.error('\n❌  Unexpected error:', err.message);
    }
    process.exit(1);
  }

  // 2. Write headers
  console.log('2/4  Writing column headers…');
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: { values: [SHEET_COLUMNS] },
  });
  console.log(`     ✅  ${SHEET_COLUMNS.length} headers written`);

  // 3. Format header row (bold white text, dark-blue bg) + freeze row 1
  console.log('3/4  Formatting header row and freezing…');
  const sheetIdNum = spreadsheet.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        // Bold white text + dark-blue background on row 1
        {
          repeatCell: {
            range: {
              sheetId: sheetIdNum,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: SHEET_COLUMNS.length,
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 10,
                },
                backgroundColor: {
                  red: 0.102,
                  green: 0.337,
                  blue: 0.855,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)',
          },
        },
        // Freeze row 1
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetIdNum,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        // Auto-resize all columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheetIdNum,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: SHEET_COLUMNS.length,
            },
          },
        },
      ],
    },
  });
  console.log('     ✅  Header formatted and row frozen');

  // 4. Done
  console.log('\n4/4  Summary');
  console.log('     Sheet URL  : https://docs.google.com/spreadsheets/d/' + SHEET_ID);
  console.log('     Sheet ID   : ' + SHEET_ID);
  console.log('\n🎉  Sheet is ready! Update lib/gym-config.ts and .env.local next.\n');
}

main().catch((err) => {
  console.error('\n❌  Script failed:', err.message ?? err);
  process.exit(1);
});
