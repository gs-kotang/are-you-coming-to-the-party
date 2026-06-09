import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import './PhotoUpload.css';

const ACCEPT = 'image/jpeg,image/png,image/webp';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/x-png',
]);

const GENERIC_MIME_TYPES = new Set(['', 'application/octet-stream']);

const ACCEPTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const REJECTED_FILE_MESSAGE = 'Please use a PNG, JPG, or WebP image.';

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return '';
  return filename.slice(dot).toLowerCase();
}

function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.has(file.type)) return true;
  if (GENERIC_MIME_TYPES.has(file.type) && ACCEPTED_EXTENSIONS.has(getExtension(file.name))) {
    return true;
  }
  return false;
}

interface PhotoUploadProps {
  onChange: (file: File | null) => void;
  previewUrl: string | null;
}

export function PhotoUpload({ onChange, previewUrl }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedImage(file)) {
      setError(REJECTED_FILE_MESSAGE);
      resetInput();
      return;
    }
    setError(null);
    setFileName(file.name);
    onChange(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const openPicker = () => {
    setError(null);
    if (inputRef.current) {
      // Reset so selecting the same file again still fires onChange
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleRemove = () => {
    setFileName(null);
    setError(null);
    onChange(null);
    resetInput();
  };

  return (
    <div className="photo-upload">
      <input
        ref={inputRef}
        className="photo-upload-input"
        type="file"
        accept={ACCEPT}
        onChange={handleInputChange}
      />

      {previewUrl ? (
        <>
          <div className="photo-upload-preview">
            <div className="invite-full-frame">
              <img src={previewUrl} alt="Invite preview" className="invite-full-image" />
            </div>
            <div className="photo-upload-preview-overlay">
              {fileName && <p className="photo-upload-filename">{fileName}</p>}
              <div className="photo-upload-actions">
                <button type="button" className="photo-upload-change" onClick={openPicker}>
                  Change photo
                </button>
                <button type="button" className="photo-upload-remove" onClick={handleRemove}>
                  Remove
                </button>
              </div>
            </div>
          </div>
          {fileName && (
            <div className="photo-upload-preview-bar">
              <span>{fileName}</span>
              <button type="button" onClick={openPicker}>
                Change
              </button>
            </div>
          )}
        </>
      ) : (
        <div
          className={`photo-upload-dropzone ${dragging ? 'dragging' : ''}`}
          onClick={openPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
        >
          <div className="photo-upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="photo-upload-title">Drop your invite here</p>
          <p className="photo-upload-hint">PNG, JPG or WebP · up to 10 MB</p>
          <button
            type="button"
            className="photo-upload-browse"
            onClick={(event) => {
              event.stopPropagation();
              openPicker();
            }}
          >
            Choose photo
          </button>
        </div>
      )}

      {error && (
        <p className="photo-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
