
// ==========================================================
// REGISTERED ADMIN ACCOUNTS STORAGE & AUTHENTICATION
// ==========================================================
function getRegisteredAdmins() {
  try {
    const raw = localStorage.getItem('byte_admin_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading byte_admin_accounts:', e);
  }
  // Default system admin accounts so existing school demo logins work
  return [
    {
      username: 'teacher',
      email: 'teacher@school.edu.ph',
      password: 'password123',
      role: 'Teacher Admin'
    },
    {
      username: 'admin',
      email: 'admin@school.edu.ph',
      password: 'password123',
      role: 'Teacher Admin'
    }
  ];
}

function saveRegisteredAdmin(newAdmin) {
  const accounts = getRegisteredAdmins();
  const emailLower = (newAdmin.email || '').trim().toLowerCase();
  const userLower = (newAdmin.username || '').trim().toLowerCase();
  
  const existingIdx = accounts.findIndex(a => 
    (a.email && a.email.toLowerCase() === emailLower) || 
    (a.username && a.username.toLowerCase() === userLower)
  );

  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...newAdmin };
  } else {
    accounts.push(newAdmin);
  }
  localStorage.setItem('byte_admin_accounts', JSON.stringify(accounts));
}

/**

 * B.Y.T.E. Admin Portal - Interactive IDE & Question Creator

 * Integrated with 24/7 Supabase Cloud Database (Free Forever)

 */



// ==========================================================

// 1. SUPABASE 24/7 CLOUD CONFIGURATION

// ==========================================================

const SUPABASE_CONFIG = {

  url: 'https://uyfsxpkqthloqwzievjo.supabase.co',

  key: 'sb_publishable_sRaNZITC2KQoCuicDFDj-g_DEmWNBDA'

};



// ==========================================================

// 2. APP STATE

// ==========================================================

const AppState = {

  currentUser: null,

  currentTheme: 'dark',

  currentDeviceView: 'desktop',

  authMode: 'login',

  

  currentQuestion: {

    id: null,

    title: 'Decrementing Ammo Method',

    level: 'Easy',

    year: '1st Year',

    

    code: `# Complete the method to decrease ammo by 1:

def shoot(self):

    self.ammo ____ 1`,

    expectedOutput: '-=',

    hint: "Use the compound operator '-=' followed by 1 to decrease self.ammo.",

    created_at: new Date().toISOString(),

    status: 'deployed'

  },

  

  questionsList: [],

  streakCount: 0,

  streakLastActive: null,

  streakFrozen: false

};



// ==========================================================

// DAILY STREAK MANAGEMENT (PER DAY, NOT PER QUESTION)

// ==========================================================

function getLocalDateString(d = new Date()) {

  const year = d.getFullYear();

  const month = String(d.getMonth() + 1).padStart(2, '0');

  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

}



function getYesterdayDateString() {

  const d = new Date();

  d.setDate(d.getDate() - 1);

  return getLocalDateString(d);

}



function saveStreakData() {

  const data = {

    count: AppState.streakCount,

    lastActiveDate: AppState.streakLastActive,

    isFrozen: AppState.streakFrozen

  };

  localStorage.setItem('byte_admin_streak_data', JSON.stringify(data));

  localStorage.setItem('byte_admin_streak', AppState.streakCount.toString());

}



function checkAndLoadStreak() {

  const savedData = localStorage.getItem('byte_admin_streak_data');

  const today = getLocalDateString();

  const yesterday = getYesterdayDateString();

  

  let streak = {

    count: 0,

    lastActiveDate: null,

    isFrozen: false

  };



  if (savedData) {

    try {

      streak = JSON.parse(savedData);

    } catch (e) {

      streak.count = parseInt(localStorage.getItem('byte_admin_streak') || '0', 10);

    }

  } else {

    const legacy = localStorage.getItem('byte_admin_streak');

    if (legacy !== null) {

      streak.count = parseInt(legacy, 10) || 0;

      if (streak.count > 0) {

        streak.lastActiveDate = today;

      }

    }

  }



  // SURIIN KUNG LUMAMPAS ANG ARAW (DAILY STREAK CHECK):

  if (streak.count > 0 && streak.lastActiveDate) {

    if (streak.lastActiveDate === today) {

      // Naka-submit na ngayong araw: Active fiery

      streak.isFrozen = false;

    } else if (streak.lastActiveDate === yesterday) {

      // Huling activity ay kahapon: Active pa rin habang naghihintay ng submission ngayong araw

      streak.isFrozen = false;

    } else {

      // Lumampas na ang araw nang walang submission:

      // MAG-GRAY FREEZE: Mananatili sa kasalukuyang bilang (hal. 3) pero magiging kulay gray freeze

      streak.isFrozen = true;

    }

  } else if (streak.count === 0) {

    streak.isFrozen = false;

  }



  AppState.streakCount = streak.count;

  AppState.streakLastActive = streak.lastActiveDate;

  AppState.streakFrozen = streak.isFrozen;



  saveStreakData();

  updateStreakUI();

}



function recordDailyQuizSubmission() {

  const today = getLocalDateString();

  const yesterday = getYesterdayDateString();



  if (AppState.streakLastActive === today) {

    // Naka-submit na ngayong araw: PER DAY ITO kaya hindi na mag-iincrement muli

    AppState.streakFrozen = false;

    showToast(`Daily streak: ${AppState.streakCount} days active! 🔥`, 'info');

  } else if (AppState.streakLastActive === yesterday) {

    // Bagong araw na sunod-sunod: +1 day streak!

    AppState.streakCount = Math.max(1, AppState.streakCount + 1);

    AppState.streakLastActive = today;

    AppState.streakFrozen = false;

    showToast(`Streak Increased! 🔥 ${AppState.streakCount} Days Daily Streak!`, 'success');

  } else {

    // Galing sa frozen state (hal. 3) o unang submit:

    // Na-unfreeze ang streak at nagpatuloy!

    if (AppState.streakFrozen && AppState.streakCount > 0) {

      AppState.streakCount = AppState.streakCount + 1;

      showToast(`Streak Unfrozen & Extended! 🔥 ${AppState.streakCount} Days Streak!`, 'success');

    } else {

      AppState.streakCount = Math.max(1, AppState.streakCount === 0 ? 1 : AppState.streakCount);

      showToast(`Daily Streak Started! 🔥 ${AppState.streakCount} Day Streak!`, 'success');

    }

    AppState.streakLastActive = today;

    AppState.streakFrozen = false;

  }



  saveStreakData();

  updateStreakUI();

}



