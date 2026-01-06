'use client';

import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import app from './firebase';

const functions: Functions = getFunctions(app);

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { functions };

