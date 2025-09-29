import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingTorus() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    mountRef.current.appendChild(renderer.domElement);

    // Create environment map for reflections
    const createEnvironmentMap = () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Vibrant gradient
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ff6b9d');
      gradient.addColorStop(0.3, '#c06c84');
      gradient.addColorStop(0.6, '#6c5b7b');
      gradient.addColorStop(1, '#355c7d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 30 + 10;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      return texture;
    };

    const envMap = createEnvironmentMap();

    // Create main torus
    const torusGeometry = new THREE.TorusGeometry(2.5, 1, 64, 128);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.15,
      envMap: envMap,
      envMapIntensity: 2.5
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.castShadow = true;
    torus.receiveShadow = true;
    scene.add(torus);

    // Create inner glowing ring
    const innerRingGeo = new THREE.TorusGeometry(2.5, 0.15, 32, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    scene.add(innerRing);

    // Create outer energy ring
    const outerRingGeo = new THREE.TorusGeometry(3.8, 0.05, 16, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.6
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    scene.add(outerRing);

    // Particles orbiting the torus
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 4 + Math.random() * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 1, 0.6);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Add platform below
    const platformGeo = new THREE.CylinderGeometry(5, 5, 0.3, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      envMap: envMap,
      envMapIntensity: 1.0
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -3;
    platform.receiveShadow = true;
    scene.add(platform);

    // Add decorative rings on platform
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(4 - i * 1.2, 0.02, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -2.85;
      scene.add(ring);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 3, 30);
    pointLight1.position.set(5, 5, 5);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 3, 30);
    pointLight2.position.set(-5, 5, -5);
    pointLight2.castShadow = true;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 20);
    pointLight3.position.set(0, 8, 0);
    scene.add(pointLight3);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x4466ff, 2);
    rimLight.position.set(0, -5, 10);
    scene.add(rimLight);

    // Camera position
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);

    // Animation
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate main torus - slow and majestic
      torus.rotation.x += 0.003;
      torus.rotation.y += 0.005;

      // Float up and down
      torus.position.y = Math.sin(time * 0.5) * 0.5;

      // Rotate inner ring opposite direction
      innerRing.rotation.x = torus.rotation.x;
      innerRing.rotation.y = -torus.rotation.y * 1.5;
      innerRing.position.y = torus.position.y;

      // Pulse inner ring
      const pulse = Math.sin(time * 2) * 0.5 + 0.5;
      innerRingMat.opacity = 0.5 + pulse * 0.3;

      // Rotate outer ring
      outerRing.rotation.z += 0.01;
      outerRing.position.y = torus.position.y;
      outerRingMat.opacity = 0.4 + Math.sin(time * 3) * 0.2;

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.3;
        const radius = 4 + Math.sin(time + i * 0.1) * 1.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(time * 2 + i * 0.05) * 3;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.002;

      // Animate lights
      pointLight1.position.x = Math.sin(time * 0.7) * 8;
      pointLight1.position.z = Math.cos(time * 0.7) * 8;

      pointLight2.position.x = Math.cos(time * 0.5) * 8;
      pointLight2.position.z = Math.sin(time * 0.5) * 8;

      // Orbit camera
      camera.position.x = Math.sin(time * 0.15) * 12;
      camera.position.z = Math.cos(time * 0.15) * 12;
      camera.position.y = 3 + Math.sin(time * 0.1) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      torusGeometry.dispose();
      torusMaterial.dispose();
      envMap.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '12px 24px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.3)'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '5px', fontWeight: '600' }}>
          Metallic Torus
        </div>
        <div style={{ opacity: 0.8, fontSize: '11px' }}>
          PBR Material • Environment Mapping • Floating Animation
        </div>
      </div>
    </div>
  );
}
