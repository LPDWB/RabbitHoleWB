import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { readFileSync } from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SPREADSHEET_ID = "1brVhUcgvrVHTbZtmzk5n1JZ1cBUDWRNC0sry2tDTEjw";
const RANGE = "A2:C"; // пропускаем заголовки

export async function getStatuses() {
  const credentialsPath = path.join(process.cwd(), "credentials.json");
  const credentials = JSON.parse(readFileSync(credentialsPath, "utf-8"));

  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth: client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values || [];

  return rows.map(([code, description, actions]) => ({
    code,
    description,
    actions,
  }));
}
