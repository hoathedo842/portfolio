document.addEventListener('DOMContentLoaded', () => {
  // 1. Show success alert if query param exists
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

  // 2. Handle custom delete modal configuration and user binding
  const deleteButtons = document.querySelectorAll('.delete-btn');
  const deleteForm = document.getElementById('deleteForm');
  const deleteModalElement = document.getElementById('deleteConfirmModal');

  if (deleteModalElement && deleteForm) {
    const deleteModal = new bootstrap.Modal(deleteModalElement);

    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const userId = this.getAttribute('data-id');
        deleteForm.action = `/api/v1/admin/users/${userId}?_method=DELETE`;
        deleteModal.show();
      });
    });
  }
});