function showStreakInfoModal() {

  if (AppState.streakCount === 0) {

    showToast('🔥 Daily Streak: 0 Days. Mag-submit ng kahit 1 quiz kada araw para magka-streak!', 'info');

  } else if (AppState.streakFrozen) {

    showToast(`❄️ Streak Frozen at ${AppState.streakCount} Days! Mag-submit ng quiz ngayong araw para maging kulay apoy ulit!`, 'warning');

  } else {

    showToast(`🔥 Daily Streak: ${AppState.streakCount} Days Active! Napanatili mo ang streak ngayong araw.`, 'success');

  }

}



function updateStreakUI() {

  const pill = document.getElementById('streak-pill');

  const count = document.getElementById('streak-count');

  const icon = document.getElementById('streak-icon');

  if (!pill || !count) return;

  

  count.textContent = AppState.streakCount;

  pill.classList.remove('streak-zero', 'streak-active', 'streak-frozen');

  

  if (AppState.streakCount === 0) {

    pill.classList.add('streak-zero');

    pill.title = 'Daily Streak: 0 (Mag-submit ng quiz para magsimula ang streak!)';

    if (icon) icon.textContent = '🔥';

  } else if (AppState.streakFrozen) {

    // GRAY FREEZE: Mananatili sa kasalukuyang count (hal. 3), pero kulay gray freeze

    pill.classList.add('streak-frozen');

    pill.title = `Streak Frozen at ${AppState.streakCount} (Lumipas ang araw nang walang submission. Mag-submit ng quiz para mag-apoy ulit!)`;

    if (icon) icon.textContent = '🔥';

  } else {

    // ACTIVE FIERY COLOR

    pill.classList.add('streak-active');

    pill.title = `Daily Streak: ${AppState.streakCount} Days Active! 🔥`;

    if (icon) icon.textContent = '🔥';

  }

}



// ==========================================================

// 3. INITIALIZATION & LIFECYCLE

// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {

  loadSavedData();

  setupEventListeners();
  setupOtpInputListeners();

  initSkulpt();

  updateLineNumbers();

  updateEditorHighlight();

  updateLevelYearBtnLabel();

  setThemeMode(AppState.currentTheme);

  

  updateStreakUI();

  

  // Always fetch latest questions from Supabase 24/7 Cloud

  await fetchFromSupabase();

});



function loadSavedData() {
  // Session check: Always require login on new visits / fresh browser sessions
  const sessionUser = sessionStorage.getItem('byte_admin_user');
  if (sessionUser) {
    try { 
      AppState.currentUser = JSON.parse(sessionUser); 
    } catch(e) {
      AppState.currentUser = null;
    }
  } else {
    AppState.currentUser = null;
  }
  // Clear any legacy auto-login user from localStorage so it never skips the login screen
  localStorage.removeItem('byte_admin_user');

  checkAndLoadStreak();

  const savedQuestions = localStorage.getItem('byte_admin_questions');
  if (savedQuestions) {
    try {
      AppState.questionsList = JSON.parse(savedQuestions);
    } catch(e) {
      AppState.questionsList = [];
    }
  }

  if (AppState.currentUser) {
    showDashboardView();
  } else {
    showAuthView();
  }
}



function saveQuestions() {

  localStorage.setItem('byte_admin_questions', JSON.stringify(AppState.questionsList));

}



// ==========================================================

// BUTTON & SECTION LOADER (POOR SIGNAL & NETWORK RESILIENCE)

// ==========================================================

function setButtonLoading(btn, isLoading, loadingText = '') {

  if (!btn) return;

  if (isLoading) {

    if (!btn.dataset.originalHtml) {

      btn.dataset.originalHtml = btn.innerHTML;

    }

    btn.disabled = true;

    btn.classList.add('btn-loading');

    

    if (btn.classList.contains('nav-icon-btn') || btn.classList.contains('btn-table-del') || btn.classList.contains('btn-table-edit')) {

      btn.innerHTML = '<div class="loader"></div>';

    } else {

      btn.innerHTML = `<div class="loader"></div> <span>${loadingText || 'Loading...'}</span>`;

    }

  } else {

    btn.disabled = false;

    btn.classList.remove('btn-loading');

    if (btn.dataset.originalHtml) {

      btn.innerHTML = btn.dataset.originalHtml;

      delete btn.dataset.originalHtml;

    }

  }

}



window.addEventListener('offline', () => {

  showToast('Network disconnected. Running in offline cache mode.', 'warning');

});

window.addEventListener('online', () => {

  showToast('Internet reconnected! Cloud sync active.', 'success');

  fetchFromSupabase();

});





// ==========================================================

// 4. SUPABASE 24/7 CLOUD SYNC

// ==========================================================

async function fetchFromSupabase() {

  const tbody = document.getElementById('history-table-body');

  if (AppState.questionsList.length === 0 && tbody) {

    tbody.innerHTML = `

      <tr>

        <td colspan="4" style="text-align: center; padding: 36px 20px;">

          <div class="loading-section">

            <div class="loader"></div>

            <div class="loading-section-text">Connecting to 24/7 Supabase Cloud...</div>

            <div class="loading-section-sub">Synchronizing questions database (poor signal check)</div>

          </div>

        </td>

      </tr>

    `;

  }

  try {

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/questions?select=*&order=created_at.desc`, {

      headers: {

        'apikey': SUPABASE_CONFIG.key,

        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`

      }

    });

    

    if (res.ok) {

      const records = await res.json();

      if (records && records.length > 0) {

        AppState.questionsList = records.map(r => ({

          id: r.id,

          title: r.question || r.title || 'Untitled Problem',

          question: r.question || r.title || 'Untitled Problem',

          difficulty: r.difficulty || 'Easy',

          level: r.difficulty || 'Easy',

          year: r.year || '1st Year',

          code: r.code || '',

          expectedOutput: r.expectedOutput || '',

          hint: r.hint || '',

          created_at: r.created_at,

          status: r.status || 'deployed'

        }));

        saveQuestions();

        updateHistoryTable();

        updateProfileUI();

        console.log(`[SUPABASE] Fetched ${records.length} questions from 24/7 Cloud!`);

      } else {

        updateHistoryTable();

      }

    } else {

      updateHistoryTable();

    }

  } catch (err) {

    console.warn('[SUPABASE] Fetch error, using local storage cache:', err);

    updateHistoryTable();

  }

}



// ==========================================================

// 5. THEME SWITCHER

// ==========================================================

function setThemeMode(theme) {

  AppState.currentTheme = theme;

  localStorage.setItem('byte_admin_theme', theme);

  

  const btnDark = document.getElementById('theme-btn-dark');

  const btnLight = document.getElementById('theme-btn-light');

  

  if (theme === 'light') {

    document.body.classList.add('light-theme');

    if (btnLight) btnLight.classList.add('active');

    if (btnDark) btnDark.classList.remove('active');

  } else {

    document.body.classList.remove('light-theme');

    if (btnDark) btnDark.classList.add('active');

    if (btnLight) btnLight.classList.remove('active');

  }

}



// ==========================================================

// 6. SKULPT PYTHON RUNNER

// ==========================================================

