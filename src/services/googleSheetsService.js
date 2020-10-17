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

export const writeToGoogleSheet = async ({
    user,
    recipient,
    amount,
    reason
}) => {
    await jwtClient.authorize();
    google.sheets('v4').spreadsheets.values.append({
        auth: jwtClient,
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'Sheet1!A1:A1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'OVERWRITE',
        includeValuesInResponse: true,
        resource: {
            values: [[user, recipient, amount, reason, 'FALSE']]
        }
    });
};
