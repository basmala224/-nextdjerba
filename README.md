# Tech Battle — Hackathon Website

A premium static website for a multi-hackathon event featuring an animated loading screen, dynamic theme-switching, and Google Sheets registration.

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Or deploy to GitHub Pages (see below)

## 📋 Comprehensive Google Sheets Setup (Backend)

The registration form sends data directly to a Google Sheet using Google Apps Script. Follow these detailed steps to set it up properly without running into CORS errors.

### Step 1: Prepare the Google Sheet

1. Navigate to [Google Sheets](https://sheets.google.com) and create a **Blank spreadsheet**.
2. Name the spreadsheet (e.g., `Tech Battle 2026 Registrations`).
3. In the first row of your sheet, you need exactly 33 headers matching the script. For better understanding, here is the structure of the data:

| Form Info | Team Leader | Teammate 1 (tm1_) | Teammate 2 (tm2_) | Teammate 3 (tm3_) | Teammate 4 (tm4_) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `timestamp` | `firstName` | `tm1_firstName` | `tm2_firstName` | `tm3_firstName` | `tm4_firstName` |
| `hackathon` | `lastName` | `tm1_lastName` | `tm2_lastName` | `tm3_lastName` | `tm4_lastName` |
| | `department` | `tm1_department` | `tm2_department` | `tm3_department` | `tm4_department` |
| | `class` | `tm1_class` | `tm2_class` | `tm3_class` | `tm4_class` |
| | `studentId` | `tm1_studentId` | `tm2_studentId` | `tm3_studentId` | `tm4_studentId` |
| | `email` | `tm1_email` | `tm2_email` | `tm3_email` | `tm4_email` |
| | `teammateCount` | | | | |

4. **Fast Setup**: Copy the wide table below and paste it directly into cell **A1** of your Google Sheet. It will automatically fill the first row with all 33 column headers correctly.

| timestamp | hackathon | firstName | lastName | department | class | studentId | email | teammateCount | tm1_firstName | tm1_lastName | tm1_department | tm1_class | tm1_studentId | tm1_email | tm2_firstName | tm2_lastName | tm2_department | tm2_class | tm2_studentId | tm2_email | tm3_firstName | tm3_lastName | tm3_department | tm3_class | tm3_studentId | tm3_email | tm4_firstName | tm4_lastName | tm4_department | tm4_class | tm4_studentId | tm4_email |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

*(Pro tip: Freeze the first row by going to **View → Freeze → 1 row** so your headers stay visible when scrolling.)*

### Step 2: Write the Google Apps Script

1. From your Google Sheet, click on **Extensions → Apps Script**.
2. Name the project (e.g., `TechBattle Backend`).
3. Delete any existing code in the editor (`Code.gs`) and paste the following comprehensive script:

```javascript
// Handles GET requests - useful for verifying the Web App is running
function doGet(e) {
  return ContentService.createTextOutput("✅ Tech Battle API is running successfully!");
}

// Handles POST requests - triggered when a user submits our registration form
function doPost(e) {
  try {
    // Check if post data exists
    if (!e || !e.postData || !e.postData.contents) {
        throw new Error("No data received");
    }

    // Connect to the active sheet
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Construct the row data array mapping to our spreadsheet headers
    var row = [
      data.timestamp || new Date().toISOString(),
      data.hackathon || 'Unknown',
      data.firstName || '',
      data.lastName || '',
      data.department || '',
      data.class || '',
      data.studentId || '',
      data.email || '',
      data.teammateCount || 0
    ];
    
    // Add teammate data dynamically (supports up to 4 teammates)
    for (var i = 1; i <= 4; i++) {
        row.push(data['tm' + i + '_firstName'] || '');
        row.push(data['tm' + i + '_lastName'] || '');
        row.push(data['tm' + i + '_department'] || '');
        row.push(data['tm' + i + '_class'] || '');
        row.push(data['tm' + i + '_studentId'] || '');
        row.push(data['tm' + i + '_email'] || '');
    }
    
    // Append the completely formatted row to the sheet at the bottom
    sheet.appendRow(row);
    
    // Return a success JSON response
    return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Registration recorded successfully", timestamp: new Date().toISOString() })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error internally and return a JSON error response
    Logger.log("Error processing request: " + error.toString());
    
    return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```
4. Click the **Save** icon (💾) or press `Ctrl + S`.

### Step 3: Deploy as a Web App (Crucial Step!)

If these settings are incorrect, the form will fail to submit.

1. In the top right corner of the Apps Script editor, click **Deploy → New deployment**.
2. Click the **Select type** gear icon (⚙️) and choose **Web app**.
3. Fill out the deployment configuration EXACTLY like this:
   - **Description**: `Version 1.0 - Initial Setup`
   - **Execute as**: `Me (your-email@gmail.com)` *(It MUST be your email, NOT "User accessing the web app")*
   - **Who has access**: `Anyone` *(It MUST be "Anyone", NOT "Anyone with Google Account". If you don't see "Anyone", you might be using a restricted Google Workspace account).*
4. Click **Deploy**.
5. **Authorization Required**: It will prompt you to authorize access.
   - Click **Authorize access**.
   - Select your Google Account.
   - You might see a Google warning: "Google hasn't verified this app."
   - Click **Advanced** (at the bottom left of the warning).
   - Click **Go to [Project Name] (unsafe)**.
   - Click **Allow**.
6. Copy the **Web app URL** that appears (it must end in `/exec`).

### Step 4: Connect to Your Frontend

1. Open the file `js/form.js` in your code editor.
2. Near the top of the file, locate the `GOOGLE_SCRIPT_URL` variable (or similar).
3. Replace the placeholder URL with the newly copied Web app URL.
   ```javascript
   const scriptURL = 'https://script.google.com/macros/s/YOUR_ACTUAL_ID_HERE/exec';
   ```
4. Save the file. Your form will now submit directly to your Google Sheet!

### Step 5: Verify & Troubleshoot

1. **Verify Backend is Alive**: Open a new browser tab and paste your Web App URL. It should display: `✅ Tech Battle API is running successfully!`
2. **Updating Script Code**: If you ever modify the Apps Script code (`Code.gs`), you **MUST** deploy a new version for changes to take effect:
   - Click **Deploy → Manage deployments**.
   - Click the pencil icon (✏️) to edit the active deployment.
   - Under **Version**, use the dropdown and select **New version**.
   - Click **Deploy**.
3. **Fixing CORS Errors**: If you see a "CORS" or "Network Error" in the browser console (F12) when submitting the form, it almost always means your deployment access settings are wrong. You must re-deploy using **Execute as: Me** and **Who has access: Anyone**.

## 🌐 GitHub Pages Deployment

1. Create a GitHub repository
2. Push all files:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
3. Go to repository **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: **main**, folder: **/ (root)**
6. Click **Save**
7. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 📁 Project Structure

```
nextdjerba/
├── index.html          # Main page (loader + home + form)
├── css/
│   └── styles.css      # All styles, themes, animations
├── js/
│   ├── loader.js       # Loading screen with particles
│   ├── theme.js        # Theme switching engine
│   └── form.js         # Form validation + Google Sheets
├── assets/             # Images (optional)
│   └── images/
└── README.md
```

## 🎨 Features

- **Animated Loading Screen** with particle effects, typewriter quote, and real progress bar
- **3 Hackathon Themes** that dynamically change colors, backgrounds, and content
- **Scroll Reveal Animations** for smooth content appearance
- **Registration Form** with validation, teammate management, and Google Sheets integration
- **Fully Responsive** — works on mobile, tablet, and desktop
- **GitHub Pages Ready** — pure static files, no build step
