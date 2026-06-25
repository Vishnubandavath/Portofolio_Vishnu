// Dynamic Typing Effect
class TypeWriter {
  constructor(element, words, wait = 3000) {
    this.element = element;
    this.words = words;
    this.txt = '';
    this.wordIndex = 0;
    this.wait = parseInt(wait, 10);
    this.type();
    this.isDeleting = false;
  }

  type() {
    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.element.innerHTML = `<span class="txt">${this.txt}</span>`;

    let typeSpeed = 100;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = this.wait;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize TypeWriter
  const typeElement = document.querySelector('.typewriter-target');
  if (typeElement) {
    const words = JSON.parse(typeElement.getAttribute('data-words') || '[]');
    new TypeWriter(typeElement, words, 2000);
  }

  // Interactive Cursor Lighting spotlight
  const mouseLight = document.createElement('div');
  mouseLight.className = 'mouse-light';
  document.body.appendChild(mouseLight);

  document.addEventListener('mousemove', (e) => {
    mouseLight.style.left = `${e.clientX}px`;
    mouseLight.style.top = `${e.clientY}px`;
  });

  // Apply 3D Tilt Interaction
  init3DTilt();

  // Initialize Three.js Background
  initThreeBackground();
});

// Custom 3D Tilt Card Logic
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// Three.js Interactive Particle Field
function initThreeBackground() {
  const canvas = document.querySelector('#three-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle System Parameters
  const particleCount = 120;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15; // Spread particles
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Custom Neon Glow Material
  const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x8cf109,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  // Create point cloud
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  camera.position.z = 5;

  // Mouse Interaction Variables
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Slow rotational drift
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = elapsedTime * 0.02;

    // React to cursor movement
    particles.position.x += (mouseX * 0.5 - particles.position.x) * 0.05;
    particles.position.y += (-mouseY * 0.5 - particles.position.y) * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Desktop Header Sticky Shrink Logic
const header = document.querySelector("header");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (header) {
    // Shrink navbar when scrolling down, expand when scrolling up
    if (currentScrollY > 100) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }
  lastScrollY = currentScrollY;
});

// Intersection Observer for Active Section Tracking
const trackedSections = document.querySelectorAll("section");
const desktopNavLinks = document.querySelectorAll("header nav a");
const dockNavLinks = document.querySelectorAll(".mobile-nav-dock a");
const sheetNavLinks = document.querySelectorAll(".bottom-sheet-links a");

const observerOptions = {
  root: null,
  rootMargin: "-20% 0px -60% 0px", // Observe sections when they occupy the center of viewport
  threshold: 0.1
};

const observerCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");

      // Update Desktop Navbar Links
      desktopNavLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });

      // Update Mobile Dock Links
      dockNavLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });

      // Update Bottom Sheet Links
      sheetNavLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
};

const navObserver = new IntersectionObserver(observerCallback, observerOptions);
trackedSections.forEach(section => navObserver.observe(section));

// Mobile Bottom Sheet Navigation Control (Command Center)
const dockActionBtn = document.querySelector(".dock-action-btn");
const bottomSheetOverlay = document.querySelector(".bottom-sheet-overlay");
const bottomSheet = document.querySelector(".bottom-sheet");
const bottomSheetHandle = document.querySelector(".bottom-sheet-handle");
const allSheetLinks = document.querySelectorAll(".bottom-sheet-links a");

function openBottomSheet() {
  if (bottomSheet && bottomSheetOverlay) {
    bottomSheet.classList.add("active");
    bottomSheetOverlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Lock background scroll
  }
}

function closeBottomSheet() {
  if (bottomSheet && bottomSheetOverlay) {
    bottomSheet.classList.remove("active");
    bottomSheetOverlay.classList.remove("active");
    document.body.style.overflow = ""; // Unlock background scroll
  }
}

if (dockActionBtn) {
  dockActionBtn.addEventListener("click", openBottomSheet);
}

if (bottomSheetOverlay) {
  bottomSheetOverlay.addEventListener("click", closeBottomSheet);
}

// Close bottom sheet when link clicked
allSheetLinks.forEach(link => {
  link.addEventListener("click", closeBottomSheet);
});

// ESC key closes bottom sheet
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBottomSheet();
  }
});

// Touch Swipe-down gesture detection on bottom sheet handle to close
let touchStartY = 0;
let touchEndY = 0;

if (bottomSheetHandle) {
  bottomSheetHandle.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  bottomSheetHandle.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    if (touchEndY - touchStartY > 50) { // Swiped down at least 50px
      closeBottomSheet();
    }
  }, { passive: true });
}

// Form Submission handling
const form = document.getElementById('form');
if (form) {
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    if (!formData.has("access_key")) {
      formData.append("access_key", "46bb3fe9-0398-4403-81a9-49503f8b3a60");
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert("Success! Your message has been sent.");
        form.reset();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Skills Filter System
const filterButtons = document.querySelectorAll(".filter-btn");
const skillCards = document.querySelectorAll(".skill-card");

if (filterButtons.length > 0 && skillCards.length > 0) {
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");

      skillCards.forEach(card => {
        const cardCategory = card.getAttribute("data-category");
        if (filterValue === "all" || cardCategory === filterValue) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
      // Re-trigger tilt behavior to make sure new positions are updated
      init3DTilt();
    });
  });
}