import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6861157c51f00f0b4cfc0f16", 
  requiresAuth: true // Ensure authentication is required for all operations
});