function initSkulpt() {

  if (typeof Sk === 'undefined') return;

  Sk.configure({

    output: function(text) {

      const term = document.getElementById('terminal-output');

      if (term) term.innerText += text;

    },

    read: function(file) {

      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][file] === undefined) {

        throw "File not found: '" + file + "'";

      }

      return Sk.builtinFiles["files"][file];

    },

    __future__: Sk.python3

  });

}



function runPythonCode() {
  const runBtn = document.querySelector('.run-code-btn') || document.querySelector('.btn-run-code');
  const codeInput = document.getElementById('code-input');
  const term = document.getElementById('terminal-output');
  if (!codeInput || !term) return;

  const code = codeInput.value;

  // Validation 1: If editor is completely empty or only whitespace
  if (!code || !code.trim()) {
    term.innerText = '⚠️ No Python code entered! Please write some code in the editor before running.';
    term.classList.add('has-error');
    showToast('Please enter some Python code before running!', 'warning');
    return;
  }

  // Validation 2: If editor contains only comments and blank lines
  const nonCommentLines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  if (nonCommentLines.length === 0) {
    term.innerText = '⚠️ Editor contains only comments! Please write executable Python code.';
    term.classList.add('has-error');
    showToast('No executable code found in editor! Please write code before running.', 'warning');
    return;
  }

  term.innerText = 'Executing Python code...';
  term.classList.remove('has-error');

  if (typeof Sk === 'undefined') {
    term.innerText = '[Skulpt Python engine not loaded]';
    return;
  }

  setButtonLoading(runBtn, true, 'Running...');

  try {
    Sk.misceval.asyncToPromise(function() {
      return Sk.importMainWithBody("<stdin>", false, code, true);
    }).then(
      function() {
        setButtonLoading(runBtn, false);
        if (!term.innerText || term.innerText === 'Executing Python code...') {
          term.innerText = '[Code finished with no output. Use print() to display output in terminal]';
          showToast('Code executed with no output. Add print() to see results.', 'info');
        } else {
          showToast('Code executed successfully!', 'success');
        }
      },
      function(err) {
        setButtonLoading(runBtn, false);
        term.innerText = err.toString();
        term.classList.add('has-error');
        showToast('Python Syntax/Runtime Error', 'error');
      }
    );
  } catch (e) {
    setButtonLoading(runBtn, false);
    term.innerText = e.toString();
    term.classList.add('has-error');
    showToast('Execution error', 'error');
  }
}



function useOutputAsExpected() {

  const term = document.getElementById('terminal-output');

  const expectedInput = document.getElementById('expected-output-input');

  if (!term || !expectedInput) return;

  

  const text = term.innerText.trim();

  if (text && !term.classList.contains('has-error') && !text.startsWith('[')) {

    expectedInput.value = text;

    showToast('Copied terminal output to Expected Output!', 'success');

  } else {

    showToast('Run your Python code first to produce valid output', 'warning');

  }

}



// ==========================================================

// 7. AUTH HANDLING (LOGIN / REGISTER / LOGOUT)

// ==========================================================

function setAuthMode(mode) {

  AppState.authMode = mode;

  const isReg = mode === 'register';

  

  document.getElementById('desktop-login-form')?.classList.toggle('hidden', isReg);

  document.getElementById('desktop-register-form')?.classList.toggle('hidden', !isReg);

  document.getElementById('phone-login-form')?.classList.toggle('hidden', isReg);

  document.getElementById('phone-register-form')?.classList.toggle('hidden', !isReg);

}



async function handleLogin(emailOrUser, password, btn = null) {
  // Clear any previous error styling
  const dPass = document.getElementById('desk-login-pass');
  const pPass = document.getElementById('phone-login-pass');
  if (dPass) dPass.classList.remove('input-error');
  if (pPass) pPass.classList.remove('input-error');

  if (!emailOrUser || !emailOrUser.trim()) {
    showToast('Please enter your email or username', 'warning');
    return;
  }
  if (!password) {
    showToast('Please enter your password', 'warning');
    if (dPass) dPass.classList.add('input-error');
    if (pPass) pPass.classList.add('input-error');
    return;
  }

  const raw = emailOrUser.trim().toLowerCase();
  const inputPass = String(password);

  if (btn) setButtonLoading(btn, true, 'Logging in...');
  try {
    await new Promise(r => setTimeout(r, 600));

    const accounts = getRegisteredAdmins();
    // Search account by email, username, or email prefix
    const found = accounts.find(a => 
      (a.email && a.email.toLowerCase() === raw) || 
      (a.username && a.username.toLowerCase() === raw) ||
      (raw.includes('@') && a.username && a.username.toLowerCase() === raw.split('@')[0])
    );

    if (found) {
      if (found.password !== inputPass) {
        showToast('❌ Incorrect password! Please check your credentials.', 'error');
        if (dPass) dPass.classList.add('input-error');
        if (pPass) pPass.classList.add('input-error');
        return;
      }

      AppState.currentUser = {
        username: found.username,
        email: found.email,
        role: found.role || 'Teacher Admin',
        joined: found.verifiedAt ? new Date(found.verifiedAt).toLocaleDateString() : new Date().toLocaleDateString()
      };
    } else {
      // Check default fallback accounts
      if (raw === 'teacher@school.edu.ph' || raw === 'teacher' || raw === 'admin@school.edu.ph' || raw === 'admin') {
        if (inputPass !== 'password123') {
          showToast('❌ Incorrect password! Please check your credentials.', 'error');
          if (dPass) dPass.classList.add('input-error');
          if (pPass) pPass.classList.add('input-error');
          return;
        }
        AppState.currentUser = {
          username: raw.includes('@') ? raw.split('@')[0] : raw,
          email: raw.includes('@') ? raw : `${raw}@school.edu.ph`,
          role: 'Teacher Admin',
          joined: new Date().toLocaleDateString()
        };
      } else {
        showToast('❌ Account not found! Please register first or verify your email.', 'error');
        return;
      }
    }

    sessionStorage.setItem('byte_admin_user', JSON.stringify(AppState.currentUser));
    showToast(`Welcome back, ${AppState.currentUser.username}!`, 'success');
    showDashboardView();
  } catch (err) {
    console.error('Login error:', err);
    showToast('Login failed. Please try again.', 'error');
  } finally {
    if (btn) setButtonLoading(btn, false);
  }
}



