import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';
import { ApiResponse } from '@/lib/axios';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app, 'europe-west1');

const validateAuthToken = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
};

const errorResponse = (message: string, status: number = 500): NextResponse => {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse,
    { status }
  );
};

const successResponse = (data: any): NextResponse => {
  return NextResponse.json({
    success: true,
    data
  } as ApiResponse);
};

export async function GET(request: NextRequest) {
  try {
    const token = validateAuthToken(request);
    if (!token) {
      return errorResponse('Authentication token missing', 401);
    }

    const getUserProfile = httpsCallable(functions, 'getUserProfileFunction');
    const result = await getUserProfile();

    return successResponse(result.data);
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return errorResponse('Failed to get user profile');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = validateAuthToken(request);
    if (!token) {
      return errorResponse('Authentication token missing', 401);
    }

    const body = await request.json();
    const { displayName, photoURL } = body;

    if (!displayName && !photoURL) {
      return errorResponse('No data to update', 400);
    }

    const updateUserProfile = httpsCallable(functions, 'updateUserProfileFunction');
    const result = await updateUserProfile({ displayName, photoURL });

    return successResponse(result.data);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return errorResponse('Failed to update user profile');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = validateAuthToken(request);
    if (!token) {
      return errorResponse('Authentication token missing', 401);
    }

    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccountFunction');
    const result = await deleteUserAccount();

    return successResponse(result.data);
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return errorResponse('Failed to delete user account');
  }
}
