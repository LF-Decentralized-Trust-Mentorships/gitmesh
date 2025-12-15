import { Logger } from '@gitmesh/logging'
import { RedisClient } from '@gitmesh/redis'
import { SegmentData } from '@gitmesh/types'
import { Unleash } from '@gitmesh/feature-flags'
import { Client as TemporalClient } from '@gitmesh/temporal'

export interface IServiceOptions {
  log: Logger
  language: string
  currentUser: any
  currentTenant: any
  currentSegments: SegmentData[]
  database: any
  redis: RedisClient
  transaction?: any
  unleash?: Unleash
  temporal: TemporalClient
}
