import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const range = 'Sheet1!A2:C';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const statuses = rows.map(([code, description, action]) => ({
      code,
      description,
      action,
    }));

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error('Ошибка при загрузке из Google Sheets:', error);
    return NextResponse.json({ error: 'Ошибка сервера при получении статусов' }, { status: 500 });
  }
}
