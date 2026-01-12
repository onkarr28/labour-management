import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import * as FileSystem from 'expo-file-system';

/**
 * Upload worker photo to Firebase Storage
 * @param {string} labourId - Unique labour ID
 * @param {string} photoUri - Local URI of the photo
 * @returns {Promise<string>} - Download URL of the uploaded photo
 */
export const uploadWorkerPhoto = async (labourId, photoUri) => {
  if (!photoUri) return null;

  try {
    // Read the image file as base64
    const imageData = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create blob from base64
    const imageBlob = Buffer.from(imageData, 'base64');

    // Create storage reference
    const timestamp = Date.now();
    const storageRef = ref(storage, `worker-photos/${labourId}-${timestamp}.jpg`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, imageBlob, {
      contentType: 'image/jpeg',
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading worker photo:', error);
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
