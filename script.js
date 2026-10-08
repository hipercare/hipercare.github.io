// Progressive enhancement: navigation is fully visible when JavaScript is absent.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const mobile = window.matchMedia('(max-width: 800px)');

if (toggle && nav) {
  function closeMenu(restoreFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.hidden = mobile.matches;
    if (restoreFocus) toggle.focus();
  }

  function syncNavigation() {
    const focusWillBeHidden = mobile.matches && nav.contains(document.activeElement);
    toggle.hidden = !mobile.matches;
    closeMenu(focusWillBeHidden);
  }

  toggle.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opening));
    nav.hidden = !opening;
  });

  nav.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu(true);
    }
  });

  mobile.addEventListener('change', syncNavigation);
  syncNavigation();
}
