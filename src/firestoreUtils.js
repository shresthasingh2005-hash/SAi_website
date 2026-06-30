import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const loadSessionsFromFirestore = async (uid) => {
  const targetUid = 'sahityaka';
  try {
    const sessionsRef = collection(db, 'users', targetUid, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    if (!snapshot.empty) {
      const loaded = [];
      snapshot.forEach(doc => loaded.push({ id: doc.id, ...doc.data() }));
      loaded.sort((a, b) => b.updatedAt - a.updatedAt);
      return loaded;
    }
  } catch (error) {
    console.error("Error loading sessions from Firestore", error);
  }
  return null;
};

export const saveSessionToFirestore = async (uid, session) => {
  const targetUid = 'sahityaka';
  try {
    const sessionRef = doc(db, 'users', targetUid, 'sessions', session.id);
    await setDoc(sessionRef, session, { merge: true });
    console.log("Successfully saved to Firebase path: users/" + targetUid + "/sessions/" + session.id);
  } catch (error) {
    console.error("Error saving session to Firestore", error);
    alert("Firebase Save Error: " + error.message);
  }
};

export const deleteAllSessions = async (uid) => {
  const targetUid = 'sahityaka';
  try {
    const sessionsRef = collection(db, 'users', targetUid, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, 'users', targetUid, 'sessions', docSnap.id)));
    });
    await Promise.all(deletePromises);
    console.log(`Deleted all sessions for ${targetUid}`);
  } catch (error) {
    console.error("Error deleting sessions", error);
  }
};

export const updateUserLastSeen = async () => {
  const targetUid = 'sahityaka';
  try {
    const userRef = doc(db, 'users', targetUid);
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });
    await setDoc(userRef, { 
      lastSeen: now.toISOString(),
      lastSeen_IST: istTime + ' (IST)'
    }, { merge: true });
    console.log(`Updated lastSeen for ${targetUid}`);
  } catch (error) {
    console.error("Error updating lastSeen", error);
  }
};
