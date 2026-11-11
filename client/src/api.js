// API Helper for Temple Treasury App
const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('temple_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('temple_auth_token', token);
  } else {
    localStorage.removeItem('temple_auth_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// Format Currency in Indian Rupee standard format (e.g., ₹ 1,50,000)
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

// Format Date
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format file size nicely
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(1)} MB`;
}

/**
 * High-performance client-side image compression
 * Automatically resizes large mobile camera images (often 5-15MB)
 * down to crisp ~100KB-250KB JPEG while keeping text 100% readable.
 */
export async function compressImage(file, maxWidth = 1600, maxHeight = 1600, quality = 0.75) {
  // Pass PDFs through untouched
  if (!file || file.type === 'application/pdf') {
    return { compressedFile: file, originalSize: file?.size || 0, compressedSize: file?.size || 0, isCompressed: false };
  }

  const originalSize = file.size;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;

        // Cap maximum dimension to 1600px maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean white background for any PNG transparency
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ compressedFile: file, originalSize, compressedSize: file.size, isCompressed: false });
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            resolve({
              compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
              isCompressed: compressedFile.size < originalSize
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve({ compressedFile: file, originalSize, compressedSize: file.size, isCompressed: false });
    };
    reader.onerror = () => resolve({ compressedFile: file, originalSize, compressedSize: file.size, isCompressed: false });
  });
}
