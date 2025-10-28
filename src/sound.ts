// Sound Manager for game audio feedback
export class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext()
  }

  private initAudioContext() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      // Web Audio API not supported - silently fail
    }
  }

  private createOscillator(frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine'): void {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type

    // Create envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Play sound for correct click
  playCorrect(): void {
    this.createOscillator(800, 0.15, 'sine')
  }

  // Play sound for wrong click
  playWrong(): void {
    this.createOscillator(200, 0.3, 'sawtooth')
  }

  // Play sound for sequence display
  playSequence(): void {
    this.createOscillator(600, 0.1, 'square')
  }

  // Play sound for level completion
  playSuccess(): void {
    // Play a pleasant ascending chord
    setTimeout(() => this.createOscillator(523, 0.2, 'sine'), 0)   // C
    setTimeout(() => this.createOscillator(659, 0.2, 'sine'), 50)  // E
    setTimeout(() => this.createOscillator(784, 0.2, 'sine'), 100) // G
  }

  // Play sound for combo milestone
  playCombo(): void {
    this.createOscillator(1000, 0.1, 'triangle')
    setTimeout(() => this.createOscillator(1200, 0.1, 'triangle'), 50)
  }

  // Play sound for achievement
  playAchievement(): void {
    // Triumphant fanfare
    const notes = [523, 659, 784, 1047] // C, E, G, C (octave higher)
    notes.forEach((freq, index) => {
      setTimeout(() => this.createOscillator(freq, 0.15, 'sine'), index * 80)
    })
  }

  toggleSound(): void {
    this.enabled = !this.enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }
}