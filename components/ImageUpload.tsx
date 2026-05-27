'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import {
  IconUpload, IconPhoto, IconX, IconCamera,
  IconFileText, IconAlertCircle,
} from '@tabler/icons-react';
import classes from './ImageUpload.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UploadVariant = 'default' | 'avatar' | 'banner' | 'compact' | 'document';

export interface UploadedFile {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

interface ImageUploadProps {
  /** Visual variant */
  variant?: UploadVariant;
  /** Current uploaded file (controlled) */
  value?: UploadedFile | null;
  /** Callback when file is selected */
  onChange?: (file: UploadedFile | null) => void;
  /** Accepted file types */
  accept?: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Label shown above the dropzone */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Description hint */
  hint?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
}

interface DocumentUploadProps {
  /** Current uploaded files (controlled) */
  value?: UploadedFile[];
  /** Callback when files change */
  onChange?: (files: UploadedFile[]) => void;
  /** Accepted file types */
  accept?: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Label */
  label?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toUpperCase() || '';
}

// ---------------------------------------------------------------------------
// ImageUpload Component
// ---------------------------------------------------------------------------

export function ImageUpload({
  variant = 'default',
  value,
  onChange,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 5,
  placeholder,
  hint,
  disabled = false,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const variantClass = {
    default: '',
    avatar: classes.avatarDropzone,
    banner: classes.bannerDropzone,
    compact: classes.compactDropzone,
    document: classes.documentDropzone,
  }[variant];

  const validateFile = useCallback((file: File): string | null => {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.some(t => file.type.match(t.replace('*', '.*')))) {
      return `File type "${file.type}" is not supported.`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSizeMB}MB.`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const processFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Revoke previous preview URL to avoid memory leaks
    if (value?.previewUrl) {
      URL.revokeObjectURL(value.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    onChange?.({
      file,
      previewUrl,
      name: file.name,
      size: file.size,
    });
  }, [onChange, validateFile, value?.previewUrl]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, processFile]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (value?.previewUrl) {
      URL.revokeObjectURL(value.previewUrl);
    }
    onChange?.(null);
    setError(null);
  }, [onChange, value?.previewUrl]);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const defaultPlaceholder = variant === 'avatar'
    ? 'Upload'
    : variant === 'banner'
      ? 'Drop your banner image here'
      : 'Drop your image here';

  const defaultHint = `${accept.split(',').map(t => t.split('/')[1]?.toUpperCase()).join(', ')} · Max ${maxSizeMB}MB`;

  const formats = accept.split(',').map(t => t.split('/')[1]?.toUpperCase() || t);

  return (
    <div>
      <div
        className={`${classes.dropzone} ${variantClass} ${dragging ? classes.dropzoneDragging : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={classes.fileInput}
          disabled={disabled}
        />

        {value ? (
          /* ── Preview State ── */
          <div className={classes.previewContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.previewUrl}
              alt={value.name}
              className={classes.previewImage}
            />
            <div className={classes.previewOverlay}>
              <div className={classes.previewInfo}>
                <span className={classes.previewFilename}>{value.name}</span>
                <span className={classes.previewSize}>{formatFileSize(value.size)}</span>
              </div>
              <div className={classes.previewActions}>
                <button
                  className={`${classes.previewBtn} ${classes.changeBtn}`}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <IconCamera size={14} /> Change
                </button>
                <button
                  className={`${classes.previewBtn} ${classes.removeBtn}`}
                  onClick={handleRemove}
                >
                  <IconX size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Empty State ── */
          <div className={classes.uploadContent}>
            <div className={classes.uploadIcon}>
              {variant === 'avatar' ? (
                <IconCamera size={20} className={classes.uploadPulse} />
              ) : (
                <IconPhoto size={24} className={classes.uploadPulse} />
              )}
            </div>
            <p className={classes.uploadTitle}>
              {placeholder || defaultPlaceholder}
            </p>
            <p className={classes.uploadHint}>
              {hint || (
                <>
                  Drag & drop or <span className={classes.browseLink}>browse</span>
                  <br />
                  {defaultHint}
                </>
              )}
            </p>
            <div className={classes.formatBadges}>
              {formats.map(f => (
                <span key={f} className={classes.formatBadge}>{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className={classes.errorMessage}>
          <IconAlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocumentUpload Component
// ---------------------------------------------------------------------------

export function DocumentUpload({
  value = [],
  onChange,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  maxFiles = 5,
  label,
}: DocumentUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB.`;
    }
    if (value.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed.`;
    }
    return null;
  }, [maxSizeMB, maxFiles, value.length]);

  const processFiles = useCallback((files: FileList) => {
    setError(null);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      newFiles.push({
        file,
        previewUrl: '',
        name: file.name,
        size: file.size,
      });
    }

    onChange?.([...value, ...newFiles]);
  }, [onChange, validateFile, value]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  }, [onChange, value]);

  const formats = accept.split(',').map(f => f.replace('.', '').toUpperCase());

  return (
    <div>
      {label && (
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bm-text-dark)', marginBottom: '8px' }}>
          {label}
        </p>
      )}

      <div
        className={`${classes.dropzone} ${classes.documentDropzone} ${dragging ? classes.dropzoneDragging : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload document"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => { if (e.target.files) processFiles(e.target.files); if (inputRef.current) inputRef.current.value = ''; }}
          className={classes.fileInput}
          multiple
        />
        <div className={classes.uploadContent} style={{ minHeight: '100px', padding: '20px 16px' }}>
          <div className={classes.uploadIcon}>
            <IconUpload size={20} className={classes.uploadPulse} />
          </div>
          <p className={classes.uploadTitle}>Upload Documents</p>
          <p className={classes.uploadHint}>
            Drag & drop or <span className={classes.browseLink}>browse</span>
            <br />
            {formats.join(', ')} · Max {maxSizeMB}MB · Up to {maxFiles} files
          </p>
          <div className={classes.formatBadges}>
            {formats.map(f => (
              <span key={f} className={classes.formatBadge}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className={classes.fileList}>
          {value.map((f, i) => (
            <div key={`${f.name}-${i}`} className={classes.fileItem}>
              <div className={classes.fileIcon}>
                <IconFileText size={18} color="#4b6bfb" />
              </div>
              <div className={classes.fileDetails}>
                <div className={classes.fileName}>{f.name}</div>
                <div className={classes.fileMeta}>
                  {getFileExtension(f.name)} · {formatFileSize(f.size)}
                </div>
              </div>
              <button
                className={classes.fileRemove}
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(i); }}
                aria-label={`Remove ${f.name}`}
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={classes.errorMessage}>
          <IconAlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
