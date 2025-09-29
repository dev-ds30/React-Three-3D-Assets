import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Cityscape() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 80);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Function to create building with windows
    function createBuilding(width, height, depth, x, z) {
      const group = new THREE.Group();

      // Building body
      const buildingGeo = new THREE.BoxGeometry(width, height, depth);
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2
      });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.y = height / 2;
      group.add(building);

      // Create windows
      const windowRows = Math.floor(height / 2);
      const windowColsWidth = Math.floor(width / 0.8);
      const windowColsDepth = Math.floor(depth / 0.8);

      // Windows on front face
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsWidth; col++) {
          if (Math.random() > 0.3) { // 70% chance of lit window
            const windowGeo = new THREE.PlaneGeometry(0.4, 0.6);
            const isWarm = Math.random() > 0.5;
            const windowMat = new THREE.MeshBasicMaterial({
              color: isWarm ? 0xffcc66 : 0x66ccff,
              transparent: true,
              opacity: 0.7 + Math.random() * 0.3
            });
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(
              (col - windowColsWidth / 2) * 0.8 + 0.4,
              row * 2 + 1,
              depth / 2 + 0.01
            );
            group.add(window);
          }
        }
      }

      // Windows on back face
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsWidth; col++) {
          if (Math.random() > 0.3) {
            const windowGeo = new THREE.PlaneGeometry(0.4, 0.6);
            const isWarm = Math.random() > 0.5;
            const windowMat = new THREE.MeshBasicMaterial({
              color: isWarm ? 0xffcc66 : 0x66ccff,
              transparent: true,
              opacity: 0.7 + Math.random() * 0.3
            });
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(
              (col - windowColsWidth / 2) * 0.8 + 0.4,
              row * 2 + 1,
              -depth / 2 - 0.01
            );
            window.rotation.y = Math.PI;
            group.add(window);
          }
        }
      }

      // Windows on left face
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsDepth; col++) {
          if (Math.random() > 0.3) {
            const windowGeo = new THREE.PlaneGeometry(0.4, 0.6);
            const isWarm = Math.random() > 0.5;
            const windowMat = new THREE.MeshBasicMaterial({
              color: isWarm ? 0xffcc66 : 0x66ccff,
              transparent: true,
              opacity: 0.7 + Math.random() * 0.3
            });
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(
              -width / 2 - 0.01,
              row * 2 + 1,
              (col - windowColsDepth / 2) * 0.8 + 0.4
            );
            window.rotation.y = Math.PI / 2;
            group.add(window);
          }
        }
      }

      // Windows on right face
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowColsDepth; col++) {
          if (Math.random() > 0.3) {
            const windowGeo = new THREE.PlaneGeometry(0.4, 0.6);
            const isWarm = Math.random() > 0.5;
            const windowMat = new THREE.MeshBasicMaterial({
              color: isWarm ? 0xffcc66 : 0x66ccff,
              transparent: true,
              opacity: 0.7 + Math.random() * 0.3
            });
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(
              width / 2 + 0.01,
              row * 2 + 1,
              (col - windowColsDepth / 2) * 0.8 + 0.4
            );
            window.rotation.y = -Math.PI / 2;
            group.add(window);
          }
        }
      }

      // Add rooftop light
      const roofLightGeo = new THREE.BoxGeometry(width * 0.3, 0.2, depth * 0.3);
      const roofLightMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff0066 : 0x00ffff
      });
      const roofLight = new THREE.Mesh(roofLightGeo, roofLightMat);
      roofLight.position.y = height + 0.1;
      group.add(roofLight);

      // Add point light for glow
      const pointLight = new THREE.PointLight(
        roofLightMat.color,
        2,
        10
      );
      pointLight.position.y = height + 0.5;
      group.add(pointLight);

      group.position.set(x, 0, z);
      return group;
    }

    // Create city grid
    const buildings = [];
    const gridSize = 8;
    const spacing = 6;

    for (let i = -gridSize / 2; i < gridSize / 2; i++) {
      for (let j = -gridSize / 2; j < gridSize / 2; j++) {
        // Skip center for camera space
        if (Math.abs(i) < 1 && Math.abs(j) < 1) continue;

        const width = 2 + Math.random() * 2;
        const height = 5 + Math.random() * 20;
        const depth = 2 + Math.random() * 2;
        const x = i * spacing + (Math.random() - 0.5) * 2;
        const z = j * spacing + (Math.random() - 0.5) * 2;

        const building = createBuilding(width, height, depth, x, z);
        buildings.push(building);
        scene.add(building);
      }
    }

    // Create ground/streets
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f1e,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Add street lines
    for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
      // Vertical lines
      const lineGeo1 = new THREE.PlaneGeometry(0.1, 200);
      const lineMat1 = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3
      });
      const line1 = new THREE.Mesh(lineGeo1, lineMat1);
      line1.rotation.x = -Math.PI / 2;
      line1.position.set(i * spacing, 0.01, 0);
      scene.add(line1);

      // Horizontal lines
      const lineGeo2 = new THREE.PlaneGeometry(200, 0.1);
      const lineMat2 = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3
      });
      const line2 = new THREE.Mesh(lineGeo2, lineMat2);
      line2.rotation.x = -Math.PI / 2;
      line2.position.set(0, 0.01, i * spacing);
      scene.add(line2);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.5);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x6666ff, 0.5);
    moonLight.position.set(20, 50, 20);
    scene.add(moonLight);

    // Add atmospheric particles/rain
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = Math.random() * 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      particleVelocities.push(-0.1 - Math.random() * 0.1);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6699ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Camera position
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 10, 0);

    // Animation
    let time = 0;
    const windowElements = [];
    
    // Collect all window meshes for flickering effect
    buildings.forEach(building => {
      building.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial && child.geometry instanceof THREE.PlaneGeometry) {
          windowElements.push({
            mesh: child,
            baseOpacity: child.material.opacity,
            flickerSpeed: Math.random() * 2 + 1
          });
        }
      });
    });

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Flicker windows randomly
      windowElements.forEach(window => {
        if (Math.random() > 0.99) {
          window.mesh.material.opacity = window.baseOpacity * (0.3 + Math.random() * 0.7);
        }
      });

      // Animate particles (rain)
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i];
        
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 50;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Slowly orbit camera
      const radius = 30;
      camera.position.x = Math.sin(time * 0.05) * radius;
      camera.position.z = Math.cos(time * 0.05) * radius;
      camera.position.y = 15 + Math.sin(time * 0.03) * 5;
      camera.lookAt(0, 10, 0);

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
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px 20px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 153, 255, 0.3)'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
          🌃 Night City
        </div>
        <div style={{ opacity: 0.85, fontSize: '11px', lineHeight: '1.6' }}>
          • Procedurally generated buildings<br/>
          • Lit windows (warm & cool tones)<br/>
          • Rooftop lights with glow<br/>
          • Street grid with neon lines<br/>
          • Atmospheric rain particles<br/>
          • Random window flickering
        </div>
      </div>
    </div>
  );
}
