const imageInput = document.getElementById('imageInput');
const previewImg = document.getElementById('previewImg');
const bigPreviewImg = document.getElementById('bigPreviewImg');
const imgBig = document.getElementById('imgBig');
const form = document.getElementById('projectForm');
const submitBtn = document.getElementById('submitBtn');

function toggleLargeImage() {
  imgBig.style.display = imgBig.style.display === 'flex' ? 'none' : 'flex';
}

imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const newUrl = URL.createObjectURL(file);
    previewImg.src = newUrl;
    bigPreviewImg.src = newUrl;
  }
});

form.addEventListener('submit', function () {
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Updating...';
});

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('success')) {
    Swal.fire({
      icon: 'success',
      title: 'Successfully Updated!',
      text: 'The project has been successfully saved to the database.',
      showConfirmButton: false,
      timer: 2000,
    });
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
