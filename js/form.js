/* ============================================
   FORM HANDLER — Validation + Google Sheets
   ============================================ */

(function () {
  'use strict';

  // ===========================================================
  // IMPORTANT: Replace this URL with your Google Apps Script URL
  // ===========================================================
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwJOQq9_G66uaLP65dJzN9tOzhxhDQ2T61hHKrerFSgfY6FQGpqaB6wgvxpQqgS7OKp/exec';

  const form = document.getElementById('registration-form');
  const addTeammateBtn = document.getElementById('add-teammate');
  const teammatesContainer = document.getElementById('teammates-container');
  const formMessage = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');

  // Registration form removed/disabled on the page.
  if (!form) {
    return;
  }

  // Teammates section title (section #2, now that hackathon selection was removed)
  const teammatesSectionTitle = document.querySelectorAll('.form-section-title')[1]; // 2nd section title

  let teammateCount = 0;

  // --- Theme to hackathon name mapping ---
  const themeToHackathon = {
    solidwork: 'Solid Work',
    problemsolving: 'Problem Solving',
    green: 'Green Entrepreneurial'
  };

  // --- Teammate requirements by hackathon ---
  const TEAMMATE_REQUIREMENTS = {
    'Solid Work': { min: 0, max: 0 },
    'Problem Solving': { min: 1, max: 2 },
    'Green Entrepreneurial': { min: 2, max: 2 }
  };

  // --- Solo hackathon detection ---
  const SOLO_HACKATHONS = ['Solid Work'];
  const CLOSED_HACKATHONS = [];

  function isSoloHackathon(value) {
    return SOLO_HACKATHONS.includes(value);
  }

  function isHackathonClosed(value) {
    return CLOSED_HACKATHONS.includes(value);
  }

  // --- Get current hackathon from navbar theme ---
  function getCurrentHackathon() {
    const theme = document.body.dataset.theme || 'solidwork';
    return themeToHackathon[theme] || 'Solid Work';
  }

  // --- Get teammate requirements for current hackathon ---
  function getTeammateRequirements(hackathon = null) {
    const hackathonName = hackathon || getCurrentHackathon();
    return TEAMMATE_REQUIREMENTS[hackathonName] || { min: 0, max: 0 };
  }

  // --- Toggle Teammates Section ---
  const soloBadge = document.getElementById('solo-badge');
  // Wrapper for teammates section elements to animate together
  const teammatesWrapper = [teammatesSectionTitle, teammatesContainer, addTeammateBtn];

  // --- Update form title with hackathon name ---
  function updateFormTitle(hackathonValue) {
    const titleElement = document.querySelector('.registration .section-title');
    if (titleElement) {
      titleElement.textContent = hackathonValue;
    }
  }

  function setFormDisabledState(disabled) {
    const fields = form.querySelectorAll('input, select, textarea, button');

    fields.forEach((field) => {
      if (field.id === 'submit-btn') {
        field.disabled = disabled;
        field.textContent = disabled ? 'PARTICIPANT NUMBER IS COMPLETED' : 'SUBMIT REGISTRATION';
        field.classList.toggle('is-closed', disabled);
        return;
      }

      if (field.id === 'add-teammate') {
        field.disabled = disabled;
        field.classList.toggle('is-closed', disabled);
        return;
      }

      field.disabled = disabled;
    });

    form.classList.toggle('form-closed', disabled);
  }

  function toggleTeammatesSection(hackathonValue) {
    const solo = isSoloHackathon(hackathonValue);
    const closed = isHackathonClosed(hackathonValue);

    // Update form title with hackathon name
    updateFormTitle(hackathonValue);

    if (solo) {
      // Clear any existing teammates
      teammatesContainer.innerHTML = '';
      teammateCount = 0;

      // Slide-hide teammates UI with animation
      teammatesWrapper.forEach(el => {
        if (el) el.classList.add('teammates-hidden');
      });

      // Show solo badge
      if (soloBadge) {
        soloBadge.style.display = 'block';
        // Trigger reflow for animation
        soloBadge.offsetHeight;
        soloBadge.classList.add('visible');
      }

      // Update leader section title
      const leaderSectionTitle = document.querySelectorAll('.form-section-title')[0];
      if (leaderSectionTitle) {
        leaderSectionTitle.innerHTML = '<span class="section-number">1</span> Your Information';
      }
    } else {
      // Slide-show teammates UI with animation
      teammatesWrapper.forEach(el => {
        if (el) el.classList.remove('teammates-hidden');
      });

      // Hide solo badge
      if (soloBadge) {
        soloBadge.classList.remove('visible');
        setTimeout(() => { soloBadge.style.display = 'none'; }, 400);
      }

      // Restore leader section title
      const leaderSectionTitle = document.querySelectorAll('.form-section-title')[0];
      if (leaderSectionTitle) {
        leaderSectionTitle.innerHTML = '<span class="section-number">1</span> Team Leader Information';
      }
    }

    if (closed) {
      showMessage('Participant number is completed for Solid Work.', 'error');
    } else {
      hideMessage();
    }

    setFormDisabledState(closed);
  }

  // --- Rate limiting ---
  let lastSubmitTime = 0;
  const SUBMIT_COOLDOWN = 10000; // 10 seconds

  // --- Sanitize input ---
  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.trim();
  }

  // --- Validate Email ---
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Create Teammate Block ---
  function createTeammateBlock() {
    const requirements = getTeammateRequirements();
    if (teammateCount >= requirements.max) {
      showMessage('Maximum of ' + requirements.max + ' teammates allowed.', 'error');
      return;
    }

    teammateCount++;
    const num = teammateCount;

    const block = document.createElement('div');
    block.className = 'teammate-block';
    block.id = `teammate-${num}`;
    block.innerHTML = `
      <div class="teammate-header">
        <span class="teammate-label">Teammate #${num}</span>
        <button type="button" class="remove-teammate" data-id="${num}">Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="tm-fname-${num}">First Name</label>
          <input type="text" id="tm-fname-${num}" name="tm_fname_${num}" placeholder="First name" required>
        </div>
        <div class="form-group">
          <label for="tm-lname-${num}">Last Name</label>
          <input type="text" id="tm-lname-${num}" name="tm_lname_${num}" placeholder="Last name" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="tm-dept-${num}">Department</label>
          <select id="tm-dept-${num}" name="tm_dept_${num}" required>
            <option value="">Select department</option>
            <option value="IT">IT</option>
            <option value="GE">GE</option>
            <option value="ME">ME</option>
            <option value="GES">GES</option>
          </select>
        </div>
        <div class="form-group">
          <label for="tm-class-${num}">Class</label>
          <input type="text" id="tm-class-${num}" name="tm_class_${num}" placeholder="e.g. 2CP, 1CS" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="tm-id-${num}">Student ID</label>
          <input type="text" id="tm-id-${num}" name="tm_id_${num}" placeholder="Student ID" required>
        </div>
        <div class="form-group">
          <label for="tm-email-${num}">Email</label>
          <input type="email" id="tm-email-${num}" name="tm_email_${num}" placeholder="email@example.com" required>
        </div>
      </div>
    `;

    teammatesContainer.appendChild(block);

    // Remove handler
    block.querySelector('.remove-teammate').addEventListener('click', () => {
      block.remove();
      teammateCount--;
      updateTeammateNumbers();
    });
  }

  // --- Re-number teammates after removal ---
  function updateTeammateNumbers() {
    const blocks = teammatesContainer.querySelectorAll('.teammate-block');
    blocks.forEach((block, idx) => {
      const num = idx + 1;
      block.querySelector('.teammate-label').textContent = `Teammate #${num}`;
    });
  }

  // --- Show Message ---
  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideMessage() {
    formMessage.className = 'form-message';
    formMessage.textContent = '';
  }

  // --- Collect Form Data ---
  function collectFormData() {
    const data = {
      hackathon: sanitize(getCurrentHackathon()),
      firstName: sanitize(document.getElementById('fname').value),
      lastName: sanitize(document.getElementById('lname').value),
      department: sanitize(document.getElementById('dept').value),
      class: sanitize(document.getElementById('student-class').value),
      studentId: sanitize(document.getElementById('student-id').value),
      email: sanitize(document.getElementById('email').value),
      phone: sanitize(document.getElementById('phone').value),
      teammates: []
    };

    const blocks = teammatesContainer.querySelectorAll('.teammate-block');
    blocks.forEach((block, idx) => {
      const num = idx + 1;
      const tmBlock = block;
      data.teammates.push({
        firstName: sanitize(tmBlock.querySelector(`[name^="tm_fname"]`).value),
        lastName: sanitize(tmBlock.querySelector(`[name^="tm_lname"]`).value),
        department: sanitize(tmBlock.querySelector(`[name^="tm_dept"]`).value),
        class: sanitize(tmBlock.querySelector(`[name^="tm_class"]`).value),
        studentId: sanitize(tmBlock.querySelector(`[name^="tm_id"]`).value),
        email: sanitize(tmBlock.querySelector(`[name^="tm_email"]`).value)
      });
    });

    return data;
  }

  // --- Validate ---
  function validate(data) {
    if (!data.hackathon) return 'Please select a hackathon.';
    if (!data.firstName) return 'Please enter your first name.';
    if (!data.lastName) return 'Please enter your last name.';
    if (!data.department) return 'Please select your department.';
    if (!data.class) return 'Please enter your class.';
    if (!data.studentId) return 'Please enter your student ID.';
    if (!data.email) return 'Please enter your email.';
    if (!data.phone) return 'Please enter your phone number.';
    if (!isValidEmail(data.email)) return 'Please enter a valid email address.';

    // Check teammate count requirements
    const requirements = getTeammateRequirements(data.hackathon);
    if (data.teammates.length < requirements.min) {
      return `This hackathon requires at least ${requirements.min} teammate${requirements.min !== 1 ? 's' : ''}.`;
    }
    if (data.teammates.length > requirements.max) {
      return `This hackathon allows a maximum of ${requirements.max} teammate${requirements.max !== 1 ? 's' : ''}.`;
    }

    for (let i = 0; i < data.teammates.length; i++) {
      const tm = data.teammates[i];
      if (!tm.firstName || !tm.lastName || !tm.department || !tm.class || !tm.studentId || !tm.email) {
        return `Please fill in all fields for Teammate #${i + 1}.`;
      }
      if (!isValidEmail(tm.email)) {
        return `Invalid email for Teammate #${i + 1}.`;
      }
    }

    return null;
  }

  function buildPayload(data) {
    const payload = {
      timestamp: new Date().toISOString(),
      hackathon: data.hackathon,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      class: data.class,
      studentId: data.studentId,
      email: data.email,
      phone: data.phone,
      teammateCount: data.teammates.length
    };

    data.teammates.forEach((tm, i) => {
      const n = i + 1;
      payload[`tm${n}_firstName`] = tm.firstName;
      payload[`tm${n}_lastName`] = tm.lastName;
      payload[`tm${n}_department`] = tm.department;
      payload[`tm${n}_class`] = tm.class;
      payload[`tm${n}_studentId`] = tm.studentId;
      payload[`tm${n}_email`] = tm.email;
    });

    return payload;
  }

  // --- Submit to Google Sheets without needing a local server ---
  async function submitToGoogleSheets(data) {
    const payload = buildPayload(data);
    const body = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      body.append(key, value == null ? '' : String(value));
    });

    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: body.toString()
    });

    return { success: true };
  }

  // --- Event Listeners ---
  addTeammateBtn.addEventListener('click', createTeammateBlock);

  // --- Listen for theme changes and update form ---
  // Watch for theme changes on the body element
  const observer = new MutationObserver(() => {
    const currentHackathon = getCurrentHackathon();
    toggleTeammatesSection(currentHackathon);
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // Initialize on load with current theme
  toggleTeammatesSection(getCurrentHackathon());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    if (isHackathonClosed(getCurrentHackathon())) {
      showMessage('Participant number is completed for Solid Work.', 'error');
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
      showMessage('Please wait a moment before submitting again.', 'error');
      return;
    }

    const data = collectFormData();
    const error = validate(data);

    if (error) {
      showMessage(error, 'error');
      return;
    }

    // Disable submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING...';

    try {
      if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Demo mode — no real submission
        await new Promise(r => setTimeout(r, 1500));
        showMessage('⚠️ Demo Mode: Form validated successfully! Connect a Google Sheet to save data. Check the README for setup instructions.', 'success');
      } else {
        await submitToGoogleSheets(data);
        showMessage('🎉 Registration submitted successfully! We\'ll be in touch soon.', 'success');
        form.reset();
        teammatesContainer.innerHTML = '';
        teammateCount = 0;
      }

      lastSubmitTime = now;
    } catch (err) {
      console.error('Submission error:', err);
      showMessage('Something went wrong. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT REGISTRATION';
    }
  });
})();
