
import { ApiProvider } from './types';
import { supabaseProvider } from './supabaseProvider';

// Default provider is Supabase
let currentProvider: ApiProvider = supabaseProvider;

// Function to switch providers (will be used when we add Firebase)
export function setApiProvider(provider: ApiProvider) {
  currentProvider = provider;
}

// Export the current provider as the default API
export const api = currentProvider;

// Re-export types for convenience
export * from './types';
