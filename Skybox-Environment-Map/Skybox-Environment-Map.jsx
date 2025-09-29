import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SkyboxEnvironments() {
  const mountRef = useRef(null);
  const [currentEnv, setCurrentEnv] = useState('day');

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // Create procedural skybox textures
    const createDaySkybox = () => {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#B0E0E6');
      gradient.addColorStop(1, '#F0F8FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Add clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size * 0.6;
        const w = Math.random() * 200 + 100;
        const h = Math.random() * 60 + 30;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun
      const sunGrad = ctx.createRadialGradient(size * 0.8, size * 0.2, 0, size * 0.8, size * 0.2, 150);
      sunGrad.addColorStop(0, '#FFF5E1');
      sunGrad.addColorStop(0.3, '#FFD700');
      sunGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(size * 0.7, size * 0.1, 300, 300);

      return new THREE.CanvasTexture(canvas);
    };

    const createNightSkybox = () => {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, '#000428');
      gradient.addColorStop(0.5, '#004e92');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moon
      const moonGrad = ctx.createRadialGradient(size * 0.7, size * 0.25, 0, size * 0.7, size * 0.25, 100);
      moonGrad.addColorStop(0, '#F0F0F0');
      moonGrad.addColorStop(0.7, '#C0C0C0');
      moonGrad.addColorStop(1, 'rgba(192, 192, 192, 0)');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(size * 0.6, size * 0.15, 250, 250);

      // Moon craters
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      for (let i = 0; i < 15; i++) {
        const x = size * 0.7 + (Math.random() - 0.5) * 80;
        const y = size * 0.25 + (Math.random() - 0.5) * 80;
        const r = Math.random() * 15 + 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createCyberpunkSkybox = () => {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.3, '#1a0033');
      gradient.addColorStop(0.6, '#330033');
      gradient.addColorStop(1, '#660066');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Neon grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (i / 20) * size);
        ctx.lineTo(size, (i / 20) * size);
        ctx.stroke();
      }

      // Glowing buildings silhouette
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      for (let i = 0; i < 30; i++) {
        const x = (i / 30) * size;
        const h = Math.random() * 400 + 200;
        ctx.fillRect(x, size - h, size / 35, h);
      }

      // Neon lights on buildings
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = size - Math.random() * 600;
        const colors = ['#ff006e', '#00f5ff', '#7c3aed', '#39ff14'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 20);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - 20, y - 20, 40, 40);
      }

      return new THREE.CanvasTexture(canvas);
    };

    const createSpaceSkybox = () => {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);

      // Nebula clouds
      const nebulaGrad = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.6);
      nebulaGrad.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
      nebulaGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.3)');
      nebulaGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, size, size);

      // Another nebula
      const nebula2 = ctx.createRadialGradient(size * 0.7, size * 0.6, 0, size * 0.7, size * 0.6, size * 0.5);
      nebula2.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
      nebula2.addColorStop(0.4, 'rgba(239, 68, 68, 0.2)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(size * 0.4, size * 0.3, size * 0.6, size * 0.6);

      // Stars - various sizes
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2 + 0.5;
        const brightness = Math.random();
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Add glow to brighter stars
        if (brightness > 0.7) {
          const starGlow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          starGlow.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.5})`);
          starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = starGlow;
          ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
        }
      }

      // Distant galaxy
      const galaxyGrad = ctx.createRadialGradient(size * 0.85, size * 0.2, 0, size * 0.85, size * 0.2, 100);
      galaxyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      galaxyGrad.addColorStop(0.5, 'rgba(200, 200, 255, 0.3)');
      galaxyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = galaxyGrad;
      ctx.fillRect(size * 0.75, size * 0.1, 200, 200);

      return new THREE.CanvasTexture(canvas);
    };

    const skyboxTextures = {
      day: createDaySkybox(),
      night: createNightSkybox(),
      cyberpunk: createCyberpunkSkybox(),
      space: createSpaceSkybox()
    };

    // Create skybox
    const skyboxGeo = new THREE.SphereGeometry(500, 60, 40);
    skyboxGeo.scale(-1, 1, 1);
    const skyboxMat = new THREE.MeshBasicMaterial({
      map: skyboxTextures[currentEnv]
    });
    const skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
    scene.add(skybox);

    // Add reflective sphere to show environment
    const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.1,
      envMap: skyboxTextures[currentEnv],
      envMapIntensity: 2.0
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = 2;
    scene.add(sphere);

    // Add chrome cube
    const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.05,
      envMap: skyboxTextures[currentEnv],
      envMapIntensity: 2.5
    });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(-3, 1.5, 0);
    scene.add(cube);

    // Add glass torus
    const torusGeo = new THREE.TorusGeometry(1.2, 0.4, 32, 100);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0.95,
      thickness: 0.5,
      envMap: skyboxTextures[currentEnv],
      envMapIntensity: 1.5,
      transparent: true,
      ior: 1.5
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(3, 2, 0);
    scene.add(torus);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.5
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    camera.position.set(0, 4, 8);
    camera.lookAt(0, 2, 0);

    // Animation
    let time = 0;
    
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      sphere.rotation.y += 0.005;
      cube.rotation.x += 0.003;
      cube.rotation.y += 0.005;
      torus.rotation.x += 0.004;
      torus.rotation.y += 0.006;

      skybox.rotation.y += 0.0002;

      camera.position.x = Math.sin(time * 0.1) * 8;
      camera.position.z = Math.cos(time * 0.1) * 8;
      camera.lookAt(0, 2, 0);

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
      renderer.dispose();
    };
  }, [currentEnv]);

  const environments = [
    { id: 'day', label: 'Day ☀️', color: '#87CEEB' },
    { id: 'night', label: 'Night 🌙', color: '#004e92' },
    { id: 'cyberpunk', label: 'Cyberpunk 🌆', color: '#ff006e' },
    { id: 'space', label: 'Space 🚀', color: '#9333ea' }
  ];

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {environments.map(env => (
          <button
            key={env.id}
            onClick={() => setCurrentEnv(env.id)}
            style={{
              padding: '12px 20px',
              background: currentEnv === env.id ? env.color : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: currentEnv === env.id ? '2px solid white' : '2px solid transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.3s ease',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={(e) => {
              if (currentEnv !== env.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentEnv !== env.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
          >
            {env.label}
          </button>
        ))}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '10px 20px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        Click buttons to switch environments • Reflective objects show the skybox
      </div>
    </div>
  );
}
