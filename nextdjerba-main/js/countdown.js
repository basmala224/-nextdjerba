/* ============================================
   COUNTDOWN TIMER — Registration Deadline
   ============================================ */

(function () {
  'use strict';

  // Read deadline from HTML: <section id="countdown" data-deadline="...">
  // Fallback: 7 days from now (keeps the timer working in dev).
  const countdownSection = document.getElementById('countdown');
  const deadlineAttr = countdownSection ? countdownSection.dataset.deadline : null;
  const parsedDeadline = deadlineAttr ? Date.parse(deadlineAttr) : NaN;
  const registrationDeadline = Number.isFinite(parsedDeadline)
    ? parsedDeadline
    : Date.now() + 7 * 24 * 60 * 60 * 1000;

  const deadlineLabel = document.getElementById('countdown-deadline');
  if (deadlineLabel) {
    const d = new Date(registrationDeadline);
    deadlineLabel.textContent = `🎯 Deadline: ${d.toLocaleString()}`;
  }

  const daysElement = document.getElementById('days');
  const hoursElement = document.getElementById('hours');
  const minutesElement = document.getElementById('minutes');
  const secondsElement = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = registrationDeadline - now;

    // Calculate time units
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update DOM with padding
    daysElement.textContent = String(days).padStart(2, '0');
    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = String(minutes).padStart(2, '0');
    secondsElement.textContent = String(seconds).padStart(2, '0');

    // If countdown is finished
    if (timeRemaining < 0) {
      daysElement.textContent = '00';
      hoursElement.textContent = '00';
      minutesElement.textContent = '00';
      secondsElement.textContent = '00';
      
      // Add warning styling
      const countdownSection = document.getElementById('countdown');
      if (countdownSection) {
        countdownSection.style.opacity = '0.7';
      }
      
      return false; // Stop the timer
    }

    return true; // Keep the timer running
  }

  // Initial update
  updateCountdown();

  // Update every second
  const countdownInterval = setInterval(() => {
    if (!updateCountdown()) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(countdownInterval);
  });
})();
