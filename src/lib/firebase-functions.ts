'use client';

import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import app from './firebase';

// Use europe-west1 region for all functions
const FUNCTIONS_REGION = 'europe-west1';
const functions: Functions = getFunctions(app, FUNCTIONS_REGION);

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { functions };

