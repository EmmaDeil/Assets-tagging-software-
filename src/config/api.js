/**
 * API Configuration
 * 
 * Centralized API URL management for the application.
 * Automatically uses the correct API URL based on environment.
 * 
 * Development: http://localhost:5000/api (via Vite proxy)
 * Production: Uses VITE_API_URL from environment variables
 */

// Get API URL from environment or default to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Export for easier imports
export default API_BASE_URL;
