import * as THREE from 'three'

// Simple particle system for visual effects
export class ParticleSystem {
  private particles: THREE.Mesh[] = []
  private scene: THREE.Scene
  private geometry: THREE.SphereGeometry
  private material: THREE.MeshBasicMaterial

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.geometry = new THREE.SphereGeometry(0.02, 8, 8)
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    })
  }

  createBurst(position: THREE.Vector3, color: number, count: number = 8) {
    // Clear any existing particles
    this.clearParticles()

    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(this.geometry, this.material.clone())
      particle.material.color.setHex(color)
      particle.position.copy(position)

      // Random velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      )

      // Store velocity in userData
      particle.userData.velocity = velocity
      particle.userData.life = 1.0

      this.particles.push(particle)
      this.scene.add(particle)
    }
  }

  update(deltaTime: number = 0.016) {
    this.particles = this.particles.filter(particle => {
      // Update position
      particle.position.add(particle.userData.velocity)

      // Update life
      particle.userData.life -= deltaTime * 2

      // Update opacity
      const material = particle.material as THREE.MeshBasicMaterial
      material.opacity = particle.userData.life

      // Remove dead particles
      if (particle.userData.life <= 0) {
        this.scene.remove(particle)
        return false
      }

      return true
    })
  }

  clearParticles() {
    this.particles.forEach(particle => {
      this.scene.remove(particle)
    })
    this.particles = []
  }
}