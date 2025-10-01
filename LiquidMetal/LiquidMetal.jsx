import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function LiquidMetalBlobs() {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [metalType, setMetalType] = useState('chrome');

  const metalTypes = {
    chrome: { color: 0xcccccc, metalness: 1, roughness: 0.1, name: 'Chrome' },
    gold: { color: 0xffd700, metalness: 0.9, roughness: 0.2, name: 'Gold' },
    copper: { color: 0xff6633, metalness: 0.85, roughness: 0.25, name: 'Copper' },
    silver: { color: 0xe8e8e8, metalness: 0.95, roughness: 0.15, name: 'Silver' },
    obsidian: { color: 0x1a1a2e, metalness: 0.8, roughness: 0.3, name: 'Obsidian' },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 30);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Create environment map for reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    scene.add(cubeCamera);

    // Metaball class
    class Metaball {
      constructor(position, velocity, radius, index) {
        const metalConfig = metalTypes[metalType];
        
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: metalConfig.color,
          metalness: metalConfig.metalness,
          roughness: metalConfig.roughness,
          envMap: cubeRenderTarget.texture,
          envMapIntensity: 1.5,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        
        this.velocity = velocity;
        this.radius = radius;
        this.baseRadius = radius;
        this.index = index;
        this.targetScale = 1;
        this.wobblePhase = Math.random() * Math.PI * 2;
      }

      update(delta, allBalls, mouseInfluence) {
        // Apply velocity
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Boundary collision
        const bounds = 8;
        if (Math.abs(this.mesh.position.x) > bounds) {
          this.velocity.x *= -0.8;
          this.mesh.position.x = Math.sign(this.mesh.position.x) * bounds;
        }
        if (Math.abs(this.mesh.position.y) > bounds) {
          this.velocity.y *= -0.8;
          this.mesh.position.y = Math.sign(this.mesh.position.y) * bounds;
        }
        if (Math.abs(this.mesh.position.z) > bounds) {
          this.velocity.z *= -0.8;
          this.mesh.position.z = Math.sign(this.mesh.position.z) * bounds;
        }

        // Mouse attraction
        const mousePos = new THREE.Vector3(
          mouseInfluence.x * 8,
          mouseInfluence.y * 8,
          0
        );
        const toMouse = mousePos.sub(this.mesh.position);
        const mouseDist = toMouse.length();
        if (mouseDist < 5) {
          this.velocity.add(toMouse.normalize().multiplyScalar(delta * 2));
        }

        // Gravity
        this.velocity.y -= delta * 1;

        // Damping
        this.velocity.multiplyScalar(0.98);

        // Check for merging with other balls
        let nearbyMass = 0;
        allBalls.forEach(other => {
          if (other !== this) {
            const dist = this.mesh.position.distanceTo(other.mesh.position);
            const threshold = this.radius + other.radius;
            
            if (dist < threshold) {
              // Merge influence
              nearbyMass += 1 / (dist + 0.1);
              
              // Blend positions
              const dir = other.mesh.position.clone().sub(this.mesh.position).normalize();
              this.velocity.add(dir.multiplyScalar(delta * 0.5));
              
              // Exchange momentum
              const tempVel = this.velocity.clone();
              this.velocity.lerp(other.velocity, 0.1);
              other.velocity.lerp(tempVel, 0.1);
            }
          }
        });

        // Scale based on nearby blobs (metaball effect)
        this.targetScale = 1 + nearbyMass * 0.3;
        const currentScale = this.mesh.scale.x;
        this.mesh.scale.setScalar(currentScale + (this.targetScale - currentScale) * 0.1);

        // Wobble effect
        this.wobblePhase += delta * 2;
        const wobble = Math.sin(this.wobblePhase) * 0.05;
        this.mesh.scale.x += wobble;
        this.mesh.scale.z += wobble * 0.5;

        // Limit velocity
        const maxSpeed = 5;
        if (this.velocity.length() > maxSpeed) {
          this.velocity.normalize().multiplyScalar(maxSpeed);
        }
      }
    }

    // Create initial blobs
    const createBlobs = () => {
      blobsRef.current.forEach(blob => {
        scene.remove(blob.mesh);
        blob.mesh.geometry.dispose();
        blob.mesh.material.dispose();
      });
      blobsRef.current = [];

      const blobCount = 8;
      for (let i = 0; i < blobCount; i++) {
        const angle = (i / blobCount) * Math.PI * 2;
        const radius = 4 + Math.random() * 2;
        const position = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.random() * 4 - 2,
          Math.sin(angle) * radius
        );
        
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        
        const size = 0.5 + Math.random() * 0.5;
        const blob = new Metaball(position, velocity, size, i);
        scene.add(blob.mesh);
        blobsRef.current.push(blob);
      }
    };

    createBlobs();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const keyLight = new THREE.PointLight(0x00ffff, 2, 30);
    keyLight.position.set(-8, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xff00ff, 2, 30);
    fillLight.position.set(8, 5, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffff00, 1.5, 20);
    rimLight.position.set(0, -5, 8);
    scene.add(rimLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8,
      roughness: 0.4,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update all blobs
      blobsRef.current.forEach(blob => {
        blob.update(delta, blobsRef.current, mouseRef.current);
      });

      // Animate lights
      keyLight.position.x = Math.sin(elapsed * 0.5) * 10;
      keyLight.position.z = Math.cos(elapsed * 0.5) * 10;
      
      fillLight.position.x = Math.cos(elapsed * 0.7) * 10;
      fillLight.position.z = Math.sin(elapsed * 0.7) * 10;

      rimLight.position.x = Math.sin(elapsed * 0.3) * 8;
      rimLight.position.z = Math.cos(elapsed * 0.3) * 8;

      // Camera movement
      camera.position.x += (mouseRef.current.x * 3 - camera.position.x) * 0.05;
      camera.position.y += (-mouseRef.current.y * 2 + 3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate particles
      particles.rotation.y += 0.0002;

      // Update environment map periodically
      if (Math.floor(elapsed * 2) % 10 === 0) {
        cubeCamera.update(renderer, scene);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      blobsRef.current.forEach(blob => {
        blob.mesh.geometry.dispose();
        blob.mesh.material.dispose();
      });
      groundGeometry.dispose();
      groundMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      cubeRenderTarget.dispose();
      renderer.dispose();
    };
  }, [metalType]);

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      <div ref={containerRef} className="w-full h-screen" />
      
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-10 pointer-events-none">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
          LIQUID METAL
        </h1>
        <p className="text-xl text-cyan-300 font-light">
          Metaball physics • Merging & splitting blobs
        </p>
      </div>

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-cyan-500/30">
          <div className="text-xs font-bold text-cyan-400 mb-4 tracking-wider text-center">
            METAL TYPE
          </div>
          <div className="flex gap-3">
            {Object.entries(metalTypes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setMetalType(key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  metalType === key
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-32 left-8 z-10 bg-black/50 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
        <div className="text-cyan-400 text-sm font-semibold mb-2">INTERACTIONS</div>
        <div className="text-white/80 text-xs space-y-1">
          <div>🖱️ Move mouse to attract blobs</div>
          <div>💫 Blobs merge when close</div>
          <div>🌊 Physics-based motion</div>
        </div>
      </div>

      <div className="absolute top-32 right-8 z-10 bg-black/50 backdrop-blur-md rounded-xl p-4 border border-purple-500/20">
        <div className="text-purple-400 text-sm font-semibold mb-2">EFFECTS</div>
        <div className="text-white/80 text-xs space-y-1">
          <div>✨ Real-time reflections</div>
          <div>🎨 Dynamic lighting</div>
          <div>🔮 Wobble animations</div>
        </div>
      </div>
    </div>
  );
}
