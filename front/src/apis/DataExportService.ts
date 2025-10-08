import api from './api';

/**
 * Export all user data in JSON format (GDPR Article 20 - Right to data portability)
 */
export const exportUserData = async (): Promise<void> => {
  try {
    const response = await api.get('/account/data/export', {
      responseType: 'blob', // Important for file download
    });

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'rhapsody_data_export.json';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create a blob from the response
    const blob = new Blob([response.data], { type: 'application/json' });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

/**
 * Get a summary of all user data (GDPR Article 15 - Right of access)
 */
export const getUserDataSummary = async (): Promise<any> => {
  try {
    const response = await api.get('/account/data/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data summary:', error);
    throw error;
  }
};