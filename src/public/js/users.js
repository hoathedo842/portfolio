document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebarMenu');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    });
  }

  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.getElementById('accountMenu');

  if (accountToggle && accountMenu) {
    accountToggle.addEventListener('click', () => {
      const isShown = accountMenu.style.display === 'block';
      accountMenu.style.display = isShown ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (
        !accountToggle.contains(e.target) &&
        !accountMenu.contains(e.target)
      ) {
        accountMenu.style.display = 'none';
      }
    });
  }
});
