import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload worker photo to Firebase Storage
 * @param {string} labourId - Unique labour ID
 * @param {string} photoUri - Local URI of the photo
 * @returns {Promise<string>} - Download URL of the uploaded photo
 */
export const uploadWorkerPhoto = async (labourId, photoUri) => {
  if (!photoUri) return null;

  try {
    console.log('Starting photo upload for labour:', labourId);
    console.log('Photo URI:', photoUri);
    
    // Fetch the image as a blob
    const response = await fetch(photoUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('Blob created, size:', blob.size, 'type:', blob.type);

    // Create storage reference
    const timestamp = Date.now();
    const fileName = `worker-photos/${labourId}-${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);
    console.log('Storage ref created:', fileName);

    // Upload file
    console.log('Starting upload to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
    });
    console.log('Upload successful, getting download URL...');

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL received:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading worker photo:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    throw error;
  }
};

/**
 * Delete worker photo from Firebase Storage
 * @param {string} photoURL - URL of the photo to delete
 */
export const deleteWorkerPhoto = async (photoURL) => {
  if (!photoURL) return;

  try {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(photoURL);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(startIndex, endIndex);

    const photoRef = ref(storage, filePath);
    // Delete file (optional, depends on your requirements)
    // await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting worker photo:', error);
  }
};
