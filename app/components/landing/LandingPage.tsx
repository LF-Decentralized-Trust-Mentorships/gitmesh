import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Navigate, Link } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { auth, isSupabaseConfigured } from '~/lib/supabase';
import { authStore, initializeAuth } from '~/lib/stores/auth';
import { isGitHubConnected } from '~/lib/stores/githubConnection';
import { isGitLabConnected } from '~/lib/stores/gitlabConnection';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { IconGoogle } from '~/components/icons/IconGoogle';

const isDevelopment = import.meta.env.DEV;

interface LandingPageProps {}

export default function LandingPage({}: LandingPageProps) {
  const { user, loading, initialized } = useStore(authStore);
  const isGithubConnected = useStore(isGitHubConnected);
  const isGitlabConnected = useStore(isGitLabConnected);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized]);

  // Redirect to appropriate page based on user authentication and integration status
  if (user && !loading) {
    // Check if user has any integrations
    const hasAnyIntegration = isGithubConnected || isGitlabConnected;

    if (hasAnyIntegration) {
      // User has integrations, go to hub overview
      return <Navigate to="/hub/overview" replace />;
    } else {
      // User authenticated but no integrations, go to setup
      return <Navigate to="/setup" replace />;
    }
  }

  const handleGoogleSignIn = async () => {
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const { error } = await auth.signInWithGoogle();

      if (error) {
        setError(error.message);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      const { error } =
        authMode === 'signin'
          ? await auth.signInWithEmail(email, password)
          : await auth.signUpWithEmail(email, password);

      if (error) {
        setError(error.message);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestContinue = () => {
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    // In development mode, allow guest access
    window.location.href = '/hub';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gitmesh-elements-background-depth-1">
        <div className="text-gitmesh-elements-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gitmesh-elements-background-depth-1 flex flex-col">
      <BackgroundRays />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/favicon.png" alt="GitMesh Logo" className="w-10 h-10" draggable={false} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gitmesh-elements-textPrimary mb-2">Welcome to GitMesh</h2>
            <p className="text-gitmesh-elements-textSecondary text-lg">Git Collaboration Network for OSS</p>
          </div>

          {/* Authentication Form */}
          <div className="bg-gitmesh-elements-background-depth-1 rounded-lg p-6 border border-gitmesh-elements-borderColor">
            {isDevelopment || !isSupabaseConfigured() ? (
              // Development Mode or Supabase not configured - Guest Access
              <div className="space-y-4">
                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-dev"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);

                      if (
                        e.target.checked &&
                        error === 'Please accept the Terms of Service and Privacy Policy to continue'
                      ) {
                        setError(null);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 text-gitmesh-elements-button-primary-background bg-transparent border border-gitmesh-elements-borderColor rounded focus:ring-gitmesh-elements-button-primary-background focus:ring-2"
                  />
                  <label htmlFor="terms-dev" className="text-sm text-gitmesh-elements-textSecondary">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-blue hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
                <Button
                  onClick={handleGuestContinue}
                  className="w-full h-11 bg-gitmesh-elements-button-primary-background dark:bg-gitmesh-elements-button-primary-background hover:bg-gitmesh-elements-button-primary-backgroundHover text-white font-medium"
                  disabled={authLoading || !acceptedTerms}
                >
                  Continue as Guest
                </Button>

                {isSupabaseConfigured() && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gitmesh-elements-borderColor" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gitmesh-elements-background-depth-1 px-2 text-gitmesh-elements-textSecondary">
                          Or sign in
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleGoogleSignIn}
                      variant="outline"
                      className="w-full h-11 font-medium"
                      disabled={authLoading}
                    >
                      <IconGoogle className="w-5 h-5 mr-2" />
                      Continue with Google
                    </Button>
                  </>
                )}

                {!isSupabaseConfigured() && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">Authentication not configured. Running in guest mode.</p>
                  </div>
                )}
              </div>
            ) : (
              // Production Mode - Authentication Required
              <div className="space-y-4">
                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-prod"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);

                      if (
                        e.target.checked &&
                        error === 'Please accept the Terms of Service and Privacy Policy to continue'
                      ) {
                        setError(null);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 text-gitmesh-elements-button-primary-background bg-transparent border border-gitmesh-elements-borderColor rounded focus:ring-gitmesh-elements-button-primary-background focus:ring-2"
                  />
                  <label htmlFor="terms-prod" className="text-sm text-gitmesh-elements-textSecondary">
                    I agree to the{' '}
                    <Link to="/terms" target="_blank" className="text-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-blue hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 bg-gitmesh-elements-button-primary-background hover:bg-gitmesh-elements-button-primary-backgroundHover text-white font-medium"
                  disabled={authLoading || !acceptedTerms}
                >
                  <IconGoogle className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gitmesh-elements-borderColor" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gitmesh-elements-background-depth-1 px-2 text-gitmesh-elements-textSecondary">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required
                  />

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    disabled={authLoading || !acceptedTerms}
                  >
                    {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                      setError(null);
                    }}
                    className="text-sm text-gitmesh-elements-textSecondary hover:text-gitmesh-elements-textPrimary transition-colors"
                  >
                    {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
