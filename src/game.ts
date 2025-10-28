export class Game {
  sequence: number[] = []
  playerSequence: number[] = []
  level = 1
  gameState: 'showing' | 'input' | 'waiting' = 'waiting'

  generateSequence() {
    this.sequence.push(Math.floor(Math.random() * 9))
  }

  showSequence(highlight: (idx: number, color: number) => void, onComplete: () => void) {
    this.gameState = 'showing'
    this.sequence.forEach((_idx, i) => {
      const idx = this.sequence[i]
      setTimeout(() => {
        highlight(idx, 0xffff00)
        setTimeout(() => highlight(idx, 0x00ff00), 500)
      }, i * 1000)
    })
    setTimeout(() => {
      this.gameState = 'input'
      onComplete()
    }, this.sequence.length * 1000 + 500)
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