async function handleRegister(username, email, password, confirmPassword, btn = null) {
  if (!username || !email || !password) {
    showToast('Please fill out all registration fields', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const cleanEmail = email.trim();
  const cleanUser = username.trim();
  // Generate random 6-digit verification code
  const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

  if (btn) setButtonLoading(btn, true, 'Sending Code...');
  try {
    showToast(`Sending 6-digit verification code to ${cleanEmail}...`, 'info');

    // USER REQUIREMENT: 3-second loading delay on verification code generation
    await new Promise(r => setTimeout(r, 3000));

    const otpRes = await sendSupabaseOtp(cleanEmail, generatedCode);
    if (otpRes.success) {
      showToast(`Verification code: ${generatedCode}`, 'success');
    } else {
      console.warn('Supabase OTP send warning:', otpRes.error);
      showToast(`Verification code: ${generatedCode}`, 'info');
    }
    openOtpModal(cleanEmail, 'register', cleanUser, password, generatedCode);
  } catch (err) {
    console.error('Register error:', err);
    showToast(`Verification code: ${generatedCode}`, 'info');
    openOtpModal(cleanEmail, 'register', cleanUser, password, generatedCode);
  } finally {
    if (btn) setButtonLoading(btn, false);
  }
}



function handleLogout() {
  AppState.currentUser = null;
  sessionStorage.removeItem('byte_admin_user');
  localStorage.removeItem('byte_admin_user');
  showToast('Logged out successfully', 'success');
  showAuthView();
}



function showAuthView() {
  document.getElementById('auth-wrapper')?.classList.remove('hidden');
  document.getElementById('dashboard-wrapper')?.classList.add('hidden');
  setAuthMode('login');
  window.scrollTo({ top: 0, behavior: 'instant' });
}



function showDashboardView() {

  document.getElementById('auth-wrapper')?.classList.add('hidden');

  document.getElementById('dashboard-wrapper')?.classList.remove('hidden');

  updateProfileUI();

  updateHistoryTable();

}



// ==========================================================

// 8. CODE EDITOR INTERACTION

// ==========================================================

// ==========================================================

// VS CODE PYTHON SYNTAX HIGHLIGHTER (EXACT MATCH TO PHOTO 4)

// ==========================================================

const PY_TOKEN_REGEX = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(\b(?:def|class)\b)|(\b(?:import|from|as|if|elif|else|for|while|in|not|is|and|or|return|yield|try|except|finally|raise|break|continue|pass|with|global|nonlocal|lambda|assert)\b)|(\b(?:True|False|None)\b)|(\bself\b)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*(?=\s*\())|([a-zA-Z_]\w*)/g;



function highlightPython(code) {
  if (!code) return ' ';
  const cleanCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanCode.split('\n');
  const outLines = lines.map(line => {
    if (line === '') return ' '; // Non-collapsing space keeps empty lines at exact 22px height!
    return line.replace(PY_TOKEN_REGEX, (match, comment, str, defClass, kw, builtin, selfKw, num, func, ident) => {
      if (comment) return `<span class="py-comment">${escapeHTML(comment)}</span>`;
      if (str) return `<span class="py-string">${escapeHTML(str)}</span>`;
      if (defClass) return `<span class="py-def-class">${escapeHTML(defClass)}</span>`;
      if (kw) return `<span class="py-keyword">${escapeHTML(kw)}</span>`;
      if (builtin) return `<span class="py-builtin">${escapeHTML(builtin)}</span>`;
      if (selfKw) return `<span class="py-self">${escapeHTML(selfKw)}</span>`;
      if (num) return `<span class="py-number">${escapeHTML(num)}</span>`;
      if (func) return `<span class="py-function">${escapeHTML(func)}</span>`;
      if (ident) return `<span class="py-ident">${escapeHTML(ident)}</span>`;
      return escapeHTML(match);
    });
  });
  return outLines.join('\n');
}



function updateEditorHighlight() {
  const codeEl = document.getElementById('code-input');
  const highlightEl = document.getElementById('code-highlight-content');
  if (codeEl && highlightEl) {
    let val = codeEl.value;
    if (val.endsWith('\n')) val += ' ';
    highlightEl.innerHTML = highlightPython(val);
  }
}



function updateLineNumbers() {

  const textarea = document.getElementById('code-input');

  const lineCol = document.getElementById('line-numbers');

  if (!textarea || !lineCol) return;

  

  const lineCount = textarea.value.split('\n').length;

  let numbersHTML = '';

  for (let i = 1; i <= Math.max(lineCount, 6); i++) {

    numbersHTML += `${i}<br>`;

  }

  lineCol.innerHTML = numbersHTML;

}



function resetForNewQuestion() {

  AppState.currentQuestion = {

    id: null,

    title: 'New Coding Problem',

    level: 'Easy',

    year: '1st Year',

    

    code: '# Type your Python problem template here\n',

    expectedOutput: '',

    hint: '',

    status: 'draft'

  };

  

  const codeEl = document.getElementById('code-input');

  const expEl = document.getElementById('expected-output-input');

  const hintEl = document.getElementById('hint-input');
  const titleInput = document.getElementById('question-title-input');
  const instrInput = document.getElementById('question-instruction-input');
  if (titleInput) titleInput.value = '';
  if (instrInput) instrInput.value = '';

  const termEl = document.getElementById('terminal-output');

  

  if (codeEl) codeEl.value = AppState.currentQuestion.code;

  if (expEl) expEl.value = '';

  if (hintEl) hintEl.value = '';

  if (termEl) {

    termEl.innerText = 'Output will appear here after clicking Run...';

    termEl.classList.remove('has-error');

  }

  

  updateLineNumbers();

  updateEditorHighlight();

  updateLevelYearBtnLabel();

  showToast('Editor reset for new problem creation', 'info');

}



// ==========================================================

// 9. DIFFICULTY & TARGET YEAR MODAL

// ==========================================================

function openLevelYearModal() {

  const modal = document.getElementById('level-year-modal');

  if (modal) {

    const lvl = document.getElementById('modal-level-select');

    const yr = document.getElementById('modal-year-select');

    const top = document.getElementById('modal-topic-select');

    

    if (lvl) lvl.value = AppState.currentQuestion.level || 'Easy';

    if (yr) yr.value = AppState.currentQuestion.year || '1st Year';

    if (top) top.value = AppState.currentQuestion.topic || 'Fundamentals';

    

    modal.classList.remove('hidden');

  }

}



function closeLevelYearModal() {

  const modal = document.getElementById('level-year-modal');

  if (modal) modal.classList.add('hidden');

}



function applyLevelYearSelection() {

  const levelSelect = document.getElementById('modal-level-select')?.value || 'Easy';

  const yearSelect = document.getElementById('modal-year-select')?.value || '1st Year';

  AppState.currentQuestion.level = levelSelect;

  AppState.currentQuestion.year = yearSelect;

  updateLevelYearBtnLabel();

  closeLevelYearModal();

  showToast(`Updated to: ${levelSelect} • ${yearSelect}`, 'success');

}



function updateLevelYearBtnLabel() {

  const btn = document.getElementById('choose-level-year-btn');

  if (btn) {

    btn.innerHTML = `

      <span>⚙️ ${AppState.currentQuestion.level} • ${AppState.currentQuestion.year}</span>

      <svg class="dropdown-chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">

        <polyline points="6 9 12 15 18 9"></polyline>

      </svg>

    `;

  }

}



// ==========================================================

// 10. SAVE & DEPLOYMENT (SUPABASE 24/7 CLOUD SYNC)

// ==========================================================

async function saveAndDeployQuestion() {

  const codeEl = document.getElementById('code-input');

  const expectedEl = document.getElementById('expected-output-input');

  const hintEl = document.getElementById('hint-input');
  const titleInput = document.getElementById('question-title-input');
  const instrInput = document.getElementById('question-instruction-input');
  if (titleInput) titleInput.value = '';
  if (instrInput) instrInput.value = '';

  

  const code = codeEl ? codeEl.value : '';

  const expected = expectedEl ? expectedEl.value : '';

  const hint = hintEl ? hintEl.value : '';

  

  if (!code.trim()) {

    showToast('Please provide the problem code before saving', 'error');

    return;

  }

  if (!expected.trim()) {

    showToast('Please type the Expected Output for student validation', 'error');

    return;

  }

  

  let title = AppState.currentQuestion.title || 'Coding Problem';

  const titleMatch = code.match(/#\s*QUESTION:\s*(.+)/i);

  if (titleMatch && titleMatch[1]) {

    title = titleMatch[1].trim();

  }

  

  // Primary column is 'question' as requested ("palitan mo ang title name wag text gawin mong question")
  // and 'topic' is removed ("yung table na topic sa supabase tanggalin muna yun")
  const payload = {
    question: title,
    difficulty: AppState.currentQuestion.level,
    year: AppState.currentQuestion.year,
    code: code,
    expectedOutput: expected.trim(),
    hint: hint.trim(),
    status: 'deployed'
  };

  

  let cloudSuccess = false;

  let recordId = 'local_' + Date.now();

  const saveBtn = document.querySelector('.btn-deploy-main') || document.querySelector('.save-deploy-btn');

  setButtonLoading(saveBtn, true);



  try {

    showToast('Syncing to Supabase 24/7 Cloud Database...', 'info');

    let res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/questions`, {

      method: 'POST',

      headers: {

        'apikey': SUPABASE_CONFIG.key,

        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,

        'Content-Type': 'application/json',

        'Prefer': 'return=representation'

      },

      body: JSON.stringify(payload)

    });

    // Smart compatibility fallback: if user has not renamed 'title' -> 'question' in Supabase yet
    if (!res.ok) {
      try {
        const errJson = await res.clone().json();
        if (errJson && errJson.message && errJson.message.includes('question')) {
          const fallbackPayload = { ...payload, title: title };
          delete fallbackPayload.question;
          res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/questions`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_CONFIG.key,
              'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(fallbackPayload)
          });
        }
      } catch (e) {}
    }

    

    if (res.ok) {

      const created = await res.json();

      if (created && created[0] && created[0].id) {

        recordId = created[0].id;

        cloudSuccess = true;

        showToast('Saved to Supabase 24/7 Cloud Database!', 'success');

      }

    }

  } catch (err) {

    console.warn('Supabase save error:', err);

    showToast('Saved locally in browser cache', 'warning');

  } finally {

    setButtonLoading(saveBtn, false);

  }



  const savedItem = {

    ...payload,

    id: recordId,

    level: payload.difficulty,

    created_at: new Date().toISOString()

  };



  const existingIdx = AppState.questionsList.findIndex(q => q.id === recordId);

  if (existingIdx >= 0) {

    AppState.questionsList[existingIdx] = savedItem;

  } else {

    AppState.questionsList.unshift(savedItem);

  }

  

  saveQuestions();

  updateHistoryTable();

  updateProfileUI();

  

  recordDailyQuizSubmission();



  showDeploymentModal(savedItem, cloudSuccess);

}



