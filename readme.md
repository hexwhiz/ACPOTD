----------Run this once------------
npm init -y
npm install discord.js googleapis node-cron dotenv






---2. How to get Google Sheets credentials.json (Service Account)----------
Follow these steps carefully:
STEP 1 — Go to Google Cloud Console

https://console.cloud.google.com/

Log in with your Google account.
STEP 2 — Create a new project
Left top → Project selector → New Project

Name it:
ACPOTD-BOT
Click Create.
STEP 3 — Enable Google Sheets API

Inside the project:

Left menu → APIs & Services
Click Enable APIs and Services
Search → Google Sheets API
Enable it.
STEP 4 — Create Service Account
Left menu → IAM & Admin → Service Accounts
Click Create Service Account.

Fill:

Name: discord-potd-bot
ID does not matter
Click Create and Continue until finished.
You don’t need to give it extra permissions.

STEP 5 — Create Key (JSON)
After service account is created:
Click on your service account
Go to Keys tab
Click: Add Key → Create New Key → JSON
This downloads a file like:
discord-potd-bot-123abc456def.json
Rename it to:
credentials.json


Put this file in your bot folder.

IMPORTANT — Share your Google Sheet with the Service Account

Open your spreadsheet → Share.

You will see your service account email in the JSON file:

"client_email": "your-bot@your-project.iam.gserviceaccount.com"


Copy that email.

Share the spreadsheet with Editor permission:

your-bot@your-project.iam.gserviceaccount.com


If you skip this step, bot will NOT access the sheet.

Your final folder structure must look like:
project/
│── potd.js
│── credentials.json
│── .env
│── package.json
│── lastFetchedIndex.json (auto created)
