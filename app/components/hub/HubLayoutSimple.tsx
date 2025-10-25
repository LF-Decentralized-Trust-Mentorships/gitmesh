import { useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from '@remix-run/react';
import { motion } from 'framer-motion';
import { SafeAnimatePresence } from '~/components/ui/SafeAnimatePresence';
import { useStore } from '@nanostores/react';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { isGitHubConnected } from '~/lib/stores/githubConnection';
import { isGitLabConnected } from '~/lib/stores/gitlabConnection';
import { ProfileButton } from './ProfileButton';
import NotificationsTab from '~/components/@settings/tabs/notifications/NotificationsTab';

interface HubLayoutProps {
  children: React.ReactNode;
}

export function HubLayout({ children }: HubLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isGithubConnected = useStore(isGitHubConnected);
  const isGitlabConnected = useStore(isGitLabConnected);

  const hasAnyIntegration = isGithubConnected || isGitlabConnected;

  useEffect(() => {
    // Redirect to setup if no integrations are connected (except for setup page itself)
    if (!hasAnyIntegration && !location.pathname.includes('/setup')) {
      navigate('/setup', { replace: true });
      return;
    }

    // Redirect to overview if on hub root and integrations are set up
    if ((location.pathname === '/hub' || location.pathname === '/hub/') && hasAnyIntegration) {
      navigate('/hub/overview', { replace: true });
    }
  }, [location.pathname, navigate, hasAnyIntegration]);

  const navItems = [
    { to: '/hub/overview', label: 'Overview', icon: 'i-ph:chart-line-duotone' },
    { to: '/hub/projects', label: 'Projects', icon: 'i-ph:folder-duotone' },
    { to: '/hub/settings', label: 'Settings', icon: 'i-ph:gear-duotone' },
  ];

  return (
    <div className="min-h-screen bg-gitmesh-elements-background-depth-1 flex flex-col">
      <BackgroundRays />

      {/* Top Navigation - Fixed */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gitmesh-elements-borderColor bg-gitmesh-elements-background-depth-1/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => (window.location.href = '/hub')}>
              <img src="/favicon.png" alt="GitMesh Logo" className="w-8 h-8 rounded-lg object-cover" />
              <h1 className="text-xl font-semibold text-gitmesh-elements-textPrimary">GitMesh Hub</h1>
            </div>
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-gitmesh-elements-button-primary-background text-white'
                        : 'text-gitmesh-elements-textSecondary hover:text-gitmesh-elements-textPrimary hover:bg-gitmesh-elements-background-depth-3'
                    }
                  `}
                >
                  <div className={`${item.icon} w-4 h-4`} />
                  {item.label}
                </NavLink>
              ))}
              <NotificationsTab />
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-16">
        <SafeAnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto px-6 py-8"
          >
            {children}
          </motion.div>
        </SafeAnimatePresence>
      </main>
    </div>
  );
}

// Export with both names for compatibility
export { HubLayout as HubLayoutSimple };
