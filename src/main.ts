import './style.css'
import * as THREE from 'three'
import { Game } from './game'
import { SoundManager } from './sound'
import { AchievementManager, type Achievement } from './achievements'
import { ParticleSystem } from './particles'

// Create scene
const scene = new THREE.Scene()

// Create camera
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000) // Start with 1:1 aspect ratio
camera.position.z = 5

// Create renderer with better settings
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
})
renderer.setClearColor(0x000000, 0) // transparent background
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 5, 5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0x0077b5, 0.5, 10)
pointLight.position.set(0, 0, 3)
scene.add(pointLight)

// Create enhanced geometry with rounded edges effect
const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8) // More segments for smoother look

// Create different materials for different states
const createCubeMaterial = (baseColor: number, emissiveColor: number = 0x000000, emissiveIntensity: number = 0) => {
  return new THREE.MeshPhongMaterial({
    color: baseColor,
    emissive: emissiveColor,
    emissiveIntensity: emissiveIntensity,
    transparent: true,
    opacity: 0.95,
    shininess: 100,
    specular: 0x111111,
    side: THREE.DoubleSide
  })
}

// Base material for normal state
const normalMaterial = createCubeMaterial(0x0077b5)

// Create 3x3 grid of cubes with enhanced materials
const cubes: THREE.Mesh[] = []
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const cube = new THREE.Mesh(geometry, normalMaterial.clone())
    cube.position.set((i - 1) * 1.5, (j - 1) * 1.5, 0)
    cube.castShadow = true
    cube.receiveShadow = true

    // Add subtle random rotation for visual interest
    cube.rotation.x = (Math.random() - 0.5) * 0.1
    cube.rotation.y = (Math.random() - 0.5) * 0.1

    cubes.push(cube)
    scene.add(cube)
  }
}

const game = new Game()

// Game state
let highScore = 0
let currentScore = 0
let currentCombo = 0
let maxCombo = 0

// Sound system
const soundManager = new SoundManager()

// Achievement system
const achievementManager = new AchievementManager()

// Particle system for visual effects
const particleSystem = new ParticleSystem(scene)

// Create professional UI
const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div class="game-container">
    <header class="game-header">
      <h1 class="game-title">LinkedIn Memory</h1>
      <p class="game-subtitle">Test your memory skills</p>
    </header>

    <div class="game-stats">
      <div class="stat-item">
        <div class="stat-label">Level</div>
        <div class="stat-value" id="level">${game.level}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Score</div>
        <div class="stat-value" id="score">0</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Combo</div>
        <div class="stat-value" id="combo">0</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Best</div>
        <div class="stat-value" id="high-score">${highScore}</div>
      </div>
    </div>

    <div class="game-canvas-container">
      <div id="canvas-wrapper"></div>
    </div>

    <div class="game-status">
      <p class="status-text" id="status">Click Start to begin!</p>
    </div>

    <div class="game-controls">
      <button class="game-button" id="start-btn">Start Game</button>
      <button class="game-button secondary" id="restart-btn" style="display: none;">Restart</button>
      <button class="game-button secondary" id="sound-btn">🔊 Sound</button>
    </div>

    <div class="game-instructions">
      <h3 class="instructions-title">How to Play</h3>
      <p class="instructions-text">
        Watch the sequence of highlighted cubes, then click them in the same order.
        Each level adds one more cube to remember!
      </p>
    </div>
  </div>
`

// Get canvas wrapper and add renderer
const canvasWrapper = document.getElementById('canvas-wrapper')!
canvasWrapper.appendChild(renderer.domElement)

// Initialize renderer size based on canvas wrapper
const initRendererSize = () => {
  const rect = canvasWrapper.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}
initRendererSize()

// Get UI elements
const levelElement = document.getElementById('level')!
const scoreElement = document.getElementById('score')!
const comboElement = document.getElementById('combo')!
const statusElement = document.getElementById('status')!
const startBtn = document.getElementById('start-btn')!
const restartBtn = document.getElementById('restart-btn')!
const soundBtn = document.getElementById('sound-btn')!

// Achievement notification system
function showAchievementNotification(achievement: Achievement) {
  // Create particle burst for achievement
  const centerPosition = new THREE.Vector3(0, 0, 0)
  particleSystem.createBurst(centerPosition, 0xffd700, 12)

  // Create notification element
  const notification = document.createElement('div')
  notification.className = 'achievement-notification'
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-content">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.title}</div>
      <div class="achievement-desc">${achievement.description}</div>
    </div>
  `

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100)

  // Remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 4000)
}

