import path from 'path';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/x-png',
]);

const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream']);

const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function isAcceptedImage(mimetype: string, filename: string): boolean {
  if (ACCEPTED_MIME_TYPES.has(mimetype)) return true;
  if (GENERIC_MIME_TYPES.has(mimetype) && EXTENSION_TO_MIME[getExtension(filename)]) {
    return true;
  }
  return false;
}

export function inferImageContentType(mimetype: string, filename: string): string {
  if (mimetype && !GENERIC_MIME_TYPES.has(mimetype)) {
    return mimetype;
  }
  return EXTENSION_TO_MIME[getExtension(filename)] || 'application/octet-stream';
}
