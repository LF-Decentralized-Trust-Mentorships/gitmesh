import { Kafka, Producer as KafkaProducer } from 'kafkajs'

import { IIntegrationDescriptor, INTEGRATION_SERVICES } from '@gitmesh/integrations'
import { getServiceLogger, Logger } from '@gitmesh/logging'
import { acquireLock, getRedisClient, RedisClient, releaseLock } from '@gitmesh/redis'
import { getServiceTracer, Tracer } from '@gitmesh/tracing'
import { getTemporalClient, Client as TemporalClient } from '@gitmesh/temporal'
import { Unleash as UnleashClient, getUnleashClient } from '@gitmesh/feature-flags'

// Retrieve automatically configured tracer and logger.
const tracer = getServiceTracer()
const logger = getServiceLogger()

// List all required environment variables, grouped per "component".
const envvars = {
  base: ['SERVICE'],
  producer: ['KAFKA_BROKERS'],
  temporal: ['TEMPORAL_SERVER_URL', 'TEMPORAL_NAMESPACE'],
  redis: ['REDIS_HOST', 'REDIS_PORT', 'REDIS_USERNAME', 'REDIS_PASSWORD'],
}

/*
Config is used to configure the service.
*/
export interface Config {
  // Additional environment variables required by the service to properly run.
  envvars?: string[]

  // Enable and configure the Kafka producer, if needed.
  producer: {
    enabled: boolean
    idempotent?: boolean
    retryPolicy?: {
      initialRetryTime: number
      maxRetryTime: number
      retries: number
    }
  }

  // Enable and configure the Temporal client, if needed.
  temporal: {
    enabled: boolean
  }

  // Enable and configure the Redis client, if needed.
  redis: {
    enabled: boolean
  }
}

/*
Service holds all details and methods to run any kind of services at gitmesh.dev.
*/
export class Service {
  readonly name: string
  readonly tracer: Tracer
  readonly log: Logger
  readonly config: Config
  readonly integrations: IIntegrationDescriptor[]

  protected _unleash?: UnleashClient

  protected _kafka: Kafka | null
  protected _temporal: TemporalClient | null

  protected _redisClient: RedisClient | null

  constructor(config: Config) {
    this.name = process.env['SERVICE']
    this.tracer = tracer
    this.log = logger
    this.config = config
    this.integrations = INTEGRATION_SERVICES

    // TODO: Handle SSL and SASL configuration.
    if (config.producer.enabled && process.env['KAFKA_BROKERS']) {
      const brokers = process.env['KAFKA_BROKERS']
      this._kafka = new Kafka({
        clientId: this.name,
        brokers: brokers.split(','),
        // sasl
        // ssl
      })
    }
  }

  get unleash(): UnleashClient | undefined {
    return this._unleash
  }

  get producer(): KafkaProducer | null {
    if (!this.config.producer.enabled) {
      return null
    }

    return this._kafka.producer({
      idempotent: this.config.producer.idempotent,
      retry: this.config.producer.retryPolicy,
    })
  }

  get temporal(): TemporalClient | null {
    if (!this.config.temporal.enabled) {
      return null
    }

    return this._temporal
  }

  get redis(): RedisClient | null {
    if (!this.config.redis.enabled) {
      return null
    }

    return this._redisClient
  }

  // Redis utility to acquire a lock. Redis must be enabled in the service.
  acquireLock(
    key: string,
    value: string,
    expireAfterSeconds: number,
    timeoutAfterSeconds: number,
  ): Promise<void> {
    if (!this.config.redis.enabled) {
      return Promise.reject('Redis must be enabled to leverage lock')
    }

    return acquireLock(this._redisClient, key, value, expireAfterSeconds, timeoutAfterSeconds)
  }

  // Redis utility to release a lock. Redis must be enabled in the service.
  releaseLock(key: string, value: string): Promise<void> {
    if (!this.config.redis.enabled) {
      return Promise.reject('Redis must be enabled to leverage lock')
    }

    return releaseLock(this._redisClient, key, value)
  }

  // Before actually starting the service we need to ensure required environment
  // variables are set.
  async init() {
    const missing = []
    envvars.base.forEach((envvar) => {
      if (!process.env[envvar]) {
        missing.push(envvar)
      }
    })

    // Only validate service-related environment variables when applicable.
    if (this.config.envvars) {
      this.config.envvars.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar)
        }
      })
    }

    // Only validate Kafka-related environment variables if enabled.
    if (this.config.producer.enabled) {
      envvars.producer.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar)
        }
      })
    }

    // Only validate Temporal-related environment variables if enabled.
    if (this.config.temporal.enabled) {
      envvars.temporal.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar)
        }
      })
    }

    // Only validate Redis-related environment variables if enabled.
    if (this.config.redis.enabled) {
      envvars.redis.forEach((envvar) => {
        if (!process.env[envvar]) {
          missing.push(envvar)
        }
      })
    }

    // There's no point in continuing if a variable is missing.
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }

    // Make sure to gracefully stop the service on "SIGTERM" and "SIGINT"
    // signals.
    process.on('SIGTERM', async () => {
      await this.stop()
    })

    process.on('SIGINT', async () => {
      await this.stop()
    })

    if (
      process.env['EDITION'] === 'gitmesh-hosted' &&
      process.env['UNLEASH_URL'] &&
      process.env['UNLEASH_BACKEND_API_KEY']
    ) {
      this._unleash = await getUnleashClient({
        url: process.env['UNLEASH_URL'],
        appName: this.name,
        apiKey: process.env['UNLEASH_BACKEND_API_KEY'],
      })
    }

    if (this.config.producer.enabled) {
      try {
        await this.producer.connect()
      } catch (err) {
        throw new Error(err)
      }
    }

    if (this.config.temporal.enabled) {
      try {
        this._temporal = await getTemporalClient({
          serverUrl: process.env['TEMPORAL_SERVER_URL'],
          namespace: process.env['TEMPORAL_NAMESPACE'],
          identity: this.name,
          certificate: process.env['TEMPORAL_CERTIFICATE'],
          privateKey: process.env['TEMPORAL_PRIVATE_KEY'],
        })
      } catch (err) {
        throw new Error(err)
      }
    }

    if (this.config.redis.enabled) {
      try {
        this._redisClient = await getRedisClient({
          host: process.env['REDIS_HOST'],
          port: process.env['REDIS_PORT'],
          username: process.env['REDIS_USERNAME'],
          password: process.env['REDIS_PASSWORD'],
        })
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  // Stop allows to gracefully stop the service.
  protected async stop() {
    if (this.config.producer.enabled) {
      await this.producer.disconnect()
    }

    if (this.config.temporal.enabled) {
      await this.temporal.connection.close()
    }

    if (this._unleash) {
      this._unleash.destroy()
    }
  }
}
