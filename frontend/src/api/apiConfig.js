// This line reads the environment variable we set in Vercel.
// If it's not found (like in your local development), it defaults to localhost:8000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';