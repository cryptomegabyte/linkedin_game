import './style.css'
import * as THREE from 'three'
import { Game } from './game'

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

const game = new Game()

// Add UI
const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `<div id="ui">Level: <span id="level">${game.level}</span><br><span id="status">Watch the sequence!</span></div>`
app.appendChild(renderer.domElement)

// Update UI
function updateUI() {
  document.getElementById('level')!.textContent = game.level.toString()
  const status = game.gameState === 'showing' ? 'Watch the sequence!' : game.gameState === 'input' ? 'Repeat the sequence!' : 'Waiting...'
  document.getElementById('status')!.textContent = status
}

// Raycaster for mouse clicks
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Highlight cube function
function highlightCube(index: number, color: number) {
  (cubes[index].material as THREE.MeshBasicMaterial).color.setHex(color)
}

// Handle mouse click
function onMouseClick(event: MouseEvent) {
  if (game.gameState !== 'input') return

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
    const result = game.checkClick(index)
    highlightCube(index, 0xff0000) // red for player click
    setTimeout(() => highlightCube(index, 0x00ff00), 200)

    if (result === 'wrong') {
      alert('Wrong! Game over.')
      game.reset()
      updateUI()
      startGame()
    } else if (result === 'complete') {
      alert(`Correct! Level ${game.level}`)
      updateUI()
      startGame()
    }
  }
}

// Start game
function startGame() {
  game.startGame(highlightCube, () => updateUI())
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
