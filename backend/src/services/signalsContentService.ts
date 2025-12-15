import { LoggerBase } from '@gitmesh/logging'
import axios from 'axios'
import moment from 'moment'
import {
  SignalsAction,
  SignalsContent,
  SignalsPostWithActions,
  SignalsPublishedDates,
  SignalsRawPost,
  SignalsSettings,
  PageData,
  QueryData,
} from '@gitmesh/types'
import { Error400 } from '@gitmesh/common'
import { SIGNALS_CONFIG } from '../conf'
import SignalsContentRepository from '../database/repositories/signalsContentRepository'
import SequelizeRepository from '../database/repositories/sequelizeRepository'
import TenantUserRepository from '../database/repositories/tenantUserRepository'
import track from '../segment/track'
import { IServiceOptions } from './IServiceOptions'

export interface SignalsContentUpsertData extends SignalsAction {
  content: SignalsContent
}

export default class SignalsContentService extends LoggerBase {
  options: IServiceOptions

  constructor(options: IServiceOptions) {
    super(options.log)
    this.options = options
  }

  /**
   * Create an signals shown content record.
   * @param data Data to a new SignalsContent record.
   * @param options Repository options.
   * @returns Created SignalsContent record.
   */
  async upsert(data: SignalsContent): Promise<SignalsContent | null> {
    if (!data.url) {
      throw new Error400(this.options.language, 'errors.signals.urlRequiredWhenUpserting')
    }
    const transaction = await SequelizeRepository.createTransaction(this.options)

    try {
      // find by url
      const existing = await SignalsContentRepository.findByUrl(data.url, {
        ...this.options,
        transaction,
      })

      let record

      if (existing) {
        record = await SignalsContentRepository.update(existing.id, data, {
          ...this.options,
          transaction,
        })
      } else {
        record = await SignalsContentRepository.create(data, {
          ...this.options,
          transaction,
        })
      }

      await SequelizeRepository.commitTransaction(transaction)

      return record
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(transaction)
      throw error
    }
  }

  async findById(id: string): Promise<SignalsContent> {
    return SignalsContentRepository.findById(id, this.options)
  }

  async query(data: QueryData): Promise<PageData<SignalsContent>> {
    const advancedFilter = data.filter
    const orderBy = data.orderBy
    const limit = data.limit
    const offset = data.offset
    return SignalsContentRepository.findAndCountAll(
      { advancedFilter, orderBy, limit, offset },
      this.options,
    )
  }

  static trackPostClicked(url: string, platform: string, req: any, source: string = 'app'): void {
    track(
      'Signals post clicked',
      {
        url,
        platform,
        source,
      },
      { ...req },
    )
  }

  static trackDigestEmailOpened(req: any): void {
    track('Signals digest opened', {}, { ...req })
  }

  /**
   * Convert a relative string date to a Date. For example, 30 days ago -> 2020-01-01
   * @param date String date. Can be one of SignalsPublishedDates
   * @returns The corresponding Date
   */
  static switchDate(date: string, offset = 0) {
    let dateMoment
    switch (date) {
      case SignalsPublishedDates.LAST_24_HOURS:
        dateMoment = moment().subtract(1, 'days')
        break
      case SignalsPublishedDates.LAST_7_DAYS:
        dateMoment = moment().subtract(7, 'days')
        break
      case SignalsPublishedDates.LAST_14_DAYS:
        dateMoment = moment().subtract(14, 'days')
        break
      case SignalsPublishedDates.LAST_30_DAYS:
        dateMoment = moment().subtract(30, 'days')
        break
      case SignalsPublishedDates.LAST_90_DAYS:
        dateMoment = moment().subtract(90, 'days')
        break
      default:
        return null
    }
    return dateMoment.subtract(offset, 'days').format('YYYY-MM-DD')
  }

  async search(email = false) {
    const signalsSettings: SignalsSettings = (
      await TenantUserRepository.findByTenantAndUser(
        this.options.currentTenant.id,
        this.options.currentUser.id,
        this.options,
      )
    ).settings.signals

    if (!signalsSettings.onboarded) {
      throw new Error400(this.options.language, 'errors.signals.notOnboarded')
    }

    const feedSettings = email ? signalsSettings.emailDigest.feed : signalsSettings.feed

    const keywords = feedSettings.keywords ? feedSettings.keywords.join(',') : ''
    const exactKeywords = feedSettings.exactKeywords ? feedSettings.exactKeywords.join(',') : ''
    const excludedKeywords = feedSettings.excludedKeywords
      ? feedSettings.excludedKeywords.join(',')
      : ''

    const afterDate = SignalsContentService.switchDate(feedSettings.publishedDate)

    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${SIGNALS_CONFIG.url}`,
      params: {
        platforms: feedSettings.platforms.join(','),
        keywords,
        exact_keywords: exactKeywords,
        exclude_keywords: excludedKeywords,
        after_date: afterDate,
      },
      headers: {
        Authorization: `Bearer ${SIGNALS_CONFIG.apiKey}`,
      },
    }

    const response = await axios(config)

    const interacted = (
      await this.query({
        filter: {
          postedAt: { gt: SignalsContentService.switchDate(feedSettings.publishedDate, 90) },
        },
      })
    ).rows

    const interactedMap = {}

    for (const item of interacted) {
      interactedMap[item.url] = item
    }

    const out: SignalsPostWithActions[] = []
    for (const item of response.data as SignalsRawPost[]) {
      const post = {
        description: item.description,
        thumbnail: item.thumbnail,
        title: item.title,
      }
      out.push({
        url: item.url,
        postedAt: item.date,
        post,
        platform: item.platform,
        actions: interactedMap[item.url] ? interactedMap[item.url].actions : [],
      })
    }

    return out
  }

  static async reply(title, description) {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${SIGNALS_CONFIG.url}/reply`,
      params: {
        title,
        description,
      },
      headers: {
        Authorization: `Bearer ${SIGNALS_CONFIG.apiKey}`,
      },
    }

    const response = await axios(config)
    return {
      reply: response.data,
    }
  }
}
