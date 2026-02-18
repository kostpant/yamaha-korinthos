/* ═════════════════════════════════════════════════════════════
   NAVBAR & MOBILE MENU JAVASCRIPT
   ═════════════════════════════════════════════════════════════ */

/**
 * Setup mobile menu toggle behavior
 */
export function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');

        // Prevent scroll when menu is open
        if (menu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    const menuLinks = menu.querySelectorAll('.mobile-menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Setup navbar scroll behavior
 * @param {boolean} transparentInitially - Whether the navbar should be transparent at top
 */
export function setupNavbar(transparentInitially = false) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.remove('navbar-transparent');
            navbar.classList.add('navbar-solid');
        } else {
            if (transparentInitially) {
                navbar.classList.remove('navbar-solid');
                navbar.classList.add('navbar-transparent');
            } else {
                navbar.classList.add('navbar-solid');
            }
        }
    }

    // Initial check
    updateNavbar();

    // Listen to scroll
    window.addEventListener('scroll', updateNavbar, { passive: true });
}
