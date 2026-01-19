import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const LABOURS_COLLECTION = 'labours';

export const fetchLaboursFromFirebase = async () => {
  try {
    const snapshot = await getDocs(collection(db, LABOURS_COLLECTION));
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    console.error('Error fetching labours from Firebase:', error);
    return [];
  }
};

export const syncLaboursToFirebase = async (labours) => {
  try {
    // Strong safety guard: never auto-delete everything if local state is empty
    if (!Array.isArray(labours)) {
      console.warn('syncLaboursToFirebase called with non-array labours, skipping sync');
      return;
    }

    const colRef = collection(db, LABOURS_COLLECTION);

    // Get existing docs to detect deletions
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map((d) => d.id);

    // If local list is empty but there are existing docs, DO NOT delete them automatically
    if (labours.length === 0 && existingIds.length > 0) {
      console.warn('syncLaboursToFirebase: local labours empty while remote has data – skipping delete to protect data');
      return;
    }

    const desiredIds = labours.map((l) => l.id).filter(Boolean);

    // Upsert all current labours
    for (const labour of labours) {
      if (!labour.id) continue;
      await setDoc(doc(db, LABOURS_COLLECTION, labour.id), labour);
    }

    // Delete any labours that no longer exist locally
    const toDelete = existingIds.filter((id) => !desiredIds.includes(id));
    for (const id of toDelete) {
      await deleteDoc(doc(db, LABOURS_COLLECTION, id));
    }
  } catch (error) {
    console.error('Error syncing labours to Firebase:', error);
  }
};

export const deleteAllLaboursFromFirebase = async () => {
  try {
    const snapshot = await getDocs(collection(db, LABOURS_COLLECTION));
    const deletePromises = snapshot.docs.map((d) =>
      deleteDoc(doc(db, LABOURS_COLLECTION, d.id))
    );
    await Promise.all(deletePromises);
    console.log('All labours deleted from Firebase');
  } catch (error) {
    console.error('Error deleting all labours from Firebase:', error);
  }
};
