// upload_health_docs.mjs
// Uploads Sahityaka's health documents to Firebase under sahityakasingh/health_data

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

const TARGET_UID = 'sahityakasingh';

async function uploadFile(filePath, nodeId, title, type) {
  console.log(`Reading: ${filePath}`);
  const data = readFileSync(filePath);
  let content;
  
  if (type === 'pdf') {
    // Store as base64 for PDF
    content = 'data:application/pdf;base64,' + data.toString('base64');
  } else {
    // Store HTML as text
    content = data.toString('utf-8');
  }

  const node = {
    id: nodeId,
    title: title,
    type: 'file',
    content: content,
    uploadedAt: new Date().toISOString(),
    uploadedAt_IST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  const ref = doc(db, 'users', TARGET_UID, 'health_data', nodeId);
  await setDoc(ref, node);
  console.log(`✅ Uploaded: ${title} → users/${TARGET_UID}/health_data/${nodeId}`);
}

async function main() {
  try {
    await uploadFile(
      resolve('F:/BuddyLLM/Sahityaka Singh   _Health_Report.pdf'),
      'health_report_aug2026',
      'Sahityaka Singh – Health Report (Aug 2026)',
      'pdf'
    );

    await uploadFile(
      resolve('F:/BuddyLLM/Sahityaka_Singh_Health_Recovery_Plan.html'),
      'health_recovery_plan_sept2026',
      'Sahityaka Singh – Health Recovery Plan (Sept 2026)',
      'html'
    );

    console.log('\n✅ All documents uploaded to sahityakasingh/health_data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
