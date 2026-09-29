import { useEffect, useRef, useState, type DragEvent } from 'react';
import { fileUrl } from '../api/client';
import { Button, Modal } from './ui';
import { Icon } from './icons';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

/** Ambil foto dari kamera (webcam) atau pilih file, lengkap dengan preview */
export function PhotoUpload({ value, onChange, error }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  const pickFile = (file?: File) => {
    setLocalError('');
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return setLocalError('Foto harus berformat JPG, PNG, atau WEBP');
    if (file.size > MAX_SIZE) return setLocalError('Ukuran foto maksimal 5 MB');
    onChange(file);
  };

  const openCamera = async () => {
    setLocalError('');
    try {
      setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }));
    } catch {
      setLocalError('Kamera tidak dapat diakses. Silakan pilih file foto.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onChange(new File([blob], `wfh-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        setStream(null);
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (stream) return;
    pickFile(e.dataTransfer.files?.[0]);
  };

  const shownError = localError || error;
  return (
    <div className="photo-upload">
      <div
        className={`photo-frame ${shownError ? 'invalid' : ''} ${dragOver ? 'photo-frame-drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!stream) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted />
        ) : preview ? (
          <img src={preview} alt="Preview foto bukti WFH" />
        ) : (
          <div className="photo-placeholder">
            <span className="empty-state-icon" aria-hidden>
              <Icon name="camera" size={24} />
            </span>
            <p>Belum ada foto</p>
            <small className="muted">Seret & lepas, atau pilih dari tombol di bawah</small>
          </div>
        )}
      </div>
      <div className="photo-actions">
        {stream ? (
          <>
            <Button icon="camera" onClick={capture}>
              Ambil Foto
            </Button>
            <Button variant="secondary" onClick={() => setStream(null)}>
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" icon="camera" onClick={openCamera}>
              Buka Kamera
            </Button>
            <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>
              Pilih File
            </Button>
            {value && (
              <Button variant="ghost" icon="trash" onClick={() => onChange(null)}>
                Hapus
              </Button>
            )}
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT.join(',')}
        hidden
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {shownError && <small className="field-error">{shownError}</small>}
    </div>
  );
}

/** Thumbnail foto yang bisa diklik untuk memperbesar */
export function PhotoThumb({ path, title }: { path: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="thumb" onClick={() => setOpen(true)} title="Lihat foto">
        <img src={fileUrl(path)} alt={title} loading="lazy" />
      </button>
      <Modal open={open} title={title} onClose={() => setOpen(false)} wide>
        <img className="photo-full" src={fileUrl(path)} alt={title} />
      </Modal>
    </>
  );
}
