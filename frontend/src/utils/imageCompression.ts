import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch {
    // Fallback: return original file if compression fails
    return file;
  }
}