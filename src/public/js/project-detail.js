const imageInput = document.getElementById('imageInput');
const previewImg = document.getElementById('previewImg');
const bigPreviewImg = document.getElementById('bigPreviewImg');
const imgBig = document.getElementById('imgBig');
const form = document.getElementById('projectForm');
const submitBtn = document.getElementById('submitBtn');

// 1. Logic phóng to ảnh
function toggleLargeImage() {
  imgBig.style.display = imgBig.style.display === 'flex' ? 'none' : 'flex';
}

// 2. Preview ảnh khi chọn file
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const newUrl = URL.createObjectURL(file);
    previewImg.src = newUrl;
    bigPreviewImg.src = newUrl;
  }
});

// 3. Logic khi nhấn nút Update
form.addEventListener('submit', function () {
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Updating...';
});

// 4. Kiểm tra URL xem có thành công không để hiện SweetAlert
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('success')) {
    Swal.fire({
      icon: 'success',
      title: 'Cập nhật thành công!',
      text: 'Dự án đã được lưu vào cơ sở dữ liệu.',
      showConfirmButton: false,
      timer: 2000,
    });
    // Xóa tham số success trên URL cho sạch sẽ
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
