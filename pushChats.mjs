import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

const chats = [
  {
    id: "chat_1_" + Date.now(),
    title: "Ky haal h",
    messages: [{ role: "user", content: "Ky haal h" }, { role: "assistant", content: "Main ekdam theek hu! Bataiye, aaj kaise madad karu aapki?" }],
    updatedAt: Date.now() - 3000
  },
  {
    id: "chat_2_" + Date.now(),
    title: "Kuch fibers ke bare me bat...",
    messages: [{ role: "user", content: "Kuch fibers ke bare me batao" }, { role: "assistant", content: "Zaroor! Dietary fibers digestion aur gut health ke liye bohot zaroori hote hain. Yeh soluble aur insoluble dono types ke hote hain..." }],
    updatedAt: Date.now() - 2000
  },
  {
    id: "chat_3_" + Date.now(),
    title: "Bhai ibs gut motility disorde...",
    messages: [{ role: "user", content: "Bhai ibs gut motility disorder hai kya?" }, { role: "assistant", content: "Haan bhai, IBS (Irritable Bowel Syndrome) ek functional gastrointestinal disorder hai jisme gut motility (movement) aur brain-gut interaction disturb ho jata hai." }],
    updatedAt: Date.now() - 1000
  }
];

async function pushData() {
  const targetUid = "sahityaka";
  for (const chat of chats) {
    const sessionRef = doc(db, 'users', targetUid, 'sessions', chat.id);
    await setDoc(sessionRef, chat, { merge: true });
    console.log("Saved chat:", chat.title);
  }
  console.log("Done uploading to 'sahityaka' category!");
  process.exit(0);
}

pushData().catch(err => console.error(err));
