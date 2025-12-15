import { LoggerBase } from '@gitmesh/logging'
import { SignalsAction, SignalsActionType } from '@gitmesh/types'
import { Error404 } from '@gitmesh/common'
import SignalsActionRepository from '../database/repositories/signalsActionRepository'
import SignalsContentRepository from '../database/repositories/signalsContentRepository'
import SequelizeRepository from '../database/repositories/sequelizeRepository'
import track from '../segment/track'
import { IServiceOptions } from './IServiceOptions'

export default class SignalsActionService extends LoggerBase {
  options: IServiceOptions

  constructor(options: IServiceOptions) {
    super(options.log)
    this.options = options
  }

  async create(data: SignalsAction, contentId: string): Promise<SignalsAction | null> {
    const transaction = await SequelizeRepository.createTransaction(this.options)

    // find content
    const content = await SignalsContentRepository.findById(contentId, {
      ...this.options,
      transaction,
    })

    if (!content) {
      throw new Error404(this.options.language, 'errors.signals.contentNotFound')
    }

    // Tracking here so we have access to url and platform
    track(
      `Signals post ${data.type === SignalsActionType.BOOKMARK ? 'bookmarked' : 'voted'}`,
      {
        type: data.type,
        url: content.url,
        platform: content.platform,
        action: 'create',
      },
      { ...this.options },
    )

    const existingUserActions: SignalsAction[] = content.actions.filter(
      (a) => a.actionById === this.options.currentUser.id,
    )

    const existingUserActionTypes = existingUserActions.map((a) => a.type)

    try {
      // check if already bookmarked - if yes ignore the new action and return existing
      if (
        data.type === SignalsActionType.BOOKMARK &&
        existingUserActionTypes.includes(SignalsActionType.BOOKMARK)
      ) {
        return existingUserActions.find((a) => a.type === SignalsActionType.BOOKMARK)
      }

      // thumbs up and down should be mutually exclusive
      if (
        data.type === SignalsActionType.THUMBS_DOWN &&
        existingUserActionTypes.includes(SignalsActionType.THUMBS_UP)
      ) {
        await SignalsActionRepository.removeActionFromContent(
          SignalsActionType.THUMBS_UP,
          contentId,
          {
            ...this.options,
            transaction,
          },
        )
      } else if (
        data.type === SignalsActionType.THUMBS_UP &&
        existingUserActionTypes.includes(SignalsActionType.THUMBS_DOWN)
      ) {
        await SignalsActionRepository.removeActionFromContent(
          SignalsActionType.THUMBS_DOWN,
          contentId,
          {
            ...this.options,
            transaction,
          },
        )
      }

      // add new action
      const record = await SignalsActionRepository.createActionForContent(data, contentId, {
        ...this.options,
        transaction,
      })

      await SequelizeRepository.commitTransaction(transaction)

      return record
    } catch (error) {
      await SequelizeRepository.rollbackTransaction(transaction)

      SequelizeRepository.handleUniqueFieldError(error, this.options.language, 'SignalsContent')

      throw error
    }
  }

  async destroy(id: string) {
    const action = await SignalsActionRepository.findById(id, this.options)

    const contentId = action.contentId

    await SignalsActionRepository.destroy(id, this.options)

    // find content
    const content = await SignalsContentRepository.findById(contentId, this.options)

    // if content no longer has any actions attached to it, also delete the content
    if (content.actions.length === 0) {
      await SignalsContentRepository.destroy(contentId, this.options)
    }

    // Tracking here so we have access to url and platform
    track(
      `Signals post ${action.type === SignalsActionType.BOOKMARK ? 'bookmarked' : 'voted'}`,
      {
        type: action.type,
        url: content.url,
        platform: content.platform,
        action: 'destroy',
      },
      { ...this.options },
    )
  }
}
