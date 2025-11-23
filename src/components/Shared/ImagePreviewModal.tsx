// src/components/Common/ImagePreviewModal.tsx
interface ImagePreviewModalProps {
  src: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        <button
          className="absolute top-4 right-4 text-white bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-2 text-xl"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
