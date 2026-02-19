/**
 * Utility functions for the application
 */

/**
 * Converts a Google Drive view link to a direct image link
 * Format: https://drive.google.com/file/d/<id>/view -> https://lh3.googleusercontent.com/d/<id>
 * @param {string} url - The Google Drive URL
 * @returns {string} - The direct image URL if valid, otherwise the original URL
 */
export const formatGoogleDriveLink = (url) => {
  if (!url || typeof url !== "string") return url;

  // Pattern to match Google Drive file ID
  // Matches:
  // - https://drive.google.com/file/d/ID/view
  // - https://drive.google.com/open?id=ID
  // - https://drive.google.com/uc?id=ID
  const drivePattern =
    /(?:https?:\/\/)?(?:drive\.google\.com)\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/;

  const match = url.match(drivePattern);
  if (match && match[1]) {
    // If it's already in the target format, don't change it
    if (url.includes("lh3.googleusercontent.com/d/")) return url;

    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }

  return url;
};
