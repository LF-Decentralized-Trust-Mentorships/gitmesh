import { SignalsAction, SignalsActionType, SignalsContent } from '@gitmesh/types'
import SignalsContentRepository from '../signalsContentRepository'
import SequelizeTestUtils from '../../utils/sequelizeTestUtils'
import SignalsActionRepository from '../signalsActionRepository'

const db = null

describe('signalsActionRepository tests', () => {
  beforeEach(async () => {
    await SequelizeTestUtils.wipeDatabase(db)
  })

  afterAll((done) => {
    // Closing the DB connection allows Jest to exit successfully.
    SequelizeTestUtils.closeConnection(db)
    done()
  })

  describe('createActionForContent method', () => {
    it('Should create a an action for a content succesfully', async () => {
      const mockIRepositoryOptions = await SequelizeTestUtils.getTestIRepositoryOptions(db)

      const content = {
        platform: 'reddit',
        url: 'https://some-post-url',
        post: {
          title: 'post title',
          body: 'post body',
        },
        postedAt: '2020-05-27T15:13:30Z',
        tenantId: mockIRepositoryOptions.currentTenant.id,
      } as SignalsContent

      const contentCreated = await SignalsContentRepository.create(content, mockIRepositoryOptions)

      const action: SignalsAction = {
        type: SignalsActionType.BOOKMARK,
        timestamp: '2022-07-27T19:13:30Z',
      }

      const actionCreated = await SignalsActionRepository.createActionForContent(
        action,
        contentCreated.id,
        mockIRepositoryOptions,
      )

      actionCreated.createdAt = (actionCreated.createdAt as Date).toISOString().split('T')[0]
      actionCreated.updatedAt = (actionCreated.updatedAt as Date).toISOString().split('T')[0]

      const expectedAction = {
        id: actionCreated.id,
        ...action,
        timestamp: new Date(actionCreated.timestamp),
        contentId: contentCreated.id,
        actionById: mockIRepositoryOptions.currentUser.id,
        tenantId: mockIRepositoryOptions.currentTenant.id,
        createdAt: SequelizeTestUtils.getNowWithoutTime(),
        updatedAt: SequelizeTestUtils.getNowWithoutTime(),
      }
      expect(expectedAction).toStrictEqual(actionCreated)
    })
  })
})
