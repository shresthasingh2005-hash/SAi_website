// migrate_chat_history.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAP9rXOO6di6KFjUQvt0NEFMnSEeLjwwMU",
  authDomain: "sahityaka-ai.firebaseapp.com",
  projectId: "sahityaka-ai",
  storageBucket: "sahityaka-ai.firebasestorage.app",
  messagingSenderId: "149061229841",
  appId: "1:149061229841:web:739e98ad3f58dc4e7bc0b0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SOURCE_UID = 'sahityaka';
const TARGET_UID = 'sahityakasingh';

function toIST(ts) {
  const d = ts ? new Date(typeof ts === 'number' ? ts : ts) : new Date();
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }) + ' IST';
}

async function migrateSessions() {
  console.log(`Fetching sessions from: users/${SOURCE_UID}/sessions`);
  const srcRef = collection(db, 'users', SOURCE_UID, 'sessions');
  const snap = await getDocs(srcRef);
  if (snap.empty) { console.log('No sessions found'); return; }
  console.log(`Found ${snap.size} sessions. Migrating to ${TARGET_UID}...`);
  for (const docSnap of snap.docs) {
    const session = { id: docSnap.id, ...docSnap.data() };
    if (!session.createdAt_IST && session.updatedAt) session.createdAt_IST = toIST(session.updatedAt);
    if (!session.updatedAt_IST && session.updatedAt) session.updatedAt_IST = toIST(session.updatedAt);
    if (Array.isArray(session.messages)) {
      session.messages = session.messages.map((msg, idx) => {
        if (!msg.timestamp_IST) {
          const baseTime = session.updatedAt ? session.updatedAt - (session.messages.length - idx) * 30000 : Date.now();
          return { ...msg, timestamp: msg.timestamp || baseTime, timestamp_IST: msg.timestamp ? toIST(msg.timestamp) : toIST(baseTime) };
        }
        return msg;
      });
    }
    const destRef = doc(db, 'users', TARGET_UID, 'sessions', session.id);
    await setDoc(destRef, session, { merge: true });
    console.log(`  Migrated: ${session.id} (${session.messages?.length || 0} msgs)`);
  }
  console.log(`\nAll ${snap.size} sessions migrated with timestamps!`);
}

migrateSessions().then(() => process.exit(0)).catch(e => { console.error('Error:', e.message); process.exit(1); });
