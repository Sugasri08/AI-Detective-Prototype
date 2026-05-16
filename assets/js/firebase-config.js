// ─── EvidAI — Firebase Config ────────────────────────────────
// Replace the firebaseConfig object below with your own
// from: console.firebase.google.com → Project settings → Your apps

import { initializeApp }                        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged,
         signInWithEmailAndPassword,
         createUserWithEmailAndPassword,
         signInWithPopup, GoogleAuthProvider,
         signOut, updateProfile }               from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, setDoc,
         getDoc, serverTimestamp }              from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── YOUR FIREBASE CONFIG GOES HERE ──────────────────────────
// Replace every value below with the ones from Firebase console
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID",
};
// ────────────────────────────────────────────────────────────

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const gProvider = new GoogleAuthProvider();

// ── Save user profile to Firestore on first signup ───────────
async function saveUserProfile(user, extra = {}) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:          user.uid,
      email:        user.email,
      displayName:  user.displayName || extra.displayName || '',
      photoURL:     user.photoURL    || '',
      organization: extra.organization || '',
      role:         extra.role || 'analyst',
      createdAt:    serverTimestamp(),
    });
  }
}

// ── Get user profile from Firestore ─────────────────────────
async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Auth state helper — calls cb(user|null) on change ────────
function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Redirect if not logged in ────────────────────────────────
function requireAuth(redirectTo = '/pages/login.html') {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        window.location.href = redirectTo;
      } else {
        resolve(user);
      }
    });
  });
}

// ── Redirect if already logged in ───────────────────────────
function redirectIfLoggedIn(to = '/index.html') {
  const unsub = onAuthStateChanged(auth, (user) => {
    unsub();
    if (user) window.location.href = to;
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