import { Logger } from '@gitmesh/logging'
import { RedisClient } from '@gitmesh/redis'
import { Unleash } from '@gitmesh/feature-flags'
import { Client as TemporalClient } from '@gitmesh/temporal'
import { SegmentData } from '@gitmesh/types'

export interface IRepositoryOptions {
  log: Logger
  redis: RedisClient
  language: string
  currentUser: any
  currentTenant: any
  currentSegments: SegmentData[]
  database: any
  transaction?: any
  bypassPermissionValidation?: any
  opensearch?: any
  unleash?: Unleash
  temporal: TemporalClient
}
