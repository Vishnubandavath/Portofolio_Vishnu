// Cinematic Intro Page Animations and Interactions
document.addEventListener('DOMContentLoaded', () => {
  // Ensure the body has overflow hidden initially to prevent scrolling during intro
  document.body.classList.add('intro-active');

  const intro = document.getElementById('cinematic-intro');
  const imgWrapper = document.querySelector('.intro-img-wrapper');
  const imgColor = document.querySelector('.intro-img-color');
  const scrollPrompt = document.querySelector('.intro-scroll-prompt');
  const header = document.querySelector('.header');
  const mobileDock = document.querySelector('.mobile-nav-dock');

  // Hide header and mobile dock during cinematic intro so they are not visible on the intro page
  if (header) {
    header.style.opacity = '0';
    header.style.pointerEvents = 'none';
  }
  if (mobileDock) {
    mobileDock.style.opacity = '0';
    mobileDock.style.pointerEvents = 'none';
  }

  // State to prevent multiple transition triggers
  let isTransitioned = false;

  // 1. Mouse/Cursor Spotlight Reveal & 3D Parallax
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  // Spotlight reveal radius (will animate in)
  let spotlight = { radius: 0 };

  // Set initial clip-path coordinates
  imgColor.style.clipPath = `circle(${spotlight.radius}px at ${mouse.x}px ${mouse.y}px)`;

  window.addEventListener('mousemove', (e) => {
    if (isTransitioned) return;
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
  });

  // GSAP quickTo for smooth 60fps tracking
  const xTo = gsap.quickTo(mouse, 'x', {
    duration: 0.15,
    ease: 'power2.out',
    onChange: () => updateClipPath()
  });

  const yTo = gsap.quickTo(mouse, 'y', {
    duration: 0.15,
    ease: 'power2.out',
    onChange: () => updateClipPath()
  });

  function updateClipPath() {
    if (isTransitioned) return;
    imgColor.style.clipPath = `circle(${spotlight.radius}px at ${mouse.x}px ${mouse.y}px)`;
  }

  // Mousemove handler for QuickTo and Parallax
  window.addEventListener('mousemove', (e) => {
    if (isTransitioned) return;
    xTo(e.clientX);
    yTo(e.clientY);

    // Calculate normalized coordinates (-0.5 to 0.5)
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;

    // 3D Parallax Rotation of the image container
    gsap.to(imgWrapper, {
      rotateY: normX * 10,
      rotateX: -normY * 10,
      x: normX * 20,
      y: normY * 20,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  // Handle touch events for mobile
  window.addEventListener('touchmove', (e) => {
    if (isTransitioned) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      xTo(touch.clientX);
      yTo(touch.clientY);

      const normX = (touch.clientX / window.innerWidth) - 0.5;
      const normY = (touch.clientY / window.innerHeight) - 0.5;

      gsap.to(imgWrapper, {
        rotateY: normX * 8,
        rotateX: -normY * 8,
        x: normX * 15,
        y: normY * 15,
        duration: 0.8,
        ease: 'power2.out'
      });
    }
  }, { passive: true });

  // 2. Continuous Cinematic Zoom & Float (Living Portrait Effect)
  gsap.to(imgWrapper, {
    scale: 1.12,
    duration: 25,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });

  // 3. Canvas Particles System
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Mouse avoidance/attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 0.5;
        }

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 241, 9, ${this.opacity})`; // matching portfolio's primary-color (#8CF109)
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#8CF109';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animateParticles = () => {
      if (isTransitioned) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  // 4. Loading Sequence & Intro Overlay
  const tl = gsap.timeline();

  // Initially fade out the pitch-black cover screen
  tl.to('.intro-black-overlay', {
    opacity: 0,
    duration: 1.5,
    ease: 'power2.inOut'
  });

  // Reveal the spotlight (animate spotlight radius to 150px)
  tl.to(spotlight, {
    radius: window.innerWidth < 768 ? 100 : 180,
    duration: 2.0,
    ease: 'power3.out',
    onUpdate: () => updateClipPath()
  }, '-=0.5');

  // Typing effect and fade-in for title text
  const titleText = document.querySelector('.intro-title');
  const subtitleText = document.querySelector('.intro-subtitle');

  if (titleText && subtitleText) {
    const letters = titleText.textContent.trim().split('');
    titleText.textContent = '';

    letters.forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.color = '#ffffff'; // explicitly white text as per requirements
      titleText.appendChild(span);
    });

    tl.to(titleText.children, {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=1.2');

    tl.to(subtitleText, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power2.out'
    }, '-=0.4');
  }

  // Show scroll prompt at the end of the entry animations
  tl.to(scrollPrompt, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.2');

  // 5. Scroll Transition Mechanism (Slide up and Reveal Portfolio)
  const triggerReveal = () => {
    if (isTransitioned) return;
    isTransitioned = true;

    // Fade in the header and mobile dock as the intro transitions out
    if (header) {
      gsap.to(header, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.8,
        ease: 'power2.out'
      });
    }
    if (mobileDock) {
      gsap.to(mobileDock, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    // Play exit animation
    const exitTl = gsap.timeline({
      onComplete: () => {
        intro.style.display = 'none';
        document.body.classList.remove('intro-active');
      }
    });

    exitTl.to(intro, {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut'
    });
  };

  // Scroll event listeners to trigger exit
  let touchStart = 0;
  window.addEventListener('wheel', (e) => {
    if (!isTransitioned && e.deltaY > 10) {
      triggerReveal();
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    touchStart = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isTransitioned && touchStart - e.touches[0].clientY > 30) {
      triggerReveal();
    }
  }, { passive: true });

  // Click handler on scroll prompt
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', () => {
      triggerReveal();
    });
  }

  // Click handler on navbar links to reveal page and navigate
  const navLinks = document.querySelectorAll('.navbar-container a, .mobile-nav-dock a, .sheet-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      triggerReveal();
    });
  });
});
