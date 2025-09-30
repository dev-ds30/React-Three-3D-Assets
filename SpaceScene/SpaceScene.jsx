import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SpaceScene() {
  const mountRef = useRef(null);
  const [controls, setControls] = useState({
    orbitSpeed: 1,
    rotationSpeed: 1,
    showSatellites: true,
    showOrbits: true
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create procedural Earth texture
    const createEarthTexture = () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Ocean base
      ctx.fillStyle = '#1e4d8b';
      ctx.fillRect(0, 0, size, size);

      // Continents (simplified)
      ctx.fillStyle = '#2d5016';
      
      // North America
      ctx.beginPath();
      ctx.ellipse(200, 250, 100, 150, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.ellipse(220, 450, 60, 120, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Europe/Africa
      ctx.beginPath();
      ctx.ellipse(520, 300, 80, 180, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Asia
      ctx.beginPath();
      ctx.ellipse(700, 250, 140, 130, 0, 0, Math.PI * 2);
      ctx.fill();

      // Australia
      ctx.beginPath();
      ctx.ellipse(780, 550, 60, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = Math.random() * 60 + 30;
        const h = Math.random() * 30 + 15;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Create Moon texture
    const createMoonTexture = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Base color
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, size, size);

      // Craters
      ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Darker patches (maria)
      ctx.fillStyle = 'rgba(70, 70, 70, 0.4)';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 80 + 40;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.7,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Earth atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(10.5, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Create Moon
    const moonGeometry = new THREE.SphereGeometry(2.7, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: createMoonTexture(),
      roughness: 0.9
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(50, 0, 0);
    scene.add(moon);

    // Create Moon orbit line
    const moonOrbitGeometry = new THREE.RingGeometry(49.8, 50.2, 128);
    const moonOrbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
    moonOrbit.rotation.x = Math.PI / 2;
    scene.add(moonOrbit);

    // Create satellites
    const satellites = [];
    const satelliteOrbits = [];

    function createSatellite(orbitRadius, orbitSpeed, color, orbitTilt = 0) {
      const satGroup = new THREE.Group();

      // Satellite body
      const bodyGeo = new THREE.BoxGeometry(0.5, 0.3, 0.3);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      satGroup.add(body);

      // Solar panels
      const panelGeo = new THREE.BoxGeometry(1.5, 0.02, 0.8);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a4d8b });
      const panel1 = new THREE.Mesh(panelGeo, panelMat);
      panel1.position.x = -0.8;
      satGroup.add(panel1);

      const panel2 = new THREE.Mesh(panelGeo, panelMat);
      panel2.position.x = 0.8;
      satGroup.add(panel2);

      // Antenna
      const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
      const antennaMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const antenna = new THREE.Mesh(antennaGeo, antennaMat);
      antenna.position.y = 0.4;
      satGroup.add(antenna);

      // Position satellite
      satGroup.position.set(orbitRadius, 0, 0);

      // Create orbit ring
      const orbitGeo = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      orbitRing.rotation.z = orbitTilt;
      scene.add(orbitRing);

      satelliteOrbits.push(orbitRing);

      satellites.push({
        group: satGroup,
        orbitRadius: orbitRadius,
        orbitSpeed: orbitSpeed,
        angle: Math.random() * Math.PI * 2,
        orbitTilt: orbitTilt
      });

      scene.add(satGroup);
      return satGroup;
    }

    // Create multiple satellites
    createSatellite(15, 0.02, 0x00ffff, 0);
    createSatellite(18, 0.015, 0xff00ff, 0.3);
    createSatellite(22, 0.01, 0xffff00, -0.2);
    createSatellite(25, 0.012, 0x00ff00, 0.5);

    // Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(100, 50, 50);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Add sun glow in distance
    const sunGeo = new THREE.SphereGeometry(20, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffff88
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(300, 150, 150);
    scene.add(sun);

    // Sun glow
    const sunGlowGeo = new THREE.SphereGeometry(25, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.3
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGlow.position.copy(sun.position);
    scene.add(sunGlow);

    // Camera position
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate Earth
      earth.rotation.y += 0.001 * controls.rotationSpeed;
      atmosphere.rotation.y = earth.rotation.y;

      // Orbit Moon
      const moonAngle = time * 0.02 * controls.orbitSpeed;
      moon.position.x = Math.cos(moonAngle) * 50;
      moon.position.z = Math.sin(moonAngle) * 50;
      moon.rotation.y += 0.001 * controls.rotationSpeed;

      // Update satellites
      satellites.forEach((sat, index) => {
        sat.angle += sat.orbitSpeed * controls.orbitSpeed;
        
        const x = Math.cos(sat.angle) * sat.orbitRadius;
        const z = Math.sin(sat.angle) * sat.orbitRadius;
        const y = Math.sin(sat.angle + sat.orbitTilt) * sat.orbitRadius * 0.3;
        
        sat.group.position.set(x, y, z);
        sat.group.rotation.y += 0.02;
        
        sat.group.visible = controls.showSatellites;
      });

      // Update orbit visibility
      moonOrbit.visible = controls.showOrbits;
      satelliteOrbits.forEach(orbit => {
        orbit.visible = controls.showOrbits;
      });

      // Camera follows mouse slightly
      camera.position.x = mouseX * 10;
      camera.position.y = 20 + mouseY * 10;
      camera.lookAt(0, 0, 0);

      // Rotate stars slowly
      stars.rotation.y += 0.0001;

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
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [controls]);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minWidth: '220px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          🚀 Space Controls
        </div>

        {/* Orbit Speed */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>
            Orbit Speed: {controls.orbitSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={controls.orbitSpeed}
            onChange={(e) => setControls({...controls, orbitSpeed: parseFloat(e.target.value)})}
            style={{ width: '100%' }}
          />
        </div>

        {/* Rotation Speed */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>
            Rotation Speed: {controls.rotationSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={controls.rotationSpeed}
            onChange={(e) => setControls({...controls, rotationSpeed: parseFloat(e.target.value)})}
            style={{ width: '100%' }}
          />
        </div>

        {/* Show Satellites */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={controls.showSatellites}
              onChange={(e) => setControls({...controls, showSatellites: e.target.checked})}
              style={{ marginRight: '8px' }}
            />
            Show Satellites
          </label>
        </div>

        {/* Show Orbits */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={controls.showOrbits}
              onChange={(e) => setControls({...controls, showOrbits: e.target.checked})}
              style={{ marginRight: '8px' }}
            />
            Show Orbit Paths
          </label>
        </div>
      </div>

      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '5px' }}>🌍 Earth (10km radius)</div>
        <div style={{ marginBottom: '5px' }}>🌙 Moon (2.7km radius, 50km orbit)</div>
        <div style={{ marginBottom: '5px' }}>🛰️ 4 Satellites in different orbits</div>
        <div style={{ opacity: 0.7, marginTop: '8px' }}>Move mouse to adjust camera</div>
      </div>
    </div>
  );
}
