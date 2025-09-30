import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CustomCursor() {
  const mountRef = useRef(null);
  const [cursorStyle, setCursorStyle] = useState('sphere');

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Create cursor group
    const cursorGroup = new THREE.Group();
    scene.add(cursorGroup);

    // Main cursor sphere
    const cursorSphereGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const cursorSphereMat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const cursorSphere = new THREE.Mesh(cursorSphereGeo, cursorSphereMat);
    cursorGroup.add(cursorSphere);

    // Outer ring
    const outerRingGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    cursorGroup.add(outerRing);

    // Inner ring
    const innerRingGeo = new THREE.TorusGeometry(0.35, 0.03, 16, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    cursorGroup.add(innerRing);

    // Orbiting particles
    const orbitParticles = [];
    for (let i = 0; i < 8; i++) {
      const particleGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const particleMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / 8, 1, 0.6)
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      orbitParticles.push({
        mesh: particle,
        angle: (i / 8) * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.05
      });
      cursorGroup.add(particle);
    }

    // Trail particles
    const trailParticles = [];
    const maxTrailParticles = 20;

    function createTrailParticle(x, y, z) {
      const geo = new THREE.SphereGeometry(0.1, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(geo, mat);
      particle.position.set(x, y, z);
      scene.add(particle);
      
      trailParticles.push({
        mesh: particle,
        life: 1.0,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      });

      if (trailParticles.length > maxTrailParticles) {
        const old = trailParticles.shift();
        scene.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.dispose();
      }
    }

    // Interactive objects in the scene
    const interactiveObjects = [];

    function createInteractiveBox(x, y, z) {
      const geo = new THREE.BoxGeometry(2, 2, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        metalness: 0.5,
        roughness: 0.3
      });
      const box = new THREE.Mesh(geo, mat);
      box.position.set(x, y, z);
      box.castShadow = true;
      box.userData.originalColor = 0x4488ff;
      scene.add(box);
      interactiveObjects.push(box);
      return box;
    }

    function createInteractiveSphere(x, y, z) {
      const geo = new THREE.SphereGeometry(1, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff6644,
        metalness: 0.7,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(x, y, z);
      sphere.castShadow = true;
      sphere.userData.originalColor = 0xff6644;
      scene.add(sphere);
      interactiveObjects.push(sphere);
      return sphere;
    }

    function createInteractiveTorus(x, y, z) {
      const geo = new THREE.TorusGeometry(1, 0.4, 16, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x44ff88,
        metalness: 0.6,
        roughness: 0.3
      });
      const torus = new THREE.Mesh(geo, mat);
      torus.position.set(x, y, z);
      torus.castShadow = true;
      torus.userData.originalColor = 0x44ff88;
      scene.add(torus);
      interactiveObjects.push(torus);
      return torus;
    }

    // Create scene objects
    createInteractiveBox(-5, 0, -5);
    createInteractiveSphere(5, 0, -5);
    createInteractiveTorus(0, 0, -8);
    createInteractiveBox(-5, 0, 5);
    createInteractiveSphere(5, 0, 5);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const cursorLight = new THREE.PointLight(0xff00ff, 2, 10);
    cursorGroup.add(cursorLight);

    // Camera
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Mouse tracking
    const mouse = new THREE.Vector2();
    const targetPosition = new THREE.Vector3();
    const currentPosition = new THREE.Vector3();
    const lagFactor = 0.1; // Lower = more lag

    let isMouseDown = false;

    const raycaster = new THREE.Raycaster();
    let hoveredObject = null;

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Calculate target position in 3D space
      const planeZ = 0;
      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = (planeZ - camera.position.z) / dir.z;
      targetPosition.copy(camera.position).add(dir.multiplyScalar(distance));
    };

    const handleMouseDown = () => {
      isMouseDown = true;
      cursorGroup.scale.set(0.7, 0.7, 0.7);
      
      // Explosion effect
      for (let i = 0; i < 10; i++) {
        createTrailParticle(
          currentPosition.x,
          currentPosition.y,
          currentPosition.z
        );
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      cursorGroup.scale.set(1, 1, 1);
    };

    const handleClick = () => {
      // Check if we clicked on an object
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        // Pulse animation
        const originalScale = obj.scale.clone();
        obj.scale.multiplyScalar(1.3);
        setTimeout(() => {
          obj.scale.copy(originalScale);
        }, 200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    // Animation
    let time = 0;
    let trailCounter = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Smooth cursor following with lag
      currentPosition.lerp(targetPosition, lagFactor);
      cursorGroup.position.copy(currentPosition);

      // Rotate cursor
      cursorSphere.rotation.y += 0.02;
      cursorSphere.rotation.x += 0.01;

      // Rotate rings
      outerRing.rotation.x += 0.03;
      innerRing.rotation.y += 0.04;

      // Pulse rings
      const pulse = Math.sin(time * 3) * 0.1 + 1;
      outerRing.scale.set(pulse, pulse, pulse);
      innerRing.scale.set(1.1 - (pulse - 1), 1.1 - (pulse - 1), 1.1 - (pulse - 1));

      // Orbit particles
      orbitParticles.forEach((p, i) => {
        p.angle += p.speed;
        const radius = 0.8;
        p.mesh.position.x = Math.cos(p.angle) * radius;
        p.mesh.position.y = Math.sin(p.angle) * radius * 0.5;
        p.mesh.position.z = Math.sin(p.angle) * radius;
      });

      // Create trail
      trailCounter++;
      if (trailCounter % 3 === 0) {
        createTrailParticle(
          currentPosition.x,
          currentPosition.y,
          currentPosition.z
        );
      }

      // Update trail particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life -= 0.02;
        p.mesh.material.opacity = p.life;
        p.mesh.position.add(p.velocity);
        p.mesh.scale.multiplyScalar(0.98);

        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          trailParticles.splice(i, 1);
        }
      }

      // Check for hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);

      // Reset previous hover
      if (hoveredObject) {
        hoveredObject.material.color.setHex(hoveredObject.userData.originalColor);
        hoveredObject.material.emissive.setHex(0x000000);
      }

      if (intersects.length > 0) {
        hoveredObject = intersects[0].object;
        hoveredObject.material.emissive.setHex(0xffffff);
        hoveredObject.material.emissiveIntensity = 0.3;
        
        // Scale up cursor
        cursorGroup.scale.set(1.5, 1.5, 1.5);
      } else {
        hoveredObject = null;
        if (!isMouseDown) {
          cursorGroup.scale.set(1, 1, 1);
        }
      }

      // Rotate interactive objects
      interactiveObjects.forEach((obj, i) => {
        obj.rotation.y += 0.005;
        obj.rotation.x += 0.003;
        obj.position.y = Math.sin(time + i) * 0.5;
      });

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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      document.body.style.cursor = 'default';
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
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px 30px',
        borderRadius: '15px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 0, 255, 0.4)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
          🖱️ 3D Custom Cursor
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.6' }}>
          • Move mouse to control cursor<br/>
          • Hover over objects to interact<br/>
          • Click to trigger effects<br/>
          • Hold mouse button for pulse
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 20px',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'monospace',
        fontSize: '11px',
        backdropFilter: 'blur(10px)'
      }}>
        Default cursor hidden • 3D cursor with smooth lag following • Particle trail enabled
      </div>
    </div>
  );
}
