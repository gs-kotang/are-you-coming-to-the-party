import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createInvite, getShareUrl } from '../api/client';
import { PhotoUpload } from './PhotoUpload';
import { DateTimePicker, defaultEventAt, defaultExpiry } from './DateTimePicker';

export function CreateInvite() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [eventAt, setEventAt] = useState(defaultEventAt());
  const [expiresAt, setExpiresAt] = useState(defaultExpiry());
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhoto(null);
      setPreviewUrl(null);
      setShareUrl(null);
      return;
    }

    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShareUrl(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!photo) {
      setError('Please upload a photo.');
      return;
    }

    const eventDate = new Date(eventAt);
    const expiryDate = new Date(expiresAt);
    if (eventDate.getTime() <= expiryDate.getTime()) {
      setError('Event time must be after the RSVP deadline.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createInvite(
        photo,
        new Date(expiresAt).toISOString(),
        new Date(eventAt).toISOString()
      );
      setShareUrl(getShareUrl(result.shareUrl));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Link to="/" className="back-button">
        ← Back
      </Link>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Create new invite</h2>
        <p style={{ color: '#65676b' }}>
          Upload your invite image, set when the party is, and choose when RSVPs should close.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Invite photo</label>
            <PhotoUpload previewUrl={previewUrl} onChange={handlePhotoChange} />
          </div>

          <div className="form-group">
            <label>Event time</label>
            <DateTimePicker
              value={eventAt}
              onChange={setEventAt}
              idPrefix="event-time"
              displayLabel="Event time"
              relativeMode="event"
            />
          </div>

          <div className="form-group">
            <label>RSVP deadline</label>
            <DateTimePicker value={expiresAt} onChange={setExpiresAt} />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating...' : 'Generate share link'}
          </button>
        </form>

        {shareUrl && (
          <div style={{ marginTop: '1.5rem' }}>
            <strong>Share this link:</strong>
            <div className="share-box">
              <input readOnly value={shareUrl} />
              <button type="button" className="copy-button" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
