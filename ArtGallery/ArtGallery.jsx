import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GalleryViewer() {
  const mountRef = useRef(null);
  const [selectedArt, setSelectedArt] = useState(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    scene.fog = new THREE.Fog(0xf5f5f5, 20, 50);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Gallery artworks data
    const artworks = [
      {
        title: "Abstract Waves",
        artist: "Digital Artist",
        position: { x: 0, z: -9.5 },
        rotation: 0,
        colors: ['#ff6b9d', '#c06c84', '#6c5b7b']
      },
      {
        title: "Geometric Dreams",
        artist: "Modern Gallery",
        position: { x: 9.5, z: 0 },
        rotation: Math.PI / 2,
        colors: ['#00d4ff', '#0088ff', '#6600ff']
      },
      {
        title: "Sunset Harmony",
        artist: "Color Studio",
        position: { x: 0, z: 9.5 },
        rotation: Math.PI,
        colors: ['#ff6347', '#ff8c00', '#ffd700']
      },
      {
        title: "Ocean Depths",
        artist: "Nature Series",
        position: { x: -9.5, z: 0 },
        rotation: -Math.PI / 2,
        colors: ['#1e90ff', '#4682b4', '#00ced1']
      },
      {
        title: "Forest Whispers",
        artist: "Earth Collection",
        position: { x: -9.5, z: -6 },
        rotation: -Math.PI / 2,
        colors: ['#2d5016', '#4a7c59', '#8fbc8f']
      },
      {
        title: "Fire Dance",
        artist: "Energy Series",
        position: { x: 9.5, z: -6 },
        rotation: Math.PI / 2,
        colors: ['#ff4500', '#ff6347', '#ffff00']
      },
      {
        title: "Purple Haze",
        artist: "Dream Gallery",
        position: { x: -9.5, z: 6 },
        rotation: -Math.PI / 2,
        colors: ['#9400d3', '#ba55d3', '#dda0dd']
      },
      {
        title: "Golden Hour",
        artist: "Light Studies",
        position: { x: 9.5, z: 6 },
        rotation: Math.PI / 2,
        colors: ['#ffd700', '#ffb347', '#ff8c69']
      }
    ];

    // Create procedural artwork
    function createArtwork(colors, width = 4, height = 3) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');

      // Random art style
      const style = Math.floor(Math.random() * 4);

      if (style === 0) {
        // Abstract gradient
        const gradient = ctx.createLinearGradient(0, 0, 512, 384);
        colors.forEach((color, i) => {
          gradient.addColorStop(i / (colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 384);

        // Add shapes
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(
            Math.random() * 512,
            Math.random() * 384,
            Math.random() * 100 + 20,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      } else if (style === 1) {
        // Geometric
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, 512, 384);
        
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.globalAlpha = 0.7;
          const size = Math.random() * 150 + 50;
          ctx.fillRect(
            Math.random() * (512 - size),
            Math.random() * (384 - size),
            size,
            size
          );
        }
      } else if (style === 2) {
        // Stripes
        const stripeHeight = 384 / 20;
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(0, i * stripeHeight, 512, stripeHeight);
        }
      } else {
        // Circles
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, 512, 384);
        
        for (let i = 0; i < 30; i++) {
          ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.lineWidth = Math.random() * 10 + 2;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(
            Math.random() * 512,
            Math.random() * 384,
            Math.random() * 80 + 20,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      return new THREE.CanvasTexture(canvas);
    }

    // Create gallery walls and artworks
    const artMeshes = [];

    artworks.forEach((artwork, index) => {
      // Create frame
      const frameGroup = new THREE.Group();

      // Artwork
      const artGeo = new THREE.PlaneGeometry(4, 3);
      const artTexture = createArtwork(artwork.colors);
      const artMat = new THREE.MeshStandardMaterial({
        map: artTexture,
        roughness: 0.8
      });
      const artMesh = new THREE.Mesh(artGeo, artMat);
      artMesh.userData.artwork = artwork;
      artMesh.userData.index = index;
      frameGroup.add(artMesh);
      artMeshes.push(artMesh);

      // Frame border
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        metalness: 0.3,
        roughness: 0.7
      });

      const frameThickness = 0.1;
      const frameDepth = 0.15;

      // Top frame
      const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(4.3, frameThickness, frameDepth),
        frameMat
      );
      topFrame.position.y = 1.55;
      topFrame.position.z = -frameDepth / 2;
      frameGroup.add(topFrame);

      // Bottom frame
      const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(4.3, frameThickness, frameDepth),
        frameMat
      );
      bottomFrame.position.y = -1.55;
      bottomFrame.position.z = -frameDepth / 2;
      frameGroup.add(bottomFrame);

      // Left frame
      const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 3.1, frameDepth),
        frameMat
      );
      leftFrame.position.x = -2.1;
      leftFrame.position.z = -frameDepth / 2;
      frameGroup.add(leftFrame);

      // Right frame
      const rightFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, 3.1, frameDepth),
        frameMat
      );
      rightFrame.position.x = 2.1;
      rightFrame.position.z = -frameDepth / 2;
      frameGroup.add(rightFrame);

      // Spotlight
      const spotlight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 6, 0.3);
      spotlight.position.set(0, 2, 1.5);
      spotlight.target = artMesh;
      spotlight.castShadow = true;
      frameGroup.add(spotlight);

      // Label plate
      const labelGeo = new THREE.PlaneGeometry(3, 0.4);
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 64;
      const labelCtx = labelCanvas.getContext('2d');
      labelCtx.fillStyle = '#2a2a2a';
      labelCtx.fillRect(0, 0, 512, 64);
      labelCtx.fillStyle = '#ffffff';
      labelCtx.font = 'bold 24px Arial';
      labelCtx.textAlign = 'center';
      labelCtx.fillText(artwork.title, 256, 35);
      
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.y = -2;
      label.position.z = 0.01;
      frameGroup.add(label);

      // Position and rotate
      frameGroup.position.set(artwork.position.x, 3, artwork.position.z);
      frameGroup.rotation.y = artwork.rotation;

      scene.add(frameGroup);
    });

    // Gallery walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9
    });

    const wallHeight = 6;
    const wallThickness = 0.3;

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(20, wallHeight, wallThickness),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -10);
    northWall.receiveShadow = true;
    scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(20, wallHeight, wallThickness),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, 10);
    southWall.receiveShadow = true;
    scene.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 20),
      wallMaterial
    );
    eastWall.position.set(10, wallHeight / 2, 0);
    eastWall.receiveShadow = true;
    scene.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, 20),
      wallMaterial
    );
    westWall.position.set(-10, wallHeight / 2, 0);
    westWall.receiveShadow = true;
    scene.add(westWall);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(20, 20);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    scene.add(ceiling);

    // Pedestal in center
    const pedestalGeo = new THREE.CylinderGeometry(0.8, 1, 2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.3,
      roughness: 0.7
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, 1, 0);
    pedestal.castShadow = true;
    scene.add(pedestal);

    // Sculpture on pedestal
    const sculptureGeo = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
    const sculptureMat = new THREE.MeshStandardMaterial({
      color: 0xff0066,
      metalness: 0.9,
      roughness: 0.1
    });
    const sculpture = new THREE.Mesh(sculptureGeo, sculptureMat);
    sculpture.position.set(0, 2.5, 0);
    sculpture.castShadow = true;
    scene.add(sculpture);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Camera
    camera.position.set(0, 2, 8);

    // Movement
    const moveSpeed = 0.1;
    const rotateSpeed = 0.03;
    const keys = { 
      w: false, 
      a: false, 
      s: false, 
      d: false,
      arrowleft: false,
      arrowright: false,
      arrowup: false,
      arrowdown: false
    };

    // Collision walls
    const walls = [northWall, southWall, eastWall, westWall];

    function checkCollision(newX, newZ) {
      const playerRadius = 0.5;
      
      for (let wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        const playerBox = new THREE.Box3(
          new THREE.Vector3(newX - playerRadius, 0, newZ - playerRadius),
          new THREE.Vector3(newX + playerRadius, 4, newZ + playerRadius)
        );
        
        if (wallBox.intersectsBox(playerBox)) {
          return true;
        }
      }

      // Pedestal collision
      const dist = Math.sqrt(newX * newX + newZ * newZ);
      if (dist < 1.5) return true;

      return false;
    }

    // Keyboard
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'w') keys.w = true;
      if (key === 'a') keys.a = true;
      if (key === 's') keys.s = true;
      if (key === 'd') keys.d = true;
      if (key === 'arrowleft') keys.arrowleft = true;
      if (key === 'arrowright') keys.arrowright = true;
      if (key === 'arrowup') keys.arrowup = true;
      if (key === 'arrowdown') keys.arrowdown = true;
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'w') keys.w = false;
      if (key === 'a') keys.a = false;
      if (key === 's') keys.s = false;
      if (key === 'd') keys.d = false;
      if (key === 'arrowleft') keys.arrowleft = false;
      if (key === 'arrowright') keys.arrowright = false;
      if (key === 'arrowup') keys.arrowup = false;
      if (key === 'arrowdown') keys.arrowdown = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Raycaster for artwork detection
    const raycaster = new THREE.Raycaster();
    raycaster.far = 5;

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotation with arrow keys
      if (keys.arrowleft) {
        camera.rotation.y += rotateSpeed;
      }
      if (keys.arrowright) {
        camera.rotation.y -= rotateSpeed;
      }
      if (keys.arrowup) {
        camera.rotation.x += rotateSpeed;
        camera.rotation.x = Math.min(Math.PI / 3, camera.rotation.x);
      }
      if (keys.arrowdown) {
        camera.rotation.x -= rotateSpeed;
        camera.rotation.x = Math.max(-Math.PI / 3, camera.rotation.x);
      }

      // Movement with WASD
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      let newX = camera.position.x;
      let newZ = camera.position.z;

      if (keys.w) {
        newX += forward.x * moveSpeed;
        newZ += forward.z * moveSpeed;
      }
      if (keys.s) {
        newX -= forward.x * moveSpeed;
        newZ -= forward.z * moveSpeed;
      }
      if (keys.a) {
        newX -= right.x * moveSpeed;
        newZ -= right.z * moveSpeed;
      }
      if (keys.d) {
        newX += right.x * moveSpeed;
        newZ += right.z * moveSpeed;
      }

      if (!checkCollision(newX, camera.position.z)) {
        camera.position.x = newX;
      }
      if (!checkCollision(camera.position.x, newZ)) {
        camera.position.z = newZ;
      }

      // Check for artwork viewing
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(artMeshes);
      
      if (intersects.length > 0) {
        setSelectedArt(intersects[0].object.userData.artwork);
      } else {
        setSelectedArt(null);
      }

      // Rotate sculpture
      sculpture.rotation.y += 0.01;
      sculpture.rotation.x += 0.005;

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
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px 30px',
        borderRadius: '12px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>
          🎨 Art Gallery
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <strong>WASD</strong> - Move | <strong>Arrow Keys</strong> - Look Around
        </div>
      </div>

      {/* Artwork Info */}
      {selectedArt && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '20px 30px',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '5px' }}>
            {selectedArt.title}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            by {selectedArt.artist}
          </div>
        </div>
      )}

      {/* Crosshair */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '4px',
        height: '4px',
        background: 'white',
        borderRadius: '50%',
        border: '2px solid black',
        pointerEvents: 'none'
      }} />
      
      {/* Controls reminder */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        backdropFilter: 'blur(5px)'
      }}>
        WASD: Move | Arrow Keys: Look | Point at artwork for info
      </div>
    </div>
  );
}
