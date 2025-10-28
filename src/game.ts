export class Game {
  sequence: number[] = []
  playerSequence: number[] = []
  level = 1
  gameState: 'showing' | 'input' | 'waiting' = 'waiting'

  generateSequence() {
    this.sequence.push(Math.floor(Math.random() * 9))
  }

  showSequence(highlight: (idx: number, color: number, duration?: number) => void, onComplete: () => void) {
    this.gameState = 'showing'

    // Show each cube in sequence with better timing
    this.sequence.forEach((idx, i) => {
      setTimeout(() => {
        // Highlight with bright yellow for sequence display
        highlight(idx, 0xffd700, 600) // Gold color for sequence
      }, i * 800) // Slightly faster pace
    })

    // Wait for all highlights to complete, then switch to input mode
    setTimeout(() => {
      this.gameState = 'input'
      onComplete()
    }, this.sequence.length * 800 + 800)
  }

  checkClick(index: number): 'correct' | 'wrong' | 'complete' {
    this.playerSequence.push(index)
    if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
      this.level = 1
      return 'wrong'
    } else if (this.playerSequence.length === this.sequence.length) {
      this.level++
      return 'complete'
    }
    return 'correct'
  }

  startGame(highlight: (idx: number, color: number) => void, onSequenceComplete: () => void) {
    this.sequence = []
    this.playerSequence = []
    for (let i = 0; i < this.level; i++) {
      this.generateSequence()
    }
    this.showSequence(highlight, onSequenceComplete)
  }

  reset() {
    this.sequence = []
    this.playerSequence = []
    this.level = 1
    this.gameState = 'waiting'
  }
}