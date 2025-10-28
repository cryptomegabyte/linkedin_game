import './style.css'
import * as THREE from 'three'

// Create scene
const scene = new THREE.Scene()

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

// Create renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

// Create geometry and material
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

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

// Game variables
let sequence: number[] = []
let playerSequence: number[] = []
let level = 1
let gameState: 'showing' | 'input' | 'waiting' = 'waiting'

// Add UI
const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `<div id="ui">Level: <span id="level">${level}</span><br><span id="status">Watch the sequence!</span></div>`
app.appendChild(renderer.domElement)

// Update UI
function updateUI() {
  document.getElementById('level')!.textContent = level.toString()
  const status = gameState === 'showing' ? 'Watch the sequence!' : gameState === 'input' ? 'Repeat the sequence!' : 'Waiting...'
  document.getElementById('status')!.textContent = status
}

// Raycaster for mouse clicks
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Highlight cube function
function highlightCube(index: number, color: number) {
  (cubes[index].material as THREE.MeshBasicMaterial).color.setHex(color)
}

// Generate sequence
function generateSequence() {
  sequence.push(Math.floor(Math.random() * 9))
}

// Show sequence
function showSequence() {
  gameState = 'showing'
  updateUI()
  sequence.forEach((idx, i) => {
    setTimeout(() => {
      highlightCube(idx, 0xffff00) // yellow
      setTimeout(() => highlightCube(idx, 0x00ff00), 500) // back to green
    }, i * 1000)
  })
  setTimeout(() => {
    gameState = 'input'
    updateUI()
  }, sequence.length * 1000 + 500)
}

// Handle mouse click
function onMouseClick(event: MouseEvent) {
  if (gameState !== 'input') return

  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera)

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(cubes)

  if (intersects.length > 0) {
    const clickedCube = intersects[0].object as THREE.Mesh
    const index = cubes.indexOf(clickedCube)
    playerSequence.push(index)
    highlightCube(index, 0xff0000) // red for player click
    setTimeout(() => highlightCube(index, 0x00ff00), 200)

    // Check if correct
    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
      alert('Wrong! Game over.')
      level = 1
      updateUI()
      startGame()
    } else if (playerSequence.length === sequence.length) {
      alert(`Correct! Level ${level + 1}`)
      level++
      updateUI()
      startGame()
    }
  }
}

// Start game
function startGame() {
  updateUI()
  sequence = []
  playerSequence = []
  for (let i = 0; i < level; i++) {
    generateSequence()
  }
  showSequence()
}

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()

// Event listeners
window.addEventListener('click', onMouseClick)

// Start the game
startGame()

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
