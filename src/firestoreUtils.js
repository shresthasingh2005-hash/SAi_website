import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const loadSessionsFromFirestore = async (uid) => {
  try {
    const sessionsRef = collection(db, 'users', uid, 'sessions');
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
  try {
    const sessionRef = doc(db, 'users', uid, 'sessions', session.id);
    await setDoc(sessionRef, session, { merge: true });
  } catch (error) {
    console.error("Error saving session to Firestore", error);
  }
};

export const deleteAllSessions = async (uid) => {
  try {
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, 'users', uid, 'sessions', docSnap.id)));
    });
    await Promise.all(deletePromises);
    console.log(`Deleted all sessions for ${uid}`);
  } catch (error) {
    console.error("Error deleting sessions", error);
  }
};
