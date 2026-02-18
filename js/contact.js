/* ═════════════════════════════════════════════════════════════
   CONTACT PAGE JAVASCRIPT
   ═════════════════════════════════════════════════════════════ */

import { initI18n, t } from './i18n.js';

// DOM Elements
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const backToTop = document.getElementById('backToTop');

// Initialize
async function init() {
  await initI18n();
  setupEventListeners();
  setupScrollListener();
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  contactForm?.addEventListener('submit', handleSubmit);
  
  // Back to top
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Setup scroll listener
function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
  });
}

// Validate form
function validateForm() {
  let isValid = true;
  
  // Clear previous errors
  clearErrors();
  
  // Validate full name
  const fullName = document.getElementById('fullName');
  if (!fullName.value.trim()) {
    showError('fullName', t('contact.error_name') || 'Please enter your full name');
    isValid = false;
  }
  
  // Validate email
  const email = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value)) {
    showError('email', t('contact.error_email') || 'Please enter a valid email');
    isValid = false;
  }
  
  // Validate message
  const message = document.getElementById('message');
  if (!message.value.trim()) {
    showError('message', t('contact.error_message') || 'Please enter your message');
    isValid = false;
  }
  
  return isValid;
}

// Show error for a field
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  
  if (field) {
    field.classList.add('error');
  }
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

// Clear all errors
function clearErrors() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.classList.remove('error');
  });
  
  document.querySelectorAll('.form-error').forEach(error => {
    error.classList.remove('visible');
  });
  
  formSuccess?.classList.remove('visible');
}

// Build mailto URL
function buildMailto(formData) {
  const subjectMap = {
    'inquiry': t('contact.subject_inquiry') || 'Inquiry about a motorcycle',
    'testride': t('contact.subject_testride') || 'Test ride request',
    'financing': t('contact.subject_financing') || 'Financing question',
    'general': t('contact.subject_general') || 'General question'
  };
  
  const subject = subjectMap[formData.subject] || subjectMap['general'];
  
  const body = `
${t('contact.email_name') || 'Name'}: ${formData.fullName}
${t('contact.email_email') || 'Email'}: ${formData.email}
${t('contact.email_phone') || 'Phone'}: ${formData.phone || '-'}
${t('contact.email_subject') || 'Subject'}: ${subject}

${t('contact.email_message') || 'Message'}:
${formData.message}
  `.trim();
  
  return `mailto:motodesign@yahoo.gr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Get form data
  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value.trim()
  };
  
  // Build and open mailto link
  const mailtoUrl = buildMailto(formData);
  window.location.href = mailtoUrl;
  
  // Show success message
  formSuccess?.classList.add('visible');
  
  // Reset form
  contactForm.reset();
  
  // Hide success message after 5 seconds
  setTimeout(() => {
    formSuccess?.classList.remove('visible');
  }, 5000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
