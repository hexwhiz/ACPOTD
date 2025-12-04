import { Client, GatewayIntentBits } from "discord.js";
import { google } from "googleapis";
import cron from "node-cron";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Load Google Sheets API credentials
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // Your service account key
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Replace with your sheet ID
const RANGE = "ACPOTD!B:C"; // Adjust the range if needed
const CHANNEL_ID = "1444739857913217034"; // Replace with the POTD Discord channel ID
const LAST_FETCHED_FILE = "lastFetchedIndex.json"; // File to store the index of the last fetched question

// Load the last fetched index and POTD number from the file (or default to 0 and 1)
function loadLastFetchedData() {
  try {
    const data = fs.readFileSync(LAST_FETCHED_FILE, "utf-8");
    const parsedData = JSON.parse(data);
    return {
      index: parsedData.index || 0,
      potdNumber: parsedData.potdNumber || 1,
    };
  } catch (error) {
    return { index: 0, potdNumber: 1 }; // Default values
  }
}

// Save the last fetched index and POTD number to the file
function saveLastFetchedData(index, potdNumber) {
  fs.writeFileSync(
    LAST_FETCHED_FILE,
    JSON.stringify({ index, potdNumber }),
    "utf-8"
  );
}

async function getQuestions() {
  const { index, potdNumber } = loadLastFetchedData();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return { questions: [], potdNumber };
    }

    // Fetching 2 questions, change it if you need more
    const nextQuestions = rows.slice(index, index + 2);
    saveLastFetchedData(index + 2, potdNumber + 1); // Increment by 2 (number of questions)

    return { questions: nextQuestions, potdNumber };
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return { questions: [], potdNumber };
  }
}

async function sendProblemOfTheDay() {
  const { questions, potdNumber } = await getQuestions();
  if (questions.length < 2) return;

  const today = new Date().toLocaleDateString("en-GB");
  const message = `
🎯 **Problem of the Day (POTD #${potdNumber})**
📆 **Date: ${today}**  
@2025 @lead-2024

🔸 **Task 1:** [${questions[0][0]}](${questions[0][1]})  
🔸 **Task 2:** [${questions[1][0]}](${questions[1][1]})  

React with:
1️⃣ if you completed Task 1  
2️⃣ if you completed Task 2  
  `;

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send(message);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Run the cron job at midnight daily
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Cron job triggered at:", new Date().toLocaleString()); // Logs the time when the cron job runs
    await sendProblemOfTheDay();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (data) => {
  const cmd = data.toString().trim();
  if (cmd === "run-potd") {
    console.log("Manual trigger via stdin");
    await sendProblemOfTheDay();
  }
});
