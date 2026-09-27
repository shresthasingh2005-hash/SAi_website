import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const loadSessionsFromFirestore = async (uid) => {
  const targetUid = uid;
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
  const targetUid = uid;
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
  const targetUid = uid;
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

export const deleteSession = async (uid, sessionId) => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'sessions', sessionId));
  } catch (error) {
    console.error("Error deleting session", error);
  }
};

export const updateUserLastSeen = async (uid) => {
  const targetUid = uid || 'general_user_general';
  try {
    const userRef = doc(db, 'users', targetUid);
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' });
    
    const snap = await getDoc(userRef);
    let last10Logins = [];
    if (snap.exists() && snap.data().last10Logins) {
      last10Logins = snap.data().last10Logins;
    }
    
    last10Logins.unshift(istTime + ' (IST)');
    
    if (last10Logins.length > 10) {
      last10Logins = last10Logins.slice(0, 10);
    }

    await setDoc(userRef, { 
      lastSeen: now.toISOString(),
      lastSeen_IST: istTime + ' (IST)',
      last10Logins: last10Logins
    }, { merge: true });
    console.log(`Updated lastSeen and last 10 logins for ${targetUid}`);
  } catch (error) {
    console.error("Error updating lastSeen", error);
  }
};

export const moveSessionToDeleted = async (uid, session) => {
  try {
    const targetUid = uid || 'general_user_general';
    const deletedSessionRef = doc(db, 'users', targetUid, 'deleted_sessions', session.id);
    await setDoc(deletedSessionRef, session);
    await deleteDoc(doc(db, 'users', targetUid, 'sessions', session.id));
    console.log(`Moved session ${session.id} to deleted_sessions`);
  } catch (error) {
    console.error("Error moving session to deleted_sessions", error);
  }
};
export const loadUserProfileData = async (uid) => {
  const targetUid = uid || 'general_user_general';
  try {
    const dataRef = doc(db, 'users', targetUid, 'data', 'my_data');
    const snap = await getDoc(dataRef);
    if(snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.error("Error loading myData", error);
  }
  return null;
};

export const saveUserProfileData = async (uid, myData) => {
  const targetUid = uid || 'general_user_general';
  try {
    const dataRef = doc(db, 'users', targetUid, 'data', 'my_data');
    await setDoc(dataRef, myData);
  } catch (error) {
    console.error("Error saving myData", error);
  }
};

export const loadHealthData = async (uid) => {
  const targetUid = uid || 'general_user_general';
  try {
    const healthRef = collection(db, 'users', targetUid, 'health_data');
    const snap = await getDocs(healthRef);
    if (!snap.empty) {
      const loaded = [];
      snap.forEach(doc => loaded.push({ id: doc.id, ...doc.data() }));
      return loaded;
    }
  } catch (error) {
    console.error("Error loading healthData", error);
  }
  return [];
};

export const saveHealthDataNode = async (uid, node) => {
  const targetUid = uid || 'general_user_general';
  try {
    const nodeRef = doc(db, 'users', targetUid, 'health_data', node.id);
    await setDoc(nodeRef, node);
  } catch (error) {
    console.error("Error saving health node", error);
  }
};

export const deleteHealthDataNode = async (uid, nodeId) => {
  const targetUid = uid || 'general_user_general';
  try {
    await deleteDoc(doc(db, 'users', targetUid, 'health_data', nodeId));
  } catch (error) {
    console.error("Error deleting health node", error);
  }
};