// Update UI
function updateUI() {
  levelElement.textContent = game.level.toString()
  scoreElement.textContent = currentScore.toString()
  comboElement.textContent = currentCombo.toString()

  // Update high score display if we have it
  const highScoreElement = document.getElementById('high-score')
  if (highScoreElement) {
    highScoreElement.textContent = highScore.toString()
  }

  let statusText = ''
  let statusClass = ''

  switch (game.gameState) {
    case 'showing':
      statusText = 'Watch the sequence carefully...'
      statusClass = 'showing'
      break
    case 'input':
      statusText = 'Now repeat the sequence!'
      statusClass = 'input'
      break
    case 'waiting':
      statusText = 'Click Start to begin!'
      statusClass = 'waiting'
      break
  }

  statusElement.textContent = statusText
  statusElement.className = `status-text ${statusClass}`
  statusElement.style.background = ''
  statusElement.style.color = ''
  statusElement.style.borderColor = ''
}

// Raycaster for mouse clicks
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Highlight cube function with enhanced visuals and glow effects
function highlightCube(index: number, color: number, duration: number = 500) {
  const cube = cubes[index]
  const material = cube.material as THREE.MeshPhongMaterial
  const originalColor = material.color.getHex()
  const originalEmissive = material.emissive.getHex()
  const originalEmissiveIntensity = material.emissiveIntensity
  const originalScale = cube.scale.clone()

  // Play sequence sound when showing pattern
  if (color === 0xffd700) { // Gold color for sequence
    soundManager.playSequence()
  }

  // Enhanced visual effects based on state
  if (color === 0xffd700) {
    // Sequence display: gold with glow and particles
    material.color.setHex(0xffd700)
    material.emissive.setHex(0xffd700)
    material.emissiveIntensity = 0.3
    cube.scale.setScalar(1.3)
    particleSystem.createBurst(cube.position, 0xffd700, 6)
  } else if (color === 0x42a5f5) {
    // Player click: light blue with subtle glow and particles
    material.color.setHex(0x42a5f5)
    material.emissive.setHex(0x42a5f5)
    material.emissiveIntensity = 0.2
    cube.scale.setScalar(1.25)
    particleSystem.createBurst(cube.position, 0x42a5f5, 4)
  } else {
    // Default highlight
    material.color.setHex(color)
    cube.scale.setScalar(1.2)
  }

  if (duration > 0) {
    setTimeout(() => {
      // Reset to original state with smooth transition
      material.color.setHex(originalColor)
      material.emissive.setHex(originalEmissive)
      material.emissiveIntensity = originalEmissiveIntensity
      cube.scale.copy(originalScale)
    }, duration)
  }
}

// Handle pointer events (mouse and touch)
function onPointerEvent(event: MouseEvent | TouchEvent) {
  if (game.gameState !== 'input') return

  // Prevent default touch behavior
  event.preventDefault()

  // Get coordinates from either mouse or touch event
  let clientX: number, clientY: number
  if ('changedTouches' in event) {
    const touch = event.changedTouches[0]
    clientX = touch.clientX
    clientY = touch.clientY
  } else {
    clientX = event.clientX
    clientY = event.clientY
  }

  // Calculate pointer position in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera)

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(cubes)

  if (intersects.length > 0) {
    const clickedCube = intersects[0].object as THREE.Mesh
    const index = cubes.indexOf(clickedCube)

    // Visual feedback for click
    highlightCube(index, 0x42a5f5, 300) // Light blue for player click

    const result = game.checkClick(index)

    if (result === 'wrong') {
      // Play wrong sound and reset combo
      soundManager.playWrong()
      currentCombo = 0

      // Update achievements
      achievementManager.updateStats({
        gamesPlayed: achievementManager.getStats().gamesPlayed + 1,
        maxLevel: Math.max(achievementManager.getStats().maxLevel, game.level - 1),
        maxCombo: Math.max(achievementManager.getStats().maxCombo, maxCombo),
        currentStreak: 0 // Reset streak on loss
      })

      // Update high score if needed
      if (currentScore > highScore) {
        highScore = currentScore
      }

      statusElement.textContent = `Game Over! Final Score: ${currentScore}`
      statusElement.className = 'status-text'
      statusElement.style.background = 'linear-gradient(135deg, #dc3545, #fd7e14)'
      statusElement.style.color = 'white'
      statusElement.style.borderColor = '#dc3545'

      setTimeout(() => {
        game.reset()
        currentScore = 0
        updateUI()
        showStartScreen()
      }, 3000)
    } else if (result === 'complete') {
      // Play success sound and increase combo
      soundManager.playSuccess()
      currentCombo++
      maxCombo = Math.max(maxCombo, currentCombo)

      // Calculate score with combo multiplier
      const baseScore = game.level
      const comboMultiplier = Math.min(currentCombo, 5) // Cap at 5x multiplier
      const levelScore = baseScore * comboMultiplier
      currentScore += levelScore

      // Check for newly unlocked achievements
      const newAchievements = achievementManager.updateStats({
        maxLevel: Math.max(achievementManager.getStats().maxLevel, game.level),
        maxCombo: Math.max(achievementManager.getStats().maxCombo, maxCombo)
      })

      // Show achievement notification if any were unlocked
      if (newAchievements.length > 0) {
        soundManager.playAchievement()
        setTimeout(() => {
          showAchievementNotification(newAchievements[0])
        }, 500)
      }

      statusElement.textContent = `Level ${game.level} complete! +${levelScore}pts${comboMultiplier > 1 ? ` (${comboMultiplier}x combo!)` : ''}`
      statusElement.className = 'status-text'
      statusElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)'
      statusElement.style.color = 'white'
      statusElement.style.borderColor = '#28a745'

      // Special combo celebration
      if (currentCombo >= 3) {
        soundManager.playCombo()
      }

      setTimeout(() => {
        updateUI()
        startGame()
      }, 1500)
    } else if (result === 'correct') {
      // Play correct sound and maintain combo
      soundManager.playCorrect()
      currentCombo++
      maxCombo = Math.max(maxCombo, currentCombo)
    }
  }
}

