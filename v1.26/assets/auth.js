const STORAGE_USERS = "guan_demo_users";
const STORAGE_SESSION = "guan_demo_session";

function nowIso(){ return new Date().toISOString(); }

function loadUsers(){ try { return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]"); } catch { return []; } }
function saveUsers(users){ localStorage.setItem(STORAGE_USERS, JSON.stringify(users)); }

function loadSession(){ try { return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null"); } catch { return null; } }
function saveSession(session){ localStorage.setItem(STORAGE_SESSION, JSON.stringify(session)); }
function clearSession(){ localStorage.removeItem(STORAGE_SESSION); }

function randomId(len = 28){
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function sha256Hex(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUserByEmail(email){
  const e = (email || "").trim().toLowerCase();
  return loadUsers().find(u => u.email === e) || null;
}
function getUserById(id){
  return loadUsers().find(u => u.id === id) || null;
}

function toast(el, msg, ok = true){
  el.innerHTML = `<div class="text-sm ${ok ? "text-green-600" : "text-red-500"}">${msg}</div>`;
}

async function registerUser({ firstName, lastName, email, password }){
  const e = email.trim().toLowerCase();
  if (getUserByEmail(e)) return { ok: false, error: "這個 Email 已經註冊過了。" };

  const passHash = await sha256Hex(password);
  const users = loadUsers();
  users.push({
    id: randomId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: e,
    passHash,
    createdAt: nowIso(),
    loginHistory: []
  });
  saveUsers(users);
  return { ok: true };
}

async function loginUser({ email, password }){
  const u = getUserByEmail(email);
  if (!u) return { ok: false, error: "找不到這個帳號。" };

  const passHash = await sha256Hex(password);
  if (passHash !== u.passHash) return { ok: false, error: "密碼錯誤。" };

  const users = loadUsers();
  const idx = users.findIndex(x => x.id === u.id);
  const entry = { at: nowIso(), ua: navigator.userAgent };
  users[idx].loginHistory = [entry, ...(users[idx].loginHistory || [])].slice(0, 25);
  saveUsers(users);

  saveSession({ sid: randomId(32), userId: u.id, createdAt: nowIso() });
  return { ok: true };
}

async function updatePassword({ email, newPassword }){
  const u = getUserByEmail(email);
  if (!u) return { ok: false, error: "找不到這個帳號。" };

  const users = loadUsers();
  const idx = users.findIndex(x => x.id === u.id);
  users[idx].passHash = await sha256Hex(newPassword);
  users[idx].passwordUpdatedAt = nowIso();
  saveUsers(users);

  return { ok: true };
}

function requireAuth(redirectTo = "./login.html"){
  const s = loadSession();
  if (!s?.userId){ location.replace(redirectTo); return null; }
  return s;
}
