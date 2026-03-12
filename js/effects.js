/**
 * JSLab — 3D Effects Engine
 * Powered by Three.js
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check if Three.js is loaded
  if (typeof THREE === "undefined") {
    console.warn("Three.js is not loaded.");
    return;
  }

  // ========== THREE.JS BACKGROUND SCENE ==========
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // transparent background
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Reduce elements for mobile performance
  const isMobile = window.innerWidth < 768;
  const numCubes = isMobile ? 5 : 15;
  const numOctas = isMobile ? 3 : 10;
  const numParticles = isMobile ? 80 : 200;

  // 1. Scattered small cubes (wireframe, neon blue)
  const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, wireframe: true });
  for (let i = 0; i < numCubes; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10
    );
    cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(cube);
  }

  // 2. Scattered octahedrons (wireframe, purple)
  const octaGeometry = new THREE.OctahedronGeometry(0.4);
  const octaMaterial = new THREE.MeshBasicMaterial({ color: 0xb388ff, wireframe: true });
  for (let i = 0; i < numOctas; i++) {
    const octa = new THREE.Mesh(octaGeometry, octaMaterial);
    octa.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10
    );
    scene.add(octa);
  }

  // 3. Particle field (dots in 3D space)
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(numParticles * 3);
  for (let i = 0; i < numParticles * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 30;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x4fc3f7, size: 0.05, transparent: true, opacity: 0.6
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Initial mouse positions for parallax
  let mouseX = 0, mouseY = 0;

  // Animation loop
  function animate() {
    // Only animate if tab is visible
    if (document.hidden) return;

    // Rotate all geometries slowly
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        child.rotation.x += 0.003;
        child.rotation.y += 0.005;
      }
    });

    // Rotate particle field slowly
    particles.rotation.y += 0.0003;

    // Mouse parallax effect: camera moves slightly based on mouse position
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  // Track mouse for parallax (throttled implicitly by animation loop reading it)
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Handle resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pause renderer when tab not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      renderer.setAnimationLoop(animate);
    }
  });


  // ========== 3D CARD TILT EFFECT ==========
  // Apply globally to all glass cards, except the chat card
  document.querySelectorAll(".glass-card:not(.chat-layout)").forEach(card => {
    card.classList.add('card-3d'); // Ensure class exists for 3D CSS
    card.addEventListener("mousemove", (e) => {
      // Throttle mousemove for performance using requestAnimationFrame inside? 
      // It's usually fine, but CSS handles transition smoothly.
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 10;
      const rotateY = (centerX - e.clientX) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      card.style.boxShadow = `${-rotateY}px ${rotateX}px 30px rgba(79, 195, 247, 0.3)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.boxShadow = 'none';
    });
  });

  // ========== 3D HERO TITLE DEPTH EFFECT ==========
  const heroSection = document.querySelector(".hero");
  const heroTitle = document.querySelector(".hero-title");
  
  if (heroSection && heroTitle) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      heroTitle.style.transform = `perspective(500px) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`;
    });

    heroSection.addEventListener("mouseleave", () => {
      heroTitle.style.transform = 'perspective(500px) rotateX(0) rotateY(0)';
    });
  }

  // Note: custom cursor and other 2D effects were removed in v3 to favor 3D Three.js 
});
