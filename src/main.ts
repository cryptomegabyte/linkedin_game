import './style.css'
import * as THREE from 'three'
import { Game } from './game'

// Create scene
const scene = new THREE.Scene()

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 0) // transparent background

// Create geometry and material with professional colors
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 0x0077b5, // LinkedIn blue
  transparent: true,
  opacity: 0.9
})

// Create 3x3 grid of cubes
const cubes: THREE.Mesh[] = []
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    const cube = new THREE.Mesh(geometry, material.clone())
    cube.position.set((i - 1) * 1.5, (j - 1) * 1.5, 0)
    cubes.push(cube)
    scene.add(cube)
  }
}

const game = new Game()

// Game state
let highScore = 0
let currentScore = 0

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

// Get UI elements
const levelElement = document.getElementById('level')!
const scoreElement = document.getElementById('score')!
const statusElement = document.getElementById('status')!
const startBtn = document.getElementById('start-btn')!
const restartBtn = document.getElementById('restart-btn')!

// Update UI
function updateUI() {
  levelElement.textContent = game.level.toString()
  scoreElement.textContent = currentScore.toString()

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

// Highlight cube function with better colors and animations
function highlightCube(index: number, color: number, duration: number = 500) {
  const cube = cubes[index]
  const material = cube.material as THREE.MeshBasicMaterial
  const originalColor = material.color.getHex()
  const originalScale = cube.scale.clone()

  // Animate scale and color
  material.color.setHex(color)
  cube.scale.setScalar(1.2)

  if (duration > 0) {
    setTimeout(() => {
      material.color.setHex(originalColor)
      cube.scale.copy(originalScale)
    }, duration)
  }
}

// Handle mouse click
function onMouseClick(event: MouseEvent) {
  if (game.gameState !== 'input') return

  // Calculate mouse position in normalized device coordinates
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

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
      currentScore = game.level - 1
      statusElement.textContent = `Level ${game.level} complete!`
      statusElement.className = 'status-text'
      statusElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)'
      statusElement.style.color = 'white'
      statusElement.style.borderColor = '#28a745'

      setTimeout(() => {
        updateUI()
        startGame()
      }, 1500)
    }
  }
}

// Start game
function startGame() {
  startBtn.style.display = 'none'
  restartBtn.style.display = 'inline-block'
  game.startGame(highlightCube, () => updateUI())
}

// Show start screen
function showStartScreen() {
  startBtn.style.display = 'inline-block'
  restartBtn.style.display = 'none'
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

// Animation loop with floating effect
function animate() {
  requestAnimationFrame(animate)

  // Add subtle floating animation to cubes
  cubes.forEach((cube, index) => {
    const anim = cubeAnimations[index]
    anim.time += 0.02
    cube.position.y = anim.baseY + Math.sin(anim.time) * 0.05
    cube.rotation.x += 0.005
    cube.rotation.y += 0.005
  })

  renderer.render(scene, camera)
}
animate()

// Event listeners
renderer.domElement.addEventListener('click', onMouseClick)

startBtn.addEventListener('click', startGame)
restartBtn.addEventListener('click', () => {
  game.reset()
  updateUI()
  startGame()
})

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Initialize
showStartScreen()
