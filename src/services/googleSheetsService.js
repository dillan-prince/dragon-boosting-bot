import { google } from 'googleapis';
import { Keys } from '../config/index.js';

const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID
} = await Keys();

const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
);

export const writeToDebitsSheet = (rowData) => {
    writeToSheet('Debits', [
        new Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'medium',
            timeZone: 'America/New_York'
        }).format(new Date()),
        ...rowData
    ]);
};

export const writeToCreditsSheet = (rowData) => {
    writeToSheet('Credits', [
        new Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'medium',
            timeZone: 'America/New_York'
        }).format(new Date()),
        ...rowData
    ]);
};

export const writeToSheet = async (sheetName, values) => {
    await jwtClient.authorize();
    google.sheets('v4').spreadsheets.values.append({
        auth: jwtClient,
        spreadsheetId: GOOGLE_SHEET_ID,
        range: `${sheetName}!A1:A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'OVERWRITE',
        resource: {
            values: [values]
        }
    });
};
