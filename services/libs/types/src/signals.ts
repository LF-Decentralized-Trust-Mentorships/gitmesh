export enum SignalsActionType {
  THUMBS_UP = 'thumbs-up',
  THUMBS_DOWN = 'thumbs-down',
  BOOKMARK = 'bookmark',
}

export interface SignalsAction {
  id?: string
  type: SignalsActionType
  timestamp: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface SignalsContent {
  id?: string
  platform: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: any
  url: string
  actions?: SignalsAction[]
  tenantId: string
  postedAt: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface SignalsFeedSettings {
  keywords: string[]
  exactKeywords: string[]
  excludedKeywords: string[]
  publishedDate: string
  platforms: string[]
}

export interface SignalsEmailDigestSettings {
  email: string
  frequency: SignalsEmailDigestFrequency
  time: string
  nextEmailAt: string
  feed: SignalsFeedSettings
  matchFeedSettings: boolean
}

export enum SignalsEmailDigestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

export interface SignalsSettings {
  onboarded: boolean
  feed: SignalsFeedSettings
  emailDigestActive: boolean
  emailDigest?: SignalsEmailDigestSettings
  aiReplies: boolean
}

// Enum for SignalsPlatforms
export enum SignalsPlatforms {
  GITHUB = 'github',
  HACKERNEWS = 'hackernews',
  DEVTO = 'devto',
  REDDIT = 'reddit',
  MEDIUM = 'medium',
  STACKOVERFLOW = 'stackoverflow',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
  PRODUCTHUNT = 'producthunt',
  KAGGLE = 'kaggle',
  HASHNODE = 'hashnode',
  LINKEDIN = 'linkedin',
}

export enum SignalsPublishedDates {
  LAST_24_HOURS = 'Last 24h',
  LAST_7_DAYS = 'Last 7d',
  LAST_14_DAYS = 'Last 14d',
  LAST_30_DAYS = 'Last 30d',
  LAST_90_DAYS = 'Last 90d',
}

export interface SignalsRawPost {
  description: string
  title: string
  thumbnail?: string
  url: string
  platform: string
  date: string
}

export interface SignalsPostWithActions {
  post: {
    description: string
    title: string
    thumbnail?: string
  }
  url: string
  platform: string
  postedAt: string
  actions: SignalsAction[]
}
