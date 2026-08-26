document.addEventListener('DOMContentLoaded', () => {
  // 1. Show success alert banner if query param ?success=true exists
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

  // 2. Handle image upload real-time local preview using FileReader API
  const imageInput = document.getElementById('imageInput');
  const imagePreviewContainer = document.getElementById(
    'imagePreviewContainer',
  );
  const imagePreview = document.getElementById('imagePreview');

  if (imageInput) {
    imageInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
      }
    });
  }

  // 3. Handle custom delete modal state binding and action routing
  const deleteButtons = document.querySelectorAll('.delete-btn');
  const deleteForm = document.getElementById('deleteForm');
  const deleteModalElement = document.getElementById('deleteConfirmModal');

  if (deleteModalElement && deleteForm) {
    const deleteModal = new bootstrap.Modal(deleteModalElement);

    deleteButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const projectId = this.getAttribute('data-id');
        deleteForm.action = `/api/v1/admin/projects/${projectId}?_method=DELETE`;
        deleteModal.show();
      });
    });
  }
});
