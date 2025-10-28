import { describe, it, expect, vi } from 'vitest'
import { Game } from './game'

describe('Game', () => {
  it('should initialize with default values', () => {
    const game = new Game()
    expect(game.sequence).toEqual([])
    expect(game.playerSequence).toEqual([])
    expect(game.level).toBe(1)
    expect(game.gameState).toBe('waiting')
  })

  it('should generate a random sequence number', () => {
    const game = new Game()
    game.generateSequence()
    expect(game.sequence.length).toBe(1)
    expect(game.sequence[0]).toBeGreaterThanOrEqual(0)
    expect(game.sequence[0]).toBeLessThan(9)
  })

  it('should return correct for partial match', () => {
    const game = new Game()
    game.sequence = [0, 1, 2]
    game.playerSequence = [0]
    const result = game.checkClick(1)
    expect(result).toBe('correct')
    expect(game.playerSequence).toEqual([0, 1])
  })

  it('should return complete for full correct sequence', () => {
    const game = new Game()
    game.sequence = [0, 1]
    game.playerSequence = [0]
    const result = game.checkClick(1)
    expect(result).toBe('complete')
    expect(game.level).toBe(2)
  })

  it('should return wrong for incorrect click', () => {
    const game = new Game()
    game.sequence = [0, 1]
    game.playerSequence = [0]
    const result = game.checkClick(2)
    expect(result).toBe('wrong')
    expect(game.level).toBe(1)
  })

  it('should reset the game', () => {
    const game = new Game()
    game.sequence = [1, 2]
    game.playerSequence = [1]
    game.level = 3
    game.gameState = 'input'
    game.reset()
    expect(game.sequence).toEqual([])
    expect(game.playerSequence).toEqual([])
    expect(game.level).toBe(1)
    expect(game.gameState).toBe('waiting')
  })

  it('should start game and generate sequence', async () => {
    vi.useFakeTimers()
    const game = new Game()
    game.level = 2
    const mockHighlight = vi.fn()
    const mockOnComplete = vi.fn()
    game.startGame(mockHighlight, mockOnComplete)
    expect(game.sequence.length).toBe(2)

    // Fast-forward timers to trigger the setTimeout callback
    await vi.advanceTimersByTimeAsync(1600 + 800) // sequence.length * 800 + 800

    expect(mockOnComplete).toHaveBeenCalled()
    expect(game.gameState).toBe('input')
    vi.useRealTimers()
  })
})