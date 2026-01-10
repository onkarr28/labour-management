import { collection, getDocs, setDoc, deleteDoc, doc, query, where, getDocs as getDocs2 } from 'firebase/firestore';
import { db } from './firebase';

const WORKERS_COLLECTION = 'workers';

/**
 * Save worker credentials to Firebase for login
 * This should be called immediately when a worker is created
 */
export const saveWorkerCredentials = async (workerId, workerData) => {
  try {
    const workerDoc = {
      id: workerId,
      name: workerData.name,
      loginId: workerData.loginId,
      password: workerData.password,
      contractorId: workerData.contractorId,
      contractorIds: workerData.contractorIds || [workerData.contractorId],
      mobile: workerData.mobile,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, WORKERS_COLLECTION, workerId), workerDoc);
    console.log('Worker credentials saved to Firebase:', workerId);
    return true;
  } catch (error) {
    console.error('Error saving worker credentials to Firebase:', error);
    return false;
  }
};

/**
 * Get worker by login credentials
 * Used for worker login authentication
 */
export const getWorkerByCredentials = async (loginId, password) => {
  try {
    const snapshot = await getDocs(
      query(collection(db, WORKERS_COLLECTION), where('loginId', '==', loginId))
    );

    if (snapshot.empty) {
      return null;
    }

    const worker = snapshot.docs[0].data();
    if (worker.password === password) {
      return worker;
    }

    return null;
  } catch (error) {
    console.error('Error fetching worker by credentials:', error);
    return null;
  }
};

/**
 * Get worker by ID
 */
export const getWorkerById = async (workerId) => {
  try {
    const docSnap = await getDocs2(collection(db, WORKERS_COLLECTION));
    const worker = docSnap.docs.find(d => d.id === workerId);
    return worker ? worker.data() : null;
  } catch (error) {
    console.error('Error fetching worker by ID:', error);
    return null;
  }
};

/**
 * Get all workers for a contractor
 */
export const getWorkersByContractor = async (contractorId) => {
  try {
    const snapshot = await getDocs(
      query(collection(db, WORKERS_COLLECTION), where('contractorIds', 'array-contains', contractorId))
    );
    return snapshot.docs.map(d => d.data());
  } catch (error) {
    console.error('Error fetching workers for contractor:', error);
    return [];
  }
};

/**
 * Update worker credentials
 */
export const updateWorkerCredentials = async (workerId, updates) => {
  try {
    const workerRef = doc(db, WORKERS_COLLECTION, workerId);
    await setDoc(workerRef, updates, { merge: true });
    console.log('Worker credentials updated:', workerId);
    return true;
  } catch (error) {
    console.error('Error updating worker credentials:', error);
    return false;
  }
};

/**
 * Delete worker from Firebase
 */
export const deleteWorkerFromFirebase = async (workerId) => {
  try {
    await deleteDoc(doc(db, WORKERS_COLLECTION, workerId));
    console.log('Worker deleted from Firebase:', workerId);
    return true;
  } catch (error) {
    console.error('Error deleting worker from Firebase:', error);
    return false;
  }
};

/**
 * Add worker to additional contractor
 */
export const addWorkerToContractorFB = async (workerId, contractorId) => {
  try {
    const workerRef = doc(db, WORKERS_COLLECTION, workerId);
    const worker = await getWorkerById(workerId);
    
    if (!worker) {
      console.error('Worker not found:', workerId);
      return false;
    }

    const contractorIds = worker.contractorIds || [worker.contractorId];
    if (!contractorIds.includes(contractorId)) {
      contractorIds.push(contractorId);
    }

    await setDoc(workerRef, { contractorIds }, { merge: true });
    console.log('Worker added to contractor:', contractorId);
    return true;
  } catch (error) {
    console.error('Error adding worker to contractor:', error);
    return false;
  }
};