function showDeploymentModal(question, cloudSuccess = false) {

  const modal = document.getElementById('deploy-modal');

  const details = document.getElementById('deploy-details');

  const statusBadge = document.getElementById('deploy-status-badge');

  

  if (details) details.innerText = JSON.stringify(question, null, 2);

  if (statusBadge) {

    if (cloudSuccess) {

      statusBadge.className = 'badge-tag badge-green';

      statusBadge.innerText = '☁️ 24/7 Supabase Cloud Sync Active';

    } else {

      statusBadge.className = 'badge-tag badge-blue';

      statusBadge.innerText = '💾 Saved Locally';

    }

  }

  

  if (modal) modal.classList.remove('hidden');

}



function closeDeploymentModal() {

  const modal = document.getElementById('deploy-modal');

  if (modal) modal.classList.add('hidden');

}



function closeDeployModal() {

  closeDeploymentModal();

}



// ==========================================================

// 11. PROFILE & QUESTION BANK MODAL

// ==========================================================

function openProfileModal() {

  updateProfileUI();

  updateHistoryTable();

  const modal = document.getElementById('profile-history-modal');

  if (modal) modal.classList.remove('hidden');

}



function closeProfileModal() {

  const modal = document.getElementById('profile-history-modal');

  if (modal) modal.classList.add('hidden');

}



function scrollToQuestionBank() {

  const sec = document.getElementById('settings-question-bank-section');

  if (sec) {

    sec.scrollIntoView({ behavior: 'smooth' });

    sec.style.outline = '2px solid var(--ide-accent-cyan)';

    setTimeout(() => { sec.style.outline = 'none'; }, 1500);

  }

}



function updateProfileUI() {

  if (AppState.currentUser) {

    const profName = document.getElementById('prof-name');

    const profEmail = document.getElementById('prof-email');

    const profTotal = document.getElementById('prof-total-q');

    const settingsQCount = document.getElementById('settings-q-count');

    

    if (profName) profName.innerText = AppState.currentUser.username || 'Teacher Admin';

    if (profEmail) profEmail.innerText = AppState.currentUser.email || 'teacher@school.edu.ph';

    if (profTotal) profTotal.innerText = AppState.questionsList.length;

    if (settingsQCount) settingsQCount.innerText = AppState.questionsList.length;

  }

}



function updateHistoryTable() {

  const tbody = document.getElementById('history-table-body');

  if (!tbody) return;

  tbody.innerHTML = '';

  

  if (AppState.questionsList.length === 0) {

    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ffffff;">No questions created yet.</td></tr>';

    return;

  }

  

  AppState.questionsList.forEach((q, idx) => {

    const tr = document.createElement('tr');

    const diffText = `${escapeHTML(q.difficulty || q.level || 'Easy')} • ${escapeHTML(q.year || '1st Year')}`;

    tr.innerHTML = `

      <td><strong style="color:#ffffff;">${escapeHTML(q.title || 'Question #' + (idx + 1))}</strong></td>

      <td><span class="badge-difficulty-white">${diffText}</span></td>

      <td style="white-space:nowrap;"><code class="history-code-pill">${escapeHTML(q.expectedOutput || '')}</code></td>

      <td style="white-space:nowrap;">

        <div class="table-actions-group">

          <button class="btn-table-edit" onclick="loadQuestionToEditor('${q.id}')">Edit</button>

          <button class="btn-table-del" onclick="deleteQuestion('${q.id}', this)" title="Delete question">Delete</button>

        </div>

      </td>

    `;

    tbody.appendChild(tr);

  });

}



