/**
 * ParticleSphere.js
 * Premium 3D Interactive Particle Sphere with Plexus Effect
 * Blockchain-inspired network visualization with two-layer depth system
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
    this.coreParticles = null;
    this.accentParticles = null;
    this.lines = null;
    this.corePositions = [];
    this.coreVelocities = [];
    this.accentPositions = [];
    this.accentVelocities = [];
    this.coreCount = 600;
    this.accentCount = 200;
    this.maxConnections = 15;
    this.maxDistance = 85;
    this.brandOrange = 0xe85d3f; // #E85D3F - Core particles
    this.deepAmber = 0xb7791f; // #B7791F - Accent particles
    this.lineColor = 0xe85d3f;
    this.floatOffset = 0;

    this.init();
    this.animate();
    this.handleResize();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera - zoomed out for full sphere visibility
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.camera.position.set(0, 0, 320);

    // Renderer with premium settings
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

    // Create two-layer particle system
    this.createCoreParticles();
    this.createAccentParticles();

    // Create plexus lines
    this.createPlexusLines();

    // Window resize handler
    window.addEventListener('resize', () => this.handleResize());
  }

  createCoreParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const radius = 140;

    // Generate core particles - denser, smaller, brand orange
    for (let i = 0; i < this.coreCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / this.coreCount);
      const theta = Math.sqrt(this.coreCount * Math.PI) * phi;

      const r = radius + (Math.random() - 0.5) * 25;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      this.corePositions.push(new THREE.Vector3(x, y, z));

      // Small random velocity
      this.coreVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08
        )
      );

      // Brand orange with variation
      const color = new THREE.Color(this.brandOrange);
      const brightness = 0.8 + Math.random() * 0.2;
      color.multiplyScalar(brightness);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    this.coreParticles = new THREE.Points(geometry, material);
    this.scene.add(this.coreParticles);
  }

  createAccentParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const radius = 145;

    // Generate accent particles - sparser, larger, deep amber/gold
    for (let i = 0; i < this.accentCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / this.accentCount);
      const theta = Math.sqrt(this.accentCount * Math.PI) * phi;

      const r = radius + (Math.random() - 0.5) * 30;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
      this.accentPositions.push(new THREE.Vector3(x, y, z));

      // Slightly different velocity for layered effect
      this.accentVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      );

      // Deep amber/gold with variation
      const color = new THREE.Color(this.deepAmber);
      const brightness = 0.85 + Math.random() * 0.15;
      color.multiplyScalar(brightness);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });

    this.accentParticles = new THREE.Points(geometry, material);
    this.scene.add(this.accentParticles);
  }

  createPlexusLines() {
    const totalParticles = this.coreCount + this.accentCount;
    const positions = new Float32Array(totalParticles * this.maxConnections * 3);
    const colors = new Float32Array(totalParticles * this.maxConnections * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });

    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);
  }

  updatePlexusLines() {
    const positions = this.lines.geometry.attributes.position.array;
    const colors = this.lines.geometry.attributes.color.array;
    const lineColor = new THREE.Color(this.lineColor);

    // Combine all particles for connection calculation
    const allPositions = [...this.corePositions, ...this.accentPositions];

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    // Find nearby particles and draw lines
    for (let i = 0; i < allPositions.length; i++) {
      let connectionCount = 0;

      for (let j = i + 1; j < allPositions.length; j++) {
        const dist = allPositions[i].distanceTo(allPositions[j]);

        if (dist < this.maxDistance && connectionCount < this.maxConnections) {
          positions[vertexpos++] = allPositions[i].x;
          positions[vertexpos++] = allPositions[i].y;
          positions[vertexpos++] = allPositions[i].z;

          positions[vertexpos++] = allPositions[j].x;
          positions[vertexpos++] = allPositions[j].y;
          positions[vertexpos++] = allPositions[j].z;

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
    // Update core particles
    const corePositions = this.coreParticles.geometry.attributes.position.array;
    const coreRadius = 140;

    for (let i = 0; i < this.coreCount; i++) {
      this.corePositions[i].add(this.coreVelocities[i]);

      const distance = this.corePositions[i].length();
      if (distance > coreRadius + 15 || distance < coreRadius - 15) {
        this.corePositions[i].normalize().multiplyScalar(coreRadius + (Math.random() - 0.5) * 8);
      }

      corePositions[i * 3] = this.corePositions[i].x;
      corePositions[i * 3 + 1] = this.corePositions[i].y;
      corePositions[i * 3 + 2] = this.corePositions[i].z;
    }

    this.coreParticles.geometry.attributes.position.needsUpdate = true;

    // Update accent particles
    const accentPositions = this.accentParticles.geometry.attributes.position.array;
    const accentRadius = 145;

    for (let i = 0; i < this.accentCount; i++) {
      this.accentPositions[i].add(this.accentVelocities[i]);

      const distance = this.accentPositions[i].length();
      if (distance > accentRadius + 18 || distance < accentRadius - 18) {
        this.accentPositions[i].normalize().multiplyScalar(accentRadius + (Math.random() - 0.5) * 10);
      }

      accentPositions[i * 3] = this.accentPositions[i].x;
      accentPositions[i * 3 + 1] = this.accentPositions[i].y;
      accentPositions[i * 3 + 2] = this.accentPositions[i].z;
    }

    this.accentParticles.geometry.attributes.position.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Increment float offset for gentle up/down wobble
    this.floatOffset += 0.008;
    const floatY = Math.sin(this.floatOffset) * 8;

    // Slow rotation with float animation
    if (this.coreParticles) {
      this.coreParticles.rotation.y += 0.0015;
      this.coreParticles.rotation.x += 0.0008;
      this.coreParticles.position.y = floatY;
    }

    if (this.accentParticles) {
      this.accentParticles.rotation.y += 0.0018;
      this.accentParticles.rotation.x += 0.0009;
      this.accentParticles.position.y = floatY * 1.1; // Slightly different float for depth
    }

    if (this.lines) {
      this.lines.rotation.y += 0.0015;
      this.lines.rotation.x += 0.0008;
      this.lines.position.y = floatY;
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
    console.log('Initializing Premium ParticleSphere...');
    console.log('THREE.js version:', THREE.REVISION);
    console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    new ParticleSphere('particle-sphere-container');
  } else {
    console.error('particle-sphere-container not found');
  }
}

// Wait for both DOM and window load to ensure scripts are loaded
window.addEventListener('load', initParticleSphere);
