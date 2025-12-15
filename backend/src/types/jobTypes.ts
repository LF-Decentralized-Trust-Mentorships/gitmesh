import { Logger } from '@gitmesh/logging'

export interface GitmeshJob {
  name: string
  cronTime: string
  onTrigger: (log: Logger) => Promise<void>
}
