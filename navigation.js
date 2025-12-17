/* ============================================
   NAVIGATION & STEP MANAGEMENT
   ============================================ */

const Navigation = {
  totalSteps: 7,
  currentStep: 1,

  init() {
    this.currentStep = DataManager.getCurrentStep();
    this.setupEventListeners();
    this.showStep(this.currentStep);
    this.updateProgress();
  },

  setupEventListeners() {
    // Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToNextStep());
    }

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goToPreviousStep());
    }

    // Listen for form changes
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, select, textarea')) {
        this.autoSave();
      }
    });

    // Listen for checkbox/radio changes
    document.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"], input[type="radio"]')) {
        this.autoSave();
      }
    });
  },

  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(step => {
      step.classList.add('hidden');
    });

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.remove('hidden');
      
      // Trigger animation
      currentStepElement.style.animation = 'none';
      setTimeout(() => {
        currentStepElement.style.animation = '';
      }, 10);
    }

    // Update navigation buttons
    this.updateNavigationButtons();
    
    // Update progress
    this.updateProgress();

    // Load saved data for this step
    this.loadStepData(stepNumber);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goToNextStep() {
    // Validate current step
    if (!this.validateCurrentStep()) {
      return;
    }

    // Save current step data
    this.saveStepData(this.currentStep);
    
    // Mark step as completed
    DataManager.completeStep(this.currentStep);

    // Move to next step or completion
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      DataManager.setCurrentStep(this.currentStep);
      this.showStep(this.currentStep);
    } else {
      // Show completion page
      this.showCompletion();
    }
  },

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      DataManager.setCurrentStep(this.currentStep);
      this.showStep(this.currentStep);
    }
  },

  updateNavigationButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Update back button
    if (backBtn) {
      backBtn.disabled = this.currentStep === 1;
      backBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    // Update next button text
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.totalSteps ? 'Complete' : 'Next Step →';
    }
  },

  updateProgress() {
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    
    const percentage = (this.currentStep / this.totalSteps) * 100;
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressLabel) {
      progressLabel.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
    }
  },

  validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${this.currentStep}`);
    if (!currentStepElement) return true;

    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        
        // Show error message
        let errorMsg = field.parentElement.querySelector('.error-message');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'This field is required';
          field.parentElement.appendChild(errorMsg);
        }
      } else {
        field.classList.remove('error');
        const errorMsg = field.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      }
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = currentStepElement.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  },

  saveStepData(stepNumber) {
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (!stepElement) return;

    const sectionName = stepElement.dataset.section;
    if (!sectionName) return;

    const formData = {};
    
    // Get all inputs, selects, and textareas
    const fields = stepElement.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.name) {
        if (field.type === 'checkbox') {
          if (!formData[field.name]) {
            formData[field.name] = [];
          }
          if (field.checked) {
            formData[field.name].push(field.value);
          }
        } else if (field.type === 'radio') {
          if (field.checked) {
            formData[field.name] = field.value;
          }
        } else {
          formData[field.name] = field.value;
        }
      }
    });

    DataManager.updateSection(sectionName, formData);
  },

  loadStepData(stepNumber) {
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (!stepElement) return;

    const sectionName = stepElement.dataset.section;
    if (!sectionName) return;

    const sectionData = DataManager.getSection(sectionName);
    if (!sectionData) return;

    // Populate fields with saved data
    Object.keys(sectionData).forEach(key => {
      const value = sectionData[key];
      
      // Handle arrays (checkboxes)
      if (Array.isArray(value)) {
        value.forEach(val => {
          const checkbox = stepElement.querySelector(`input[name="${key}"][value="${val}"]`);
          if (checkbox) checkbox.checked = true;
        });
      } else {
        // Handle regular inputs
        const field = stepElement.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === 'radio') {
            const radio = stepElement.querySelector(`input[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else {
            field.value = value;
          }
        }
      }
    });
  },

  autoSave() {
    // Debounced auto-save
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveStepData(this.currentStep);
    }, 500);
  },

  async showCompletion() {
    const data = DataManager.load();
    
    // ============================================
    // GENERATE PDF & SEND EMAILS
    // ============================================
    try {
      // Show loading state
      this.showLoadingState();
      
      // Generate PDF
      console.log('📄 Generating PDF...');
      const pdfBlob = await PDFGenerator.generatePDF(data);
      console.log('✅ PDF generated successfully');
      
      // Send emails (if configured)
      if (EmailSender.isConfigured()) {
        console.log('📧 Sending emails...');
        const emailResult = await EmailSender.sendEmails(data, pdfBlob);
        
        if (emailResult.success) {
          console.log('✅ Emails sent successfully');
        } else {
          console.warn('⚠️ Email sending failed:', emailResult.message);
        }
      } else {
        console.log('ℹ️ EmailJS not configured. PDF generated but not sent.');
        // Offer download as fallback
        this.offerPDFDownload(pdfBlob, data);
      }
      
    } catch (error) {
      console.error('❌ Error in completion process:', error);
      alert('There was an issue generating your PDF. Please contact support.');
    }
    // ============================================
    
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(step => {
      step.classList.add('hidden');
    });

    // Show completion page
    const completionPage = document.getElementById('completion');
    if (completionPage) {
      completionPage.classList.remove('hidden');
      
      // Initialize the progress dashboard
      if (window.Dashboard) {
        Dashboard.init(data);
      }
    }

    // Hide navigation
    const navFooter = document.querySelector('.nav-footer');
    if (navFooter) {
      navFooter.classList.add('hidden');
    }

    // Update progress to 100%
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = '100%';
    }
  },
  
  showLoadingState() {
    // Add loading indicator
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.textContent = 'Processing...';
      nextBtn.disabled = true;
    }
  },
  
  offerPDFDownload(pdfBlob, data) {
    // Create download link as fallback
    const clientInfo = data.offer_and_economics || {};
    const companyName = clientInfo.company_name || 'Client';
    const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Onboarding.pdf`;
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('💾 PDF downloaded as fallback');
  }
};

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
});

