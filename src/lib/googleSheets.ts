
// lib/googleSheets.ts
import { google } from "googleapis";
import { readFileSync } from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const CREDENTIALS_PATH = "credentials.json";
const SPREADSHEET_ID = "1brVhUcgvrVHTbZtmzk5n1JZ1cBUDWRNC0sry2tDTEjw";
const RANGE = "Sheet1!A2:C";

export async function getSheetData() {
  const content = readFileSync(CREDENTIALS_PATH, "utf-8");
  const credentials = JSON.parse(content);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values || [];

  return rows.map(([code, description, action]) => ({
    code,
    description,
    action,
  }));
} // ← вот эта закрывающая скобка обязательно должна быть
