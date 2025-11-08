import { Dialog, DialogClose, DialogRoot, DialogTitle, DialogDescription } from '~/components/ui/Dialog';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Label } from '~/components/ui/Label';
import { Switch } from '~/components/ui/Switch';
import { useState } from 'react';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';

// Define the shape of the successful API response
interface NewRepoResponse {
  clone_url: string;
  full_name: string;
}

// Define a basic shape for a potential backend error response
interface ErrorResponse {
  details?: string;
}

interface CreateNewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateNewProjectDialog({ isOpen, onClose }: CreateNewProjectDialogProps) {
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github-create-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoName,
          description,
          isPrivate,
          autoInit: includeReadme, // Send readme preference to API
        }),
      });

      if (!response.ok) {
        // FIX 2: Add a type assertion for the error data.
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.details || 'Failed to create repository');
      }

      const newRepo = (await response.json()) as NewRepoResponse;
      toast.success(`Successfully created repository ${newRepo.full_name}! Cloning...`);
      sessionStorage.setItem('projects-need-refresh', 'true');

      onClose();

      if (newRepo.clone_url) {
        const chatUrl = `/chat?clone=${encodeURIComponent(newRepo.clone_url)}&repo=${encodeURIComponent(repoName)}&fullName=${encodeURIComponent(newRepo.full_name)}&provider=github&from=hub`;
        window.location.href = chatUrl;
      } else {
        throw new Error('Could not find a clone URL in the API response.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <Dialog showCloseButton={true} onClose={onClose}>
        <div className="p-6">
          <DialogTitle>
            <div className="i-ph:github-logo w-6 h-6" />
            Create New Project
          </DialogTitle>
          <DialogDescription>Create a new GitHub repository under your account.</DialogDescription>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* ... The rest of your JSX remains the same ... */}
          <div className="space-y-2">
            <Label htmlFor="repo-name" className="text-gitmesh-elements-textPrimary">
              Repository Name
            </Label>
            <Input
              id="repo-name"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-awesome-project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gitmesh-elements-textPrimary">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your project."
            />
          </div>
          <div className="space-y-3">
            <Label className="text-gitmesh-elements-textPrimary">Visibility</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={classNames(
                  'p-4 rounded-lg border cursor-pointer transition-all',
                  !isPrivate
                    ? 'bg-blue-500/10 border-blue-500'
                    : 'border-gitmesh-elements-borderColor hover:bg-blue-500/5',
                )}
                onClick={() => setIsPrivate(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="i-ph:globe-duotone w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gitmesh-elements-textPrimary">Public</p>
                    <p className="text-sm text-gitmesh-elements-textSecondary">
                      Anyone on the internet can see this repository.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={classNames(
                  'p-4 rounded-lg border cursor-pointer transition-all',
                  isPrivate
                    ? 'bg-blue-500/10 border-blue-500'
                    : 'border-gitmesh-elements-borderColor hover:bg-blue-500/5',
                )}
                onClick={() => setIsPrivate(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="i-ph:lock-duotone w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gitmesh-elements-textPrimary">Private</p>
                    <p className="text-sm text-gitmesh-elements-textSecondary">
                      You choose who can see and commit to this repository.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="include-readme" className="text-gitmesh-elements-textPrimary font-medium">
                Add README
              </Label>
              <p className="text-sm text-gitmesh-elements-textSecondary">READMEs can be used as longer descriptions.</p>
            </div>
            <Switch checked={includeReadme} onCheckedChange={setIncludeReadme} />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gitmesh-elements-background-depth-1 border-t border-gitmesh-elements-borderColor flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={isLoading || !repoName}
            className="bg-gitmesh-elements-item-backgroundAccent text-gitmesh-elements-item-contentAccent hover:bg-gitmesh-elements-button-primary-backgroundHover"
          >
            {isLoading ? (
              <div className="i-ph:spinner-gap-bold animate-spin w-5 h-5" />
            ) : (
              <div className="i-ph:plus-circle-duotone w-5 h-5" />
            )}
            <span>{isLoading ? 'Creating...' : 'Create Project'}</span>
          </Button>
        </div>
      </Dialog>
    </DialogRoot>
  );
}
