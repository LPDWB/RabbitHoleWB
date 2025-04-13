import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export async function getStatuses() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: "Sheet1!A2:C",
  });

  const rows = response.data.values || [];

  return rows.map(([code, description, actions]) => ({
    code,
    description,
    actions,
  }));
}
