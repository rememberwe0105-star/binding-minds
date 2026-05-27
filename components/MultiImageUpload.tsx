'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  IconPhoto,
  IconStar,
  IconStarFilled,
  IconX,
  IconGripVertical,
  IconPlus,
  IconAlertCircle,
} from '@tabler/icons-react';
import classes from './MultiImageUpload.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadedImage {
  file: File | null;          // null for existing remote images
  previewUrl: string;         // blob URL for new uploads, remote URL for existing
  name: string;
  size: number;
  isPrimary: boolean;
  remoteUrl?: string;         // Set when image comes from backend
}

interface MultiImageUploadProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  accept?: string;            // default: 'image/png,image/jpeg,image/webp'
  maxSizeMB?: number;         // default: 5
  maxImages?: number;         // default: 10
  /** Label above the upload area */
  label?: string;
  /** Description text */
  hint?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Ensure exactly one image is marked as primary (the first one).
 * Returns a new array; does NOT mutate.
 */
function ensurePrimary(images: UploadedImage[]): UploadedImage[] {
  if (images.length === 0) return images;
  const hasPrimary = images.some((img) => img.isPrimary);
  if (hasPrimary) return images;
  return images.map((img, i) => ({ ...img, isPrimary: i === 0 }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MultiImageUpload({
  value = [],
  onChange,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 2,
  maxImages = 10,
  label,
  hint,
  disabled = false,
}: MultiImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [dropzoneDragging, setDropzoneDragging] = useState(false);
  // Drag-to-reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Track blob URLs we created so we can revoke them on unmount
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const images = ensurePrimary(value);
  const remaining = maxImages - images.length;
  const isFull = remaining <= 0;

  // ── Cleanup blob URLs on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  // ── Validation ────────────────────────────────────────────
  const validateFile = useCallback(
    (file: File): string | null => {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      if (!acceptedTypes.some((t) => file.type.match(t.replace('*', '.*')))) {
        return `File type "${file.type || 'unknown'}" is not supported.`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `"${file.name}" is too large (${formatFileSize(file.size)}). Maximum is ${maxSizeMB}MB.`;
      }
      return null;
    },
    [accept, maxSizeMB],
  );

  // ── Process incoming files ────────────────────────────────
  const processFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const slotsAvailable = maxImages - images.length;

      if (slotsAvailable <= 0) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const toAdd: UploadedImage[] = [];

      for (const file of fileArray) {
        if (toAdd.length >= slotsAvailable) {
          setError(
            `Only ${slotsAvailable} more image${slotsAvailable === 1 ? '' : 's'} allowed. Some files were skipped.`,
          );
          break;
        }

        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue; // skip invalid but keep trying others
        }

        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);

        toAdd.push({
          file,
          previewUrl,
          name: file.name,
          size: file.size,
          isPrimary: false, // ensurePrimary will handle this
        });
      }

      if (toAdd.length > 0) {
        const updated = ensurePrimary([...images, ...toAdd]);
        onChange?.(updated);
      }
    },
    [images, maxImages, onChange, validateFile],
  );

  // ── Dropzone drag handlers ────────────────────────────────
  const handleDropzoneDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDropzoneDragging(true);
    },
    [disabled],
  );

  const handleDropzoneDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropzoneDragging(false);
  }, []);

  const handleDropzoneDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropzoneDragging(false);
      if (disabled) return;

      // Only process if it's an external file drop, not a reorder
      if (e.dataTransfer.files.length > 0 && dragIndex === null) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles, dragIndex],
  );

  // ── File input handler ────────────────────────────────────
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles],
  );

  const openFilePicker = useCallback(() => {
    if (!disabled && !isFull) inputRef.current?.click();
  }, [disabled, isFull]);

  // ── Set primary ───────────────────────────────────────────
  const handleSetPrimary = useCallback(
    (index: number) => {
      const updated = images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }));
      // Move the new primary to position 0
      const primary = updated[index];
      const rest = updated.filter((_, i) => i !== index);
      onChange?.([primary, ...rest]);
    },
    [images, onChange],
  );

  // ── Remove image ──────────────────────────────────────────
  const handleRemove = useCallback(
    (index: number) => {
      const removed = images[index];
      // Revoke blob URL if we created it (i.e. it has a file)
      if (removed.file && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
        blobUrlsRef.current.delete(removed.previewUrl);
      }
      const updated = images.filter((_, i) => i !== index);
      onChange?.(ensurePrimary(updated));
    },
    [images, onChange],
  );

  // ── Drag-to-reorder handlers ──────────────────────────────
  const handleReorderDragStart = useCallback(
    (e: DragEvent, index: number) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      // Set a transparent drag image placeholder
      const ghost = document.createElement('div');
      ghost.style.width = '1px';
      ghost.style.height = '1px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      // Clean up ghost after a tick
      requestAnimationFrame(() => ghost.remove());
    },
    [],
  );

  const handleReorderDragOver = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIndex === null || dragIndex === index) return;
      setDragOverIndex(index);
    },
    [dragIndex],
  );

  const handleReorderDrop = useCallback(
    (e: DragEvent, dropIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIndex === null || dragIndex === dropIdx) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }

      const updated = [...images];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIdx, 0, moved);

      // Update isPrimary so position 0 is primary
      const withPrimary = updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }));

      onChange?.(withPrimary);
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, images, onChange],
  );

  const handleReorderDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  // ── Format badges for empty state ─────────────────────────
  const formats = accept
    .split(',')
    .map((t) => t.split('/')[1]?.toUpperCase() || t);

  const containerClasses = [
    classes.container,
    disabled ? classes.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  return (
    <div className={containerClasses}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className={classes.fileInput}
        disabled={disabled}
        multiple
      />

      {/* Label & hint */}
      {label && <p className={classes.label}>{label}</p>}
      {hint && <p className={classes.hint}>{hint}</p>}

      {images.length === 0 ? (
        /* ── Empty State: full-size dropzone ── */
        <div
          className={`${classes.emptyDropzone} ${
            dropzoneDragging ? classes.emptyDropzoneDragging : ''
          }`}
          onClick={openFilePicker}
          onDragOver={handleDropzoneDragOver}
          onDragLeave={handleDropzoneDragLeave}
          onDrop={handleDropzoneDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openFilePicker();
          }}
        >
          <div className={classes.emptyContent}>
            <div className={classes.emptyIcon}>
              <IconPhoto size={28} color="var(--bm-sage-dark)" />
            </div>
            <p className={classes.emptyTitle}>Upload Images</p>
            <p className={classes.emptyHint}>
              Drag &amp; drop or{' '}
              <span className={classes.browseLink}>browse</span>
              <br />
              Up to {maxImages} images · Max {maxSizeMB}MB each
            </p>
            <div className={classes.formatBadges}>
              {formats.map((f) => (
                <span key={f} className={classes.formatBadge}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Grid: thumbnails + "Add More" cell ── */
        <>
          <div className={classes.grid}>
            {images.map((img, index) => {
              const isPrimary = img.isPrimary;
              const isDragged = dragIndex === index;
              const isDraggedOver =
                dragOverIndex === index && dragIndex !== index;

              const cardClasses = [
                classes.imageCard,
                isPrimary ? classes.primaryCard : '',
                isDragged ? classes.dragging : '',
                isDraggedOver ? classes.dragOver : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div
                  key={`${img.name}-${index}`}
                  className={cardClasses}
                  draggable
                  onDragStart={(e) => handleReorderDragStart(e, index)}
                  onDragOver={(e) => handleReorderDragOver(e, index)}
                  onDrop={(e) => handleReorderDrop(e, index)}
                  onDragEnd={handleReorderDragEnd}
                >
                  {/* Primary badge */}
                  {isPrimary && (
                    <div className={classes.primaryBadge}>
                      <IconStarFilled size={12} />
                      Primary
                    </div>
                  )}

                  {/* Drag handle */}
                  <div className={classes.dragHandle}>
                    <IconGripVertical size={14} />
                  </div>

                  {/* Image preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className={classes.imagePreview}
                    draggable={false}
                  />

                  {/* Hover overlay with actions */}
                  <div className={classes.overlay}>
                    <div className={classes.overlayActions}>
                      {!isPrimary && (
                        <button
                          type="button"
                          className={`${classes.overlayBtn} ${classes.setPrimaryBtn}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(index);
                          }}
                          aria-label="Set as primary image"
                        >
                          <IconStar size={13} />
                          Primary
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${classes.overlayBtn} ${classes.removeBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        aria-label={`Remove ${img.name}`}
                      >
                        <IconX size={13} />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Index badge */}
                  <div className={classes.indexBadge}>{index + 1}</div>
                </div>
              );
            })}

            {/* "Add More" cell — shown only if under the limit */}
            {!isFull && (
              <div
                className={`${classes.addMore} ${
                  dropzoneDragging ? classes.addMoreDragging : ''
                }`}
                onClick={openFilePicker}
                onDragOver={handleDropzoneDragOver}
                onDragLeave={handleDropzoneDragLeave}
                onDrop={handleDropzoneDrop}
                role="button"
                tabIndex={0}
                aria-label="Add more images"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openFilePicker();
                }}
              >
                <div className={classes.addMoreIcon}>
                  <IconPlus size={18} />
                </div>
                <span className={classes.addMoreLabel}>Add More</span>
                <span className={classes.addMoreCount}>
                  {remaining} more image{remaining === 1 ? '' : 's'} allowed
                </span>
              </div>
            )}
          </div>

          {/* Counter */}
          <p
            className={`${classes.counter} ${
              isFull ? classes.counterFull : ''
            }`}
          >
            {images.length} / {maxImages} images
            {isFull && ' (limit reached)'}
          </p>
        </>
      )}

      {/* Error message */}
      {error && (
        <div className={classes.errorMessage}>
          <IconAlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