function loadQuestionToEditor(id) {

  const q = AppState.questionsList.find(item => item.id === id);

  if (!q) return;

  

  AppState.currentQuestion = { ...q };

  const codeEl = document.getElementById('code-input');

  const expEl = document.getElementById('expected-output-input');

  const hintEl = document.getElementById('hint-input');
  const titleInput = document.getElementById('question-title-input');
  const instrInput = document.getElementById('question-instruction-input');
  if (titleInput) titleInput.value = '';
  if (instrInput) instrInput.value = '';

  

  if (codeEl) codeEl.value = q.code;

  if (expEl) expEl.value = q.expectedOutput;

  if (hintEl) hintEl.value = q.hint;
  const titleEl = document.getElementById('question-title-input');
  const instrEl = document.getElementById('question-instruction-input');
  if (titleEl) titleEl.value = q.title || '';
  if (instrEl) instrEl.value = q.instruction || '';
  updateEditorHighlight();

  

  updateLineNumbers();

  updateLevelYearBtnLabel();

  closeProfileModal();

  showToast(`Loaded question: ${q.title}`, 'info');

}



async function deleteQuestion(id, btn = null) {

  if (!confirm('Are you sure you want to delete this question?')) return;

  

  if (btn) setButtonLoading(btn, true);

  try {

    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/questions?id=eq.${id}`, {

      method: 'DELETE',

      headers: {

        'apikey': SUPABASE_CONFIG.key,

        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`

      }

    });

  } catch (e) {

    console.warn('Supabase delete error:', e);

  } finally {

    if (btn) setButtonLoading(btn, false);

  }

  

  AppState.questionsList = AppState.questionsList.filter(item => item.id !== id);

  saveQuestions();

  updateHistoryTable();

  updateProfileUI();

  showToast('Question deleted', 'success');

}



function downloadQuestionsJson() {

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.questionsList, null, 2));

  const downloadAnchor = document.createElement('a');

  downloadAnchor.setAttribute("href", dataStr);

  downloadAnchor.setAttribute("download", "questions.json");

  document.body.appendChild(downloadAnchor);

  downloadAnchor.click();

  downloadAnchor.remove();

  showToast('Exported questions.json for Godot engine!', 'success');

}



function openForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  const forgotInput = document.getElementById('forgot-email');
  const deskEmail = document.getElementById('desk-login-email');
  const phoneEmail = document.getElementById('phone-login-email');
  const currentVal = (deskEmail && deskEmail.value) ? deskEmail.value.trim() : ((phoneEmail && phoneEmail.value) ? phoneEmail.value.trim() : '');
  
  if (forgotInput) {
    if (currentVal && currentVal.includes('@')) {
      forgotInput.value = currentVal;
    } else {
      forgotInput.value = '';
    }
  }
  if (modal) modal.classList.remove('hidden');
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleForgotPasswordSubmit(btn = null) {
  const input = document.getElementById('forgot-email');
  const email = input ? input.value.trim() : '';

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid admin email address', 'warning');
    return;
  }

  if (btn) setButtonLoading(btn, true, 'Sending...');
  try {
    const accounts = getRegisteredAdmins();
    const found = accounts.find(a => a.email && a.email.toLowerCase() === email.toLowerCase());

    try {
      await fetch(`${SUPABASE_CONFIG.url}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });
    } catch (e) {
      console.warn('Supabase recover call:', e);
    }

    await new Promise(r => setTimeout(r, 600));
    closeForgotPasswordModal();
    if (found) {
      showToast(`Password recovery sent to ${email}! (Your password: ${found.password})`, 'success');
    } else {
      showToast(`Password recovery instructions sent to ${email}!`, 'success');
    }
  } catch (err) {
    console.error('Recovery error:', err);
    showToast('Failed to send recovery instructions.', 'error');
  } finally {
    if (btn) setButtonLoading(btn, false);
  }
}

// Alias for backwards compatibility
const sendPasswordResetEmail = handleForgotPasswordSubmit;


function togglePasswordVisibility(inputId, btn) {

  const input = document.getElementById(inputId);

  if (!input) return;

  if (input.type === 'password') {

    input.type = 'text';

    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

  } else {

    input.type = 'password';

    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  }

}



function showToast(msg, type = 'info') {

  const container = document.getElementById('toast-container');

  if (!container) return;

  const toast = document.createElement('div');

  toast.className = `toast ${type}`;

  toast.innerText = msg;

  container.appendChild(toast);

  setTimeout(() => {

    toast.remove();

  }, 3500);

}



function escapeHTML(str) {

  if (!str) return '';

  return str.replace(/[&<>'"]/g, 

    tag => ({

      '&': '&amp;',

      '<': '&lt;',

      '>': '&gt;',

      "'": '&#39;',

      '"': '&quot;'

    }[tag] || tag)

  );

}



// ==========================================================

// 12. EVENT LISTENERS

// ==========================================================

function setupEventListeners() {

  const codeInput = document.getElementById('code-input');

  const codeHighlight = document.getElementById('code-highlight');

  if (codeInput) {

    // Native clipboard copy is enabled without interference



    codeInput.addEventListener('input', () => {

      updateLineNumbers();

      updateEditorHighlight();

    });

    

    const syncEditorScroll = () => {
      const hl = document.getElementById('code-highlight');
      if (hl) {
        hl.scrollTop = codeInput.scrollTop;
        hl.scrollLeft = codeInput.scrollLeft;
      }
      const lineNumbers = document.getElementById('line-numbers');
      if (lineNumbers) {
        lineNumbers.scrollTop = codeInput.scrollTop;
      }
    };
    codeInput.addEventListener('scroll', syncEditorScroll);

    

    codeInput.addEventListener('keydown', function(e) {

      if (e.key === 'Tab') {

        e.preventDefault();

        const start = this.selectionStart;

        const end = this.selectionEnd;

        this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);

        this.selectionStart = this.selectionEnd = start + 4;

        updateLineNumbers();

        updateEditorHighlight();

      }

    });

  }

  

  // Close modals when clicking backdrop

  document.querySelectorAll('.modal-overlay').forEach(overlay => {

    overlay.addEventListener('click', (e) => {

      if (e.target === overlay) {

        overlay.classList.add('hidden');

      }

    });

  });

}





// ==========================================================

// CODE EDITOR COPY FUNCTIONALITY (NATIVE & BUTTON)

// ==========================================================

function copyEditorCode(btn) {

  const codeInput = document.getElementById('code-input');

  if (!codeInput) return;

  const text = codeInput.value;

  

  if (navigator.clipboard && window.isSecureContext) {

    navigator.clipboard.writeText(text).then(() => {

      onCopySuccess(btn);

    }).catch(() => {

      fallbackCopy(codeInput, btn);

    });

  } else {

    fallbackCopy(codeInput, btn);

  }

}



function fallbackCopy(textarea, btn) {

  try {

    textarea.focus();

    textarea.select();

    const successful = document.execCommand('copy');

    if (successful) {

      onCopySuccess(btn);

    } else {

      showToast('Could not copy automatically. Please use Ctrl+C.', 'warning');

    }

  } catch (err) {

    showToast('Copy failed. Please manually select and press Ctrl+C.', 'error');

  }

}



function onCopySuccess(btn) {

  if (btn) {

    const origHTML = btn.innerHTML;

    btn.innerHTML = '✓ Copied!';

    setTimeout(() => { btn.innerHTML = origHTML; }, 2000);

  }

  showToast('Code copied to clipboard! 📋', 'success');

}



// ==========================================================
// ADMIN BUG REPORT SYSTEM (PERSISTENT IN DATABASE)
// ==========================================================
function openBugReportModal() {
  const modal = document.getElementById('bug-report-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  
  const reporterEmail = document.getElementById('bug-reporter-email');
  if (reporterEmail && AppState.currentUser) {
    reporterEmail.value = AppState.currentUser.email || 'teacher@school.edu.ph';
  }
}

function closeBugReportModal() {
  document.getElementById('bug-report-modal')?.classList.add('hidden');
}

async function submitBugReport() {
  const title = document.getElementById('bug-title')?.value.trim();
  const category = document.getElementById('bug-category')?.value || 'General';
  const severity = document.getElementById('bug-severity')?.value || 'Medium';
  const description = document.getElementById('bug-desc')?.value.trim();
  const reporter = document.getElementById('bug-reporter-email')?.value.trim() || (AppState.currentUser?.email || 'Admin');
  const includeCode = document.getElementById('bug-attach-code')?.checked;
  const currentCode = includeCode ? document.getElementById('code-input')?.value : '';

  if (!title) {
    showToast('Please enter a brief bug title or summary', 'warning');
    return;
  }
  if (!description) {
    showToast('Please describe the bug or issue you encountered', 'warning');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-bug');
  if (submitBtn) setButtonLoading(submitBtn, true, 'Submitting Report...');

  const reportData = {
    id: 'bug_' + Date.now(),
    title: title,
    category: category,
    severity: severity,
    description: description,
    reporter: reporter,
    codeSnapshot: currentCode,
    systemInfo: {
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      theme: AppState.currentTheme,
      timestamp: new Date().toISOString()
    },
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  // 1. Save locally to bug_reports database store
  let savedReports = [];
  try {
    savedReports = JSON.parse(localStorage.getItem('byte_bug_reports') || '[]');
  } catch (e) {
    savedReports = [];
  }
  savedReports.unshift(reportData);
  localStorage.setItem('byte_bug_reports', JSON.stringify(savedReports));

  // 2. Cloud database sync (Supabase) if configured
  try {
    if (window.supabase) {
      await window.supabase.from('bug_reports').insert([{
        title: title,
        category: category,
        severity: severity,
        description: description,
        reporter_email: reporter,
        code_context: currentCode,
        status: 'open',
        created_at: new Date().toISOString()
      }]);
    }
  } catch (err) {
    console.warn('Cloud sync skipped, saved to local database:', err);
  }

  // 3. PocketBase sync if configured
  try {
    if (window.PocketBase) {
      const pb = new PocketBase('http://127.0.0.1:8090');
      await pb.collection('bug_reports').create({
        title, category, severity, description, reporter
      });
    }
  } catch (err) {
    // local fallback active
  }

  if (submitBtn) setButtonLoading(submitBtn, false);
  closeBugReportModal();
  showToast(`Bug Report #${reportData.id.slice(-4)} submitted successfully to database! 🐞`, 'success');
  
  // Reset form
  const titleField = document.getElementById('bug-title');
  const descField = document.getElementById('bug-desc');
  if (titleField) titleField.value = '';
  if (descField) descField.value = '';
}


// ==========================================================
// 6-DIGIT EMAIL OTP VERIFICATION (SUPABASE AUTH OPTION 2)
// ==========================================================
let otpCountdownTimer = null;
let otpCountdownSecs = 60;

async function sendSupabaseOtp(email, code = '') {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        create_user: true,
        options: {
          emailRedirectTo: 'https://robinersd.github.io/B.Y.T.E_Admin_Portal/'
        },
        data: {
          code: code,
          verification_code: code
        }
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.msg || errData.message || 'Email rate limit reached' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function openOtpModal(email, type = 'login', username = '', password = '', code = '123456') {
  AppState.pendingOtp = { email, type, username, password, code };
  
  const modal = document.getElementById('otp-verification-modal');
  const emailDisplay = document.getElementById('otp-target-email-display');
  const title = document.getElementById('otp-modal-title');
  const subtitle = document.getElementById('otp-modal-subtitle');
  const verifyBtn = document.getElementById('btn-verify-otp');
  const errorMsg = document.getElementById('otp-error-message');
  const displayCode = document.getElementById('otp-display-code');

  if (emailDisplay) emailDisplay.textContent = email;
  if (errorMsg) errorMsg.style.display = 'none';
  if (displayCode) displayCode.textContent = code;

  if (type === 'register') {
    if (title) title.textContent = 'Verify New Admin Account';
    if (subtitle) subtitle.innerHTML = `Confirmation code sent to:<br><strong style="color:#1d4ed8 !important; font-weight:700; word-break:break-all;">${escapeHTML(email)}</strong>`;
    if (verifyBtn) verifyBtn.textContent = 'Verify & Complete Registration';
  } else {
    if (title) title.textContent = 'Admin Login Verification';
    if (subtitle) subtitle.innerHTML = `Confirmation code sent to:<br><strong style="color:#1d4ed8 !important; font-weight:700; word-break:break-all;">${escapeHTML(email)}</strong>`;
    if (verifyBtn) verifyBtn.textContent = 'Verify & Enter Portal';
  }

  // Clear inputs
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach(inp => {
    inp.value = '';
    inp.classList.remove('filled', 'has-error');
  });

  if (modal) modal.classList.remove('hidden');

  // Start 60s countdown
  startOtpCountdown();

  // Focus first input
  setTimeout(() => {
    const first = document.querySelector('.otp-digit-input[data-index="0"]');
    if (first) first.focus();
  }, 100);
}

function closeOtpModal() {
  const modal = document.getElementById('otp-verification-modal');
  if (modal) modal.classList.add('hidden');
  if (otpCountdownTimer) {
    clearInterval(otpCountdownTimer);
    otpCountdownTimer = null;
  }
}

function startOtpCountdown() {
  if (otpCountdownTimer) clearInterval(otpCountdownTimer);
  otpCountdownSecs = 60;
  const resendBtn = document.getElementById('btn-resend-otp');
  const countdownSpan = document.getElementById('otp-countdown');
  
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';
    resendBtn.style.cursor = 'not-allowed';
  }
  if (countdownSpan) countdownSpan.textContent = `(Resend in ${otpCountdownSecs}s)`;

  otpCountdownTimer = setInterval(() => {
    otpCountdownSecs--;
    if (otpCountdownSecs <= 0) {
      clearInterval(otpCountdownTimer);
      otpCountdownTimer = null;
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
        resendBtn.style.cursor = 'pointer';
      }
      if (countdownSpan) countdownSpan.textContent = '(Ready)';
    } else {
      if (countdownSpan) countdownSpan.textContent = `(Resend in ${otpCountdownSecs}s)`;
    }
  }, 1000);
}

async function resendOtpCode() {
  if (!AppState.pendingOtp || !AppState.pendingOtp.email) return;
  const resendBtn = document.getElementById('btn-resend-otp');
  if (resendBtn) setButtonLoading(resendBtn, true, 'Sending...');

  const newCode = String(Math.floor(100000 + Math.random() * 900000));
  AppState.pendingOtp.code = newCode;

  // 3-second loading delay on resend
  await new Promise(r => setTimeout(r, 3000));

  const result = await sendSupabaseOtp(AppState.pendingOtp.email, newCode);
  if (resendBtn) setButtonLoading(resendBtn, false);

  const displayCode = document.getElementById('otp-display-code');
  if (displayCode) displayCode.textContent = newCode;

  showToast(`New verification code: ${newCode}`, 'success');
  startOtpCountdown();
}

function setupOtpInputListeners() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val ? val.slice(-1) : '';
      if (e.target.value) {
        e.target.classList.add('filled');
        e.target.classList.remove('has-error');
        // Move cursor to next input box
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        // REQUIREMENT: DO NOT auto-verify! User reviews code and manually clicks Verify button.
      } else {
        e.target.classList.remove('filled');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === 'Enter') {
        submitOtpVerification();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      if (pasteData) {
        const digits = pasteData.slice(0, 6).split('');
        digits.forEach((d, i) => {
          if (inputs[i]) {
            inputs[i].value = d;
            inputs[i].classList.add('filled');
            inputs[i].classList.remove('has-error');
          }
        });
        if (digits.length < inputs.length) {
          inputs[digits.length].focus();
        } else {
          inputs[inputs.length - 1].focus();
        }
      }
    });
  });
}

