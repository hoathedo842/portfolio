document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar toggle and Account dropdown menu logic
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

  // 2. Show success alert banner if query param ?success=true exists
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
      successAlert.style.display = 'block';
      setTimeout(() => {
        successAlert.style.display = 'none';
      }, 4000);
    }
  }

  // 3. Handle custom delete modal state binding and action routing
  const deleteButtons = document.querySelectorAll('.delete-btn');
  const deleteForm = document.getElementById('deleteForm');
  const deleteModalElement = document.getElementById('deleteConfirmModal');

  if (deleteModalElement && deleteForm) {
    const deleteModal = new bootstrap.Modal(deleteModalElement);

    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const vocabId = this.getAttribute('data-id');
        deleteForm.action = `/api/v1/user/dictionary/${vocabId}?_method=DELETE`;
        deleteModal.show();
      });
    });
  }
});
