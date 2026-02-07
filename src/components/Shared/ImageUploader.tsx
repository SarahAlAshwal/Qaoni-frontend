interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
}

export default function ImageUploader({ onUpload, label, multiple = true }: ImageUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onUpload(files);
  };

  return (
    <label className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
      {label || "Upload Images"}
      <input
        type="file"
        accept="image/*"
        multiple= {multiple}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
