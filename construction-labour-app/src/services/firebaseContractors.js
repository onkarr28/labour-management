import { db } from './firebase';
import { collection, setDoc, doc, getDocs, query } from 'firebase/firestore';

// Contractor credentials collection
const CONTRACTORS_COLLECTION = 'contractors';

// Save or update contractor credentials
export const saveContractorCredentials = async (contractorId, contractor) => {
  try {
    const contractorRef = doc(db, CONTRACTORS_COLLECTION, contractorId);
    await setDoc(contractorRef, {
      ...contractor,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving contractor credentials:', error);
    return { success: false, error };
  }
};

// Get all contractor credentials (for login validation)
export const getAllContractors = async () => {
  try {
    const contractorsRef = collection(db, CONTRACTORS_COLLECTION);
    const snapshot = await getDocs(query(contractorsRef));
    const contractors = {};
    
    snapshot.forEach(doc => {
      contractors[doc.id] = doc.data();
    });
    
    return contractors;
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return {};
  }
};

// Get contractor by ID
export const getContractorById = async (contractorId) => {
  try {
    const contractorRef = doc(db, CONTRACTORS_COLLECTION, contractorId);
    const docSnap = await getDocs(query(contractorRef));
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching contractor:', error);
    return null;
  }
};

// Link worker to multiple contractors
export const addWorkerToContractor = async (workerId, contractorId) => {
  try {
    // This is handled in firebaseLabours.js by updating the contractorIds array
    return { success: true };
  } catch (error) {
    console.error('Error adding worker to contractor:', error);
    return { success: false, error };
  }
};

// Remove worker from contractor
export const removeWorkerFromContractor = async (workerId, contractorId) => {
  try {
    // This is handled in firebaseLabours.js by updating the contractorIds array
    return { success: true };
  } catch (error) {
    console.error('Error removing worker from contractor:', error);
    return { success: false, error };
  }
};
