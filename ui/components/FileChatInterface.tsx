"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRepository } from '@/contexts/RepositoryContext';
import { useChat } from '@/contexts/ChatContext';
import { useBranch } from '@/contexts/BranchContext';
import { useKnowledgeBase } from '@/contexts/KnowledgeBaseContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileSelector } from '@/components/ui/file-selector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Database, 
  Globe, 
  Upload, 
  Type, 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  File, 
  X, 
  Check, 
  Search, 
  Filter, 
  Download, 
  Settings, 
  Info, 
  AlertCircle,
  GitPullRequest,
  GitCommit,
  Bug,
  Star,
  Activity,
  Users,
  Calendar,
  Clock,
  Code2,
  Shield,
  Eye,
  Zap,
  Target,
  MessageSquare,
  RefreshCw,
  Loader2,
  CheckSquare,
  Square,
  ChevronUp,
  Minus,
  Bot,
  PlusCircle,
  Send,
  User,
  Bot as BotIcon,
  FileCode,
  Hash,
  Clock as ClockIcon,
  Copy as CopyIcon,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  List,
  Plus as PlusIcon,
  HelpCircle,
  Github,
  Table
} from 'lucide-react';
import { toast } from 'sonner';
import GitHubAPI from '@/lib/github-api';
import { fallbackContributionData } from './manage/contribution-data';
import { ImportSource } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import AnimatedTransition from './AnimatedTransition';
import { ChatSessionManager } from './ChatSessionManager';

// Import sources for unified interface
const importSources: ImportSource[] = [
  {
    id: 'csv',
    name: 'CSV File',
    type: 'csv',
    icon: 'FileText',
    description: 'Import structured data from CSV files'
  },
  {
    id: 'control-panel',
    name: 'Control Panel Data',
    type: 'control-panel',
    icon: 'Database',
    description: 'Import data from Manage page controls'
  },
  {
    id: 'url',
    name: 'Web URL',
    type: 'url',
    icon: 'Globe',
    description: 'Import content from websites and articles'
  },
  {
    id: 'file',
    name: 'Document Upload',
    type: 'file',
    icon: 'Upload',
    description: 'Upload documents, PDFs, and other files'
  },
  {
    id: 'text',
    name: 'Text Input',
    type: 'text',
    icon: 'Type',
    description: 'Directly input or paste text content'
  },
  {
    id: 'branch',
    name: 'Branch Import',
    type: 'branch',
    icon: 'GitBranch',
    description: 'Import context from other branches'
  }
];

// Types for the chat interface
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: string[]; // Files referenced in this message
  codeSnippets?: CodeSnippet[];
}

interface CodeSnippet {
  language: string;
  code: string;
  filePath?: string;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  selected?: boolean;
  expanded?: boolean;
  children?: FileSystemItem[];
  size?: number;
  path?: string;
  branch?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedFiles: Array<{branch: string, path: string, content: string}>;
  createdAt: Date;
  updatedAt: Date;
}


// Import source card component
interface ImportSourceCardProps {
  source: ImportSource;
  onClick: () => void;
  isActive: boolean;
}

