document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('success')) {
    Swal.fire({
      icon: 'success',
      title: 'Successful',
      text: 'Project updated successfully',
      timer: 2000,
      showConfirmButton: false,
    });
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
