document.addEventListener('DOMContentLoaded', function () {
  // 1. Mobile Menu Toggle Script
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 2. Footer Current Year Script
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 3. Scroll Reveal Observer
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    reveals.forEach((reveal) => {
      observer.observe(reveal);
    });
  }

  // 4. Success Modal Close Handler
  const successModal = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');
  if (closeModal && successModal) {
    closeModal.addEventListener('click', () => {
      successModal.classList.remove('show');
    });
  }

  // 5. International Telephone Input Setup
  const phoneInputField = document.querySelector('#phone');
  let phoneInput = null;
  if (phoneInputField && window.intlTelInput) {
    phoneInput = window.intlTelInput(phoneInputField, {
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
  }

  // 6. Contact Form Submission Handling
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const formResponse = document.getElementById('formResponse');
  const submitBtn = document.getElementById('submitBtn');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const phoneNumber = phoneInput
      ? phoneInput.getNumber()
      : contactForm.phone.value;
    const formData = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      phone: phoneNumber,
      message: contactForm.message.value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formResponse.textContent = '';
    formResponse.className = 'form-response-text';

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        contactForm.reset();
        if (phoneInput) phoneInput.setNumber('');

        if (successModal) {
          successModal.classList.add('show');
        }
      } else {
        formResponse.className = 'form-response-text error';
        formResponse.textContent =
          result.error || 'Something went wrong. Please try again.';
      }
    } catch (error) {
      formResponse.className = 'form-response-text error';
      formResponse.textContent = 'Network error. Please check your connection.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
});
