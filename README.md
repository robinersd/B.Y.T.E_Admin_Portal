# B.Y.T.E. 2.0 - Admin Portal & Problem Creator

Web-based Teacher & Admin Portal for **B.Y.T.E. (Python Coding Game)**. Designed specifically for teachers to compose, test, and deploy Python coding questions with real-time browser execution and PocketBase cloud synchronization.

---

## 🌟 Features Included

1. **Pixel-Perfect Responsive UI Mockup**:
   - **Phone Mode (Images 1 & 2)**: Glassmorphic UI with Western blurred background, round B.Y.T.E. badge, inputs with icons, eye toggle password visibility, "Remember me", and "Forgot Password?".
   - **Desktop Mode (Images 3 & 4)**: Split card design with western town illustration on the left and clean white authentication forms on the right.
   - **Demo Switcher Bar**: Easily switch between **Desktop View**, **Phone View**, and **Problem Creator** during panel defense or presentations.

2. **Dark IDE Coding Problem Creator (Image 5)**:
   - **Monospace Python Editor**: Includes auto-generated line numbers, tab indentation, and clean dark syntax palette.
   - **In-Browser Python Execution (Skulpt)**: Teachers can click **"▶ Run Code"** to execute their Python code locally in the browser with zero delay and view real console output.
   - **Level & Year Selector**: Configure difficulty (*Level 1 Easy, Level 2 Medium, Level 3 Boss Challenge*), target student year (*1st Year to 4th Year*), and category topic (*Fundamentals, Conditionals, Loops, Functions*).
   - **Expected Output & Hint Panels**: Set the expected output string that Godot will use to validate the student's solution, and provide hints for when students are stuck.
   - **One-Click "Use Code Output"**: Easily copy successful Python run results directly into the Expected Output field.
   - **"+ Add New"**: Rapidly clear and create consecutive questions.

3. **Deployment & PocketBase Cloud Sync**:
   - Click the **Save / Floppy Disk Icon (💾)** to deploy the problem.
   - Stores locally in browser offline cache (`localStorage`) and prepares JSON payload for PocketBase REST API (`/api/collections/questions/records`).
   - Includes **"Export questions.json for Godot"** button to export the JSON file directly for offline use in Godot (`user://questions.json`).

4. **Teacher Profile & Question Bank History**:
   - Click the **Profile Avatar (👤)** in the top right to view teacher details and a full history table of all created problems.
   - Supports viewing, editing past questions back into the editor, and deleting old questions.

---

## 🚀 How to Run the Portal

Simply double-click `index.html` in this folder:
```
C:\Users\daisy\Desktop\B.Y.T.E Admin Portal\index.html
```
No web server setup or npm install is required. All libraries (`pocketbase.umd.js`, `skulpt.min.js`, and `skulpt-stdlib.js`) are bundled locally and run 100% offline!
