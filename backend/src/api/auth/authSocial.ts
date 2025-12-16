import passport from 'passport'
import { getServiceChildLogger } from '@gitmesh/logging'
import { API_CONFIG, GITHUB_CONFIG, GOOGLE_CONFIG } from '../../conf'
import AuthService from '../../services/auth/authService'

const log = getServiceChildLogger('AuthSocial')

export default (app, routes) => {
  app.use(passport.initialize())

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  routes.post('/auth/social/onboard', async (req, res) => {
    const payload = await AuthService.handleOnboard(
      req.currentUser,
      req.body.invitationToken,
      req.body.tenantId,
      req,
    )

    await req.responseHandler.success(req, res, payload)
  })

  if (GOOGLE_CONFIG.clientId) {
    log.info({ clientId: GOOGLE_CONFIG.clientId }, 'Registering Google social routes')
    routes.get(
      '/auth/social/google',
      (req, res, next) => {
        if (!GOOGLE_CONFIG.clientSecret) {
          log.error('Google Client Secret is missing!')
          res.redirect(`${API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`)
          return
        }
        passport.authenticate('google', {
          scope: ['email', 'profile'],
          session: false,
        })(req, res, next)
      },
      () => {
        // The request will be redirected for authentication, so this
        // function will not be called.
      },
    )

    routes.get('/auth/social/google/callback', (req, res, next) => {
      if (!GOOGLE_CONFIG.clientSecret) {
        log.error('Google Client Secret is missing!')
        res.redirect(`${API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`)
        return
      }
      passport.authenticate('google', (err, jwtToken) => {
        handleCallback(res, err, jwtToken)
      })(req, res, next)
    })
  }

  if (GITHUB_CONFIG.clientId) {
    routes.get(
      '/auth/social/github',
      (req, res, next) => {
        if (!GITHUB_CONFIG.clientSecret) {
          log.error('GitHub Client Secret is missing!')
          res.redirect(`${API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`)
          return
        }
        passport.authenticate('github', {
          scope: ['user:email', 'read:user'],
          session: false,
        })(req, res, next)
      },
      () => {
        // The request will be redirected for authentication, so this
        // function will not be called.
      },
    )

    routes.get('/auth/social/github/callback', (req, res, next) => {
      if (!GITHUB_CONFIG.clientSecret) {
        log.error('GitHub Client Secret is missing!')
        res.redirect(`${API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`)
        return
      }
      passport.authenticate('github', (err, jwtToken) => {
        handleCallback(res, err, jwtToken)
      })(req, res, next)
    })
  }
}

function handleCallback(res, err, jwtToken) {
  if (err) {
    log.error(err, 'Error handling social callback!')
    let errorCode = 'generic'

    if (['auth-invalid-provider', 'auth-no-email'].includes(err.message)) {
      errorCode = err.message
    }

    res.redirect(`${API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=${errorCode}`)
    return
  }

  res.redirect(`${API_CONFIG.frontendUrl}/?social=true&authToken=${jwtToken}`)
}
