
import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface FileSelectorProps extends React.ComponentProps<"input"> {
  onFilesChange?: (files: FileList | null) => void
}

const FileSelector = React.forwardRef<HTMLInputElement, FileSelectorProps>(
  ({ onFilesChange, className, onChange, ...props }, ref) => {
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null)
    const internalRef = React.useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    const removeFile = React.useCallback((index: number) => {
      if (!selectedFiles || index < 0 || index >= selectedFiles.length) return
      
      const dataTransfer = new DataTransfer()
      Array.from(selectedFiles).forEach((file, i) => {
        if (i !== index) dataTransfer.items.add(file)
      })
      
      const newFiles = dataTransfer.files.length > 0 ? dataTransfer.files : null
      setSelectedFiles(newFiles)
      onFilesChange?.(newFiles)
    }, [selectedFiles, onFilesChange])

    const clearAll = React.useCallback(() => {
      setSelectedFiles(null)
      if (inputRef.current) inputRef.current.value = ""
      onFilesChange?.(null)
    }, [inputRef, onFilesChange])

    const handleFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target
      onChange?.(event)
      setSelectedFiles(files)
      onFilesChange?.(files)
    }, [onChange, onFilesChange])

    const formatFileName = React.useCallback((name: string) => {
      const lastDotIndex = name.lastIndexOf(".")
      if (lastDotIndex <= 0 || lastDotIndex >= name.length - 1) {
        return { displayBase: name.length > 24 ? `${name.slice(0, 14)}...${name.slice(-4)}` : name, ext: "" }
      }
      
      const base = name.slice(0, lastDotIndex)
      const ext = name.slice(lastDotIndex)
      const displayBase = base.length > 24 ? `${base.slice(0, 24)}...${base.slice(-4)}` : base
      
      return { displayBase, ext }
    }, [])

    const filesArray = React.useMemo(() => 
      selectedFiles ? Array.from(selectedFiles) : [], 
      [selectedFiles]
    )

    if (filesArray.length === 0) {
      return (
        <Input
          {...props}
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className={cn("w-full", className)}
        />
      )
    }

    return (
      <div className="w-full flex flex-col gap-3">
        <div className="relative">
          <ul className={cn(
            "flex flex-col gap-1 max-h-40 overflow-y-auto rounded-md border border-input bg-background px-2 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}>
            {filesArray.map((file, index) => {
              const { displayBase, ext } = formatFileName(file.name)
                return (
                  <li key={`${file.name}-${index}`} className="flex items-center py-1 px-2 bg-muted/40 rounded">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="mr-2 p-1 rounded hover:bg-muted shrink-0 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} />
                    </button>
                    <span className="flex-1 flex items-center min-w-0">
                      <span className="truncate" title={file.name}>{displayBase}</span>
                      {ext && <span className="ml-1 shrink-0 text-muted-foreground">{ext}</span>}
                    </span>
                  </li>
                )
            })}
          </ul>
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/80 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    )
  }
)

FileSelector.displayName = "FileSelector"

export { FileSelector }
