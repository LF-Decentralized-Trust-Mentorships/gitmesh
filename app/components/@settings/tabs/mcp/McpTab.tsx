import { useEffect, useMemo, useState } from 'react';
import { classNames } from '~/utils/classNames';
import type { MCPConfig } from '~/lib/services/mcpService';
import { toast } from 'react-toastify';
import { useMCPStore } from '~/lib/stores/mcp';
import McpServerList from '~/components/@settings/tabs/mcp/McpServerList';

const getUvxPath = () => {
  if (process.platform === 'win32') {
    const userProfile = process.env.USERPROFILE || process.env.HOME;
    const localAppData = process.env.LOCALAPPDATA;

    if (userProfile) {
      return `${userProfile}\\.local\\bin;${localAppData}\\Programs\\uv\\bin;${process.env.PATH || ''}`;
    }

    return process.env.PATH || '';
  } else {
    return process.env.HOME ? `${process.env.HOME}/.local/bin:${process.env.PATH || ''}` : process.env.PATH || '';
  }
};

const EXAMPLE_MCP_CONFIG: MCPConfig = {
  mcpServers: {
    sonarqube: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', 'sonarqube-mcp-server@latest'],
      env: {
        SONARQUBE_URL: import.meta.env.VITE_SONAR_HOST_URL || 'https://sonarcloud.io',
        SONARQUBE_TOKEN: import.meta.env.VITE_SONAR_TOKEN || '',
        SONARQUBE_ORGANIZATION: import.meta.env.VITE_SONAR_ORG || '',
      },
    },

    fetch: {
      type: 'stdio',
      command: 'uvx',
      args: ['mcp-server-fetch'],
      env: {
        PATH: getUvxPath(),
        HOME: process.env.HOME || process.env.USERPROFILE || '',
      },
    },

    git: {
      type: 'stdio',
      command: 'uvx',
      args: ['mcp-server-git'],
      env: {
        PATH: getUvxPath(),
        HOME: process.env.HOME || process.env.USERPROFILE || '',
      },
    },

    deepwiki: {
      type: 'streamable-http',
      url: import.meta.env.VITE_DEEPWIKI_URL || 'https://mcp.deepwiki.com/mcp',
    },

    sentry: {
      type: 'stdio',
      command: 'uvx',
      args: ['mcp-server-sentry'],
      env: {
        PATH: getUvxPath(),
        HOME: process.env.HOME || process.env.USERPROFILE || '',
        SENTRY_TOKEN: import.meta.env.VITE_SENTRY_TOKEN || '',
        SENTRY_ORG: import.meta.env.VITE_SENTRY_ORG || '',
      },
    },

    docker: {
      type: 'stdio',
      command: 'uvx',
      args: ['mcp-server-docker'],
      env: {
        DOCKER_HOST: import.meta.env.VITE_DOCKER_HOST || '',
        PATH: getUvxPath(),
        HOME: process.env.HOME || process.env.USERPROFILE || '',
      },
    },

    atlassian: {
      type: 'stdio',
      command: 'docker',
      args: [
        'run',
        '-i',
        '--rm',
        '-e',
        'CONFLUENCE_URL',
        '-e',
        'CONFLUENCE_USERNAME',
        '-e',
        'CONFLUENCE_API_TOKEN',
        '-e',
        'JIRA_URL',
        '-e',
        'JIRA_USERNAME',
        '-e',
        'JIRA_API_TOKEN',
        'ghcr.io/sooperset/mcp-atlassian:latest',
      ],
      env: {
        CONFLUENCE_URL: import.meta.env.VITE_CONFLUENCE_URL || '',
        CONFLUENCE_USERNAME: import.meta.env.VITE_CONFLUENCE_USERNAME || '',
        CONFLUENCE_API_TOKEN: import.meta.env.VITE_CONFLUENCE_API_TOKEN || '',
        JIRA_URL: import.meta.env.VITE_LOCAL_JIRA_BASE_URL || '',
        JIRA_USERNAME: import.meta.env.VITE_LOCAL_JIRA_EMAIL || '',
        JIRA_API_TOKEN: import.meta.env.VITE_LOCAL_JIRA_API_TOKEN || '',
      },
    },

    reddit: {
      type: 'stdio',
      command: 'uvx',
      args: ['--from', 'git+https://github.com/adhikasp/mcp-reddit.git', 'mcp-reddit'],
      env: {
        PATH: getUvxPath(),
        HOME: process.env.HOME || process.env.USERPROFILE || '',
      },
    },

    'brave-search': {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: import.meta.env.VITE_BRAVE_API_KEY || '',
      },
    },

    github: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_TOKEN: import.meta.env.VITE_GITHUB_ACCESS_TOKEN || '',
      },
    },

    memory: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    },

    kubernetes: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', 'mcp-server-kubernetes'],
    },

    jira: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: [
        '-y',
        '-p',
        '@orengrinker/jira-mcp-server',
        'node',
        'node_modules/@orengrinker/jira-mcp-server/dist/index.js',
      ],
      env: {
        JIRA_BASE_URL: import.meta.env.VITE_LOCAL_JIRA_BASE_URL || '',
        JIRA_EMAIL: import.meta.env.VITE_LOCAL_JIRA_EMAIL || '',
        JIRA_API_TOKEN: import.meta.env.VITE_LOCAL_JIRA_API_TOKEN || '',
        LOG_LEVEL: 'INFO',
      },
    },

    gitbook: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', 'gitbook-mcp', '--organization-id=' + (import.meta.env.VITE_GITBOOK_ORG_ID || '')],
      env: {
        GITBOOK_API_TOKEN: import.meta.env.VITE_GITBOOK_API_TOKEN || '',
      },
    },

    notion: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@notionhq/notion-mcp-server'],
      env: {
        NOTION_TOKEN: import.meta.env.VITE_NOTION_TOKEN || '',
      },
    },

    slack: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: {
        SLACK_BOT_TOKEN: import.meta.env.VITE_SLACK_BOT_TOKEN || '',
        SLACK_TEAM_ID: import.meta.env.VITE_SLACK_TEAM_ID || '',
        SLACK_CHANNEL_IDS: import.meta.env.VITE_SLACK_CHANNEL_IDS || '',
      },
    },

    'sequential-thinking': {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    },

    linear: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', 'linear-mcp-server'],
      env: {
        LINEAR_API_KEY: import.meta.env.VITE_LINEAR_API_KEY || '',
      },
    },

    puppeteer: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    },

    'github-actions': {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_TOKEN: import.meta.env.VITE_GITHUB_ACCESS_TOKEN || '',
      },
    },

    everything: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-everything'],
    },

    gitlab: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-gitlab'],
      env: {
        GITLAB_PERSONAL_ACCESS_TOKEN: import.meta.env.VITE_GITLAB_PERSONAL_ACCESS_TOKEN || '',
        GITLAB_API_URL: import.meta.env.VITE_GITLAB_API_URL || 'https://gitlab.com/api/v4',
      },
    },

    'gitlab-ci': {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-gitlab'],
      env: {
        GITLAB_PERSONAL_ACCESS_TOKEN: import.meta.env.VITE_GITLAB_PERSONAL_ACCESS_TOKEN || '',
        GITLAB_API_URL: import.meta.env.VITE_GITLAB_API_URL || 'https://gitlab.com/api/v4',
      },
    },

    circleci: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@circleci/mcp-server-circleci@latest'],
      env: {
        CIRCLECI_TOKEN: import.meta.env.VITE_CIRCLECI_TOKEN || '',
        CIRCLECI_BASE_URL: import.meta.env.VITE_CIRCLECI_BASE_URL || 'https://circleci.com',
      },
    },

    virustotal: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@burtthecoder/mcp-virustotal'],
      env: {
        VIRUSTOTAL_API_KEY: import.meta.env.VITE_VIRUSTOTAL_API_KEY || '',
      },
    },

    'azure-devops': {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@azure/mcp@latest', 'server', 'start'],
      env: {
        AZURE_DEVOPS_ORG_URL: import.meta.env.VITE_AZURE_DEVOPS_ORG_URL || '',
        AZURE_DEVOPS_PAT: import.meta.env.VITE_AZURE_DEVOPS_PAT || '',
      },
    },

    azure: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@azure/mcp@latest', 'server', 'start'],
      env: {
        AZURE_MCP_COLLECT_TELEMETRY: import.meta.env.VITE_AZURE_MCP_COLLECT_TELEMETRY || 'false',
      },
    },

    docs: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@arabold/docs-mcp-server@latest'],
      env: {
        OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
      },
    },

    postgres: {
      type: 'stdio',
      command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', import.meta.env.VITE_POSTGRES_CONNECTION_STRING || ''],
    },
    /*
     *the below mcp server is not yet working, it will be integerated soon
     * // SQLite server
     *sqlite: {
     *  type: 'stdio',
     *  command: 'uvx',
     *  args: ['mcp-server-sqlite', '--db-path', import.meta.env.VITE_SQLITE_DB_PATH || './data.db'],
     *  env: {
     *    PATH: getUvxPath(),
     *    HOME: process.env.HOME || process.env.USERPROFILE || '',
     *  },
     *},
     *
     *codecov: {
     *  type: 'stdio',
     *  command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
     *  args: ['-y', 'codecov-mcp-server'],
     *  env: {
     *    CODECOV_API_KEY: import.meta.env.VITE_CODECOV_API_KEY || '',
     *    GIT_URL: import.meta.env.VITE_CODECOV_GIT_URL || 'https://github.com/user/repo',
     *  },
     *},
     *
     *readwise: {
     *  type: 'stdio',
     *  command: 'uvx',
     *  args: ['--from', 'git+https://github.com/QuantGeekDev/readwise-reader-mcp.git', 'readwise-reader-mcp'],
     *  env: {
     *    PATH: getUvxPath(),
     *    HOME: process.env.HOME || process.env.USERPROFILE || '',
     *    READWISE_TOKEN: import.meta.env.VITE_READWISE_TOKEN || '',
     *  },
     *},
     *
     *snyk: {
     *  type: 'stdio',
     *  command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
     *  args: ['-y', '--package', 'snyk-mcp-server', 'snyk-mcp'],
     *  env: {
     *    SNYK_TOKEN: import.meta.env.VITE_SNYK_API_KEY || '',
     *    SNYK_ORG_ID: import.meta.env.VITE_SNYK_ORG_ID || '',
     *  },
     *},
     *
     *gdrive: {
     *  type: 'stdio',
     *  command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
     *  args: ['-y', '@modelcontextprotocol/server-gdrive'],
     *  env: {
     *    GDRIVE_CREDENTIALS_PATH: import.meta.env.VITE_GDRIVE_CREDENTIALS_PATH || '',
     *  },
     *},
     *
     *discord: {
     *  type: 'stdio',
     *  command: 'docker',
     *  args: [
     *    'run',
     *    '--rm',
     *    '-i',
     *    '--platform',
     *    'linux/amd64',
     *    '-e',
     *    DISCORD_TOKEN=${import.meta.env.VITE_DISCORD_TOKEN || ''},
     *    '-e',
     *    DISCORD_GUILD_ID=${import.meta.env.VITE_DISCORD_GUILD_ID || ''},
     *    'saseq/discord-mcp:latest',
     *  ],
     *},
     *
     *'github-dependabot': {
     *  type: 'stdio',
     *  command: 'uvx',
     *  args: ['--from', 'git+https://github.com/github/dependabot-mcp-server.git', 'dependabot-mcp'],
     *  env: {
     *    PATH: getUvxPath(),
     *    HOME: process.env.HOME || process.env.USERPROFILE || '',
     *    GITHUB_TOKEN: import.meta.env.VITE_GITHUB_ACCESS_TOKEN || '',
     *  },
     *},
     *
     *markdownify: {
     *  type: 'stdio',
     *  command: 'node',
     *  args: [import.meta.env.VITE_MARKDOWNIFY_PATH || ''],
     *  env: {
     *    UV_PATH: import.meta.env.VITE_UV_PATH || '',
     *    MD_SHARE_DIR: import.meta.env.VITE_MD_SHARE_DIR || '',
     *  },
     *},
     *
     *x: {
     *  type: 'stdio',
     *  command: 'node',
     *  args: [import.meta.env.VITE_X_SERVER_PATH || ''],
     *  env: {
     *    TWITTER_API_KEY: import.meta.env.VITE_TWITTER_API_KEY || '',
     *    TWITTER_API_SECRET: import.meta.env.VITE_TWITTER_API_SECRET || '',
     *    TWITTER_ACCESS_TOKEN: import.meta.env.VITE_TWITTER_ACCESS_TOKEN || '',
     *    TWITTER_ACCESS_SECRET: import.meta.env.VITE_TWITTER_ACCESS_SECRET || '',
     *  },
     *},
     */
  },
};

