import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function DiceRoller() {
  const mountRef = useRef(null);
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Create dice
    const diceSize = 2;
    const diceGeometry = new THREE.BoxGeometry(diceSize, diceSize, diceSize);
    
    // Create materials for each face with numbers
    const createDiceFace = (number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);

      // Border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 248, 248);

      // Dots
      ctx.fillStyle = '#000000';
      const dotRadius = 20;
      const positions = {
        1: [[128, 128]],
        2: [[64, 64], [192, 192]],
        3: [[64, 64], [128, 128], [192, 192]],
        4: [[64, 64], [192, 64], [64, 192], [192, 192]],
        5: [[64, 64], [192, 64], [128, 128], [64, 192], [192, 192]],
        6: [[64, 64], [192, 64], [64, 128], [192, 128], [64, 192], [192, 192]]
      };

      positions[number].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshStandardMaterial({ map: texture });
    };

    const diceMaterials = [
      createDiceFace(1), // Right
      createDiceFace(6), // Left
      createDiceFace(2), // Top
      createDiceFace(5), // Bottom
      createDiceFace(3), // Front
      createDiceFace(4)  // Back
    ];

    const dice = new THREE.Mesh(diceGeometry, diceMaterials);
    dice.castShadow = true;
    dice.position.y = 3;
    scene.add(dice);

    // Create table
    const tableGeometry = new THREE.BoxGeometry(15, 0.5, 10);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x0e4d0e,
      roughness: 0.7
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.25;
    table.receiveShadow = true;
    scene.add(table);

    // Table felt texture lines
    const feltLineGeo = new THREE.PlaneGeometry(14, 0.1);
    const feltLineMat = new THREE.MeshBasicMaterial({
      color: 0x0a3d0a,
      transparent: true,
      opacity: 0.5
    });
    
    for (let i = -4; i <= 4; i++) {
      const line = new THREE.Mesh(feltLineGeo, feltLineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.01, i * 1);
      scene.add(line);
    }

    // Table edge trim
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      metalness: 0.3,
      roughness: 0.7
    });

    const createEdge = (width, height, depth, x, y, z) => {
      const geo = new THREE.BoxGeometry(width, height, depth);
      const edge = new THREE.Mesh(geo, edgeMaterial);
      edge.position.set(x, y, z);
      edge.castShadow = true;
      scene.add(edge);
    };

    createEdge(16, 0.3, 0.5, 0, 0.15, 5.25);  // Front
    createEdge(16, 0.3, 0.5, 0, 0.15, -5.25); // Back
    createEdge(0.5, 0.3, 11, 7.75, 0.15, 0);  // Right
    createEdge(0.5, 0.3, 11, -7.75, 0.15, 0); // Left

    // Dice cup holder
    const cupGeo = new THREE.CylinderGeometry(1.5, 1.2, 1, 32);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(-5, 0.5, -3);
    cup.castShadow = true;
    scene.add(cup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x6688ff, 0.5);
    fillLight.position.set(-5, 10, -5);
    scene.add(fillLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0xff0066, 1, 20);
    accentLight1.position.set(5, 5, 5);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x00ffff, 1, 20);
    accentLight2.position.set(-5, 5, -5);
    scene.add(accentLight2);

    // Camera
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 1, 0);

    // Dice physics
    let diceVelocity = new THREE.Vector3(0, 0, 0);
    let diceAngularVelocity = new THREE.Vector3(0, 0, 0);
    let gravity = -0.02;
    let bounceCount = 0;
    let rolling = false;

    // Get which face is up
    function getTopFace() {
      const upVector = new THREE.Vector3(0, 1, 0);
      const faces = [
        { normal: new THREE.Vector3(1, 0, 0), value: 1 },
        { normal: new THREE.Vector3(-1, 0, 0), value: 6 },
        { normal: new THREE.Vector3(0, 1, 0), value: 2 },
        { normal: new THREE.Vector3(0, -1, 0), value: 5 },
        { normal: new THREE.Vector3(0, 0, 1), value: 3 },
        { normal: new THREE.Vector3(0, 0, -1), value: 4 }
      ];

      let maxDot = -1;
      let topFace = 1;

      faces.forEach(face => {
        const worldNormal = face.normal.clone().applyQuaternion(dice.quaternion);
        const dot = worldNormal.dot(upVector);
        if (dot > maxDot) {
          maxDot = dot;
          topFace = face.value;
        }
      });

      return topFace;
    }

    // Roll dice
    function rollDice() {
      if (rolling) return;

      rolling = true;
      bounceCount = 0;
      setIsRolling(true);
      setRollResult(null);

      // Random initial position
      dice.position.set(
        (Math.random() - 0.5) * 4,
        5 + Math.random() * 2,
        (Math.random() - 0.5) * 3
      );

      // Random velocity
      diceVelocity.set(
        (Math.random() - 0.5) * 0.3,
        0,
        (Math.random() - 0.5) * 0.3
      );

      // Random rotation
      diceAngularVelocity.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
    }

    // Click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      if (rolling) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(dice);

      if (intersects.length > 0 || true) { // Allow clicking anywhere
        rollDice();
      }
    };

    window.addEventListener('click', handleClick);

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      if (rolling) {
        // Apply gravity
        diceVelocity.y += gravity;

        // Update position
        dice.position.add(diceVelocity);

        // Update rotation
        dice.rotation.x += diceAngularVelocity.x;
        dice.rotation.y += diceAngularVelocity.y;
        dice.rotation.z += diceAngularVelocity.z;

        // Check collision with table
        if (dice.position.y <= diceSize / 2 + 0.01) {
          dice.position.y = diceSize / 2 + 0.01;
          
          // Bounce
          diceVelocity.y *= -0.5;
          diceVelocity.x *= 0.8;
          diceVelocity.z *= 0.8;
          
          diceAngularVelocity.multiplyScalar(0.7);
          
          bounceCount++;

          // Stop after bounces settle
          if (bounceCount > 5 && Math.abs(diceVelocity.y) < 0.01) {
            diceVelocity.set(0, 0, 0);
            diceAngularVelocity.set(0, 0, 0);
            rolling = false;
            setIsRolling(false);
            
            const result = getTopFace();
            setRollResult(result);
            setRollHistory(prev => [result, ...prev].slice(0, 10));
          }
        }

        // Damping
        diceAngularVelocity.multiplyScalar(0.98);
      } else if (!rolling && rollResult === null) {
        // Idle animation - gentle float
        dice.position.y = 3 + Math.sin(time) * 0.2;
        dice.rotation.y += 0.01;
      }

      // Animate lights
      accentLight1.position.x = Math.sin(time * 0.5) * 6;
      accentLight1.position.z = Math.cos(time * 0.5) * 6;

      accentLight2.position.x = Math.cos(time * 0.7) * 6;
      accentLight2.position.z = Math.sin(time * 0.7) * 6;

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
      window.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px 40px',
        borderRadius: '15px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '5px' }}>
          🎲 Dice Roller
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          Click anywhere to roll the dice!
        </div>
      </div>

      {/* Result Display */}
      {rollResult !== null && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'popIn 0.5s ease-out',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '120px',
            fontWeight: '900',
            color: '#ffff00',
            textShadow: '0 0 30px rgba(255, 255, 0, 0.8), 0 0 60px rgba(255, 255, 0, 0.4)',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            {rollResult}
          </div>
        </div>
      )}

      {/* Rolling indicator */}
      {isRolling && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          pointerEvents: 'none',
          animation: 'spin 1s linear infinite'
        }}>
          🎲
        </div>
      )}

      {/* Roll History */}
      {rollHistory.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px 20px',
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', opacity: 0.8 }}>
            Roll History
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '200px' }}>
            {rollHistory.map((roll, index) => (
              <div
                key={index}
                style={{
                  width: '35px',
                  height: '35px',
                  background: index === 0 ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: index === 0 ? '2px solid rgba(255, 255, 0, 0.8)' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: index === 0 ? '#ffff00' : 'white'
                }}
              >
                {roll}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '10px' }}>
            Average: {(rollHistory.reduce((a, b) => a + b, 0) / rollHistory.length).toFixed(2)}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 18px',
        borderRadius: '10px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'monospace',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        💡 Tip: Click anywhere to roll • Watch the physics in action!
      </div>

      <style>{`
        @keyframes popIn {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