async function submitOtpVerification() {
  if (!AppState.pendingOtp) return;
  const inputs = document.querySelectorAll('.otp-digit-input');
  const code = Array.from(inputs).map(i => i.value.trim()).join('');
  const errorMsg = document.getElementById('otp-error-message');
  const verifyBtn = document.getElementById('btn-verify-otp');

  if (code.length < 6) {
    if (errorMsg) {
      errorMsg.textContent = '⚠️ Please enter all 6 digits.';
      errorMsg.style.display = 'block';
    }
    inputs.forEach(i => { if (!i.value) i.classList.add('has-error'); });
    showToast('Please enter the full 6-digit code', 'warning');
    return;
  }

  if (errorMsg) errorMsg.style.display = 'none';
  if (verifyBtn) setButtonLoading(verifyBtn, true, 'Verifying...');
  await new Promise(r => setTimeout(r, 1800));

  let isVerified = false;

  // 1. Check generated session code or Master Demo Fallback Code (123456 or 000000)
  const validCodes = [AppState.pendingOtp.code, '123456', '000000'].filter(Boolean);
  if (validCodes.includes(code)) {
    isVerified = true;
  } else {
    // 2. Verify with Supabase Auth API
    try {
      const verifyRes = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/verify`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          email: AppState.pendingOtp.email,
          token: code
        })
      });
      if (verifyRes.ok) {
        isVerified = true;
      }
    } catch (err) {
      console.warn('Supabase verification network check:', err);
    }
  }

  if (verifyBtn) setButtonLoading(verifyBtn, false);

  if (isVerified) {
    const pending = AppState.pendingOtp;
    closeOtpModal();

    if (pending.type === 'register') {
      // 1. Permanently register this admin account with verified password
      saveRegisteredAdmin({
        username: pending.username,
        email: pending.email,
        password: pending.password,
        role: 'Teacher Admin',
        verifiedAt: new Date().toISOString()
      });

      // 2. REQUIREMENT: Once registered & verified, DO NOT auto-login!
      // Switch BACK TO LOGIN so they log in with their verified credentials!
      showToast('🎉 Admin account verified successfully! Please log in with your credentials.', 'success');
      
      // 3. Pre-fill email in login forms
      const deskLoginEmail = document.getElementById('desk-login-email');
      const phoneLoginEmail = document.getElementById('phone-login-email');
      if (deskLoginEmail) deskLoginEmail.value = pending.email;
      if (phoneLoginEmail) phoneLoginEmail.value = pending.email;

      // 4. CLEAR password inputs so NO wrong/stale password is automatically present!
      const deskLoginPass = document.getElementById('desk-login-pass');
      const phoneLoginPass = document.getElementById('phone-login-pass');
      if (deskLoginPass) { deskLoginPass.value = ''; deskLoginPass.classList.remove('input-error'); }
      if (phoneLoginPass) { phoneLoginPass.value = ''; phoneLoginPass.classList.remove('input-error'); }

      setAuthMode('login');
      AppState.pendingOtp = null;

      // Focus on password input
      setTimeout(() => {
        const pInp = (window.innerWidth <= 840) ? phoneLoginPass : deskLoginPass;
        if (pInp) pInp.focus();
      }, 150);
    } else {
      // Login verified: enter portal!
      const usernameVal = pending.username || (pending.email.includes('@') ? pending.email.split('@')[0] : pending.email);
      AppState.currentUser = {
        username: usernameVal,
        email: pending.email,
        role: 'Teacher Admin',
        joined: new Date().toLocaleDateString()
      };
      sessionStorage.setItem('byte_admin_user', JSON.stringify(AppState.currentUser));
      showToast(`Welcome back, ${AppState.currentUser.username}!`, 'success');
      AppState.pendingOtp = null;
      showDashboardView();
    }
  } else {
    if (errorMsg) {
      errorMsg.textContent = '❌ Invalid or expired verification code. Please check your email (or use demo code: 123456).';
      errorMsg.style.display = 'block';
    }
    inputs.forEach(i => i.classList.add('has-error'));
    showToast('Invalid verification code!', 'error');
  }
}
