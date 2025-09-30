import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function DataGlobe() {
  const mountRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showConnections, setShowConnections] = useState(true);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create Earth texture
    const createEarthTexture = () => {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Ocean
      ctx.fillStyle = '#1a4d8f';
      ctx.fillRect(0, 0, size, size);

      // Continents
      ctx.fillStyle = '#2d5016';
      
      // North America
      ctx.beginPath();
      ctx.ellipse(250, 350, 150, 200, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.ellipse(300, 700, 100, 180, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Europe
      ctx.beginPath();
      ctx.ellipse(600, 320, 100, 120, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Africa
      ctx.beginPath();
      ctx.ellipse(600, 600, 120, 200, 0, 0, Math.PI * 2);
      ctx.fill();

      // Asia
      ctx.beginPath();
      ctx.ellipse(900, 350, 200, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(1100, 500, 150, 120, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Australia
      ctx.beginPath();
      ctx.ellipse(1150, 850, 100, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(canvas);
    };

    // Create Earth
    const earthRadius = 10;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.7,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 0.5, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Data points (cities)
    const dataPoints = [
      { name: 'New York', lat: 40.7128, lon: -74.0060, value: 450, color: 0xff0066 },
      { name: 'London', lat: 51.5074, lon: -0.1278, value: 380, color: 0x00ff88 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, value: 520, color: 0x0088ff },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, value: 290, color: 0xffaa00 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, value: 340, color: 0xff00ff },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708, value: 410, color: 0x00ffff },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, value: 460, color: 0xffff00 },
      { name: 'Moscow', lat: 55.7558, lon: 37.6173, value: 320, color: 0xff6600 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, value: 395, color: 0x66ff00 },
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, value: 425, color: 0xff0099 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522, value: 365, color: 0x9900ff },
      { name: 'Beijing', lat: 39.9042, lon: 116.4074, value: 480, color: 0x00ff66 }
    ];

    // Convert lat/lon to 3D coordinates
    function latLonToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    }

    // Create markers
    const markers = [];
    const markerMeshes = [];

    dataPoints.forEach((point, index) => {
      const markerGroup = new THREE.Group();
      
      // Position on globe
      const position = latLonToVector3(point.lat, point.lon, earthRadius);
      markerGroup.position.copy(position);
      
      // Orient marker to face outward
      markerGroup.lookAt(position.clone().multiplyScalar(2));

      // Pin base
      const pinHeight = 1 + (point.value / 500) * 2;
      const pinGeo = new THREE.CylinderGeometry(0.05, 0.1, pinHeight, 8);
      const pinMat = new THREE.MeshStandardMaterial({
        color: point.color,
        emissive: point.color,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.z = pinHeight / 2;
      markerGroup.add(pin);

      // Pin top (sphere)
      const topGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const topMat = new THREE.MeshStandardMaterial({
        color: point.color,
        emissive: point.color,
        emissiveIntensity: 0.8
      });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.z = pinHeight;
      markerGroup.add(top);

      // Pulsing ring
      const ringGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: point.color,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.z = 0.1;
      markerGroup.add(ring);

      // Point light
      const pointLight = new THREE.PointLight(point.color, 1, 5);
      pointLight.position.z = pinHeight;
      markerGroup.add(pointLight);

      earth.add(markerGroup);

      markers.push({
        group: markerGroup,
        data: point,
        ring: ring,
        top: top,
        pin: pin,
        light: pointLight
      });

      markerMeshes.push(top);
    });

    // Create connections between cities
    const connections = [];
    
    function createConnection(point1, point2) {
      const pos1 = latLonToVector3(point1.lat, point1.lon, earthRadius);
      const pos2 = latLonToVector3(point2.lat, point2.lon, earthRadius);

      // Create curved line
      const curve = new THREE.QuadraticBezierCurve3(
        pos1,
        pos1.clone().add(pos2).multiplyScalar(0.6),
        pos2
      );

      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(lineGeo, lineMat);
      earth.add(line);
      connections.push(line);

      // Animated particle along connection
      const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0x00ffff
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      earth.add(particle);

      return {
        line: line,
        particle: particle,
        curve: curve,
        progress: Math.random()
      };
    }

    // Create some connections
    const connectionPairs = [
      [dataPoints[0], dataPoints[1]], // NY - London
      [dataPoints[1], dataPoints[2]], // London - Tokyo
      [dataPoints[2], dataPoints[6]], // Tokyo - Singapore
      [dataPoints[0], dataPoints[9]], // NY - LA
      [dataPoints[5], dataPoints[6]], // Dubai - Singapore
      [dataPoints[1], dataPoints[10]], // London - Paris
      [dataPoints[2], dataPoints[11]]  // Tokyo - Beijing
    ];

    const activeConnections = connectionPairs.map(pair => createConnection(pair[0], pair[1]));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(30, 20, 30);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x6699ff, 0.5);
    rimLight.position.set(-20, 10, -20);
    scene.add(rimLight);

    // Camera
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, 0);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMarker = null;

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);

      if (hoveredMarker) {
        hoveredMarker.top.scale.set(1, 1, 1);
      }

      if (intersects.length > 0) {
        const marker = markers.find(m => m.top === intersects[0].object);
        if (marker) {
          hoveredMarker = marker;
          marker.top.scale.set(1.5, 1.5, 1.5);
          document.body.style.cursor = 'pointer';
        }
      } else {
        hoveredMarker = null;
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);

      if (intersects.length > 0) {
        const marker = markers.find(m => m.top === intersects[0].object);
        if (marker) {
          setSelectedCity(marker.data);
        }
      } else {
        setSelectedCity(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate Earth
      earth.rotation.y += 0.001;

      // Animate markers
      markers.forEach((marker, i) => {
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        marker.ring.scale.set(1 + pulse * 0.5, 1 + pulse * 0.5, 1);
        marker.ring.material.opacity = 0.3 + pulse * 0.3;
        marker.light.intensity = 0.5 + pulse * 0.5;
      });

      // Animate connections
      activeConnections.forEach(conn => {
        conn.progress += 0.01;
        if (conn.progress > 1) conn.progress = 0;
        
        const point = conn.curve.getPoint(conn.progress);
        conn.particle.position.copy(point);
        
        conn.line.visible = showConnections;
        conn.particle.visible = showConnections;
      });

      // Orbit camera
      camera.position.x = Math.sin(time * 0.1) * 30;
      camera.position.z = Math.cos(time * 0.1) * 30;
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
      window.removeEventListener('click', handleClick);
      document.body.style.cursor = 'default';
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [showConnections]);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0 }} />
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px',
        borderRadius: '12px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          🌍 Data Globe
        </div>
        <div style={{ marginBottom: '15px', opacity: 0.8, fontSize: '11px' }}>
          12 major cities • Real-time connections
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={showConnections}
            onChange={(e) => setShowConnections(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Show Connections
        </label>

        <div style={{ 
          marginTop: '15px', 
          paddingTop: '15px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '11px',
          opacity: 0.7
        }}>
          Click markers for details<br/>
          Hover to highlight
        </div>
      </div>

      {/* City Info Panel */}
      {selectedCity && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '20px 30px',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${selectedCity.color.toString(16).padStart(6, '0')}`,
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            marginBottom: '10px',
            color: `#${selectedCity.color.toString(16).padStart(6, '0')}`
          }}>
            {selectedCity.name}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
            📍 {selectedCity.lat.toFixed(4)}°, {selectedCity.lon.toFixed(4)}°
          </div>
          <div style={{ fontSize: '14px', marginTop: '12px' }}>
            Data Value: <strong style={{ color: `#${selectedCity.color.toString(16).padStart(6, '0')}` }}>
              {selectedCity.value}
            </strong>
          </div>
          <button
            onClick={() => setSelectedCity(null)}
            style={{
              marginTop: '15px',
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Legend</div>
        <div style={{ opacity: 0.8 }}>
          🟢 Pin height = data value<br/>
          💡 Pulsing rings = activity<br/>
          ⚡ Blue lines = connections<br/>
          ✨ Particles = data flow
        </div>
      </div>
    </div>
  );
}
