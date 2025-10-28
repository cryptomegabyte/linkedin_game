// Type declarations for browser environment
declare const localStorage: {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

// Achievement system for game milestones
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  condition: (stats: GameStats) => boolean
}

export interface GameStats {
  gamesPlayed: number
  totalScore: number
  maxLevel: number
  maxCombo: number
  perfectGames: number
  currentStreak: number
}

export class AchievementManager {
  private achievements: Achievement[] = [
    {
      id: 'first_win',
      title: 'First Victory',
      description: 'Complete your first level',
      icon: '🎯',
      unlocked: false,
      condition: (stats) => stats.maxLevel >= 1
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      description: 'Achieve a 5x combo streak',
      icon: '🔥',
      unlocked: false,
      condition: (stats) => stats.maxCombo >= 5
    },
    {
      id: 'level_10',
      title: 'Memory Champion',
      description: 'Reach level 10',
      icon: '👑',
      unlocked: false,
      condition: (stats) => stats.maxLevel >= 10
    },
    {
      id: 'perfect_game',
      title: 'Perfectionist',
      description: 'Complete a game without mistakes',
      icon: '💎',
      unlocked: false,
      condition: (stats) => stats.perfectGames >= 1
    },
    {
      id: 'streak_3',
      title: 'On Fire',
      description: 'Win 3 games in a row',
      icon: '🌟',
      unlocked: false,
      condition: (stats) => stats.currentStreak >= 3
    }
  ]

  private stats: GameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    maxLevel: 0,
    maxCombo: 0,
    perfectGames: 0,
    currentStreak: 0
  }

  constructor() {
    this.loadStats()
  }

  private loadStats() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('linkedin-memory-stats')
      if (saved) {
        this.stats = { ...this.stats, ...JSON.parse(saved) }
      }

      const unlocked = localStorage.getItem('linkedin-memory-achievements')
      if (unlocked) {
        const unlockedIds = JSON.parse(unlocked)
        this.achievements.forEach(achievement => {
          achievement.unlocked = unlockedIds.includes(achievement.id)
        })
      }
    }
  }

  private saveStats() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('linkedin-memory-stats', JSON.stringify(this.stats))
      const unlockedIds = this.achievements.filter(a => a.unlocked).map(a => a.id)
      localStorage.setItem('linkedin-memory-achievements', JSON.stringify(unlockedIds))
    }
  }

  updateStats(updates: Partial<GameStats>): Achievement[] {
    this.stats = { ...this.stats, ...updates }
    this.saveStats()
    return this.checkAchievements()
  }

  private checkAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = []

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(this.stats)) {
        achievement.unlocked = true
        newlyUnlocked.push(achievement)
      }
    })

    if (newlyUnlocked.length > 0) {
      this.saveStats()
    }

    return newlyUnlocked
  }

  getStats(): GameStats {
    return { ...this.stats }
  }

  getAchievements(): Achievement[] {
    return [...this.achievements]
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked)
  }

  getNewlyUnlockedAchievements(): Achievement[] {
    // This would need to be tracked separately in a real implementation
    return this.getUnlockedAchievements()
  }

  resetStats() {
    this.stats = {
      gamesPlayed: 0,
      totalScore: 0,
      maxLevel: 0,
      maxCombo: 0,
      perfectGames: 0,
      currentStreak: 0
    }
    this.saveStats()
  }
}