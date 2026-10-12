# IQRA AOE — Academy of Excellence

A premium dark-mode learning web app for IQRA Academy of Excellence. Google Sheets is the database. Google Apps Script serves the site and checks every login, expiry date, and XP update.

## 1. Google Sheet setup

1. Create a Google Sheet. Name it `IQRA AOE Database`.
2. Set the spreadsheet timezone to **(GMT+05:30) India** so expiry dates match the academy day.  
   File → Settings → Time zone.
3. Rename the first tab to exactly `Users`.
4. Put these headers in row 1, one per column, in this order:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | UserID | Password | StudentName | Class | ExpiryDate | TotalXP | CurrentStreak |

5. Add a second tab named exactly `Admin`.
6. Put these headers in row 1:

   | A | B |
   |---|---|
   | AdminID | AdminPass |

7. Add accounts under the headers. Dates can be real date cells or text. Use `yyyy-mm-dd` or Indian `dd/mm/yyyy`. The expiry day itself is still valid. The next day returns **Account Expired. Please contact Admin.**

   Example `Admin` row:

   | AdminID | AdminPass |
   |---|---|
   | admin | ChangeMe123 |

   Example `Users` rows:

   | UserID | Password | StudentName | Class | ExpiryDate | TotalXP | CurrentStreak |
   |---|---|---|---|---|---|---|
   | STD001 | pass123 | Ayesha Khan | 5 | 2027-10-12 | 120 | 3 |
   | STD002 | pass123 | Rahul Patil | 8 | 2026-10-11 | 40 | 1 |

8. Share the spreadsheet only with academy admins. Students never need the sheet link. They use the web app URL. The script runs as you, so it can read a private sheet.

From the Apps Script editor you can also run `initializeSheets` to create missing tabs and headers, then `seedSampleData` to insert the sample rows above only when a tab has no accounts. Change those passwords before you share the web app.

Class is a whole number from 1 to 10. `TotalXP` and `CurrentStreak` start at 0 for new students. The admin screen can add a student, change the name, class, expiry date, and password, or remove a student. Passwords stay in the sheet. They are not shown again in the web app.

## 2. Project files

Copy each file into the Apps Script project under the same name:

| File | Role |
|---|---|
| `Code.gs` | `doGet`, login, expiry check, admin register, XP save |
| `Index.html` | Page shell. Pulls the other files in with `<?!= include('...'); ?>` |
| `CSS.html` | Tailwind, Font Awesome, canvas-confetti, glassmorphism styles |
| `JS.html` | Routing, language hub, math arena, sheet calls |
| `Team.html` | Team portraits and copyright, included on both dashboards |
| `appsscript.json` | Asia/Kolkata timezone, V8 runtime, web app access |

`appsscript.json` is the manifest. In the Apps Script editor: Project Settings → tick **Show "appsscript.json" manifest file in editor**, then paste this file over it.

## 3. Deploy as a web app

1. Open the Google Sheet.
2. Extensions → Apps Script.
3. Remove the sample `Code.gs` contents and paste this project's `Code.gs`.
4. For each HTML file, click **+** → HTML, name it `Index`, `CSS`, `JS`, or `Team` (Apps Script adds `.html` for you), and paste the matching file.
5. Paste `appsscript.json` as the manifest. Confirm the timezone is `Asia/Kolkata`.
6. If this script is **not** bound to the sheet, open Project Settings → Script properties and add `SPREADSHEET_ID` with the long id from the sheet URL (`/d/`**this part**`/edit`). A script opened from the sheet does not need that property.
7. Click **Deploy** → **New deployment**.
8. Click the gear → **Web app**.
9. Description: `IQRA AOE`.
10. Execute as: **Me**.
11. Who has access: **Anyone**. Students then sign in with the academy ID and password, without a Google account prompt.
12. Click **Deploy**, authorize the spreadsheet permission, and copy the web app URL.
13. After every code change: Deploy → Manage deployments → pencil → New version → Deploy. The URL stays the same.

Open the URL in a browser. `/dev` links are only for the script owner. Share the `/exec` URL.

## 4. What each screen does

- **Login.** One form. Admin IDs are checked on the Admin sheet. Everyone else is checked on Users. A correct password past the expiry date shows `Account Expired. Please contact Admin.` Eight wrong tries in ten minutes pause that ID.
- **Admin dashboard.** Counts, search, add, edit, and remove students. Writes go back to the Users sheet.
- **Student dashboard.** Name, class, total XP, streak, and expiry, loaded from the sheet.
- **Language Hub.** English, Hindi, and Urdu. Each has 2-letter, 3-letter, and 4-letter rhyming families (अब / कब / जब, अगर / मगर / नगर, किताब / हिसाब / जवाब, and the English and Urdu sets). Urdu cards are spoken with the Hindi `hi-IN` voice, using the Hindi spelling, because browser Urdu voices often fail.
- **Math Hub.** Questions follow the signed-in class, aligned to the Maharashtra State Board path from basics through quadratics and geometry. Ten practice questions show immediate feedback. Ten test questions do not. The report card sends the earned XP to `TotalXP`. A repeat save of the same report does not add the XP twice.
- **Tables.** Multiplication tables 2–20 with read-aloud. Fractions and decimals videos are embedded for the Class 5–7 stretch.

Both dashboards include the team portraits and `© 2026 IQRA Academy of Excellence`. Faisal Kamran and Ammar Qazi use the photo hosted at `https://ibb.co/DZhmwxr`. If a portrait cannot load, the frame shows that person's initials.

## 5. Keep the register private

The sheet holds passwords in plain text so an admin can set them from the web app or the grid. Do not turn the sheet link into "anyone with the link". Only the web app URL should be public, and it should keep running as you.
