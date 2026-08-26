document.addEventListener('DOMContentLoaded', () => {
  // 1. Toggle Form Logic
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const portfolioFormCard = document.getElementById('portfolioFormCard');
  const portfolioViewCards = document.getElementById('portfolioViewCards');

  if (toggleFormBtn) {
    toggleFormBtn.addEventListener('click', () => {
      portfolioFormCard.style.display = 'block';
      portfolioViewCards.style.display = 'none';
      toggleFormBtn.style.display = 'none';
    });
  }

  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', () => {
      portfolioFormCard.style.display = 'none';
      portfolioViewCards.style.display = 'flex';
      toggleFormBtn.style.display = 'inline-block';
    });
  }

  // 2. Add Skill Category Logic
  const addSkillCategoryBtn = document.getElementById('addSkillCategoryBtn');
  const skillsContainer = document.getElementById('skillsContainer');

  if (addSkillCategoryBtn && skillsContainer) {
    addSkillCategoryBtn.addEventListener('click', () => {
      const index = skillsContainer.querySelectorAll('.skill-item').length;
      const html = `
        <div class="col-md-6 skill-item">
          <div class="card bg-light border p-3 h-100 position-relative">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-2 remove-skill-btn"></button>
            <div class="mb-2">
              <label class="form-label">Category</label>
              <input type="text" name="skillCategories[${index}]" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Items</label>
              <input type="text" name="skillItems[${index}]" class="form-control" required />
            </div>
          </div>
        </div>`;
      skillsContainer.insertAdjacentHTML('beforeend', html);
    });

    skillsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-skill-btn')) {
        e.target.closest('.skill-item').remove();
      }
    });
  }

  // 3. Add Social Link Logic
  const addSocialBtn = document.getElementById('addSocialBtn');
  const socialsContainer = document.getElementById('socialsContainer');

  if (addSocialBtn && socialsContainer) {
    addSocialBtn.addEventListener('click', () => {
      const index = socialsContainer.querySelectorAll('.social-item').length;
      const html = `
        <div class="col-md-6 social-item">
          <div class="card bg-light border p-3 h-100 position-relative">
            <button type="button" class="btn-close position-absolute top-0 end-0 m-2 remove-social-btn"></button>
            <div class="mb-2">
              <label class="form-label">Platform Name</label>
              <input type="text" name="socialNames[${index}]" class="form-control" placeholder="e.g. GitHub" required />
            </div>
            <div>
              <label class="form-label">Profile URL</label>
              <input type="url" name="socialUrls[${index}]" class="form-control" placeholder="https://..." required />
            </div>
          </div>
        </div>`;
      socialsContainer.insertAdjacentHTML('beforeend', html);
    });

    socialsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-social-btn')) {
        e.target.closest('.social-item').remove();
      }
    });
  }
});
