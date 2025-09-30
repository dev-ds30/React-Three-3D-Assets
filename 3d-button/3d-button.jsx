import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function InteractiveButton() {
  const mountRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Button components
    const buttonGroup = new THREE.Group();

    // Button base (fixed)
    const baseGeometry = new THREE.CylinderGeometry(3, 3.2, 0.5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.6,
      roughness: 0.4
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.25;
    base.receiveShadow = true;
    buttonGroup.add(base);

    // Button top (pressable)
    const buttonGeometry = new THREE.CylinderGeometry(2.8, 2.8, 1, 32);
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0066,
      metalness: 0.3,
      roughness: 0.2,
      emissive: 0xff0066,
      emissiveIntensity: 0.3
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.y = 0.5;
    button.castShadow = true;
    button.receiveShadow = true;
    buttonGroup.add(button);

    // Button rim/edge
    const rimGeometry = new THREE.TorusGeometry(2.8, 0.15, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x666677,
      metalness: 0.8,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1;
    buttonGroup.add(rim);

    // Button label (text simulation with geometry)
    const labelGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.05);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, 0.55, 0);
    label.rotation.x = -Math.PI / 2;
    buttonGroup.add(label);

    // "PRESS" text elements (simple bars to simulate letters)
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0066 });
    
    // P
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.01), textMaterial);
    p1.position.set(-0.6, 0.56, 0);
    p1.rotation.x = -Math.PI / 2;
    buttonGroup.add(p1);
    
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.01), textMaterial);
    p2.position.set(-0.54, 0.56, 0.11);
    p2.rotation.x = -Math.PI / 2;
    buttonGroup.add(p2);

    // R
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.01), textMaterial);
    r1.position.set(-0.3, 0.56, 0);
    r1.rotation.x = -Math.PI / 2;
    buttonGroup.add(r1);
    
    const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.01), textMaterial);
    r2.position.set(-0.24, 0.56, 0.11);
    r2.rotation.x = -Math.PI / 2;
    buttonGroup.add(r2);

    // E
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.01), textMaterial);
    e1.position.set(0, 0.56, 0);
    e1.rotation.x = -Math.PI / 2;
    buttonGroup.add(e1);
    
    const e2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.01), textMaterial);
    e2.position.set(0.07, 0.56, 0.11);
    e2.rotation.x = -Math.PI / 2;
    buttonGroup.add(e2);

    // S
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.01), textMaterial);
    s1.position.set(0.33, 0.56, 0.11);
    s1.rotation.x = -Math.PI / 2;
    buttonGroup.add(s1);
    
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.01), textMaterial);
    s2.position.set(0.33, 0.56, -0.11);
    s2.rotation.x = -Math.PI / 2;
    buttonGroup.add(s2);

    // S (continued)
    const s3 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.01), textMaterial);
    s3.position.set(0.26, 0.56, 0);
    s3.rotation.x = -Math.PI / 2;
    buttonGroup.add(s3);

    scene.add(buttonGroup);

    // Glow ring that pulses
    const glowRingGeometry = new THREE.TorusGeometry(3.2, 0.1, 16, 32);
    const glowRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0066,
      transparent: true,
      opacity: 0.4
    });
    const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = 0.1;
    buttonGroup.add(glowRing);

    // Platform below button
    const platformGeometry = new THREE.CylinderGeometry(6, 6, 0.5, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x16213e,
      metalness: 0.5,
      roughness: 0.5
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -1;
    platform.receiveShadow = true;
    scene.add(platform);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const accentLight1 = new THREE.PointLight(0xff0066, 2, 20);
    accentLight1.position.set(0, 5, 0);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x00ffff, 1, 20);
    accentLight2.position.set(5, 3, 5);
    scene.add(accentLight2);

    // Camera position
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Button state
    let isPressed = false;
    let pressProgress = 0;
    const pressDepth = 0.4;
    const pressSpeed = 0.15;

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isHovering = false;

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(button);

      if (intersects.length > 0) {
        isHovering = true;
        document.body.style.cursor = 'pointer';
      } else {
        isHovering = false;
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(button);

      if (intersects.length > 0) {
        isPressed = true;
        setClickCount(prev => prev + 1);
        setLastClickTime(Date.now());
        
        // Flash effect
        buttonMaterial.emissiveIntensity = 0.8;
        
        // Sound effect simulation with color flash
        scene.background.setHex(0x2a2a3e);
        setTimeout(() => {
          scene.background.setHex(0x1a1a2e);
        }, 100);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Button press animation
      if (isPressed) {
        pressProgress = Math.min(pressProgress + pressSpeed, 1);
        if (pressProgress >= 1) {
          isPressed = false;
        }
      } else {
        pressProgress = Math.max(pressProgress - pressSpeed, 0);
      }

      // Apply press depth
      const currentDepth = pressProgress * pressDepth;
      button.position.y = 0.5 - currentDepth;
      rim.position.y = 1 - currentDepth;
      label.position.y = 0.55 - currentDepth;

      // Update text elements positions
      [p1, p2, r1, r2, e1, e2, s1, s2, s3].forEach(element => {
        element.position.y = 0.56 - currentDepth;
      });

      // Emissive fade
      if (buttonMaterial.emissiveIntensity > 0.3) {
        buttonMaterial.emissiveIntensity -= 0.02;
      }

      // Hover effect
      if (isHovering && pressProgress === 0) {
        button.scale.set(1.02, 1, 1.02);
        buttonMaterial.emissiveIntensity = 0.4;
      } else if (pressProgress === 0) {
        button.scale.set(1, 1, 1);
      }

      // Glow ring pulse
      glowRing.scale.set(
        1 + Math.sin(time * 2) * 0.05,
        1,
        1 + Math.sin(time * 2) * 0.05
      );
      glowRingMaterial.opacity = 0.3 + Math.sin(time * 2) * 0.1;

      // Rotate button group slowly
      buttonGroup.rotation.y = Math.sin(time * 0.2) * 0.1;

      // Animate lights
      accentLight2.position.x = Math.sin(time * 0.5) * 6;
      accentLight2.position.z = Math.cos(time * 0.5) * 6;

      // Slowly orbit camera
      camera.position.x = Math.sin(time * 0.05) * 10;
      camera.position.z = Math.cos(time * 0.05) * 10;
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.body.style.cursor = 'default';
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Stats Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px 40px',
        borderRadius: '15px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 0, 102, 0.5)'
      }}>
        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>
          Button Pressed
        </div>
        <div style={{ fontSize: '48px', fontWeight: '700', color: '#ff0066' }}>
          {clickCount}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '5px' }}>
          times
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px 25px',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ marginBottom: '5px', fontSize: '16px' }}>
          🖱️ Click the button to press it!
        </div>
        <div style={{ opacity: 0.7, fontSize: '11px' }}>
          Watch it depress with smooth animation
        </div>
      </div>

      {/* Recent click indicator */}
      {Date.now() - lastClickTime < 1000 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '80px',
          animation: 'fadeOut 1s ease-out',
          pointerEvents: 'none',
          color: '#ff0066',
          fontWeight: '900',
          textShadow: '0 0 20px #ff0066'
        }}>
          ✓
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
