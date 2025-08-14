// Utility function to get full image URL
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get base URL from environment or default to localhost:5000
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  let serverBaseUrl;
  
  if (apiBaseUrl) {
    // Remove /api from baseUrl if present
    serverBaseUrl = apiBaseUrl.replace('/api', '');
  } else {
    // Default to localhost:5000
    serverBaseUrl = 'http://localhost:5000';
  }
  
  // If imagePath starts with /, use it directly
  if (imagePath.startsWith('/')) {
    return `${serverBaseUrl}${imagePath}`;
  }
  
  // Otherwise, add /uploads/ prefix
  return `${serverBaseUrl}/uploads/${imagePath}`;
}
