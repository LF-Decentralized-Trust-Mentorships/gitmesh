import { WebhookState, WebhookType } from '@gitmesh/types'

export interface IWebhookData {
  id: string
  tenantId: string
  integrationId: string
  state: WebhookState
  type: WebhookType
  platform: string
  createdAt: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}
