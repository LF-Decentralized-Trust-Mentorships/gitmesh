import { get } from 'lodash'
import GithubStrategy from 'passport-github2'
import { getServiceChildLogger } from '@gitmesh/logging'
import { AuthProvider } from '@gitmesh/types'
import { GITHUB_CONFIG } from '../../../conf'
import { databaseInit } from '../../../database/databaseConnection'
import AuthService from '../authService'
import { splitFullName } from '../../../utils/splitName'

const log = getServiceChildLogger('AuthSocial')

export function getGithubStrategy(): GithubStrategy {
  return new GithubStrategy(
    {
      clientID: GITHUB_CONFIG.clientId,
      clientSecret: GITHUB_CONFIG.clientSecret,
      callbackURL: GITHUB_CONFIG.callbackUrl,
      scope: ['user:email', 'read:user'], // Request email and user info scope
    },
    (accessToken, refreshToken, profile, done) => {
      databaseInit()
        .then((database) => {
          const email = get(profile, 'emails[0].value')
          
          // Check if we got an email
          if (!email) {
            log.error({ profile }, 'GitHub profile missing email address')
            throw new Error('auth-no-email')
          }
          
          // GitHub user's profile doesn't include 'verified' field
          // However, GitHub accounts require email verification for activation
          const emailVerified = !!email
          const displayName = get(profile, 'displayName') || get(profile, 'username') || 'GitHub User'
          const { firstName, lastName } = splitFullName(displayName)

          return AuthService.signinFromSocial(
            AuthProvider.GITHUB,
            profile.id,
            email,
            emailVerified,
            firstName,
            lastName,
            displayName,
            { database },
          )
        })
        .then((jwtToken) => {
          done(null, jwtToken)
        })
        .catch((error) => {
          log.error(error, 'Error while handling github auth!')
          done(error, null)
        })
    },
  )
}