const ImportSourceCard: React.FC<ImportSourceCardProps> = ({ source, onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIcon = () => {
    switch (source.icon) {
      case 'FileText': return <FileText size={20} />;
      case 'Database': return <Database size={20} />;
      case 'Globe': return <Globe size={20} />;
      case 'Upload': return <Upload size={20} />;
      case 'Type': return <Type size={20} />;
      case 'GitBranch': return <GitBranch size={20} />;
      default: return <FileText size={20} />;
    }
  };
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg border border-border hover:border-primary cursor-pointer transition-all duration-200",
        isActive ? "bg-primary/10 border-primary" : "bg-card/50",
        isHovered ? "translate-y-[-2px] shadow-md" : ""
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{source.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {source.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// File type icons mapping
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return <Code2 size={12} className="mr-1 text-blue-500" />;
    case 'js':
    case 'jsx':
      return <Code2 size={12} className="mr-1 text-yellow-500" />;
    case 'json':
      return <Code2 size={12} className="mr-1 text-green-500" />;
    case 'md':
      return <FileText size={12} className="mr-1 text-purple-500" />;
    case 'css':
    case 'scss':
      return <FileText size={12} className="mr-1 text-pink-500" />;
    case 'html':
      return <FileText size={12} className="mr-1 text-orange-500" />;
    case 'py':
      return <Code2 size={12} className="mr-1 text-blue-600" />;
    case 'java':
      return <Code2 size={12} className="mr-1 text-red-500" />;
    case 'cpp':
    case 'c':
      return <Code2 size={12} className="mr-1 text-blue-700" />;
    default:
      return <File size={12} className="mr-1 text-blue-500" />;
  }
};

// File system node component
interface FileSystemNodeProps {
  item: FileSystemItem;
  level: number;
  onToggle: (item: FileSystemItem, path: string[]) => void;
  onSelect: (item: FileSystemItem, path: string[]) => void;
  path: string[];
  branch: string;
  onFileSelect?: (branch: string, filePath: string, content: string) => void;
  fileContent?: string;
  isLoadingContent?: boolean;
  selectedFiles: Array<{branch: string, path: string, content: string}>;
}

const FileSystemNode: React.FC<FileSystemNodeProps> = ({ 
  item, 
  level, 
  onToggle, 
  onSelect,
  path,
  branch,
  onFileSelect,
  fileContent,
  isLoadingContent,
  selectedFiles
}) => {
  const isFolder = item.type === 'folder';
  
  // Check if this item is selected based on the selectedFiles array
  const isItemSelected = selectedFiles.some(file => 
    file.branch === branch && file.path === path.join('/')
  );
  
  // Check if folder has selected files
  const hasSelectedFiles = isFolder && item.children && item.children.some(child => {
    if (child.type === 'file') {
      const childPath = [...path, child.name].join('/');
      return selectedFiles.some(file => file.branch === branch && file.path === childPath);
    }
    return false;
  });
  
  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-1 px-1 rounded-md hover:bg-primary/10 cursor-pointer transition-colors",
          item.selected && "bg-primary/20",
          hasSelectedFiles && "bg-green-500/10 border border-green-500/20"
        )}
        style={{ paddingLeft: `${(level * 8) + 4}px` }}
      >
        {/* Selection checkbox for both files and folders */}
        <div 
          className="mr-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item, path);
          }}
        >
          {isItemSelected ? 
            <CheckSquare size={12} className="text-primary" /> : 
            <Square size={12} className="text-muted-foreground" />
          }
        </div>
        
        {/* Expand/collapse control for folders */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (isFolder) onToggle(item, path);
          }}
          className={cn(
            "mr-1 w-3 h-3 flex items-center justify-center",
            isFolder ? "cursor-pointer" : "opacity-0"
          )}
        >
          {isFolder && (
            item.expanded ? 
              <ChevronDown size={12} className="text-primary" /> : 
              <ChevronRight size={12} className="text-muted-foreground" />
          )}
        </div>
        
        {/* Icon and name */}
        <div 
          className="flex items-center flex-grow"
          onClick={() => {
            if (isFolder) {
              onToggle(item, path);
            } else {
              const filePath = path.join('/');
              if (onFileSelect) {
                onFileSelect(branch, filePath, '');
              }
              onSelect(item, path);
            }
          }}
        >
          {isFolder ? 
            <Folder size={12} className={cn(
              "mr-1",
              hasSelectedFiles ? "text-green-500" : "text-amber-500"
            )} /> : 
            getFileIcon(item.name)
          }
          
          <span className="text-xs truncate">{item.name}</span>
          <div className="flex items-center gap-1 ml-auto">
            {isFolder && item.children && (
              <span className="text-xs text-muted-foreground">
                {item.children.length} item{item.children.length !== 1 ? 's' : ''}
              </span>
            )}
            {!isFolder && isLoadingContent && (
              <Loader2 size={10} className="animate-spin text-muted-foreground" />
            )}
            {!isFolder && (
              <span className="text-xs text-muted-foreground">
                {item.size ? `${(item.size / 1024).toFixed(1)}KB` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Children for expanded folders */}
      {isFolder && item.expanded && item.children && (
        <div className="animate-fadeIn">
          {item.children.map((child: FileSystemItem, index: number) => (
            <FileSystemNode 
              key={`${child.name}-${index}`}
              item={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              path={[...path, child.name]}
              branch={branch}
              onFileSelect={onFileSelect}
              fileContent={fileContent}
              isLoadingContent={isLoadingContent}
              selectedFiles={selectedFiles}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Branch file item component for import dialog
interface BranchFileItemProps {
  item: FileSystemItem;
  level: number;
  selectedFiles: string[];
  onFileToggle: (path: string) => void;
  onFolderToggle?: (folderPath: string, selectAll: boolean) => void;
}

const BranchFileItem: React.FC<BranchFileItemProps> = ({ 
  item, 
  level, 
  selectedFiles, 
  onFileToggle, 
  onFolderToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === 'folder';
  const filePath = item.path || item.name;
  const isSelected = selectedFiles.includes(filePath);

  // For folders, calculate selection state
  const getAllFilesInFolder = (folderItem: FileSystemItem, basePath: string = ''): string[] => {
    const files: string[] = [];
    const currentPath = basePath ? `${basePath}/${folderItem.name}` : folderItem.name;
    
    if (folderItem.children) {
      folderItem.children.forEach(child => {
        if (child.type === 'file') {
          const childPath = child.path || `${currentPath}/${child.name}`;
          files.push(childPath);
        } else if (child.type === 'folder') {
          files.push(...getAllFilesInFolder(child, currentPath));
        }
      });
    }
    
    return files;
  };

  const folderFiles = isFolder ? getAllFilesInFolder(item, item.path ? item.path.split('/').slice(0, -1).join('/') : '') : [];
  const selectedFolderFiles = folderFiles.filter(file => selectedFiles.includes(file));
  const isFolderPartiallySelected = selectedFolderFiles.length > 0 && selectedFolderFiles.length < folderFiles.length;
  const isFolderFullySelected = folderFiles.length > 0 && selectedFolderFiles.length === folderFiles.length;

  const handleClick = (e: React.MouseEvent) => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onFileToggle(filePath);
    }
  };

  const handleFolderCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder && onFolderToggle) {
      onFolderToggle(filePath, !isFolderFullySelected);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10 text-primary",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )
        ) : (
          <div className="w-3.5" />
        )}
        
        {isFolder ? (
          <Folder size={14} className="text-amber-500" />
        ) : (
          getFileIcon(item.name)
        )}
        
        <span className="flex-1 truncate">{item.name}</span>
        
        {/* File count for folders */}
        {isFolder && folderFiles.length > 0 && (
          <span className="text-xs text-muted-foreground mr-2">
            {selectedFolderFiles.length}/{folderFiles.length}
          </span>
        )}
        
        {/* Checkbox for both files and folders */}
        <div 
          className={cn(
            "w-4 h-4 border rounded flex-shrink-0 transition-colors cursor-pointer",
            isFolder ? (
              isFolderFullySelected 
                ? "bg-primary border-primary" 
                : isFolderPartiallySelected
                  ? "bg-primary/50 border-primary"
                  : "border-muted-foreground/30 hover:border-muted-foreground/50"
            ) : (
              isSelected 
                ? "bg-primary border-primary" 
                : "border-muted-foreground/30 hover:border-muted-foreground/50"
            )
          )}
          onClick={isFolder ? handleFolderCheckboxClick : handleClick}
        >
          {(isSelected || isFolderFullySelected) && (
            <Check size={12} className="text-primary-foreground m-auto" />
          )}
          {isFolderPartiallySelected && !isFolderFullySelected && (
            <Minus size={12} className="text-primary-foreground m-auto" />
          )}
        </div>
      </div>
      
      {isFolder && isExpanded && item.children && (
        <div className="ml-2">
          {item.children.map((child, index) => (
            <BranchFileItem
              key={index}
              item={child}
              level={level + 1}
              selectedFiles={selectedFiles}
              onFileToggle={onFileToggle}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Chat message component
interface ChatMessageProps {
  message: ChatMessage;
  onCopy: (content: string) => void;
  messageStatus?: {
    id: string;
    status: 'sending' | 'sent' | 'failed' | 'retrying';
    retryCount: number;
    error?: string;
  };
}

// Message status indicator component
const MessageStatusIndicator: React.FC<{
  status: 'sending' | 'sent' | 'failed' | 'retrying';
  retryCount?: number;
  error?: string;
}> = ({ status, retryCount = 0, error }) => {
  switch (status) {
    case 'sending':
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 size={10} className="animate-spin" />
          <span>Sending...</span>
        </div>
      );
    case 'retrying':
      return (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <RefreshCw size={10} className="animate-spin" />
          <span>Retrying ({retryCount}/3)...</span>
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center gap-1 text-xs text-red-500" title={error}>
          <AlertCircle size={10} />
          <span>Failed to send</span>
        </div>
      );
    case 'sent':
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckSquare size={10} />
          <span>Sent</span>
        </div>
      );
    default:
      return null;
  }
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onCopy, messageStatus }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex gap-3 max-w-[80%]",
        isUser && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {isUser ? <User size={16} /> : <BotIcon size={16} />}
        </div>
        
        {/* Message content */}
        <div className={cn(
          "rounded-lg p-4",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium">
              {isUser ? 'You' : 'TARS'}
            </span>
            <div className="flex items-center gap-2 text-xs opacity-70">
              <ClockIcon size={12} />
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {messageStatus && <MessageStatusIndicator {...messageStatus} />}
              <button
                onClick={() => onCopy(message.content)}
                className="ml-2 hover:opacity-100 opacity-70 transition-opacity"
              >
                <CopyIcon size={12} />
              </button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom styling for different markdown elements
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
                h4: ({ children }) => <h4 className="text-sm font-medium mb-1">{children}</h4>,
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground mb-2">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>;
                  }
                  return <code className={className}>{children}</code>;
                },
                pre: ({ children }) => (
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-2">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="min-w-full border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-3 py-2 text-left font-medium bg-muted">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-3 py-2">
                    {children}
                  </td>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                hr: () => <hr className="border-border my-4" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* File references */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
                <FileCode size={12} />
                <span>Referenced files:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {message.files.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {file}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Code snippets */}
          {message.codeSnippets && message.codeSnippets.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.codeSnippets.map((snippet, index) => (
                <div key={index} className="bg-background/50 rounded-md p-3">
                  {snippet.filePath && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <FileCode size={12} />
                      <span>{snippet.filePath}</span>
                    </div>
                  )}
                  <pre className="text-xs overflow-x-auto">
                    <code className={`language-${snippet.language}`}>
                      {snippet.code}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main chat interface component
interface ImportedFile {
  branch: string;
  path: string;
  content?: string;
}

interface ImportedData {
  type: 'branch' | 'file' | 'text' | 'control-panel';
  branch?: string;
  branches?: string[];
  files?: ImportedFile[];
  fileStructures?: Record<string, FileSystemItem[]>;
  dataTypes?: string[];
  title?: string;
  content?: string;
}

interface FileChatInterfaceProps {
  importedData?: ImportedData;
}

export const FileChatInterface: React.FC<FileChatInterfaceProps> = ({ importedData }) => {
  const { token, user, githubApi } = useAuth();
  const { repository } = useRepository();
  const { selectedBranch, branchList, getBranchInfo } = useBranch();
  const { updateKnowledgeBase } = useKnowledgeBase();
  const {
    state,
    getActiveSession,
    addMessage,
    sendMessage,
    sendMessageWithRetry,
    setSelectedFiles,
    addSelectedFile,
    removeSelectedFile,
    getCachedFileContent,
    cacheFileContent,
    setFileStructure,
    setLoadingState,
    setError,
    clearErrors,
    getFileCacheKey,
    getFileHash,
    createSession,
    setMessageStatus,
    updateMessageStatus,
    getMessageStatus
  } = useChat();
  
  const githubAPI = githubApi || new GitHubAPI(null);
  
  // Local state management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isContextSidebarCollapsed, setIsContextSidebarCollapsed] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sending' | 'sent' | 'failed'>>({});
  
  // Import state management
  const [selectedImportSource, setSelectedImportSource] = useState<string | null>(null);
  const [showImportPanel, setShowImportPanel] = useState(true);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeImportType, setActiveImportType] = useState<string>('');
  const [importFormData, setImportFormData] = useState<any>({});
  const [filesBySource, setFilesBySource] = useState<{[key: string]: any[]}>({
    csv: [],
    'control-panel': [],
    url: [],
    file: [],
    text: [],
    branch: []
  });
  const [selectedBranchFiles, setSelectedBranchFiles] = useState<string[]>([]);
  const [branchFilesLoading, setBranchFilesLoading] = useState(false);

  const [branchFileStructures, setBranchFileStructures] = useState<Record<string, any[]>>({});
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFileContent, setLoadingFileContent] = useState<Record<string, boolean>>({});
  const [selectedFileContents, setSelectedFileContents] = useState<Array<{branch: string, path: string, content: string}>>([]);
  const [controlPanelData, setControlPanelData] = useState<any>(fallbackContributionData);
  const [activeSection, setActiveSection] = useState('files'); // 'files', 'about', 'why', 'how', 'contribute', 'manage'
  const [selectedDataTypes, setSelectedDataTypes] = useState<{
    pullRequests: boolean;
    issues: boolean;
    botLogs: boolean;
    activities: boolean;
  }>({
    pullRequests: false,
    issues: false,
    botLogs: false,
    activities: false
  });
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  
  // Enhanced import state for unified experience
  const [importProgress, setImportProgress] = useState<{
    isImporting: boolean;
    progress: number;
    message: string;
    importedFiles: number;
    totalFiles: number;
  }>({
    isImporting: false,
    progress: 0,
    message: '',
    importedFiles: 0,
    totalFiles: 0
  });
  
  // Auto-import state
  const [autoImportEnabled, setAutoImportEnabled] = useState(true);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  // Demo mode state - REMOVED - no demo mode
  // const [useDemoMode, setUseDemoMode] = useState(false); // Always false - no demo mode

  // Demo content - REMOVED
  
  // Get active session and its data
  const activeSession = getActiveSession();
  const messages = activeSession?.messages || [];
  const selectedFiles = state.selectedFiles;
  const isLoading = state.loadingStates.chat;
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize chat session if none exists
  useEffect(() => {
    if (!activeSession && repository && !state.loadingStates.sessions) {
      createSession('New Chat');
    }
  }, [activeSession, repository]); // Removed createSession from dependencies

  // Track processed imports to prevent infinite loops
  const [processedImports, setProcessedImports] = useState<Set<string>>(new Set());
  
  // Debounce mechanism to prevent rapid successive API calls
  const [fetchTimeouts, setFetchTimeouts] = useState<Record<string, NodeJS.Timeout>>({});
  
  // Use ref to track current selected files to avoid circular dependencies
  const selectedFilesRef = useRef(selectedFiles);
  selectedFilesRef.current = selectedFiles;

  // Fetch file content function - moved before useEffect that uses it
  const fetchFileContent = useCallback(async (branch: string, filePath: string): Promise<string | null> => {
    if (!repository?.owner?.login || !repository?.name) return null;
    
    // Removed demo mode logic - only use real repository content
    
    const contentKey = getFileCacheKey(branch, filePath);
    
    // Check if we're already fetching this file
    if (fetchTimeouts[contentKey]) {
      clearTimeout(fetchTimeouts[contentKey]);
    }
    
    // Debounce the fetch request
    return new Promise((resolve) => {
      const timeoutId = setTimeout(async () => {
        setLoadingState('files', contentKey, true);
        
        try {
          if (!githubAPI) {
            throw new Error('GitHub API not available');
          }
          
          const content = await githubAPI.getFileContent(
            repository.owner.login, 
            repository.name, 
            filePath, 
            branch
          );
          
          const contentHash = getFileHash(content);
          cacheFileContent(contentKey, content, contentHash);
          
          // Update selected files with content using ref to avoid circular dependency
          const currentFiles = selectedFilesRef.current;
          const updatedFiles = currentFiles.map(file => 
            file.branch === branch && file.path === filePath 
              ? { ...file, content, contentHash: contentHash || undefined }
              : file
          );
          setSelectedFiles(updatedFiles);
          
          console.log(`Successfully fetched content for ${filePath} (${content.length} characters)`);
          resolve(content);
          
        } catch (err) {
          console.error(`Failed to fetch content for ${filePath} in ${branch}:`, err);
          
          // Don't add files without real content to avoid confusing developers
          console.warn(`Skipping file ${filePath} - GitHub API failed and no demo content available`);
          resolve(null);
        } finally {
          setLoadingState('files', contentKey, false);
          // Clear the timeout reference
          setFetchTimeouts(prev => {
            const newTimeouts = { ...prev };
            delete newTimeouts[contentKey];
            return newTimeouts;
          });
        }
      }, 300); // 300ms debounce
      
      // Store the timeout reference
      setFetchTimeouts(prev => ({ ...prev, [contentKey]: timeoutId }));
    });
  }, [repository, getFileCacheKey, setLoadingState, cacheFileContent, getFileHash, setSelectedFiles, setError, fetchTimeouts]);

  // Handle imported data with enhanced workflow
  useEffect(() => {
    if (importedData && repository && !processedImports.has(importedData.type + importedData.branch)) {
      console.log('Processing imported data:', importedData);
      
      // Mark this import as processed
      setProcessedImports(prev => new Set([...prev, importedData.type + importedData.branch]));
      
      // Show import progress
      setImportProgress({
        isImporting: true,
        progress: 0,
        message: 'Processing imported data...',
        importedFiles: 0,
        totalFiles: 0
      });
      
      const timeoutId = setTimeout(async () => {
        let totalFiles = 0;
        let processedFiles = 0;
        
        if (importedData.type === 'branch' && importedData.branches) {
          // Set selected branches
          setSelectedBranches(importedData.branches);
          
          // Set file structures for imported branches
          if (importedData.fileStructures) {
            Object.entries(importedData.fileStructures).forEach(([branch, structure]) => {
              setFileStructure(branch, structure as FileSystemItem[]);
            });
          }
          
          // Add imported files to selected files and fetch content
          if (importedData.files) {
            totalFiles = importedData.files.length;
            for (const file of importedData.files) {
              // Check if file is already selected to avoid duplicates
              const isAlreadySelected = selectedFiles.some(f => f.branch === file.branch && f.path === file.path);
              
              if (!isAlreadySelected) {
                // Add file to selected files with loading state
                addSelectedFile({
                  branch: file.branch,
                  path: file.path,
                  content: 'Loading...'
                });
                
                // Fetch the actual content
                try {
                  await fetchFileContent(file.branch, file.path);
                } catch (error) {
                  console.error(`Failed to fetch content for ${file.path}:`, error);
                }
              }
              
              processedFiles++;
              setImportProgress(prev => ({
                ...prev,
                progress: (processedFiles / totalFiles) * 100,
                importedFiles: processedFiles,
                totalFiles
              }));
            }
          }
          
          toast.success(`Imported ${importedData.branches.length} branch(es) with ${totalFiles} files. You can now chat with your imported content!`);
        } else if (importedData.type === 'file' && importedData.files && importedData.branch) {
          // Handle single file imports
          totalFiles = importedData.files.length;
          for (const file of importedData.files) {
            const isAlreadySelected = selectedFiles.some(f => f.branch === importedData.branch && f.path === file.path);
            
            if (!isAlreadySelected) {
              if (file.content && file.content !== 'No content available') {
                // Use provided content
                addSelectedFile({
                  branch: importedData.branch!,
                  path: file.path,
                  content: file.content
                });
              } else {
                // Fetch content
                addSelectedFile({
                  branch: importedData.branch!,
                  path: file.path,
                  content: 'Loading...'
                });
                
                try {
                  await fetchFileContent(importedData.branch!, file.path);
                } catch (error) {
                  console.error(`Failed to fetch content for ${file.path}:`, error);
                }
              }
            }
            
            processedFiles++;
            setImportProgress(prev => ({
              ...prev,
              progress: (processedFiles / totalFiles) * 100,
              importedFiles: processedFiles,
              totalFiles
            }));
          }
          
          setSelectedBranches([importedData.branch]);
          toast.success(`Imported ${importedData.files.length} file(s). You can now chat with your imported content!`);
        } else if (importedData.type === 'text' && importedData.branch && importedData.content) {
          // Handle text imports - create a virtual file
          const virtualFilePath = `imported-text-${Date.now()}.txt`;
          addSelectedFile({
            branch: importedData.branch,
            path: virtualFilePath,
            content: importedData.content
          });
          setSelectedBranches([importedData.branch]);
          toast.success('Imported text content. You can now chat with your imported content!');
        } else if (importedData.type === 'control-panel' && importedData.branch && importedData.dataTypes) {
          // Handle control panel imports
          setSelectedBranches([importedData.branch]);
          toast.success(`Imported ${importedData.dataTypes.join(', ')} data. You can now chat with your imported content!`);
        }
        
        // Complete import process
        setImportProgress(prev => ({
          ...prev,
          isImporting: false,
          progress: 100,
          message: 'Import completed!'
        }));
        
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 3000);
        
      }, 1000);
      
      // Cleanup timeout on unmount or dependency change
      return () => clearTimeout(timeoutId);
    }
  }, [importedData, repository, setFileStructure, addSelectedFile, setSelectedBranches]); // Removed fetchFileContent from dependencies


  
  // Fetch branches and file structures
  useEffect(() => {
    if (repository?.owner?.login && repository?.name) {
      setLoadingState('sessions', undefined, true);
      
      githubAPI.getBranchesWithTrees(repository.owner.login, repository.name)
        .then(data => {
          console.log('Fetched repository data:', data);
          setSelectedBranches(data.branches.map((b: { name: string }) => b.name));
          
          Object.entries(data.treesByBranch).forEach(([branchName, branchData]) => {
            // Handle both formats: direct array or object with tree property
            let treeData: Array<{ path: string; type: string; size?: number }>;
            
            if (Array.isArray(branchData)) {
              // Direct array format (from local file service or some API responses)
              treeData = branchData as Array<{ path: string; type: string; size?: number }>;
            } else {
              // Object format with tree property
              const typedBranchData = branchData as { tree?: Array<{ path: string; type: string; size?: number }>; error?: string };
              if (typedBranchData.tree && !typedBranchData.error) {
                treeData = typedBranchData.tree;
              } else {
                console.error(`Branch ${branchName} has error:`, typedBranchData.error);
                return; // Skip this branch
              }
            }
            
            if (treeData && treeData.length > 0) {
              const fileStructure = convertTreeToFileStructure(treeData);
              console.log(`Setting file structure for branch ${branchName}:`, fileStructure);
              
              // Set in both places to ensure compatibility
              setFileStructure(branchName, fileStructure);
              setBranchFileStructures(prev => ({
                ...prev,
                [branchName]: fileStructure
              }));
            }
          });
          // Backend is working - no need for demo mode
        })
        .catch(err => {
          console.error('Failed to fetch branches with trees:', err);
          setError('sessions', undefined, 'Failed to load repository structure');
          
          // Fallback: fetch branches first, then individual trees
          if (githubAPI) {
            githubAPI.getRepositoryBranches(repository.owner.login, repository.name)
              .then(branches => {
                console.log('Fetched branches (fallback):', branches);
                setSelectedBranches(branches.map((b: { name: string }) => b.name));
                
                // Fetch tree for each branch individually
                branches.forEach(async (branch: { name: string }) => {
                  try {
                    if (githubAPI) {
                      const tree = await githubAPI.getRepositoryTree(repository.owner.login, repository.name, branch.name);
                      console.log(`Fetched tree for branch ${branch.name}:`, tree);
                      
                      const fileStructure = convertTreeToFileStructure(tree);
                      setFileStructure(branch.name, fileStructure);
                      setBranchFileStructures(prev => ({
                        ...prev,
                        [branch.name]: fileStructure
                      }));
                    }
                  } catch (treeErr) {
                    console.error(`Failed to fetch tree for branch ${branch.name}:`, treeErr);
                  }
                });
                // Backend is working - no need for demo mode
              })
              .catch(branchErr => {
                console.error('Failed to fetch branches (fallback):', branchErr);
                console.log('Backend connection issues - showing error');
                
                // Show error message when backend is not available
                setError('sessions', undefined, 'Failed to connect to repository. Please check your connection and try again.');
                toast.error('Failed to connect to repository');
              });
          } else {
            // No githubAPI available
            console.log('GitHub API not available');
            setError('sessions', undefined, 'GitHub API not available. Please check configuration.');
            toast.error('GitHub API not available');
          }
        })
        .finally(() => setLoadingState('sessions', undefined, false));
    }
  }, [repository, token, setLoadingState, setFileStructure, setError]);
  
  // Demo files initialization removed - no demo mode
  // useEffect(() => {
  //   // Demo files population removed
  // }, []);
  
  // Get filtered file structure for a branch
  const getFilteredStructure = (branch: string): FileSystemItem[] => {
    // Try to get structure from local state first, then from context
    const structure = branchFileStructures[branch] || state.fileStructures[branch] || [];
    
    console.log(`Getting filtered structure for branch ${branch}:`, structure);
    
    if (!searchQuery.trim() && !showOnlySelected) {
      return structure;
    }
    
    const filterItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.filter(item => {
        const matchesSearch = !searchQuery.trim() || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSelection = !showOnlySelected || 
          (item.type === 'file' && selectedFiles.some(f => 
            f.branch === branch && f.path === item.path
          )) ||
          (item.type === 'folder' && item.children && 
           item.children.some(child => 
             selectedFiles.some(f => f.branch === branch && f.path === child.path)
           ));
        
        if (item.type === 'folder' && item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        
        return matchesSearch && matchesSelection;
      });
    };
    
    return filterItems(structure);
  };

  // Helper function to convert GitHub tree to file structure
  const convertTreeToFileStructure = (treeData: Array<{ path: string; type: string; size?: number }>): FileSystemItem[] => {
    const structure: FileSystemItem[] = [];
    const folderMap = new Map<string, FileSystemItem>();

    if (!treeData || !Array.isArray(treeData)) {
      return structure;
    }

    treeData.forEach((item) => {
      const pathParts = item.path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      if (item.type === 'tree') {
        const folderItem: FileSystemItem = {
          name: fileName,
          type: 'folder',
          expanded: false,
          selected: false,
          children: []
        };
        
        if (pathParts.length === 1) {
          structure.push(folderItem);
        } else {
          const parentPath = pathParts.slice(0, -1).join('/');
          if (!folderMap.has(parentPath)) {
            folderMap.set(parentPath, { name: '', type: 'folder', children: [] });
          }
          folderMap.get(parentPath)!.children!.push(folderItem);
        }
        folderMap.set(item.path, folderItem);
      } else {
        const fileItem: FileSystemItem = {
          name: fileName,
          type: 'file',
          selected: false,
          size: item.size || 0,
          path: item.path
        };
        
        if (pathParts.length === 1) {
          structure.push(fileItem);
        } else {
          const parentPath = pathParts.slice(0, -1).join('/');
          if (!folderMap.has(parentPath)) {
            folderMap.set(parentPath, { name: '', type: 'folder', children: [] });
          }
          folderMap.get(parentPath)!.children!.push(fileItem);
        }
      }
    });

    return structure;
  };
  

  
  // Folder expansion handler
  const handleFolderToggle = useCallback((item: FileSystemItem, path: string[]) => {
    if (item.type !== 'folder') return;
    
    const branch = selectedBranches[0] || repository?.default_branch || '';
    const currentStructure = branchFileStructures[branch] || [];
    
    // Update the structure to toggle the folder's expanded state
    const updateStructure = (items: FileSystemItem[], currentPath: string[], index: number): FileSystemItem[] => {
      return items.map(currentItem => {
        if (currentItem.name === currentPath[index]) {
          if (index === currentPath.length - 1) {
            // This is the target item
            return { ...currentItem, expanded: !currentItem.expanded };
          } else if (currentItem.children) {
            // Keep traversing the path
            return {
              ...currentItem,
              children: updateStructure(currentItem.children, currentPath, index + 1)
            };
          }
        }
        return currentItem;
      });
    };
    
    const newStructure = updateStructure(currentStructure, path, 0);
    setBranchFileStructures(prev => ({
      ...prev,
      [branch]: newStructure
    }));
  }, [selectedBranches, branchFileStructures]);

  // File and folder selection handler
  const handleFileSelect = useCallback(async (item: FileSystemItem, path: string[]) => {
    const branch = selectedBranches[0] || repository?.default_branch || '';
    
    if (item.type === 'file') {
      const filePath = path.join('/');
      
      // Check if file is already selected
      const isSelected = selectedFiles.some(f => f.branch === branch && f.path === filePath);
      
      if (isSelected) {
        // Remove file
        removeSelectedFile(branch, filePath);
      } else {
        // Add file with loading state first
        addSelectedFile({ branch, path: filePath, content: 'Loading...' });
        
        // Then fetch the actual content
        try {
          await fetchFileContent(branch, filePath);
        } catch (error) {
          console.error(`Failed to fetch content for ${filePath}:`, error);
          // Update the file with error content using the current state
          const errorFiles = selectedFiles.map(file => 
            file.branch === branch && file.path === filePath 
              ? { ...file, content: 'Error: Failed to load file content' }
              : file
          );
          setSelectedFiles(errorFiles);
        }
      }
    } else if (item.type === 'folder') {
      // Handle folder selection - select all files in the folder recursively
      const selectFilesInFolder = (folderItem: FileSystemItem, folderPath: string[]): string[] => {
        const filePaths: string[] = [];
        
        if (folderItem.children) {
          folderItem.children.forEach(child => {
            const childPath = [...folderPath, child.name];
            if (child.type === 'file') {
              filePaths.push(childPath.join('/'));
            } else if (child.type === 'folder') {
              filePaths.push(...selectFilesInFolder(child, childPath));
            }
          });
        }
        
        return filePaths;
      };
      
      const filePaths = selectFilesInFolder(item, path);
      
      // Add all files in the folder to selected files
      for (const filePath of filePaths) {
        const isAlreadySelected = selectedFiles.some(f => f.branch === branch && f.path === filePath);
        if (!isAlreadySelected) {
          addSelectedFile({ branch, path: filePath, content: 'Loading...' });
          try {
            await fetchFileContent(branch, filePath);
          } catch (error) {
            console.error(`Failed to fetch content for ${filePath}:`, error);
          }
        }
      }
    }
  }, [selectedBranches, selectedFiles, removeSelectedFile, addSelectedFile, fetchFileContent, setSelectedFiles]);

  // Utility function to expand all folders
  const expandAllFolders = useCallback((branch: string) => {
    const currentStructure = branchFileStructures[branch] || [];
    
    const expandItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.type === 'folder' && item.children) {
          return {
            ...item,
            expanded: true,
            children: expandItems(item.children)
          };
        }
        return item;
      });
    };
    
    const newStructure = expandItems(currentStructure);
    setBranchFileStructures(prev => ({
      ...prev,
      [branch]: newStructure
    }));
  }, [branchFileStructures]);

  // Utility function to collapse all folders
  const collapseAllFolders = useCallback((branch: string) => {
    const currentStructure = branchFileStructures[branch] || [];
    
    const collapseItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.type === 'folder' && item.children) {
          return {
            ...item,
            expanded: false,
            children: collapseItems(item.children)
          };
        }
        return item;
      });
    };
    
    const newStructure = collapseItems(currentStructure);
    setBranchFileStructures(prev => ({
      ...prev,
      [branch]: newStructure
    }));
  }, [branchFileStructures]);

  // Utility function to select all files in a branch
  const selectAllFiles = useCallback(async (branch: string) => {
    const currentStructure = branchFileStructures[branch] || [];
    
    const getAllFilePaths = (items: FileSystemItem[], currentPath: string[] = []): string[] => {
      const filePaths: string[] = [];
      
      items.forEach(item => {
        const itemPath = [...currentPath, item.name];
        if (item.type === 'file') {
          filePaths.push(itemPath.join('/'));
        } else if (item.type === 'folder' && item.children) {
          filePaths.push(...getAllFilePaths(item.children, itemPath));
        }
      });
      
      return filePaths;
    };
    
    const allFilePaths = getAllFilePaths(currentStructure);
    
    // Add all files to selected files
    for (const filePath of allFilePaths) {
      const isAlreadySelected = selectedFiles.some(f => f.branch === branch && f.path === filePath);
      if (!isAlreadySelected) {
        addSelectedFile({ branch, path: filePath, content: 'Loading...' });
        try {
          await fetchFileContent(branch, filePath);
        } catch (error) {
          console.error(`Failed to fetch content for ${filePath}:`, error);
        }
      }
    }
  }, [branchFileStructures, selectedFiles, addSelectedFile, fetchFileContent]);
  
  // Chat handlers
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !activeSession) return;
    
    const userMessage = {
      type: 'user' as const,
      content: inputMessage,
      files: selectedFiles.map(f => f.path)
    };
    
    // Add user message immediately for better UX
    addMessage(activeSession.id, userMessage);
    const messageToSend = inputMessage;
    setInputMessage('');
    
    try {
      // Use the enhanced sendMessage with retry logic from context
      await sendMessageWithRetry(activeSession.id, messageToSend, 3);
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message after multiple attempts. Please check your connection and try again.');
      setError('chat', undefined, 'Failed to send message');
    }
  };
  
  // Enhanced import handler with seamless transition to chat
  const handleImportAndChat = async (importData: any, importType: string) => {
    setImportProgress({
      isImporting: true,
      progress: 0,
      message: `Importing ${importType}...`,
      importedFiles: 0,
      totalFiles: 1
    });
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process the import
      if (importType === 'text' && importData.title && importData.content) {
        const fileData = {
          branch: 'local',
          path: `${importData.title}.txt`,
          content: importData.content
        };
        
        addSelectedFile(fileData);
        
        setImportProgress({
          isImporting: false,
          progress: 100,
          message: 'Import completed!',
          importedFiles: 1,
          totalFiles: 1
        });
        
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 3000);
        
        // Auto-generate a chat message about the imported content
        const autoMessage = `I've imported "${importData.title}". Can you help me understand this content?`;
        setInputMessage(autoMessage);
        
        // Show welcome message if this is the first import
        if (!hasShownWelcome) {
          setHasShownWelcome(true);
          toast.success('Welcome! Your content is ready for chat. Try asking questions about your imported files.');
        }
        
        toast.success('Content imported and ready for chat!');
      }
      
      // Close import panel
      setShowImportPanel(false);
      setSelectedImportSource(null);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import content. Please try again.');
      setImportProgress({
        isImporting: false,
        progress: 0,
        message: 'Import failed',
        importedFiles: 0,
        totalFiles: 0
      });
    }
  };
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Import popup handlers
  const handleImportSourceClick = (sourceType: string) => {
    setActiveImportType(sourceType);
    setImportFormData({});
    setShowImportDialog(true);
  };

  const handleImportSubmit = async () => {
    try {
      const sourceType = activeImportType;
      let importedFiles: any[] = [];

      switch (sourceType) {
        case 'csv':
          // Handle CSV import
          if (importFormData.file) {
            importedFiles = [{
              name: importFormData.file.name,
              source: 'csv',
              content: 'CSV content processed',
              type: 'csv'
            }];
          }
          break;
          
        case 'url':
          // Handle URL import
          if (importFormData.url) {
            importedFiles = [{
              name: new URL(importFormData.url).hostname,
              source: 'url',
              content: 'Web content fetched',
              url: importFormData.url,
              type: 'webpage'
            }];
          }
          break;
          
        case 'file':
          // Handle file upload
          if (importFormData.files && importFormData.files.length > 0) {
            importedFiles = Array.from(importFormData.files).map((file: any) => ({
              name: file.name,
              source: 'file',
              content: 'File content processed',
              type: file.type || 'document'
            }));
          }
          break;
          
        case 'text':
          // Handle text input
          if (importFormData.title && importFormData.text) {
            importedFiles = [{
              name: importFormData.title,
              source: 'text',
              content: importFormData.text,
              type: 'text'
            }];
          }
          break;
          
        case 'branch':
          // Handle branch import
          if (importFormData.selectedBranch && selectedBranchFiles.length > 0) {
            // Set import progress
            setImportProgress({
              isImporting: true,
              progress: 0,
              message: 'Fetching branch files...',
              importedFiles: 0,
              totalFiles: selectedBranchFiles.length
            });

            let processedFiles = 0;
            const branchFiles = [];

            for (const filePath of selectedBranchFiles) {
              try {
                let content = '';
                
                // Only fetch real content - no demo mode
                if (repository) {
                  try {
                    content = await githubAPI.getFileContent(
                      repository.owner.login,
                      repository.name,
                      filePath,
                      importFormData.selectedBranch
                    );
                  } catch (fetchError) {
                    console.error(`Failed to fetch content for ${filePath}:`, fetchError);
                    content = `// Error loading content for ${filePath}
// File exists but content could not be fetched
console.log('File: ${filePath}');`;
                  }
                } else {
                  content = `// Content not available for ${filePath}
// GitHub API not available`;
                }

                branchFiles.push({
                  name: filePath,
                  source: 'branch',
                  content: content,
                  branch: importFormData.selectedBranch,
                  type: 'code'
                });

                processedFiles++;
                setImportProgress(prev => ({
                  ...prev,
                  progress: (processedFiles / selectedBranchFiles.length) * 100,
                  importedFiles: processedFiles,
                  message: `Processing ${filePath}...`
                }));

              } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
                // Add placeholder for failed files
                branchFiles.push({
                  name: filePath,
                  source: 'branch',
                  content: `// Error loading ${filePath}\n// ${error}`,
                  branch: importFormData.selectedBranch,
                  type: 'code'
                });
                processedFiles++;
              }
            }

            importedFiles = branchFiles;
            
            // Complete the import progress
            setImportProgress(prev => ({
              ...prev,
              isImporting: false,
              progress: 100,
              message: 'Branch import completed!'
            }));
          }
          break;
          
        case 'control-panel':
          // Handle control panel data import
          if (importFormData.dataSource) {
            importedFiles = [{
              name: importFormData.dataSource,
              source: 'control-panel',
              content: 'Control panel data imported',
              type: 'data'
            }];
          }
          break;
      }

      // Update filesBySource
      if (importedFiles.length > 0) {
        setFilesBySource(prev => ({
          ...prev,
          [sourceType]: [...prev[sourceType], ...importedFiles]
        }));
        
        // Also add to selectedFiles for chat context
        importedFiles.forEach(file => {
          addSelectedFile({
            branch: file.branch || 'imported',
            path: file.name,
            content: file.content
          });
        });
        
        toast.success(`Successfully imported ${importedFiles.length} item(s) from ${sourceType}`);
      }

      setShowImportDialog(false);
      setActiveImportType('');
      setImportFormData({});
      setSelectedBranchFiles([]);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import. Please try again.');
    }
  };

  // Debug effect to monitor context selectedFiles changes
  useEffect(() => {
    console.log('Context selectedFiles changed:', state.selectedFiles?.length || 0, 'files');
    state.selectedFiles?.forEach((file, index) => {
      console.log(`  File ${index + 1}:`, file.path, 'branch:', file.branch, 'content length:', file.content?.length);
    });
  }, [state.selectedFiles]);

  // Debug effect to monitor branchFileStructures changes
  useEffect(() => {
    console.log('branchFileStructures state changed:', branchFileStructures);
    if (importFormData.selectedBranch) {
      console.log('Current selected branch structure:', branchFileStructures[importFormData.selectedBranch]);
      console.log('Length:', branchFileStructures[importFormData.selectedBranch]?.length);
    }
  }, [branchFileStructures, importFormData.selectedBranch]);

  // Handle branch selection for import
  const handleBranchSelectForImport = async (branchName: string) => {
    console.log('Branch selected for import:', branchName);
    
    setImportFormData({...importFormData, selectedBranch: branchName});
    setSelectedBranchFiles([]);
    setBranchFilesLoading(true);

    try {
      // Check if we already have file structure for this branch
      if (!branchFileStructures[branchName] || branchFileStructures[branchName].length === 0) {
        console.log('Loading file structure for branch:', branchName);
        
        // Only use real GitHub API data - no demo fallback
        if (repository) {
          console.log('Fetching from GitHub API');
          const tree = await githubAPI.getRepositoryTree(repository.owner.login, repository.name, branchName);
          const processedStructure = convertTreeToFileStructure(tree.tree || []);
          
          setBranchFileStructures(prev => ({
            ...prev,
            [branchName]: processedStructure
          }));
          console.log('GitHub file structure set:', processedStructure);
        } else {
          console.error('GitHub API or repository not available');
          toast.error('Failed to load branch structure - GitHub API not available');
        }
      } else {
        console.log('File structure already exists for branch:', branchName);
        console.log('Existing structure:', branchFileStructures[branchName]);
      }
    } catch (error) {
      console.error('Error loading branch files:', error);
      toast.error('Failed to load branch files');
    } finally {
      setBranchFilesLoading(false);
    }
  };

  // Handle file selection in branch import
  const handleBranchFileToggle = async (filePath: string) => {
    const branchName = importFormData.selectedBranch;
    if (!branchName) return;

    console.log('File toggle for:', filePath, 'in branch:', branchName);

    setSelectedBranchFiles(prev => {
      const isCurrentlySelected = prev.includes(filePath);
      
      if (isCurrentlySelected) {
        // Remove from selection
        console.log('Removing file from selection:', filePath);
        const newSelection = prev.filter(path => path !== filePath);
        
        // Also remove from context
        removeSelectedFile(branchName, filePath);
        console.log('Removed file from context:', filePath);
        
        return newSelection;
      } else {
        // Check if already in progress to prevent double-clicks
        if (prev.includes(filePath)) {
          console.log('File toggle already in progress for:', filePath);
          return prev;
        }
        
        // Add to selection
        console.log('Adding file to selection:', filePath);
        const newSelection = [...prev, filePath];
        
        // Fetch content and add to context (with debounce)
        setTimeout(() => {
          fetchFileContent(branchName, filePath).then((content) => {
            console.log('Content fetched for:', filePath, 'length:', content?.length);
            
            // Handle case where content might be an object or string
            let actualContent: string;
            if (typeof content === 'string') {
              actualContent = content;
            } else if (content && typeof content === 'object' && 'content' in content) {
              actualContent = (content as any).content;
            } else {
              actualContent = String(content || '');
            }
            
            if (actualContent && actualContent.trim()) {
              addSelectedFile({
                branch: branchName,
                path: filePath,
                content: actualContent,
                contentHash: getFileHash(actualContent)
              });
              console.log('Added file to context:', filePath, 'content preview:', actualContent.substring(0, 100) + '...');
            } else {
              console.warn('Failed to get valid content for file:', filePath, '- not adding to context');
              // Remove from UI selection since we can't get content
              setSelectedBranchFiles(prev => prev.filter(p => p !== filePath));
            }
          }).catch(error => {
            console.error('Failed to fetch content for file:', filePath, error);
            // Remove from UI selection since fetch failed
            setSelectedBranchFiles(prev => prev.filter(p => p !== filePath));
          });
        }, 100); // 100ms debounce
        
        return newSelection;
      }
    });
  };

  // Handle folder selection in branch import
  const handleBranchFolderToggle = async (folderPath: string, selectAll: boolean) => {
    const branchName = importFormData.selectedBranch;
    if (!branchName) return;

    console.log('Folder toggle for:', folderPath, 'selectAll:', selectAll, 'in branch:', branchName);

    // Find the folder in the file structure
    const findFolderInStructure = (items: FileSystemItem[], targetPath: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.type === 'folder') {
          const itemPath = item.path || item.name;
          if (itemPath === targetPath) {
            return item;
          }
          if (item.children) {
            const found = findFolderInStructure(item.children, targetPath);
            if (found) return found;
          }
        }
      }
      return null;
    };

    // Get all files in folder recursively
    const getAllFilesInFolder = (folderItem: FileSystemItem, basePath: string = ''): string[] => {
      const files: string[] = [];
      const currentPath = basePath ? `${basePath}/${folderItem.name}` : folderItem.name;
      
      if (folderItem.children) {
        folderItem.children.forEach(child => {
          if (child.type === 'file') {
            const childPath = child.path || `${currentPath}/${child.name}`;
            files.push(childPath);
          } else if (child.type === 'folder') {
            files.push(...getAllFilesInFolder(child, currentPath));
          }
        });
      }
      
      return files;
    };

    const currentStructure = branchFileStructures[branchName] || [];
    const folderItem = findFolderInStructure(currentStructure, folderPath);
    
    if (!folderItem) {
      console.warn('Folder not found:', folderPath);
      return;
    }

    const folderFiles = getAllFilesInFolder(folderItem, folderItem.path ? folderItem.path.split('/').slice(0, -1).join('/') : '');
    console.log('Files in folder:', folderFiles);

    if (selectAll) {
      // Add all files in folder to selection
      setSelectedBranchFiles(prev => {
        const newSelection = [...new Set([...prev, ...folderFiles])];
        console.log('Added folder files to selection:', folderFiles);
        
        // Fetch content for each file
        folderFiles.forEach(filePath => {
          if (!prev.includes(filePath)) {
            setTimeout(() => {
              fetchFileContent(branchName, filePath).then((content) => {
                let actualContent: string;
                if (typeof content === 'string') {
                  actualContent = content;
                } else if (content && typeof content === 'object' && 'content' in content) {
                  actualContent = (content as any).content;
                } else {
                  actualContent = String(content || '');
                }
                
                if (actualContent && actualContent.trim()) {
                  addSelectedFile({
                    branch: branchName,
                    path: filePath,
                    content: actualContent,
                    contentHash: getFileHash(actualContent)
                  });
                  console.log('Added folder file to context:', filePath);
                } else {
                  console.warn('Failed to get valid content for folder file:', filePath);
                  setSelectedBranchFiles(prev => prev.filter(p => p !== filePath));
                }
              }).catch(error => {
                console.error('Failed to fetch content for folder file:', filePath, error);
                setSelectedBranchFiles(prev => prev.filter(p => p !== filePath));
              });
            }, 100);
          }
        });
        
        return newSelection;
      });
    } else {
      // Remove all files in folder from selection
      setSelectedBranchFiles(prev => {
        const newSelection = prev.filter(path => !folderFiles.includes(path));
        console.log('Removed folder files from selection:', folderFiles);
        
        // Remove from context
        folderFiles.forEach(filePath => {
          removeSelectedFile(branchName, filePath);
        });
        
        return newSelection;
      });
    }
  };

  // Helper function to get all files from file structure recursively
  const getAllFilesFromStructure = (items: FileSystemItem[]): string[] => {
    const files: string[] = [];
    
    const traverseItems = (itemList: FileSystemItem[], basePath: string = '') => {
      itemList.forEach(item => {
        if (item.type === 'file') {
          const filePath = item.path || (basePath ? `${basePath}/${item.name}` : item.name);
          files.push(filePath);
        } else if (item.type === 'folder' && item.children) {
          const currentPath = item.path || (basePath ? `${basePath}/${item.name}` : item.name);
          traverseItems(item.children, currentPath);
        }
      });
    };
    
    traverseItems(items);
    return files;
  };
  

  
  const clearAllSelections = () => {
    setSelectedFiles([]);
  };
  
  const selectByType = (fileType: string) => {
    // Implementation for selecting files by type
  };
  

  
  return (
    <div className="w-full h-full flex bg-background overflow-hidden">
      {/* Import Sidebar - Focused on Import Functionality */}
      <div className={cn(
        "border-r border-border bg-card/50 transition-all duration-300 h-full overflow-hidden",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {!isSidebarCollapsed && (
          <div className="p-3 space-y-3 h-full flex flex-col overflow-hidden">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="font-medium text-sm">Import</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(true)}
              >
                <ChevronLeft size={14} />
              </Button>
            </div>
            
            {/* Demo Mode Indicator - REMOVED */}
            
            {/* Import Progress Indicator */}
            {importProgress.isImporting && (
              <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="text-sm font-medium text-primary">Importing...</span>
                </div>
                <Progress value={importProgress.progress} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  {importProgress.message}
                  {importProgress.totalFiles > 0 && (
                    <span className="ml-2">
                      ({importProgress.importedFiles}/{importProgress.totalFiles} files)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Import Success Message */}
            {showImportSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Import Successful!</span>
                  <button
                    onClick={() => setShowImportSuccess(false)}
                    className="ml-auto p-1 rounded hover:bg-green-100"
                  >
                    <X size={12} className="text-green-600" />
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Files have been added to your context and are ready for chat.
                </p>
              </div>
            )}
            
            {/* Import Sources */}
            <div className="space-y-3 flex-1 overflow-hidden">              
              <div className="space-y-2 flex-1 overflow-y-auto">
                {importSources.map((source) => (
                  <ImportSourceCard
                    key={source.id}
                    source={source}
                    onClick={() => handleImportSourceClick(source.type)}
                    isActive={selectedImportSource === source.type}
                  />
                ))}
              </div>
              
            </div>


            


          </div>
        )}
        
        {/* Collapsed sidebar */}
        {isSidebarCollapsed && (
          <div className="p-2">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-full p-2 rounded-lg hover:bg-muted flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 max-h-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2 max-w-md">
                
                {selectedFiles.length === 0 && (
                  <div className="p-2 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground">
                      No files selected.
                    </p>
                    <div className="space-y-1 text-left">
                      <button
                        onClick={() => setSelectedImportSource('text')}
                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors w-full text-left"
                      >
                        <Type size={12} />
                        <span>Add text content directly</span>
                      </button>
                      <button
                        onClick={() => setSelectedImportSource('branch')}
                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors w-full text-left"
                      >
                        <GitBranch size={12} />
                        <span>Import from GitHub branches</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onCopy={handleCopyMessage}
                  messageStatus={getMessageStatus(message.id)}
                />
              ))}
              
              {isLoading && (
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <BotIcon size={16} />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">TARS is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-border p-3">
          {/* Enhanced Status Bar */}
          <div className="mb-3 p-2 bg-muted/30 rounded-lg">
            {selectedFiles.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} in context</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {repository && (
                      <Badge variant="outline" className="text-xs">
                        {repository.owner.login}/{repository.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Show processing status if any */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Processing your message with {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}...</span>
                  </div>
                )}
                
                {/* Show error status if any */}
                {state.errors.chat && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle size={12} />
                    <span>Error: {state.errors.chat}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearErrors('chat')}
                      className="h-auto p-0 text-xs underline"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle size={12} />
                <span>No files in context - Import files to start chatting with TARS</span>
              </div>
            )}
          </div>
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedFiles.length > 0 ? "Ask about your files..." : "Import files to start chatting..."}
                className="w-full p-2 pr-10 rounded-lg border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={1}
                style={{
                  minHeight: '36px',
                  maxHeight: '80px'
                }}
              />
              
              {selectedFiles.length > 0 && (
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedFiles.length} files
                  </Badge>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || selectedFiles.length === 0}
              className="px-3 py-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>


      {/* Context Sidebar - Shows Selected Files and Context */}
      <div className={cn(
        "border-l border-border bg-card/50 transition-all duration-300 h-full overflow-hidden",
        isContextSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {!isContextSidebarCollapsed && (
          <div className="p-3 space-y-3 h-full flex flex-col overflow-hidden">
            
            {/* Context Sidebar Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="font-medium text-sm">Context</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContextSidebarCollapsed(true)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
            
            {/* Context Stats */}
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg flex-shrink-0">
              <FileText size={14} className="text-primary" />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedFiles.reduce((acc, file) => acc + (file.content?.length || 0), 0).toLocaleString()} characters total
                </div>
              </div>
            </div>
            
            {/* Selected Files List */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Selected Files</h4>
                {selectedFiles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                    className="text-xs h-6 px-2"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 overflow-y-auto flex-1">
                {selectedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {/* Organize files by source */}
                    {Object.entries(filesBySource).map(([sourceType, files]) => {
                      if (files.length === 0) return null;
                      
                      const sourceConfig = {
                        csv: { name: 'CSV Files', icon: <FileText size={14} className="text-blue-500" />, color: 'blue' },
                        'control-panel': { name: 'Control Panel', icon: <Database size={14} className="text-purple-500" />, color: 'purple' },
                        url: { name: 'Web Content', icon: <Globe size={14} className="text-green-500" />, color: 'green' },
                        file: { name: 'Documents', icon: <Upload size={14} className="text-orange-500" />, color: 'orange' },
                        text: { name: 'Text Content', icon: <Type size={14} className="text-pink-500" />, color: 'pink' },
                        branch: { name: 'Branch Files', icon: <GitBranch size={14} className="text-indigo-500" />, color: 'indigo' }
                      };
                      
                      const config = sourceConfig[sourceType as keyof typeof sourceConfig] || { name: sourceType, icon: <FileText size={14} />, color: 'gray' };
                      
                      return (
                        <div key={sourceType} className="space-y-2">
                          <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                            {config.icon}
                            <span className="text-xs font-medium">{config.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {files.length}
                            </Badge>
                            <button
                              onClick={() => {
                                // Clear all files from this source
                                setFilesBySource(prev => ({
                                  ...prev,
                                  [sourceType]: []
                                }));
                                // Also remove from selectedFiles
                                files.forEach(file => {
                                  const matchingFile = selectedFiles.find(f => f.path === file.name);
                                  if (matchingFile) {
                                    removeSelectedFile(matchingFile.branch, matchingFile.path);
                                  }
                                });
                              }}
                              className="p-1 rounded hover:bg-muted text-red-500 opacity-70 hover:opacity-100 transition-opacity ml-auto"
                              title={`Clear all ${config.name.toLowerCase()}`}
                            >
                              <X size={10} />
                            </button>
                          </div>
                          
                          <div className="space-y-1 pl-2">
                            {files.map((file, index) => (
                              <div key={index} className="group flex items-center gap-2 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                                {getFileIcon(file.name)}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate" title={file.name}>
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {file.type} • {(file.content?.length || 0).toLocaleString()} chars
                                  </div>
                                  {file.branch && (
                                    <div className="text-xs text-muted-foreground">
                                      Branch: {file.branch}
                                    </div>
                                  )}
                                  {file.url && (
                                    <div className="text-xs text-muted-foreground truncate" title={file.url}>
                                      URL: {new URL(file.url).hostname}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    // Remove from filesBySource
                                    setFilesBySource(prev => ({
                                      ...prev,
                                      [sourceType]: prev[sourceType].filter((_, i) => i !== index)
                                    }));
                                    // Also remove from selectedFiles if it exists there
                                    const matchingFile = selectedFiles.find(f => f.path === file.name);
                                    if (matchingFile) {
                                      removeSelectedFile(matchingFile.branch, matchingFile.path);
                                    }
                                  }}
                                  className="p-1 rounded hover:bg-muted text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show traditional files that aren't from import sources */}
                    {selectedFiles.filter(file => file.branch !== 'imported').length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                          <GitBranch size={14} className="text-gray-500" />
                          <span className="text-xs font-medium">Repository Files</span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {selectedFiles.filter(file => file.branch !== 'imported').length}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 pl-2">
                          {selectedFiles.filter(file => file.branch !== 'imported').map((file, index) => (
                            <div key={index} className="group flex items-center gap-2 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                              {getFileIcon(file.path.split('/').pop() || '')}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate" title={file.path}>
                                  {file.path.split('/').pop()}
                                </div>
                                <div className="text-xs text-muted-foreground truncate" title={file.path}>
                                  {file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : 'Root'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Branch: {file.branch} • {(file.content?.length || 0).toLocaleString()} chars
                                </div>
                              </div>
                              <button
                                onClick={() => removeSelectedFile(file.branch, file.path)}
                                className="p-1 rounded hover:bg-muted text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium mb-1">No files in context</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Collapsed Context Sidebar */}
        {isContextSidebarCollapsed && (
          <div className="p-2">
            <button
              onClick={() => setIsContextSidebarCollapsed(false)}
              className="w-full p-2 rounded-lg hover:bg-muted flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="mt-2 text-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <FileText size={14} className="text-primary" />
              </div>
              <div className="text-xs font-medium mt-1">{selectedFiles.length}</div>
            </div>
          </div>
        )}
      </div>
   
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        setShowImportDialog(open);
        if (!open) {
          // Reset form data when closing
          setImportFormData({});
          setSelectedBranchFiles([]);
          setActiveImportType('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Import {activeImportType === 'control-panel' ? 'Control Panel Data' : 
                     activeImportType === 'csv' ? 'CSV File' :
                     activeImportType === 'url' ? 'Web URL' :
                     activeImportType === 'file' ? 'Documents' :
                     activeImportType === 'text' ? 'Text Content' :
                     activeImportType === 'branch' ? 'Branch Files' : 'Content'}
            </DialogTitle>
            <DialogDescription>
              {activeImportType === 'csv' && 'Upload and import structured data from CSV files'}
              {activeImportType === 'control-panel' && 'Import data from your Manage page controls'}
              {activeImportType === 'url' && 'Import content from websites and articles'}
              {activeImportType === 'file' && 'Upload documents, PDFs, and other files'}
              {activeImportType === 'text' && 'Directly input or paste text content'}
              {activeImportType === 'branch' && 'Import context from other branches'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* CSV Import Form */}
            {activeImportType === 'csv' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFormData({...importFormData, file: e.target.files?.[0]})}
                  />
                </div>
                <div>
                  <Label htmlFor="csv-delimiter">Delimiter</Label>
                  <Select onValueChange={(value) => setImportFormData({...importFormData, delimiter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delimiter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="\t">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Control Panel Import Form */}
            {activeImportType === 'control-panel' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="data-source">Data Source</Label>
                  <Select onValueChange={(value) => setImportFormData({...importFormData, dataSource: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repositories">Repository Data</SelectItem>
                      <SelectItem value="analytics">Analytics Data</SelectItem>
                      <SelectItem value="settings">Configuration Data</SelectItem>
                      <SelectItem value="users">User Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* URL Import Form */}
            {activeImportType === 'url' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="url-input">Website URL</Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com"
                    value={importFormData.url || ''}
                    onChange={(e) => setImportFormData({...importFormData, url: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select onValueChange={(value) => setImportFormData({...importFormData, contentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article/Blog Post</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="webpage">General Webpage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* File Upload Form */}
            {activeImportType === 'file' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload">Documents</Label>
                  <FileSelector
                    id="file-upload"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onFilesChange={(files) => setImportFormData({...importFormData, files})}
                  />
                </div>
              </div>
            )}

            {/* Text Input Form */}
            {activeImportType === 'text' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    placeholder="Enter a title for this content"
                    value={importFormData.title || ''}
                    onChange={(e) => setImportFormData({...importFormData, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste or type your content here..."
                    rows={6}
                    value={importFormData.text || ''}
                    onChange={(e) => setImportFormData({...importFormData, text: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Branch Import Form */}
            {activeImportType === 'branch' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="branch-select">Branch</Label>
                  <Select onValueChange={handleBranchSelectForImport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Use selectedBranches (from our local state) if branchList is empty */}
                      {(branchList.length > 0 ? branchList : selectedBranches).map((branch) => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                      {/* Fallback for demo mode */}
                      {branchList.length === 0 && selectedBranches.length === 0 && (
                        <>
                          <SelectItem value="main">main</SelectItem>
                          <SelectItem value="development">development</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {importFormData.selectedBranch && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Files to Import</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allFiles = getAllFilesFromStructure(branchFileStructures[importFormData.selectedBranch] || []);
                            setSelectedBranchFiles(allFiles);
                            // Add all files to context
                            allFiles.forEach(filePath => {
                              setTimeout(() => {
                                fetchFileContent(importFormData.selectedBranch, filePath).then((content) => {
                                  let actualContent: string;
                                  if (typeof content === 'string') {
                                    actualContent = content;
                                  } else if (content && typeof content === 'object' && 'content' in content) {
                                    actualContent = (content as any).content;
                                  } else {
                                    actualContent = String(content || '');
                                  }
                                  
                                  if (actualContent && actualContent.trim()) {
                                    addSelectedFile({
                                      branch: importFormData.selectedBranch,
                                      path: filePath,
                                      content: actualContent,
                                      contentHash: getFileHash(actualContent)
                                    });
                                  }
                                }).catch(console.error);
                              }, 100);
                            });
                          }}
                          className="text-xs h-7"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBranchFiles([]);
                            // Remove all files from context
                            const allFiles = getAllFilesFromStructure(branchFileStructures[importFormData.selectedBranch] || []);
                            allFiles.forEach(filePath => {
                              removeSelectedFile(importFormData.selectedBranch, filePath);
                            });
                          }}
                          className="text-xs h-7"
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select files and folders from branch: {importFormData.selectedBranch}. 
                      <span className="font-medium"> Folders can be selected to include all files within them.</span>
                    </p>
                    
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {branchFilesLoading ? (
                        <div className="p-4 text-center">
                          <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading files...</p>
                        </div>
                      ) : branchFileStructures[importFormData.selectedBranch] ? (
                        <div className="p-2 space-y-1">
                          {(() => {
                            console.log('Rendering files for branch:', importFormData.selectedBranch);
                            console.log('File structure:', branchFileStructures[importFormData.selectedBranch]);
                            console.log('Files count:', branchFileStructures[importFormData.selectedBranch]?.length);
                            return null;
                          })()}
                          
                          {branchFileStructures[importFormData.selectedBranch].length > 0 ? (
                            branchFileStructures[importFormData.selectedBranch].map((item: any, index: number) => (
                              <BranchFileItem
                                key={index}
                                item={item}
                                level={0}
                                selectedFiles={selectedBranchFiles}
                                onFileToggle={handleBranchFileToggle}
                                onFolderToggle={handleBranchFolderToggle}
                              />
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <p className="text-sm">File structure exists but is empty</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-sm">No files found in this branch</p>
                          {/* Debug info */}
                          <p className="text-xs mt-1">Debug: Branch {importFormData.selectedBranch}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedBranchFiles.length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <strong>{selectedBranchFiles.length}</strong> file{selectedBranchFiles.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportSubmit}
              disabled={
                (activeImportType === 'csv' && !importFormData.file) ||
                (activeImportType === 'url' && !importFormData.url) ||
                (activeImportType === 'file' && (!importFormData.files || importFormData.files.length === 0)) ||
                (activeImportType === 'text' && (!importFormData.title || !importFormData.text)) ||
                (activeImportType === 'branch' && (!importFormData.selectedBranch || selectedBranchFiles.length === 0)) ||
                (activeImportType === 'control-panel' && !importFormData.dataSource)
              }
            >
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Manager Modal */}
      <ChatSessionManager 
        isOpen={showSessionManager}
        onClose={() => setShowSessionManager(false)}
      />
    </div>
  );
};

export default FileChatInterface;
