'use client';

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 512;
const QUALITY = 0.85;

/**
 * Compresses and resizes an image
 */
export async function compressAndResizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image is too large (max 10MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Unable to create canvas context'));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob (WebP if supported, otherwise JPEG)
        const tryWebP = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                // Fallback to JPEG if WebP fails
                canvas.toBlob(
                  (jpegBlob) => {
                    if (jpegBlob) {
                      resolve(jpegBlob);
                    } else {
                      reject(new Error('Error during compression'));
                    }
                  },
                  'image/jpeg',
                  QUALITY
                );
              }
            },
            'image/webp',
            QUALITY
          );
        };

        tryWebP();
      };
      img.onerror = () => reject(new Error('Error loading image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a profile picture to Firebase Storage
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  try {
    // Compress and resize the image
    const compressedBlob = await compressAndResizeImage(file);

    // Detect file extension based on MIME type
    let fileExtension = 'webp';
    if (compressedBlob.type === 'image/jpeg') {
      fileExtension = 'jpg';
    } else if (compressedBlob.type === 'image/png') {
      fileExtension = 'png';
    }

    // Create storage path with timestamp to avoid collisions
    const timestamp = Date.now();
    const storagePath = `profile-pictures/${userId}/${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, compressedBlob);

    // Get public URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error uploading photo'
    );
  }
}

/**
 * Deletes a profile picture from Firebase Storage
 */
export async function deleteProfilePicture(photoURL: string): Promise<void> {
  try {
    // Extract path from URL
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const url = new URL(photoURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      // If URL is not in Firebase Storage format, do nothing
      return;
    }

    // Decode path (spaces are encoded as %20)
    const encodedPath = pathMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);

    // Delete the file
    const storageRef = ref(storage, decodedPath);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore deletion errors (file may not exist)
    console.warn('Error deleting old photo:', error);
  }
}

/**
 * Extracts the Storage path from a Firebase Storage URL
 */
export function extractStoragePathFromURL(photoURL: string): string | null {
  try {
    const url = new URL(photoURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      return null;
    }

    const encodedPath = pathMatch[1];
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

