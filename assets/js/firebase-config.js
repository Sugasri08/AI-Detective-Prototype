// ─── EvidAI — Firebase Config ────────────────────────────────

import { initializeApp }                   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged,
         signInWithEmailAndPassword,
         createUserWithEmailAndPassword,
         signInWithPopup, GoogleAuthProvider,
         signOut, updateProfile }          from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc,
         getDoc, serverTimestamp }         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyB1ZVsxF9Hd4lj1_kQX01U2VZJSsc_KBkI",
  authDomain:        "evidai-81904.firebaseapp.com",
  projectId:         "evidai-81904",
  storageBucket:     "evidai-81904.firebasestorage.app",
  messagingSenderId: "722520033231",
  appId:             "1:722520033231:web:6cbda9d3a5bcadbfb874ba",
  measurementId:     "G-Q9WYJQ8WCH",
};

const app       = initializeApp(firebaseConfig);
const auth      = getAuth(app);
const db        = getFirestore(app);
const gProvider = new GoogleAuthProvider();

gProvider.addScope('email');
gProvider.addScope('profile');

// ── Save user profile — non-fatal if Firestore blocked ───────
async function saveUserProfile(user, extra = {}) {
  try {
    const ref  = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:          user.uid,
        email:        user.email,
        displayName:  user.displayName || extra.displayName || '',
        photoURL:     user.photoURL    || '',
        organization: extra.organization || '',
        orgType:      extra.orgType || 'other',
        role:         extra.role || 'analyst',
        createdAt:    serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('[EvidAI] Firestore write skipped:', err.code);
  }
}

// ── Get user profile — returns null if unavailable ───────────
async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('[EvidAI] Firestore read skipped:', err.code);
    return null;
  }
}

// ── Auth state listener ───────────────────────────────────────
function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Redirect if not logged in ────────────────────────────────
// Uses relative paths so it works on any domain
function requireAuth(redirectTo) {
  const fallback = redirectTo || (window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) window.location.href = fallback;
      else resolve(user);
    });
  });
}

// ── Redirect if already logged in ───────────────────────────
function redirectIfLoggedIn(to) {
  const dest = to || (window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html');
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (user) window.location.href = dest;
  });
}

export {
  auth, db, gProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  saveUserProfile,
  getUserProfile,
  onAuth,
  requireAuth,
  redirectIfLoggedIn,
};