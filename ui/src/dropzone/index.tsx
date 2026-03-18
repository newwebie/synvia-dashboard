import type { DropzoneOptions } from "react-dropzone";
import { useReducer } from "react";
import { FileUp, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "../button";
import { cn } from "../utils";
import { CsvFileIcon } from "./csv-file-icon";
import { JpgFileIcon } from "./jpg-file-icon";
import { PdfFileIcon } from "./pdf-file-icon";
import { PngFileIcon } from "./png-file-icon";

export interface DropzoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
  options?: DropzoneOptions;
}

const filetypeIconMap = {
  csv: <CsvFileIcon />,
  pdf: <PdfFileIcon />,
  jpg: <JpgFileIcon />,
  png: <PngFileIcon />,
};

const getFileTypeFromName = (filename: string) => filename.split(".").pop();

const FileIcon = ({ filetype }: { filetype?: string }) => {
  if (filetype && filetype in filetypeIconMap)
    return filetypeIconMap[filetype as keyof typeof filetypeIconMap];

  return filetypeIconMap.pdf;
};

export const Dropzone = ({ onDrop, disabled, options }: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      disabled,
      onDrop,
      maxFiles: 1,
      ...options,
    });

  const [, forceRender] = useReducer<(x: number) => number>((x) => x + 1, 0);

  const onClearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Solução meio estranho pq não encontrei uma maneira "certa" de fazer isso
    acceptedFiles.length = 0;
    forceRender();
    onDrop([]);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex h-full items-center justify-center rounded-md border-2 border-dashed border-primary bg-secondary p-6 text-center transition-all duration-200",
        !acceptedFiles.length &&
          "cursor-pointer hover:border-gray-500 hover:bg-sky-100",
        isDragActive && "border-gray-500 bg-sky-100",
      )}
    >
      <input
        {...getInputProps()}
        className="sr-only"
        id="document"
        type="file"
      />

      {acceptedFiles.length ? (
        <div className="flex items-center gap-2">
          <FileIcon
            filetype={
              acceptedFiles[0]
                ? getFileTypeFromName(acceptedFiles[0].name)
                : undefined
            }
          />

          <span>{acceptedFiles[0]?.name}</span>

          <Button
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={disabled}
            onClick={onClearFile}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          <FileUp size={16} /> Adicionar
        </div>
      )}
    </div>
  );
};
