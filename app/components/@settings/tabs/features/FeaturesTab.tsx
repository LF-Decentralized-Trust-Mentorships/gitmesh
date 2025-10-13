import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '~/components/ui/Switch';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';

interface FeatureToggle {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  beta?: boolean;
  experimental?: boolean;
  tooltip?: string;
}

export default function FeaturesTab() {
  // Use local state instead of stores to avoid potential issues
  const [features, setFeatures] = useState({
    latestBranch: false,
    autoSelectTemplate: true,
    contextOptimization: true,
    eventLogs: true,
  });

  const [promptId, setPromptId] = useState('default');

  const handleToggleFeature = useCallback((id: string, enabled: boolean) => {
    setFeatures((prev) => ({ ...prev, [id]: enabled }));

    switch (id) {
      case 'latestBranch':
        toast.success(`Main branch updates ${enabled ? 'enabled' : 'disabled'}`);
        break;
      case 'autoSelectTemplate':
        toast.success(`Auto select template ${enabled ? 'enabled' : 'disabled'}`);
        break;
      case 'contextOptimization':
        toast.success(`Context optimization ${enabled ? 'enabled' : 'disabled'}`);
        break;
      case 'eventLogs':
        toast.success(`Event logging ${enabled ? 'enabled' : 'disabled'}`);
        break;
    }
  }, []);

  const featureList: FeatureToggle[] = [
    {
      id: 'latestBranch',
      title: 'Main Branch Updates',
      description: 'Get the latest updates from the main branch',
      icon: 'i-ph:git-branch',
      enabled: features.latestBranch,
      tooltip: 'Enabled by default to receive updates from the main development branch',
    },
    {
      id: 'autoSelectTemplate',
      title: 'Auto Select Template',
      description: 'Automatically select starter template',
      icon: 'i-ph:selection',
      enabled: features.autoSelectTemplate,
      tooltip: 'Enabled by default to automatically select the most appropriate starter template',
    },
    {
      id: 'contextOptimization',
      title: 'Context Optimization',
      description: 'Optimize context for better responses',
      icon: 'i-ph:brain',
      enabled: features.contextOptimization,
      tooltip: 'Enabled by default for improved AI responses',
    },
    {
      id: 'eventLogs',
      title: 'Event Logging',
      description: 'Enable detailed event logging and history',
      icon: 'i-ph:list-bullets',
      enabled: features.eventLogs,
      tooltip: 'Enabled by default to record detailed logs of system events and user actions',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Core Features Section */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="i-ph:check-circle text-xl text-blue-500" />
          <div>
            <h3 className="text-lg font-medium text-gitmesh-elements-textPrimary">Core Features</h3>
            <p className="text-sm text-gitmesh-elements-textSecondary">
              Essential features that are enabled by default for optimal performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureList.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={classNames(
                'relative group cursor-pointer',
                'bg-gitmesh-elements-background-depth-1',
                'hover:bg-gitmesh-elements-background-depth-3',
                'transition-colors duration-200',
                'rounded-lg overflow-hidden',
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={classNames(feature.icon, 'w-5 h-5 text-gitmesh-elements-textSecondary')} />
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gitmesh-elements-textPrimary">{feature.title}</h4>
                      {feature.beta && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 font-medium">
                          Beta
                        </span>
                      )}
                      {feature.experimental && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/10 text-orange-500 font-medium">
                          Experimental
                        </span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={(checked) => handleToggleFeature(feature.id, checked)}
                  />
                </div>
                <p className="mt-2 text-sm text-gitmesh-elements-textSecondary">{feature.description}</p>
                {feature.tooltip && (
                  <p className="mt-1 text-xs text-gitmesh-elements-textTertiary">{feature.tooltip}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Prompt Library Section */}
      <motion.div
        className={classNames(
          'bg-gitmesh-elements-background-depth-1',
          'hover:bg-gitmesh-elements-background-depth-3',
          'transition-all duration-200',
          'rounded-lg p-4',
          'group',
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={classNames(
              'p-2 rounded-lg text-xl',
              'bg-gitmesh-elements-background-depth-3 group-hover:bg-gitmesh-elements-background-depth-4',
              'transition-colors duration-200',
              'text-blue-500',
            )}
          >
            <div className="i-ph:book" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gitmesh-elements-textPrimary group-hover:text-blue-500 transition-colors">
              Prompt Library
            </h4>
            <p className="text-xs text-gitmesh-elements-textSecondary mt-0.5">
              Choose a prompt from the library to use as the system prompt
            </p>
          </div>
          <select
            value={promptId}
            onChange={(e) => {
              setPromptId(e.target.value);
              toast.success('Prompt template updated');
            }}
            className={classNames(
              'p-2 rounded-lg text-sm min-w-[200px]',
              'bg-gitmesh-elements-background-depth-3 border border-gitmesh-elements-borderColor',
              'text-gitmesh-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
              'group-hover:border-blue-500/30',
              'transition-all duration-200',
            )}
          >
            <option value="default">Default</option>
            <option value="enhanced">Enhanced</option>
            <option value="creative">Creative</option>
            <option value="technical">Technical</option>
            <option value="concise">Concise</option>
          </select>
        </div>
      </motion.div>
    </div>
  );
}
