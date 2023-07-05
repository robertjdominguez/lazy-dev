const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

async function cleanUpEmail() {
  // Set up JWT credentials
  const jwtClient = new JWT({
    email: process.env.GOOGLE_EMAIL,
    key: process.env.GOOGLE_APP_PASSCODE,
    scopes: ["https://www.googleapis.com/auth/gmail.modify"],
  });

  // Generate an access token
  const tokens = await jwtClient.authorize();
  const accessToken = tokens.access_token;

  // Use the access token to make an API request
  const gmail = google.gmail({ version: "v1", auth: accessToken });
  const response = await gmail.users.messages.list({
    userId: "me",
  });
  const messages = response.data.messages;
  console.log(messages);
}

cleanUpEmail();
