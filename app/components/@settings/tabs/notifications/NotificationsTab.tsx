import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { motion } from 'framer-motion';
import { logStore } from '~/lib/stores/logs';
import { formatDistanceToNow } from 'date-fns';
import { classNames } from '~/utils/classNames';
import { Dropdown, DropdownSeparator } from '~/components/ui/Dropdown';

type FilterType = 'all' | 'system' | 'error' | 'warning' | 'update' | 'info' | 'provider' | 'network';

interface NotificationDetails {
  type?: string;
  message?: string;
  currentVersion?: string;
  latestVersion?: string;
  branch?: string;
  updateUrl?: string;
}

export function NotificationsTab() {
  const [filter, setFilter] = useState<FilterType>('all');
  const logs = useStore(logStore.logs);

  useEffect(() => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      logStore.logPerformanceMetric('NotificationsTab', 'mount-duration', duration);
    };
  }, []);

  const handleClearNotifications = () => {
    const count = Object.keys(logs).length;
    logStore.logInfo('Cleared notifications', {
      type: 'notification_clear',
      message: `Cleared ${count} notifications`,
      clearedCount: count,
      component: 'notifications',
    });
    logStore.clearLogs();
  };

  const handleUpdateAction = (updateUrl: string) => {
    logStore.logInfo('Update link clicked', {
      type: 'update_click',
      message: 'User clicked update link',
      updateUrl,
      component: 'notifications',
    });
    window.open(updateUrl, '_blank');
  };

  const handleFilterChange = (newFilter: FilterType) => {
    logStore.logInfo('Notification filter changed', {
      type: 'filter_change',
      message: `Filter changed to ${newFilter}`,
      previousFilter: filter,
      newFilter,
      component: 'notifications',
    });
    setFilter(newFilter);
  };

  const filteredLogs = Object.values(logs)
    .filter((log) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'update') {
        return log.details?.type === 'update';
      }

      if (filter === 'system') {
        return log.category === 'system';
      }

      if (filter === 'provider') {
        return log.category === 'provider';
      }

      if (filter === 'network') {
        return log.category === 'network';
      }

      return log.level === filter;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getNotificationStyle = (level: string, type?: string) => {
    if (type === 'update') {
      return {
        icon: 'i-ph:arrow-circle-up',
        color: 'text-blue-500 dark:text-blue-400',
        bg: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/20',
      };
    }

    switch (level) {
      case 'error':
        return {
          icon: 'i-ph:warning-circle',
          color: 'text-red-500 dark:text-red-400',
          bg: 'hover:bg-red-500/10 dark:hover:bg-red-500/20',
        };
      case 'warning':
        return {
          icon: 'i-ph:warning',
          color: 'text-yellow-500 dark:text-yellow-400',
          bg: 'hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20',
        };
      case 'info':
        return {
          icon: 'i-ph:info',
          color: 'text-blue-500 dark:text-blue-400',
          bg: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/20',
        };
      default:
        return {
          icon: 'i-ph:bell',
          color: 'text-gray-500 dark:text-gray-400',
          bg: 'hover:bg-gray-500/10 dark:hover:bg-gray-500/20',
        };
    }
  };

  const renderNotificationDetails = (details: NotificationDetails) => {
    if (details.type === 'update') {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">{details.message}</p>
          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-500">
            <p>Current Version: {details.currentVersion}</p>
            <p>Latest Version: {details.latestVersion}</p>
            <p>Branch: {details.branch}</p>
          </div>
          <button
            onClick={() => details.updateUrl && handleUpdateAction(details.updateUrl)}
            className={classNames(
              'mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium',
              'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
              'border border-[#E5E5E5] dark:border-[#1A1A1A]',
              'text-gray-900 dark:text-white',
              'hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all duration-200',
            )}
          >
            <span className="i-ph:git-branch text-lg" />
            View Changes
          </button>
        </div>
      );
    }

    return details.message ? <p className="text-sm text-gray-600 dark:text-gray-400">{details.message}</p> : null;
  };

  const filterOptions: { id: FilterType; label: string; icon: string; color: string }[] = [
    { id: 'all', label: 'All', icon: 'i-ph:bell', color: '#3b82f6' },
    { id: 'system', label: 'System', icon: 'i-ph:gear', color: '#6b7280' },
    { id: 'update', label: 'Updates', icon: 'i-ph:arrow-circle-up', color: '#3b82f6' },
    { id: 'error', label: 'Errors', icon: 'i-ph:warning-circle', color: '#ef4444' },
    { id: 'warning', label: 'Warnings', icon: 'i-ph:warning', color: '#f59e0b' },
    { id: 'info', label: 'Info', icon: 'i-ph:info', color: '#3b82f6' },
    { id: 'provider', label: 'Providers', icon: 'i-ph:robot', color: '#10b981' },
    { id: 'network', label: 'Network', icon: 'i-ph:wifi-high', color: '#6366f1' },
  ];

  const trigger = (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-gitmesh-elements-textSecondary bg-gitmesh-elements-background-depth-1 hover:text-gitmesh-elements-textPrimary hover:bg-gitmesh-elements-background-depth-2"
      title="Notifications"
    >
      <div className="i-ph:bell-duotone w-6 h-6" />
      <div className="i-ph:caret-down w-4 h-4" />
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="end" sideOffset={8}>
      {/* Header */}
      <div className="flex items-center justify-between w-full px-2 py-1">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Notifications</span>
        <button
          onClick={handleClearNotifications}
          className={classNames(
            'flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-colors',
            'text-gray-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
          )}
        >
          <span className="i-ph:trash text-sm" />
          Clear All
        </button>
      </div>

      <DropdownSeparator />

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        {filterOptions.map((opt) => {
          const isActive = filter === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleFilterChange(opt.id)}
              type="button"
              aria-pressed={isActive}
              className={classNames(
                'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
                // Set background based on active state & dark mode
                isActive
                  ? 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              <span className={classNames(opt.icon, 'text-sm')} />
              {opt.label}
            </button>
          );
        })}
      </div>

      <DropdownSeparator />

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto px-2 py-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-gray-500 dark:text-gray-400">
            <span className="i-ph:bell-slash text-2xl" />
            <p className="text-sm">No Notifications</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const style = getNotificationStyle(log.level, log.details?.type);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={classNames(
                  'flex flex-col gap-1 p-3 mb-1 rounded-lg border border-[#E5E5E5] dark:border-[#1A1A1A] bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                  style.bg,
                  'transition-all duration-200',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className={classNames('text-base', style.icon, style.color)} />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{log.message}</h3>
                      {log.details && renderNotificationDetails(log.details as NotificationDetails)}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.category}
                        {log.subCategory ? ` > ${log.subCategory}` : ''}
                      </p>
                    </div>
                  </div>
                  <time className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </time>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Dropdown>
  );
}

export default NotificationsTab;