// Start game
function startGame() {
  startBtn.style.display = 'none'
  restartBtn.style.display = 'inline-block'
  currentCombo = 0 // Reset combo for new game
  game.startGame(highlightCube, () => updateUI())
}

// Show start screen
function showStartScreen() {
  startBtn.style.display = 'inline-block'
  restartBtn.style.display = 'none'
  currentCombo = 0 // Reset combo
  updateUI()
}

// Animation variables for floating effect
const cubeAnimations: { [key: number]: { baseY: number; time: number } } = {}
cubes.forEach((cube, index) => {
  cubeAnimations[index] = {
    baseY: cube.position.y,
    time: Math.random() * Math.PI * 2 // Random starting phase
  }
})

// Animation loop with enhanced visual effects
function animate() {
  requestAnimationFrame(animate)

  const time = Date.now() * 0.001 // Convert to seconds

  // Enhanced floating and breathing animation for cubes
  cubes.forEach((cube, index) => {
    const anim = cubeAnimations[index]

    // Floating motion
    anim.time += 0.015
    cube.position.y = anim.baseY + Math.sin(anim.time) * 0.08

    // Gentle rotation
    cube.rotation.x = Math.sin(time * 0.5 + index) * 0.05
    cube.rotation.y += 0.003

    // Subtle breathing effect (scale pulsing)
    const breathScale = 1 + Math.sin(time * 2 + index * 0.5) * 0.02
    cube.scale.setScalar(breathScale)

    // Dynamic emissive intensity for ambient glow
    const material = cube.material as THREE.MeshPhongMaterial
    material.emissiveIntensity = 0.05 + Math.sin(time * 1.5 + index) * 0.02
  })

  // Animate point light for dynamic lighting
  if (pointLight) {
    pointLight.position.x = Math.sin(time * 0.5) * 2
    pointLight.position.y = Math.cos(time * 0.3) * 1
    pointLight.intensity = 0.5 + Math.sin(time * 0.8) * 0.1
  }

  // Update particle system
  particleSystem.update()

  renderer.render(scene, camera)
}
animate()

// Event listeners
// Add event listeners for both mouse and touch
renderer.domElement.addEventListener('click', onPointerEvent)
renderer.domElement.addEventListener('touchstart', onPointerEvent)

startBtn.addEventListener('click', startGame)
restartBtn.addEventListener('click', () => {
  game.reset()
  currentScore = 0
  currentCombo = 0
  updateUI()
  startGame()
})

soundBtn.addEventListener('click', () => {
  soundManager.toggleSound()
  soundBtn.textContent = soundManager.isEnabled() ? '🔊 Sound' : '🔇 Muted'
})

// Handle window resize
window.addEventListener('resize', () => {
  const canvasWrapper = document.getElementById('canvas-wrapper')!
  const rect = canvasWrapper.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
})

// Initialize
showStartScreen()
