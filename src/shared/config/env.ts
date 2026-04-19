const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  API_TIMEOUT: 30000,
}

export default env
