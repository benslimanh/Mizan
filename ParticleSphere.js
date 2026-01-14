/**
 * ParticleSphere.js
 * 3D Interactive Particle Sphere with Plexus Effect
 * Blockchain-inspired network visualization
 */

class ParticleSphere {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleSystem = null;
    this.lines = null;
    this.particlePositions = [];
    this.particleVelocities = [];
    this.particleCount = 800;
    this.maxConnections = 20;
    this.maxDistance = 80;
    this.primaryColor = 0xe85d3f; // #E85D3F
    this.lineColor = 0xe85d3f;

    this.init();
    this.animate();
    this.handleResize();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera - positioned closer for better visibility
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    this.camera.position.set(0, 0, 250);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    // Create particles in sphere formation
    this.createParticleSphere();

    // Create plexus lines
    this.createPlexusLines();

    // Window resize handler
    window.addEventListener('resize', () => this.handleResize());
  }

  createParticleSphere() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const radius = 150;

    // Generate particles on sphere surface with some randomness
    for (let i = 0; i < this.particleCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(-1 + (2 * i) / this.particleCount);
      const theta = Math.sqrt(this.particleCount * Math.PI) * phi;

      // Add some randomness to create depth
      const r = radius + (Math.random() - 0.5) * 30;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      this.particlePositions.push(new THREE.Vector3(x, y, z));

      // Small random velocity for subtle floating effect
      this.particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      );

      // Color with slight variation
      const color = new THREE.Color(this.primaryColor);
      const brightness = 0.7 + Math.random() * 0.3;
      color.multiplyScalar(brightness);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  createPlexusLines() {
    const positions = new Float32Array(this.particleCount * this.maxConnections * 3);
    const colors = new Float32Array(this.particleCount * this.maxConnections * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);
  }

  updatePlexusLines() {
    const positions = this.lines.geometry.attributes.position.array;
    const colors = this.lines.geometry.attributes.color.array;
    const lineColor = new THREE.Color(this.lineColor);

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    // Find nearby particles and draw lines
    for (let i = 0; i < this.particleCount; i++) {
      let connectionCount = 0;

      for (let j = i + 1; j < this.particleCount; j++) {
        const dist = this.particlePositions[i].distanceTo(this.particlePositions[j]);

        if (dist < this.maxDistance && connectionCount < this.maxConnections) {
          positions[vertexpos++] = this.particlePositions[i].x;
          positions[vertexpos++] = this.particlePositions[i].y;
          positions[vertexpos++] = this.particlePositions[i].z;

          positions[vertexpos++] = this.particlePositions[j].x;
          positions[vertexpos++] = this.particlePositions[j].y;
          positions[vertexpos++] = this.particlePositions[j].z;

          // Line opacity based on distance
          const alpha = 1.0 - dist / this.maxDistance;
          
          colors[colorpos++] = lineColor.r;
          colors[colorpos++] = lineColor.g;
          colors[colorpos++] = lineColor.b;

          colors[colorpos++] = lineColor.r;
          colors[colorpos++] = lineColor.g;
          colors[colorpos++] = lineColor.b;

          connectionCount++;
          numConnected++;
        }
      }
    }

    this.lines.geometry.setDrawRange(0, numConnected * 2);
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
  }

  updateParticles() {
    const positions = this.particleSystem.geometry.attributes.position.array;
    const radius = 150;

    for (let i = 0; i < this.particleCount; i++) {
      // Subtle floating motion
      this.particlePositions[i].add(this.particleVelocities[i]);

      // Keep particles roughly on sphere surface
      const distance = this.particlePositions[i].length();
      if (distance > radius + 20 || distance < radius - 20) {
        this.particlePositions[i].normalize().multiplyScalar(radius + (Math.random() - 0.5) * 10);
      }

      positions[i * 3] = this.particlePositions[i].x;
      positions[i * 3 + 1] = this.particlePositions[i].y;
      positions[i * 3 + 2] = this.particlePositions[i].z;
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Slow rotation
    if (this.particleSystem) {
      this.particleSystem.rotation.y += 0.002;
      this.particleSystem.rotation.x += 0.001;
    }

    if (this.lines) {
      this.lines.rotation.y += 0.002;
      this.lines.rotation.x += 0.001;
    }

    // Update particle positions
    this.updateParticles();

    // Update plexus connections
    this.updatePlexusLines();

    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  destroy() {
    window.removeEventListener('resize', () => this.handleResize());
    if (this.renderer && this.renderer.domElement && this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Auto-initialize when DOM and THREE.js are ready
function initParticleSphere() {
  // Check if THREE.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('THREE.js not loaded yet, waiting...');
    setTimeout(initParticleSphere, 100);
    return;
  }

  const container = document.getElementById('particle-sphere-container');
  if (container) {
    console.log('Initializing ParticleSphere...');
    console.log('THREE.js version:', THREE.REVISION);
    console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    new ParticleSphere('particle-sphere-container');
  } else {
    console.error('particle-sphere-container not found');
  }
}

// Wait for both DOM and window load to ensure scripts are loaded
window.addEventListener('load', initParticleSphere);
