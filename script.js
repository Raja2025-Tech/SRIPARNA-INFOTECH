/**
 * Sriparna Infotech - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* 1. Mobile Menu Toggle Logic */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Toggle hamburger icon to 'X' (optional)
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    /* 2. Scroll Reveal Animation Logic (Intersection Observer) */
    // Automatically add the '.reveal' class to sections, cards, and important elements
    const elementsToReveal = document.querySelectorAll('.card, .section-title, .section-lede, .contact-info, .contact-form, .local-faq-item');
    
    elementsToReveal.forEach(el => {
        el.classList.add('reveal');
    });

    const revealOptions = {
        threshold: 0.15, // element triggers when 15% visible
        rootMargin: "0px 0px -40px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            // Add 'active' class to trigger CSS animation
            entry.target.classList.add('active');
            // Stop observing once animated to prevent repeating
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    elementsToReveal.forEach(el => {
        revealOnScroll.observe(el);
    });

});
