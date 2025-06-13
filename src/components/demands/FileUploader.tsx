
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Camera, X, FileImage, FilePlus } from "lucide-react";
import { DocumentAttachment } from "@/context/DemandContext";
import { isAllowedFileType, formatFileSize, fileToBase64 } from "@/lib/file-utils";
import { toast } from "sonner";

interface FileUploaderProps {
  onFilesSelected: (files: DocumentAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

const FileUploader = ({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: FileUploaderProps) => {
  const [files, setFiles] = useState<DocumentAttachment[]>([]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    // Check if adding more files would exceed the limit
    if (files.length + event.target.files.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }
    
    const newFiles: DocumentAttachment[] = [];
    const filesList = Array.from(event.target.files);
    
    for (const file of filesList) {
      // Check file type
      if (!isAllowedFileType(file)) {
        toast.error(`${file.name} is not an allowed file type. Please upload PDF, JPG, or PNG files.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`${file.name} exceeds the maximum file size of ${formatFileSize(maxFileSize)}`);
        continue;
      }
      
      try {
        const base64Data = await fileToBase64(file);
        
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
    
    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
    
    // Clear the file input
    event.target.value = '';
  };
  
  const handleCameraCapture = async () => {
    // This function won't work in a web environment, but demonstrates the concept
    // In a real mobile app using Capacitor or similar, we would use the camera plugin
    toast.info("Camera functionality requires mobile integration");
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Input
            id="file-upload"
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <Button type="button" variant="outline" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleCameraCapture}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Attached Files ({files.length}/{maxFiles})</p>
          <div className="grid gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-muted/40 p-2 rounded-md"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.type.includes('image') ? (
                    <Image className="h-4 w-4" />
                  ) : (
                    <FilePlus className="h-4 w-4" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
