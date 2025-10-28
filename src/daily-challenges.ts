// Type declarations for browser environment
declare const window: any

export interface DailyChallenge {
  id: string
  title: string
  description: string
  objective: {
    type: 'score' | 'level' | 'combo' | 'perfect' | 'speed'
    target: number
    timeLimit?: number // in seconds, for speed challenges
  }
  reward: {
    type: 'theme' | 'powerup' | 'achievement' | 'bonus'
    value: string | number
  }
  expiresAt: Date
  completed: boolean
  progress: number
}

interface StoredChallenge {
  id: string
  title: string
  description: string
  objective: DailyChallenge['objective']
  reward: DailyChallenge['reward']
  expiresAt: string
  completed: boolean
  progress: number
}

export class DailyChallengeManager {
  private challenges: DailyChallenge[] = []
  private readonly STORAGE_KEY = 'linkedin_game_daily_challenges'

  constructor() {
    this.loadChallenges()
    this.generateDailyChallenges()
  }

  private loadChallenges() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        try {
          const parsed: StoredChallenge[] = JSON.parse(stored)
          this.challenges = parsed.map((c: StoredChallenge): DailyChallenge => ({
            id: c.id,
            title: c.title,
            description: c.description,
            objective: c.objective,
            reward: c.reward,
            expiresAt: new Date(c.expiresAt),
            completed: c.completed,
            progress: c.progress
          }))
        } catch (e) {
          // Silently fail for loading errors
        }
      }
    }
  }

  private saveChallenges() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.challenges))
    }
  }

  private generateDailyChallenges() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if we already have challenges for today
    const existingToday = this.challenges.filter(c =>
      c.expiresAt >= today && c.expiresAt < tomorrow
    )

    if (existingToday.length > 0) {
      return // Already have challenges for today
    }

    // Remove expired challenges
    this.challenges = this.challenges.filter(c => c.expiresAt >= today)

    // Generate 1 random challenge for today
    const challengeTemplates = [
      {
        title: "Score Sprint",
        description: "Reach a score of {target} points",
        objective: { type: 'score' as const, target: 5000 },
        reward: { type: 'bonus' as const, value: 100 }
      },
      {
        title: "Level Master",
        description: "Reach level {target}",
        objective: { type: 'level' as const, target: 8 },
        reward: { type: 'theme' as const, value: 'rainbow' }
      },
      {
        title: "Combo King",
        description: "Achieve a {target}x combo",
        objective: { type: 'combo' as const, target: 15 },
        reward: { type: 'powerup' as const, value: 'slow_motion' }
      },
      {
        title: "Perfect Memory",
        description: "Complete {target} perfect sequences",
        objective: { type: 'perfect' as const, target: 3 },
        reward: { type: 'achievement' as const, value: 'perfect_memory' }
      },
      {
        title: "Speed Demon",
        description: "Complete level 5 in under {target} seconds",
        objective: { type: 'speed' as const, target: 30, timeLimit: 30 },
        reward: { type: 'powerup' as const, value: 'time_freeze' }
      }
    ]

    // Randomly select 1 challenge
    const selectedTemplates = this.shuffleArray(challengeTemplates).slice(0, 1)

    selectedTemplates.forEach((template, index) => {
      const challenge: DailyChallenge = {
        id: `daily_${Date.now()}_${index}`,
        title: template.title,
        description: template.description.replace('{target}', template.objective.target.toString()),
        objective: template.objective,
        reward: template.reward,
        expiresAt: tomorrow,
        completed: false,
        progress: 0
      }
      this.challenges.push(challenge)
    })

    selectedTemplates.forEach((template, index) => {
      const challenge: DailyChallenge = {
        id: `daily_${Date.now()}_${index}`,
        title: template.title,
        description: template.description.replace('{target}', template.objective.target.toString()),
        objective: template.objective,
        reward: template.reward,
        expiresAt: tomorrow,
        completed: false,
        progress: 0
      }
      this.challenges.push(challenge)
    })

    this.saveChallenges()
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  getActiveChallenges(): DailyChallenge[] {
    const now = new Date()
    return this.challenges.filter(c => c.expiresAt > now && !c.completed)
  }

  updateProgress(type: DailyChallenge['objective']['type'], value: number): DailyChallenge[] {
    const activeChallenges = this.getActiveChallenges()
    const completedChallenges: DailyChallenge[] = []

    activeChallenges.forEach(challenge => {
      if (challenge.objective.type === type) {
        challenge.progress = Math.max(challenge.progress, value)

        if (challenge.progress >= challenge.objective.target) {
          challenge.completed = true
          completedChallenges.push(challenge)
        }
      }
    })

    if (completedChallenges.length > 0) {
      this.saveChallenges()
    }

    return completedChallenges
  }

  getCompletedToday(): DailyChallenge[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.challenges.filter(c =>
      c.completed && c.expiresAt >= today && c.expiresAt < tomorrow
    )
  }

  resetExpiredChallenges() {
    const now = new Date()
    this.challenges = this.challenges.filter(c => c.expiresAt > now)
    this.saveChallenges()
  }
}