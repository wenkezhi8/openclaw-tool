import { useI18n } from '@/lib/i18n';

export type HelpPageKey = 'dashboard' | 'gateway' | 'settings' | 'agents' | 'channels' | 'models' | 'messaging';

export interface HelpSection {
  title: string;
  content: string[];
}

export interface HelpContent {
  title: string;
  description: string;
  sections: HelpSection[];
}

// Helper function to get help content based on current locale
export function useHelpContent(page: HelpPageKey): HelpContent {
  const { t, locale } = useI18n();

  const helpContents: Record<HelpPageKey, HelpContent> = {
    dashboard: {
      title: t('help.dashboard.title', 'Dashboard Help'),
      description: t('help.dashboard.description', 'Learn how to use the OpenClaw dashboard'),
      sections: [
        {
          title: t('help.dashboard.overview.title', 'Overview'),
          content: [
            t('help.dashboard.overview.content1', 'The dashboard provides a comprehensive view of your OpenClaw AI gateway status and performance metrics.'),
            t('help.dashboard.overview.content2', 'You can monitor gateway status, view real-time metrics, and control the gateway from this page.'),
          ],
        },
        {
          title: t('help.dashboard.metrics.title', 'Metrics'),
          content: [
            t('help.dashboard.metrics.content1', 'Total Requests: The total number of API requests processed since the gateway started.'),
            t('help.dashboard.metrics.content2', 'Success Rate: The percentage of successful requests out of total requests.'),
            t('help.dashboard.metrics.content3', 'Avg Latency: The average response time for API requests.'),
          ],
        },
        {
          title: t('help.dashboard.control.title', 'Gateway Control'),
          content: [
            t('help.dashboard.control.content1', 'Use the control buttons to start, stop, or restart the gateway.'),
            t('help.dashboard.control.content2', 'The refresh button updates the current status and metrics.'),
          ],
        },
      ],
    },
    gateway: {
      title: t('help.gateway.title', 'Gateway Help'),
      description: t('help.gateway.description', 'Learn how to manage the OpenClaw gateway'),
      sections: [
        {
          title: t('help.gateway.status.title', 'Gateway Status'),
          content: [
            t('help.gateway.status.content1', 'Running: The gateway is operational and processing requests.'),
            t('help.gateway.status.content2', 'Stopped: The gateway is not running. Start it to process requests.'),
            t('help.gateway.status.content3', 'Error: There is an issue with the gateway. Check logs for details.'),
          ],
        },
        {
          title: t('help.gateway.control.title', 'Control Actions'),
          content: [
            t('help.gateway.control.content1', 'Start: Launch the gateway service.'),
            t('help.gateway.control.content2', 'Stop: Halt the gateway. This will interrupt all active connections.'),
            t('help.gateway.control.content3', 'Restart: Stop and start the gateway. Useful for applying configuration changes.'),
          ],
        },
        {
          title: t('help.gateway.shortcuts.title', 'Keyboard Shortcuts'),
          content: [
            t('help.gateway.shortcuts.content1', 'Press ? to show keyboard shortcuts.'),
            t('help.gateway.shortcuts.content2', 'R: Refresh gateway status.'),
            t('help.gateway.shortcuts.content3', 'S: Start gateway.'),
            t('help.gateway.shortcuts.content4', 'X: Stop gateway.'),
          ],
        },
      ],
    },
    settings: {
      title: t('help.settings.title', 'Settings Help'),
      description: t('help.settings.description', 'Configure your OpenClaw Tool preferences'),
      sections: [
        {
          title: t('help.settings.modelProviders.title', 'Model Providers'),
          content: [
            t('help.settings.modelProviders.content1', 'Configure API keys for different AI model providers.'),
            t('help.settings.modelProviders.content2', 'Click "Configure" to add or update your API key for each provider.'),
            t('help.settings.modelProviders.content3', 'You can test the connection before saving.'),
          ],
        },
        {
          title: t('help.settings.gatewayConfig.title', 'Gateway Configuration'),
          content: [
            t('help.settings.gatewayConfig.content1', 'Port: The port number where the gateway will listen for requests.'),
            t('help.settings.gatewayConfig.content2', 'Token: Optional authentication token for securing the gateway.'),
            t('help.settings.gatewayConfig.content3', 'Enable "Restart after save" to apply changes immediately.'),
          ],
        },
        {
          title: t('help.settings.apiConfig.title', 'API Configuration'),
          content: [
            t('help.settings.apiConfig.content1', 'Configure the backend API connection settings.'),
            t('help.settings.apiConfig.content2', 'API URL: The base URL for the backend API.'),
            t('help.settings.apiConfig.content3', 'WebSocket URL: The URL for real-time communication.'),
          ],
        },
      ],
    },
    agents: {
      title: t('help.agents.title', 'Agents Help'),
      description: t('help.agents.description', 'Learn how to manage AI agents'),
      sections: [
        {
          title: t('help.agents.overview.title', 'Overview'),
          content: [
            t('help.agents.overview.content1', 'Agents are AI assistants that can perform tasks and respond to messages.'),
            t('help.agents.overview.content2', 'Each agent has a unique configuration that determines its behavior and capabilities.'),
          ],
        },
        {
          title: t('help.agents.management.title', 'Agent Management'),
          content: [
            t('help.agents.management.content1', 'Create: Click "Create Agent" to add a new AI agent.'),
            t('help.agents.management.content2', 'Edit: Click on an agent to modify its configuration.'),
            t('help.agents.management.content3', 'Delete: Remove an agent that is no longer needed.'),
            t('help.agents.management.content4', 'Toggle Status: Enable or disable an agent without deleting it.'),
          ],
        },
        {
          title: t('help.agents.filters.title', 'Filtering'),
          content: [
            t('help.agents.filters.content1', 'Use the search box to find agents by name.'),
            t('help.agents.filters.content2', 'Filter by status (Active/Inactive) or type to narrow down the list.'),
          ],
        },
      ],
    },
    channels: {
      title: t('help.channels.title', 'Channels Help'),
      description: t('help.channels.description', 'Learn how to configure API channels'),
      sections: [
        {
          title: t('help.channels.overview.title', 'Overview'),
          content: [
            t('help.channels.overview.content1', 'Channels are connections to AI model providers (like OpenAI, Anthropic, etc.).'),
            t('help.channels.overview.content2', 'Configure channels to enable the gateway to route requests to different providers.'),
          ],
        },
        {
          title: t('help.channels.configuration.title', 'Channel Configuration'),
          content: [
            t('help.channels.configuration.content1', 'Name: A descriptive name for the channel.'),
            t('help.channels.configuration.content2', 'Type: The provider type (e.g., OpenAI, Anthropic).'),
            t('help.channels.configuration.content3', 'API Key: Your authentication key for the provider.'),
            t('help.channels.configuration.content4', 'Priority: Higher priority channels are used first.'),
          ],
        },
        {
          title: t('help.channels.testing.title', 'Testing'),
          content: [
            t('help.channels.testing.content1', 'Use the "Test Connection" feature to verify your channel configuration.'),
            t('help.channels.testing.content2', 'A successful test confirms the API key is valid and the provider is accessible.'),
          ],
        },
      ],
    },
    models: {
      title: t('help.models.title', 'Models Help'),
      description: t('help.models.description', 'Learn how to manage AI models'),
      sections: [
        {
          title: t('help.models.overview.title', 'Overview'),
          content: [
            t('help.models.overview.content1', 'Models are automatically discovered from configured channels.'),
            t('help.models.overview.content2', 'You cannot add models manually; they appear when you configure channels.'),
          ],
        },
        {
          title: t('help.models.configuration.title', 'Model Configuration'),
          content: [
            t('help.models.configuration.content1', 'Enable/Disable: Toggle model availability without removing it.'),
            t('help.models.configuration.content2', 'Configure: Set custom pricing or context limits for a model.'),
            t('help.models.configuration.content3', 'Test: Send a test request to verify the model is working.'),
          ],
        },
        {
          title: t('help.models.pricing.title', 'Pricing'),
          content: [
            t('help.models.pricing.content1', 'Input Price: Cost per 1K tokens for input/prompt.'),
            t('help.models.pricing.content2', 'Output Price: Cost per 1K tokens for output/completion.'),
            t('help.models.pricing.content3', 'Pricing information helps track usage costs.'),
          ],
        },
      ],
    },
    messaging: {
      title: t('help.messaging.title', 'Messaging Help'),
      description: t('help.messaging.description', 'Learn how to connect messaging platforms'),
      sections: [
        {
          title: t('help.messaging.overview.title', 'Overview'),
          content: [
            t('help.messaging.overview.content1', 'Connect messaging platforms to allow AI agents to communicate through them.'),
            t('help.messaging.overview.content2', 'Supported platforms include Telegram, Discord, Slack, WhatsApp, and WeChat.'),
          ],
        },
        {
          title: t('help.messaging.connection.title', 'Connection Process'),
          content: [
            t('help.messaging.connection.content1', 'Each platform requires different credentials (tokens, API keys).'),
            t('help.messaging.connection.content2', 'Follow the tutorial steps provided for each platform.'),
            t('help.messaging.connection.content3', 'Click "Connect" after entering your credentials.'),
          ],
        },
        {
          title: t('help.messaging.troubleshooting.title', 'Troubleshooting'),
          content: [
            t('help.messaging.troubleshooting.content1', 'If connection fails, verify your API credentials are correct.'),
            t('help.messaging.troubleshooting.content2', 'Check that the bot has the necessary permissions.'),
            t('help.messaging.troubleshooting.content3', 'Refer to the platform-specific tutorial for detailed setup instructions.'),
          ],
        },
      ],
    },
  };

  return helpContents[page];
}

// Get all help page keys
export function getHelpPageKeys(): HelpPageKey[] {
  return ['dashboard', 'gateway', 'settings', 'agents', 'channels', 'models', 'messaging'];
}
