/**
 * Constructs a Google Drive URL to view a file
 * @param documentId - The Google Drive document ID
 * @returns Full URL to view the document in Google Drive
 */
export function getGoogleDriveUrl(documentId: string): string {
  return `https://drive.google.com/file/d/${documentId}/view`
}
