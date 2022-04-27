import express from 'express';
import Axios from 'axios';
import { google } from 'googleapis';
import axios from 'axios';
import moment from 'moment'

const app = express();
const port = 3001;
const sheetId = '1af-GPV-p_YfA6orHCphLqkdwW6woyAiZqc8_bK6N0cA';
const slackIntegrationWebhook = 'https://hooks.slack.com/services/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'
const auth = new google.auth.GoogleAuth({
  keyFile: "./keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets", 
});

const getSheetData = async() => {

  const authClientObject = await auth.getClient();

  const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

  const sheetData = await googleSheetsInstance.spreadsheets.values.get({
    auth,
    spreadsheetId: sheetId,
    // TODO: replace with actual sheet range once sheet is finished 
    range: "F2:F3", 
  });

  const results = await Promise.all(sheetData.data.values.map(async (element, index) => ({row: index,  ...await getSSLCertificate(element[0])})))

  const data = await googleSheetsInstance.spreadsheets.values.append({
    auth,
    spreadsheetId: sheetId,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'OVERWRITE',
    // TODO: replace with actual sheet range once sheet is finished 
    range: "I2:I3",
    resource: {
        values: results.map(element => [element.expiry]),
    },
  });

  /**
   * Set the length of time from now to start triggering expiry notifications by adding days to a current moment()
   */
  //RESET TO 30 DAYS FOR FULL DEPLOYMENT
  const expiryThreshold = moment().add(150, 'days')
  results.map( element => {
    if(moment(element.expiry).isBefore(expiryThreshold)) {
      console.log('POSTED TO SLACK')
      axios.post(slackIntegrationWebhook, {"text": `${element.url} is expiring on ${element.expiry} \n`})
    } else {
      console.log('NOT POSTED TO SLACK')
    }
  })
}

const getSSLCertificate = async(url) => {

  try {
    const response = await Axios.get(url);
    const cert = response.request.res.socket.getPeerCertificate(false);
    return {url: url, expiry: cert.valid_to}
  } catch (e) {
    console.log(e.response)
    throw e
  }
}

app.get('/', (req, res) => {
  try {
    getSheetData();
    res.status('200').send('Ok!');
  } catch (e) {
    res.send(e);
  }
})

app.listen(port, () => {
  console.log(`app is running on port: ${port}`)
})