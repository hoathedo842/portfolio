document.addEventListener('DOMContentLoaded', function () {
  const phoneInputField = document.querySelector('#phone');
  if (!phoneInputField) return;

  const phoneInput = window.intlTelInput(phoneInputField, {
    initialCountry: 'auto',
    geoIpLookup: function (callback) {
      fetch('https://ipapi.co/json')
        .then((res) => res.json())
        .then((data) => callback(data.country_code))
        .catch(() => callback('vn'));
    },
    utilsScript:
      'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js',
  });

  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const formResponse = document.getElementById('formResponse');
  const submitBtn = document.getElementById('submitBtn');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const phoneNumber = phoneInput.getNumber();
    const formData = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      phone: phoneNumber,
      message: contactForm.message.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formResponse.textContent = '';

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        formResponse.className = 'mt-3 text-center fw-semibold text-success';
        formResponse.textContent = result.message;
        contactForm.reset();
        phoneInput.setNumber('');
      } else {
        formResponse.className = 'mt-3 text-center fw-semibold text-danger';
        formResponse.textContent =
          result.error || 'Something went wrong. Please try again.';
      }
    } catch (error) {
      formResponse.className = 'mt-3 text-center fw-semibold text-danger';
      formResponse.textContent = 'Network error. Please check your connection.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
});
