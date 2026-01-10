import { db } from './firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Add a worker to a contractor (supports multiple contractors per worker)
 * @param {string} workerId - Worker's ID
 * @param {string} contractorId - Contractor's ID
 */
export const addWorkerToContractor = async (workerId, contractorId) => {
  try {
    const workerRef = doc(db, 'labours', workerId);
    await updateDoc(workerRef, {
      contractorIds: arrayUnion(contractorId),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding worker to contractor:', error);
    return { success: false, error };
  }
};

/**
 * Remove a worker from a contractor
 * @param {string} workerId - Worker's ID
 * @param {string} contractorId - Contractor's ID
 */
export const removeWorkerFromContractor = async (workerId, contractorId) => {
  try {
    const workerRef = doc(db, 'labours', workerId);
    await updateDoc(workerRef, {
      contractorIds: arrayRemove(contractorId),
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing worker from contractor:', error);
    return { success: false, error };
  }
};

/**
 * Get all contractors for a worker
 * @param {object} worker - Worker object
 * @returns {array} Array of contractor IDs
 */
export const getWorkerContractorIds = (worker) => {
  // Support both old format (single contractorId) and new format (multiple contractorIds)
  return worker.contractorIds || (worker.contractorId ? [worker.contractorId] : []);
};

/**
 * Check if worker belongs to a contractor
 * @param {object} worker - Worker object
 * @param {string} contractorId - Contractor's ID
 * @returns {boolean}
 */
export const isWorkerOfContractor = (worker, contractorId) => {
  const contractorIds = getWorkerContractorIds(worker);
  return contractorIds.includes(contractorId);
};

/**
 * Get shared contractors between two workers
 * @param {object} worker1 - First worker
 * @param {object} worker2 - Second worker
 * @returns {array} Array of shared contractor IDs
 */
export const getSharedContractors = (worker1, worker2) => {
  const ids1 = getWorkerContractorIds(worker1);
  const ids2 = getWorkerContractorIds(worker2);
  return ids1.filter(id => ids2.includes(id));
};
