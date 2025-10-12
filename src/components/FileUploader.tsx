// File: components/FileUploader.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

type FileUploaderProps = {
  fieldChange: (url: string | null, file?: File) => void;
  mediaUrl: string | null;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  // Manage preview URL and cleanup
  useEffect(() => {
    let objectUrl: string | undefined;
    if (file) {
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else if (mediaUrl) {
      setPreviewUrl(mediaUrl);
    } else {
      setPreviewUrl("");
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, mediaUrl]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles.length === 0) return;
      const chosen = acceptedFiles[0];
      setFile(chosen);
      fieldChange(null, chosen); // signal parent to start upload
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
      "video/*": [".mp4"],
    },
    multiple: false,
    noClick: true,        // prevent root from auto-opening the file dialog
    noKeyboard: true,     // optional: prevent Enter/Space from triggering open
    onDragEnter: () => console.log("Drag entered"),
    onDragOver: () => console.log("Drag over"),
    onDragLeave: () => console.log("Drag leave"),
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer relative"
      >
        <input {...getInputProps()} className="hidden" />

        {previewUrl ? (
          <>
            <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
              {file && file.type.startsWith("video/") ? (
                <video
                  controls
                  src={previewUrl}
                  className="h-80 lg:h-[480px] w-full rounded-[24px] object-cover object-top"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-80 lg:h-[480px] w-full rounded-[24px] object-cover object-top"
                />
              )}
            </div>
            <p className="file_uploader-label">Click or drag photo to replace</p>
            <div className="p-5">
              <Button
                type="button"
                className="h-12 bg-dark-4 px-5 text-light-1 flex gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  open();
                }}
              >
                Select from device
              </Button>
            </div>
          </>
        ) : (
          <div className="file-uploader-box p-5 flex flex-col items-center">
            <Image
              src="/file-upload.svg"
              alt="file-upload"
              width={96}
              height={77}
              className="max-sm: size-40"
            />
            <h3 className="base-medium text-light-2 mb-2 mt-6">
              Drag photo/video here
            </h3>
            <p className="text-light-4 text-small-regular mb-6">
              PNG, JPG, SVG, MP4 ...
            </p>
            <Button
              type="button"
              className="h-12 bg-dark-4 px-5 text-light-1 flex gap-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                open();
              }}
            >
              Select from device
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;