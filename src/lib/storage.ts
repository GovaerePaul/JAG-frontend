'use client';

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 512;
const QUALITY = 0.85;

export async function compressAndResizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image is too large (max 10MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Unable to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const tryWebP = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
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

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  try {
    const compressedBlob = await compressAndResizeImage(file);

    let fileExtension = 'webp';
    if (compressedBlob.type === 'image/jpeg') {
      fileExtension = 'jpg';
    } else if (compressedBlob.type === 'image/png') {
      fileExtension = 'png';
    }

    const timestamp = Date.now();
    const storagePath = `profile-pictures/${userId}/${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, compressedBlob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error uploading photo'
    );
  }
}

export async function deleteProfilePicture(photoURL: string): Promise<void> {
  try {
    const url = new URL(photoURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      return;
    }

    const encodedPath = pathMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);

    const storageRef = ref(storage, decodedPath);
    await deleteObject(storageRef);
  } catch (_error) {
    // Ignore error when deleting old photo
  }
}

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

