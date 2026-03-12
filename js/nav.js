function initBottomNav() {
  const moreBtn = document.getElementById('bnav-more');
  const drawer = document.getElementById('more-drawer');
  const backdrop = document.getElementById(
    'drawer-backdrop');
  const settingsBtn = document.getElementById(
    'drawer-settings-btn');

  function openDrawer() {
    drawer?.classList.add('open');
    backdrop?.classList.add('open');
  }
  function closeDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
  }

  moreBtn?.addEventListener('click', () => {
    drawer?.classList.contains('open') 
      ? closeDrawer() : openDrawer();
  });
  backdrop?.addEventListener('click', closeDrawer);
  settingsBtn?.addEventListener('click', () => {
    closeDrawer();
    document.getElementById('settings-modal')
      ?.classList.add('open');
  });

  // Set active tab
  const path = window.location.pathname;
  document.querySelectorAll('.bnav-item').forEach(item => {
    const page = item.dataset.page;
    if (!page) return;
    if (path === '/' || path.includes('index')) {
      if (page === 'home') item.classList.add('active');
    } else if (path.includes(page)) {
      item.classList.add('active');
    }
  });
}
// Call after DOM ready
document.addEventListener('DOMContentLoaded', 
  initBottomNav);
