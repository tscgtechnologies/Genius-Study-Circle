/**
 * GENIUS STUDY CIRCLE — SCRIPT.JS
 * Vanilla JavaScript implementation for interactive effects
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // -------------------------------------------------------------------
  // 1. SELECTORS & CORE VARIABLES
  // -------------------------------------------------------------------
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-fade-left, .reveal-fade-right');
  const sections = document.querySelectorAll('section[id]');
  
  // -------------------------------------------------------------------
  // 2. MOBILE MENU CONTROLS
  // -------------------------------------------------------------------
  function toggleMobileMenu(open = true) {
    if (open) {
      mobileNav.classList.add('active');
      mobileNavOverlay.classList.add('active');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      mobileNav.classList.remove('active');
      mobileNavOverlay.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('active');
    toggleMobileMenu(!isOpen);
  });

  menuClose.addEventListener('click', () => toggleMobileMenu(false));
  mobileNavOverlay.addEventListener('click', () => toggleMobileMenu(false));

  // Close menu when clicking on any mobile nav links
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // Close mobile nav on escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      toggleMobileMenu(false);
    }
  });

  // -------------------------------------------------------------------
  // 3. HEADER CHANGE ON SCROLL
  // -------------------------------------------------------------------
  function handleHeaderScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll(); // Check once on initial load

  // -------------------------------------------------------------------
  // 4. BACK-TO-TOP BUTTON
  // -------------------------------------------------------------------
  function handleBackToTopVisibility() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleBackToTopVisibility);
  handleBackToTopVisibility();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // -------------------------------------------------------------------
  // 5. INTERSECTION OBSERVER FOR ACTIVE NAV LINKS & SCROLL REVEALS
  // -------------------------------------------------------------------
  
  // A. Active Navigation Link Highlighting
  const activeLinkOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the sweet middle-spot of screen
    threshold: 0
  };

  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update Desktop Navbar links
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Update Mobile Navbar links
        mobileNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, activeLinkOptions);

  sections.forEach(section => activeLinkObserver.observe(section));

  // B. Scroll Reveal Animations
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger slightly before element is in full view
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // Reveal only once
      }
    });
  }, revealOptions);

  revealElements.forEach(element => {
    // Add custom stagger delays to lists/grids
    const delay = element.getAttribute('style');
    if (delay && delay.includes('--delay')) {
      const stepIndex = parseInt(delay.replace(/[^\d]/g, '')) || 0;
      element.style.transitionDelay = `${stepIndex * 0.1}s`;
    }
    revealObserver.observe(element);
  });

  // -------------------------------------------------------------------
  // 6. ANTI-GRAVITY MOUSE PARALLAX WITH SMOOTH INTERPOLATION (LERPING)
  // -------------------------------------------------------------------
  const gravityContainer = document.getElementById('antigravity-container');
  const floatingItems = document.querySelectorAll('.floating-item');
  
  // Variables for tracking mouse and current position for smooth easing
  let mouse = { x: 0, y: 0 };
  let currentPos = { x: 0, y: 0 };
  let animationFrameId = null;
  let isMobileDevice = window.innerWidth <= 768;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Max pixel offset displacement for anti-gravity objects
  const maxDisplacement = 60; 

  function handleMouseMove(e) {
    if (isMobileDevice || isReducedMotion) return;
    
    // Normalize coordinates so center screen is (0,0) and borders are (-0.5 to 0.5)
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;

    mouse.x = normX * maxDisplacement;
    mouse.y = normY * maxDisplacement;
    
    // Start animation loop if it is not already running
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateParallaxPosition);
    }
  }

  function updateParallaxPosition() {
    // Linear Interpolation (Lerp) formula: Current = Current + (Target - Current) * EasingRate
    // EasingRate 0.08 creates a very smooth, sluggish drag-like float effect
    currentPos.x += (mouse.x - currentPos.x) * 0.08;
    currentPos.y += (mouse.y - currentPos.y) * 0.08;

    floatingItems.forEach(item => {
      const depth = parseFloat(item.getAttribute('data-depth')) || 0.2;
      const moveX = currentPos.x * depth;
      const moveY = currentPos.y * depth;
      
      // Use translate3d to leverage GPU hardware acceleration for smooth 60fps animations
      item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    // Check if the current position is extremely close to the target mouse position
    const diffX = Math.abs(mouse.x - currentPos.x);
    const diffY = Math.abs(mouse.y - currentPos.y);

    if (diffX > 0.01 || diffY > 0.01) {
      animationFrameId = requestAnimationFrame(updateParallaxPosition);
    } else {
      animationFrameId = null; // Pause rendering loop if items have come to rest
    }
  }

  // Handle screen resize events
  function handleResize() {
    isMobileDevice = window.innerWidth <= 768;
    
    if (isMobileDevice || isReducedMotion) {
      // Cancel loops and reset positions on mobile
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      floatingItems.forEach(item => {
        item.style.transform = '';
      });
    }
  }

  // Bind Listeners
  if (gravityContainer && !isReducedMotion) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
  }

  // -------------------------------------------------------------------
  // 7. KEYBOARD ACCESSIBILITY FOR NAV LINK FOCUSING
  // -------------------------------------------------------------------
  // Ensure smooth scroll doesn't break focus management
  const allFocusableNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  allFocusableNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      }
    });
  });

});