export default function McpTab() {
  const settings = useMCPStore((state) => state.settings);
  const isInitialized = useMCPStore((state) => state.isInitialized);
  const serverTools = useMCPStore((state) => state.serverTools);
  const initialize = useMCPStore((state) => state.initialize);
  const updateSettings = useMCPStore((state) => state.updateSettings);
  const checkServersAvailabilities = useMCPStore((state) => state.checkServersAvailabilities);

  const [isSaving, setIsSaving] = useState(false);
  const [mcpConfigText, setMCPConfigText] = useState('');
  const [maxLLMSteps, setMaxLLMSteps] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingServers, setIsCheckingServers] = useState(false);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize().catch((err) => {
        setError(`Failed to initialize MCP settings: ${err instanceof Error ? err.message : String(err)}`);
        toast.error('Failed to load MCP configuration');
      });
    }
  }, [isInitialized]);

  useEffect(() => {
    setMCPConfigText(JSON.stringify(settings.mcpConfig, null, 2));
    setMaxLLMSteps(settings.maxLLMSteps);
    setError(null);
  }, [settings]);

  const parsedConfig = useMemo(() => {
    try {
      setError(null);
      return JSON.parse(mcpConfigText) as MCPConfig;
    } catch (e) {
      setError(`Invalid JSON format: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }, [mcpConfigText]);

  const handleMaxLLMCallChange = (value: string) => {
    setMaxLLMSteps(parseInt(value, 10));
  };

  const handleSave = async () => {
    if (!parsedConfig) {
      return;
    }

    setIsSaving(true);

    try {
      await updateSettings({
        mcpConfig: parsedConfig,
        maxLLMSteps,
      });
      toast.success('MCP configuration saved');

      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save configuration');
      toast.error('Failed to save MCP configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadExample = () => {
    setMCPConfigText(JSON.stringify(EXAMPLE_MCP_CONFIG, null, 2));
    setError(null);
  };

  const checkServerAvailability = async () => {
    if (serverEntries.length === 0) {
      return;
    }

    setIsCheckingServers(true);
    setError(null);

    try {
      await checkServersAvailabilities();
    } catch (e) {
      setError(`Failed to check server availability: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsCheckingServers(false);
    }
  };

  const toggleServerExpanded = (serverName: string) => {
    setExpandedServer(expandedServer === serverName ? null : serverName);
  };

  const serverEntries = useMemo(() => Object.entries(serverTools), [serverTools]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section aria-labelledby="server-status-heading">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-medium text-gitmesh-elements-textPrimary">MCP Servers Configured</h2>{' '}
          <button
            onClick={checkServerAvailability}
            disabled={isCheckingServers || !parsedConfig || serverEntries.length === 0}
            className={classNames(
              'px-3 py-1.5 rounded-lg text-sm',
              'bg-gitmesh-elements-background-depth-3 hover:bg-gitmesh-elements-background-depth-4',
              'text-gitmesh-elements-textPrimary',
              'transition-all duration-200',
              'flex items-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isCheckingServers ? (
              <div className="i-svg-spinners:90-ring-with-bg w-3 h-3 text-gitmesh-elements-loader-progress animate-spin" />
            ) : (
              <div className="i-ph:arrow-counter-clockwise w-3 h-3" />
            )}
            Check availability
          </button>
        </div>
        <McpServerList
          checkingServers={isCheckingServers}
          expandedServer={expandedServer}
          serverEntries={serverEntries}
          toggleServerExpanded={toggleServerExpanded}
        />
      </section>

      <section aria-labelledby="config-section-heading">
        <h2 className="text-base font-medium text-gitmesh-elements-textPrimary mb-3">Configuration</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="mcp-config" className="block text-sm text-gitmesh-elements-textSecondary mb-2">
              Configuration JSON
            </label>
            <textarea
              id="mcp-config"
              value={mcpConfigText}
              onChange={(e) => setMCPConfigText(e.target.value)}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm font-mono h-72',
                'bg-[#F8F8F8] dark:bg-[#1A1A1A]',
                'border',
                error ? 'border-gitmesh-elements-icon-error' : 'border-[#E5E5E5] dark:border-[#333333]',
                'text-gitmesh-elements-textPrimary',
                'focus:outline-none focus:ring-1 focus:ring-gitmesh-elements-focus',
              )}
            />
          </div>
          <div>{error && <p className="mt-2 mb-2 text-sm text-gitmesh-elements-icon-error">{error}</p>}</div>
          <div>
            <label htmlFor="max-llm-steps" className="block text-sm text-gitmesh-elements-textSecondary mb-2">
              Maximum number of sequential LLM calls (steps)
            </label>
            <input
              id="max-llm-steps"
              type="number"
              placeholder="Maximum number of sequential LLM calls"
              min="1"
              max="20"
              value={maxLLMSteps}
              onChange={(e) => handleMaxLLMCallChange(e.target.value)}
              className="w-full px-3 py-2 text-gitmesh-elements-textPrimary text-sm rounded-lg bg-white dark:bg-gitmesh-elements-background-depth-4 border border-gitmesh-elements-borderColor dark:border-gitmesh-elements-borderColor-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-2 text-sm text-gitmesh-elements-textSecondary">
            The MCP configuration format is identical to the one used in Claude Desktop.
            <a
              href="https://modelcontextprotocol.io/examples"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gitmesh-elements-link hover:underline inline-flex items-center gap-1"
            >
              View example servers
              <div className="i-ph:arrow-square-out w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-between gap-3 mt-6">
        <button
          onClick={handleLoadExample}
          className="px-4 py-2 rounded-lg text-sm border border-gitmesh-elements-borderColor
                    bg-gitmesh-elements-background-depth-1 text-gitmesh-elements-textSecondary
                    hover:bg-gitmesh-elements-background-depth-3"
        >
          Load Example
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !parsedConfig}
            aria-disabled={isSaving || !parsedConfig}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm flex items-center gap-2',
              'bg-blue-50 text-blue-500',
              'hover:bg-gitmesh-elements-item-backgroundActive',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <div className="i-ph:floppy-disk w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
