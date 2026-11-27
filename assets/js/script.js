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

  // Initialize Certificate Lightbox Modal
  initCertificateModal();
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

// Intersection Observer for Active Section Tracking
const trackedSections = document.querySelectorAll("section");
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
    
    // 1. Form Validation
    const name = formData.get('name') ? formData.get('name').trim() : '';
    const email = formData.get('email') ? formData.get('email').trim() : '';
    const number = formData.get('number') ? formData.get('number').trim() : '';
    const city = formData.get('city') ? formData.get('city').trim() : '';
    const message = formData.get('message') ? formData.get('message').trim() : '';

    if (name.length < 2) {
      alert("Please enter a valid name (at least 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Checking mobile number length (allowing country codes and the + symbol)
    const cleanedNumber = number.replace(/[\s\-\(\)\+]/g, '');
    if (cleanedNumber.length < 7) {
      alert("Please enter a valid mobile number.");
      return;
    }

    if (city.length < 2) {
      alert("Please enter a valid city name.");
      return;
    }

    if (message.length < 10) {
      alert("Please enter a message with at least 10 characters.");
      return;
    }

    if (!formData.has("access_key")) {
      // Web3Forms public access key for contact form submission
      formData.append("access_key", "950a5aaa-a76d-4914-a28e-8389f3b6f8ac");
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

// Certificate Lightbox Modal System
// ==================================================
// Centralized Mapping for Certificates & Internships
// ==================================================
const milestones = [
  {
    title: "Solutions Architecture Job Simulation",
    category: "Certificate",
    issuer: "Forage – AWS",
    date: "July 22, 2025",
    file: "assets/docs/Certificates/aws_page-0001.jpg"
  },
  {
    title: "Information Technology Intern",
    category: "Internship",
    issuer: "Vanna Information Technologies India Pvt. Ltd.",
    date: "June 12, 2025 – July 12, 2025",
    file: "assets/docs/Internships/B22AI055_VANNA_page-0001.jpg"
  },
  {
    title: "Remote Sensing of Soils: Mapping, Classification and Evaluation for Agricultural Land Use Planning",
    category: "Certificate",
    issuer: "Indian Institute of Remote Sensing (IIRS), ISRO",
    date: "Course: March 3–7, 2025 | Certified: April 16, 2025",
    file: "assets/docs/Certificates/ISRO-1.png"
  },
  {
    title: "SCOA Warehouse Training Program for Aspiring Professionals",
    category: "Certificate",
    issuer: "Flipkart – Supply Chain Operations Academy (SCOA)",
    date: "Exam: March 10, 2025 | Certified: April 11, 2025",
    file: "assets/docs/Certificates/Flipcart-1.png"
  },
  {
    title: "GDG on Campus Solution Challenge – Certificate of Participation",
    category: "Certificate",
    issuer: "Google Developer Groups on Campus (powered by Hack2skill)",
    date: "2025",
    file: "assets/docs/Certificates/Hack2skill-Certificate.png"
  },
  {
    title: "Data Analytics and Power BI Virtual Intern",
    category: "Internship",
    issuer: "AICTE and Vodafone Idea Foundation (_VOIS)",
    date: "June 25, 2024 – July 18, 2024",
    file: "assets/docs/Internships/VOIS_page-0001.jpg"
  },
  {
    title: "Front End Development Intern",
    category: "Internship",
    issuer: "AICTE and Edunet Foundation (IBM SkillsBuild)",
    date: "June 24, 2024 – July 31, 2024",
    file: "assets/docs/Internships/AICTE EDUNET FED-1.png"
  },
  {
    title: "Build Reports and Dashboards in Power BI",
    category: "Certificate",
    issuer: "Vodafone Idea Foundation (_VOIS)",
    date: "July 11, 2024",
    file: "assets/docs/Certificates/VOIS_Power-BI.png"
  },
  {
    title: "Data Analytics and Visualization Job Simulation",
    category: "Certificate",
    issuer: "Forage – Accenture North America",
    date: "April – June 2024 | Issued: June 4, 2024",
    file: "assets/docs/Certificates/Accenture North America_completion_certificate-1.png"
  },
  {
    title: "Web Development Intern",
    category: "Internship",
    issuer: "Coding Raja Technologies",
    date: "May 1, 2024 – June 1, 2024",
    file: "assets/docs/Internships/Coding_raja_internship.png"
  },
  {
    title: "The Joy of Computing using Python",
    category: "Certificate",
    issuer: "IIT Madras / NPTEL (SWAYAM)",
    date: "January – April 2024",
    file: "assets/docs/Certificates/NPTEL_python.jpg"
  },
  {
    title: "Microsoft Learn Student Ambassador – Azure Fundamentals Challenge",
    category: "Certificate",
    issuer: "Microsoft Learn Student Ambassador",
    date: "March 6–17, 2024",
    file: "assets/docs/Certificates/microsoft student ambassador.png"
  },
  {
    title: "Microsoft Learn Student Ambassador – Embark on Your Azure Adventure: Unleashing the Fundamentals",
    category: "Certificate",
    issuer: "Microsoft Learn Student Ambassador",
    date: "Microsoft Learn Challenge",
    file: "assets/docs/Certificates/MLSA_Embark on Your Azure Adventure-1.png"
  }
];

function initCertificateModal() {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.cert-modal-overlay');
  const closeBtn = modal.querySelector('.cert-modal-close');
  const titleEl = document.getElementById('cert-modal-title');
  const subtitleEl = document.getElementById('cert-modal-subtitle');
  const issuerEl = document.getElementById('cert-modal-issuer');
  const openLink = document.getElementById('cert-modal-open-link');
  const downloadLink = document.getElementById('cert-modal-download-link');
  const contentEl = document.getElementById('cert-modal-content');
  const loadingEl = document.getElementById('cert-modal-loading');

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modal.classList.contains('active')) {
        contentEl.innerHTML = '';
      }
    }, 300);
  }

  function showFallback(filename, title, issuer) {
    if (loadingEl) loadingEl.style.display = 'none';
    const cleanName = filename ? filename.split('/').pop() : 'Credential Document';
    contentEl.innerHTML = `
      <div class="cert-fallback-box">
        <i class="fa-solid fa-file-circle-check cert-fallback-icon"></i>
        <h4 class="cert-fallback-title">${title}</h4>
        <p class="cert-fallback-desc">
          Issued by <strong>${issuer}</strong>.<br>
          This credential document will display directly once placed in the assets directory.
        </p>
        <div class="cert-fallback-path">${cleanName}</div>
      </div>
    `;
  }

  function tryFallback(fallbackUrl, title, issuer, originalUrl) {
    if (!fallbackUrl) {
      showFallback(originalUrl, title, issuer);
      return;
    }
    const isPdf = fallbackUrl.toLowerCase().split('?')[0].endsWith('.pdf');
    if (isPdf) {
      if (loadingEl) loadingEl.style.display = 'none';
      const iframe = document.createElement('iframe');
      iframe.className = 'cert-modal-iframe';
      iframe.title = title || 'Document Preview';
      iframe.src = fallbackUrl;
      contentEl.innerHTML = '';
      contentEl.appendChild(iframe);
      if (openLink) openLink.href = fallbackUrl;
      if (downloadLink) {
        downloadLink.href = fallbackUrl;
        downloadLink.setAttribute('download', fallbackUrl.split('/').pop() || 'document.pdf');
      }
    } else {
      const img = new Image();
      img.className = 'cert-modal-img';
      img.alt = title || 'Document Preview';
      img.onload = () => {
        if (loadingEl) loadingEl.style.display = 'none';
        contentEl.innerHTML = '';
        contentEl.appendChild(img);
        if (openLink) openLink.href = fallbackUrl;
        if (downloadLink) {
          downloadLink.href = fallbackUrl;
          downloadLink.setAttribute('download', fallbackUrl.split('/').pop() || 'document.png');
        }
      };
      img.onerror = () => {
        showFallback(originalUrl, title, issuer);
      };
      img.src = fallbackUrl;
    }
  }

  function openModal(data) {
    const { title, subtitle, issuer, src, fallbackSrc } = data;
    if (titleEl) titleEl.textContent = title || 'Credential Document';
    if (subtitleEl) subtitleEl.textContent = subtitle || '';
    if (issuerEl) issuerEl.textContent = issuer || 'Verified Credential';

    if (openLink) openLink.href = src || '#';
    if (downloadLink) {
      downloadLink.href = src || '#';
      downloadLink.setAttribute('download', src ? src.split('/').pop() : 'document');
    }

    contentEl.innerHTML = '';
    if (loadingEl) loadingEl.style.display = 'flex';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!src) {
      showFallback('', title, issuer);
      return;
    }

    const isPdf = src.toLowerCase().split('?')[0].endsWith('.pdf');

    if (isPdf) {
      if (loadingEl) loadingEl.style.display = 'none';
      const iframe = document.createElement('iframe');
      iframe.className = 'cert-modal-iframe';
      iframe.title = title || 'Document Preview';
      iframe.src = src;
      contentEl.innerHTML = '';
      contentEl.appendChild(iframe);
    } else {
      const img = new Image();
      img.className = 'cert-modal-img';
      img.alt = title || 'Document Preview';

      img.onload = () => {
        if (loadingEl) loadingEl.style.display = 'none';
        contentEl.innerHTML = '';
        contentEl.appendChild(img);
      };

      img.onerror = () => {
        tryFallback(fallbackSrc, title, issuer, src);
      };

      img.src = src;
    }
  }

  // Bind click event to all clickable cards, thumbnails, and preview buttons
  const previewTriggers = document.querySelectorAll('[data-cert-src]');
  previewTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
      // Do not open modal if user clicked a download button
      if (e.target.closest('a[download]')) return;

      e.preventDefault();
      e.stopPropagation();

      const src = el.getAttribute('data-cert-src');
      const fallbackSrc = el.getAttribute('data-cert-fallback') || '';
      const card = el.closest('.cert-card, .internship-card, .timeline-card') || el;
      const title = el.getAttribute('data-cert-title') || card.getAttribute('data-cert-title') || card.querySelector('h3')?.textContent || 'Document';
      const issuer = el.getAttribute('data-cert-issuer') || card.getAttribute('data-cert-issuer') || 'Issuer';
      const subtitle = el.getAttribute('data-cert-date') || card.getAttribute('data-cert-date') || card.querySelector('.date, .cert-date, .internship-duration')?.textContent || '';

      openModal({ title, subtitle, issuer, src, fallbackSrc });
    });
  });

  // Event handlers for closing
  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ==================================================
// Mobile Read More / Read Less Toggle Logic
// ==================================================
function initReadMoreToggles() {
  const readMoreButtons = document.querySelectorAll('.card-read-more-btn');
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest('.timeline-card, .internship-card');
      if (!card) return;

      const projectDetails = card.querySelector('.project-details-grid');
      const internshipList = card.querySelector('.internship-responsibilities');
      const researchDesc = card.querySelector('.research-desc');
      const summaryText = card.querySelector('.internship-responsibilities-summary');

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (projectDetails) {
        projectDetails.classList.toggle('collapsed', isExpanded);
      }
      if (internshipList) {
        internshipList.classList.toggle('collapsed', isExpanded);
        if (summaryText) {
          summaryText.style.display = isExpanded ? '-webkit-box' : 'none';
        }
      }
      if (researchDesc) {
        researchDesc.classList.toggle('collapsed', isExpanded);
      }

      const newExpandedState = !isExpanded;
      btn.setAttribute('aria-expanded', newExpandedState.toString());
      btn.innerHTML = newExpandedState
        ? '<span>Read Less</span> <i class="fa-solid fa-angle-up"></i>'
        : '<span>Read More</span> <i class="fa-solid fa-angle-down"></i>';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReadMoreToggles();
});
