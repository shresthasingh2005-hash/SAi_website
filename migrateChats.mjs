import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAP9rXOO6di6KFjUQvt0NEFMnSEeLjwwMU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sahityaka-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sahityaka-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sahityaka-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "149061229841",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:149061229841:web:739e98ad3f58dc4e7bc0b0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
  const sourceUid = "general_user_general";
  const targetUid = "sahityaka";
  
  console.log(`Fetching sessions from ${sourceUid}...`);
  const sessionsRef = collection(db, 'users', sourceUid, 'sessions');
  const snapshot = await getDocs(sessionsRef);
  
  if (snapshot.empty) {
    console.log("No sessions found in source.");
    process.exit(0);
  }
  
  let count = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const newRef = doc(db, 'users', targetUid, 'sessions', docSnap.id);
    await setDoc(newRef, data, { merge: true });
    console.log(`Migrated chat: ${data.title}`);
    count++;
  }
  
  console.log(`Successfully migrated ${count} chats from ${sourceUid} to ${targetUid}!`);
  process.exit(0);
}

migrateData().catch(err => console.error(err));
