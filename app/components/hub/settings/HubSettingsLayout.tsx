import { useLocation, NavLink, Navigate } from '@remix-run/react';
import { motion } from 'framer-motion';

interface HubSettingsLayoutProps {
  children: React.ReactNode;
}

export function HubSettingsLayout({ children }: HubSettingsLayoutProps) {
  const location = useLocation();

  const settingsNavItems = [
    {
      to: '/hub/settings/profile',
      label: 'Profile',
      icon: 'i-ph:user-duotone',
      description: 'Manage your profile and account settings',
    },
    {
      to: '/hub/settings/general',
      label: 'Settings',
      icon: 'i-ph:gear-duotone',
      description: 'Configure application preferences',
    },
    {
      to: '/hub/settings/features',
      label: 'Features',
      icon: 'i-ph:star-duotone',
      description: 'Explore new and upcoming features',
    },
    {
      to: '/hub/settings/data',
      label: 'Data Management',
      icon: 'i-ph:database-duotone',
      description: 'Manage your data and storage',
    },
    {
      to: '/hub/settings/cloud-providers',
      label: 'Cloud Providers',
      icon: 'i-ph:cloud-duotone',
      description: 'Configure cloud AI providers and models',
    },
    {
      to: '/hub/settings/local-providers',
      label: 'Local Providers',
      icon: 'i-ph:desktop-duotone',
      description: 'Configure local AI providers and models',
    },
    {
      to: '/hub/settings/github',
      label: 'GitHub',
      icon: 'i-ph:github-logo',
      description: 'Connect and manage GitHub integration',
    },
    {
      to: '/hub/settings/gitlab',
      label: 'GitLab',
      icon: 'i-ph:gitlab-logo',
      description: 'Connect and manage GitLab integration',
    },
    {
      to: '/hub/settings/netlify',
      label: 'Netlify',
      icon: 'i-ph:globe-duotone',
      description: 'Configure Netlify deployment settings',
    },
    {
      to: '/hub/settings/vercel',
      label: 'Vercel',
      icon: 'i-ph:triangle-duotone',
      description: 'Manage Vercel projects and deployments',
    },
    {
      to: '/hub/settings/supabase',
      label: 'Supabase',
      icon: 'i-ph:cylinder-duotone',
      description: 'Setup Supabase database connection',
    },
    {
      to: '/hub/settings/event-logs',
      label: 'Event Logs',
      icon: 'i-ph:list-duotone',
      description: 'View system events and logs',
    },
    {
      to: '/hub/settings/mcp',
      label: 'MCP Servers',
      icon: 'i-ph:wrench-duotone',
      description: 'Configure MCP (Model Context Protocol) servers',
    },
  ];

  // If we're on the root settings path, redirect to profile
  if (location.pathname === '/hub/settings' || location.pathname === '/hub/settings/') {
    return <Navigate to="/hub/settings/profile" replace />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold text-gitmesh-elements-textPrimary">Settings</h1>
        <p className="text-gitmesh-elements-textSecondary">
          Manage your preferences, integrations, and account settings.
        </p>
      </motion.div>

      {/* Settings Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {settingsNavItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  group p-4 rounded-lg transition-all duration-200 border border-gitmesh-elements-borderColor
                  ${
                    isActive
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-500/50'
                  }
                `}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="text-center space-y-2"
                >
                  <div
                    className={`
                      w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-colors
                      ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gitmesh-elements-background-depth-1 text-gitmesh-elements-textSecondary group-hover:bg-blue-500/20 group-hover:text-blue-500'
                      }
                    `}
                  >
                    <div className={`${item.icon} w-4 h-4`} />
                  </div>
                  <div>
                    <h3
                      className={`
                        font-medium text-sm transition-colors
                        ${isActive ? 'text-blue-500' : 'text-gitmesh-elements-textPrimary group-hover:text-blue-500'}
                      `}
                    >
                      {item.label}
                    </h3>
                    <p className="text-xs text-gitmesh-elements-textSecondary group-hover:text-gitmesh-elements-textPrimary mt-0.5 line-clamp-2 transition-colors">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </motion.div>

      {/* Settings Content */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor"
      >
        {children}
      </motion.div>
    </div>
  );
}
