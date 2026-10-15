# IQRA AOE — Academy of Excellence

A Google Apps Script web app. Google Sheets is the database. Students sign in, practise languages and class-wise mathematics, and the sheet stores XP. Admins add students from the app.

Files the script editor needs:

| Editor file | Purpose |
| --- | --- |
| `Code.gs` | `doGet`, login, expiry check, admin writes, XP updates |
| `Index.html` | Single-page shell |
| `CSS.html` | Glassmorphism styles |
| `JS.html` | Routing, curriculum, quizzes |
| `appsscript.json` | Timezone `Asia/Kolkata`, web-app access, Sheets scope |

`tools/preview-server.mjs` is only for a local preview. It is not uploaded to Apps Script.

## 1. Google Sheet setup

1. Create a Google Sheet. Name it `IQRA AOE`.
2. Rename the first tab to **Users**. The name must match exactly.
3. Put this header row in row 1:

   `UserID` | `Password` | `StudentName` | `Class` | `ExpiryDate` | `TotalXP` | `CurrentStreak`

4. Add a second tab named **Admin**. Header row:

   `AdminID` | `AdminPass`

5. You can type accounts by hand, or let `setupAcademySheets()` create the seed rows below.

Example **Users** rows:

| UserID | Password | StudentName | Class | ExpiryDate | TotalXP | CurrentStreak |
| --- | --- | --- | --- | --- | --- | --- |
| IQRA001 | Learn@2026 | Ayesha Khan | 6 | 2027-03-31 | 120 | 3 |
| IQRA002 | Learn@2026 | Arhaan Shaikh | 3 | 2027-03-31 | 40 | 1 |

Example **Admin** row:

| AdminID | AdminPass |
| --- | --- |
| admin | Excellence@2026 |

Rules the app enforces:

- `Class` is a whole number from 1 to 10.
- `ExpiryDate` is a real date. The student can sign in on that date. The next day the login returns **Account Expired. Please contact Admin.**
- A blank expiry date is treated as expired.
- `TotalXP` and `CurrentStreak` are numbers. New students created in the app start at 0.
- Passwords are stored in the sheet as plain text because the admin edits them there. Share the spreadsheet only with staff. Do not publish the sheet to the web.

Change the seed passwords before you share the web-app link.

## 2. Put the script on the sheet

Container-bound (simplest):

1. Open the sheet. **Extensions → Apps Script**.
2. Delete the starter `Code.gs` contents and paste `Code.gs` from this project.
3. **+ → HTML**, name the files `Index`, `CSS`, and `JS`. Paste the matching file contents. Do not paste the `<style>` or `<script>` wrappers into `CSS` or `JS`; those wrappers already live in `Index.html`.
4. Open **Project Settings** and check that the timezone is `Asia/Kolkata`. The manifest in `appsscript.json` sets this if you copy it into the project.
5. `SPREADSHEET_ID` at the top of `Code.gs` is already set to `1YywsSUGKckzORomiB4AUsnZh4HFVLKnmZTXzVK3v6b8`. Keep that line. The app opens that spreadsheet even if the script was not created from inside the sheet.
6. In the editor, choose `setupAcademySheets` and **Run**. Approve the Sheets permission. This adds headers (if the tabs were empty) and the seed accounts.
7. Confirm both tabs look right, then change the seed passwords.

Standalone script (script.google.com, not opened from the sheet):

1. Create a new project and add the same four files.
2. Copy the spreadsheet ID from the sheet URL: `https://docs.google.com/spreadsheets/d/THIS_PART/edit`.
3. Paste it into `SPREADSHEET_ID` at the top of `Code.gs`, **or** run `setSpreadsheetId('THIS_PART')` once.
4. Run `setupAcademySheets` and approve access.

## 3. Deploy the web app

1. **Deploy → New deployment**.
2. Click the gear and choose **Web app**.
3. Description: `IQRA AOE`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (or **Anyone with a Google account** if you want a Google login wall in front of the academy login).
6. **Deploy**, authorise, and copy the web-app URL. That URL ends in `/exec`.
7. Open it in a browser. Sign in as a student or as an admin.

After every code change: **Deploy → Manage deployments → pencil → Version: New version → Deploy**. The `/exec` URL stays the same. The `/dev` URL always runs the latest saved code while you are logged into the owning Google account.

Tailwind, Font Awesome, canvas-confetti, and the Google fonts load from CDNs. The custom CSS still draws the glass layout if a CDN is slow.

## 4. What each screen does

- **Login.** One form. Matching `Admin` credentials open the admin studio. Matching `Users` credentials open the student dashboard after the expiry check.
- **Admin.** Lists every student, including expired ones. The form creates a student or, after you click a row, updates the name, class, expiry, and password. A blank password on edit keeps the current password.
- **Student dashboard.** Shows name, class, XP, streak, and access date from the sheet, plus the team footer.
- **Language hub.** English, Hindi, and Urdu, each with 2-letter, 3-letter, and 4-letter rhyming sets. Urdu cards speak the Hindi transliteration with the `hi-IN` voice.
- **Math hub.** Questions follow the signed-in class (1–10): arithmetic, tables, division, fractions, decimals, LCM, HCF, algebra, quadratics, and geometry. Class 5–7 video lessons are linked from the hub. Ten practice questions give immediate feedback, then ten test questions do not. The report card writes the earned XP back to `TotalXP` and adds 1 to `CurrentStreak`.

The footer on both dashboards reads **A Web Development Project By The Students Of IQRA Academy of Excellence**, shows Faiz Khan, Faisal Kamran, Ammar Qazi, and Ukasha, and ends with **© 2026 IQRA Academy of Excellence**. If a portrait URL does not load, the frame shows that person's initials.

## 5. Local preview

```bash
node tools/preview-server.mjs
```

Open `http://127.0.0.1:4173`. This preview does not talk to Google. It uses the seed accounts above, plus `IQRA000` / `Expired@2026`, which is already expired.
