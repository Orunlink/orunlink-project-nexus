
import { ApiProvider } from './types';
import { supabaseProvider } from './supabaseProvider';

// Use Supabase provider as the main API
export const api: ApiProvider = supabaseProvider;

// Re-export types for convenience
export * from './types';
