/* ============================================
   MAIN APPLICATION LOGIC
   ============================================ */

const App = {
  init() {
    console.log('Energy+ Onboarding Portal Initialized');
    this.setupCompletionHandlers();
    this.setupTableHandlers();
  },

  setupCompletionHandlers() {
    // Export JSON button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        DataManager.exportJSON();
        this.showToast('Data exported successfully!');
      });
    }

    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start over? All data will be cleared.')) {
          DataManager.clear();
          location.reload();
        }
      });
    }
  },

  setupTableHandlers() {
    // Add Setter button
    const addSetterBtn = document.getElementById('addSetter');
    if (addSetterBtn) {
      addSetterBtn.addEventListener('click', () => this.addSetterRow());
    }

    // Add Triager button
    const addTriagerBtn = document.getElementById('addTriager');
    if (addTriagerBtn) {
      addTriagerBtn.addEventListener('click', () => this.addTriagerRow());
    }

    // Add Closer button
    const addCloserBtn = document.getElementById('addCloser');
    if (addCloserBtn) {
      addCloserBtn.addEventListener('click', () => this.addCloserRow());
    }

    // Add Custom System button
    const addCustomSystemBtn = document.getElementById('addCustomSystem');
    if (addCustomSystemBtn) {
      addCustomSystemBtn.addEventListener('click', () => this.addCustomSystemRow());
    }

    // Delete row handlers (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-row-btn')) {
        const row = e.target.closest('tr');
        const tbody = row.parentElement;
        // Only delete if there's more than one row
        if (tbody.querySelectorAll('tr').length > 1) {
          row.remove();
          Navigation.saveStepData(Navigation.currentStep);
        } else {
          this.showToast('At least one row is required', 2000);
        }
      }
    });
  },

  addSetterRow() {
    const tbody = document.getElementById('settersTableBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" name="setter_name[]" class="form-input" placeholder="Name"></td>
      <td><input type="text" name="setter_role[]" class="form-input" placeholder="Role"></td>
      <td><input type="text" name="setter_channels[]" class="form-input" placeholder="Channels"></td>
      <td><input type="text" name="setter_notes[]" class="form-input" placeholder="Notes"></td>
      <td>
        <select name="setter_eval[]" class="form-select">
          <option value="">Select...</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_improvement">Needs Improvement</option>
          <option value="poor">Poor</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="delete-row-btn" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 1.2rem;">✕</button>
      </td>
    `;
    tbody.appendChild(row);
  },

  addTriagerRow() {
    const tbody = document.getElementById('triagersTableBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" name="triager_name[]" class="form-input" placeholder="Name"></td>
      <td><input type="text" name="triager_resp[]" class="form-input" placeholder="Responsibilities"></td>
      <td><input type="text" name="triager_tools[]" class="form-input" placeholder="Tools"></td>
      <td><input type="text" name="triager_notes[]" class="form-input" placeholder="Notes"></td>
      <td>
        <select name="triager_eval[]" class="form-select">
          <option value="">Select...</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_improvement">Needs Improvement</option>
          <option value="poor">Poor</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="delete-row-btn" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 1.2rem;">✕</button>
      </td>
    `;
    tbody.appendChild(row);
  },

  addCloserRow() {
    const tbody = document.getElementById('closersTableBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" name="closer_name[]" class="form-input" placeholder="Name"></td>
      <td><input type="text" name="closer_role[]" class="form-input" placeholder="Role"></td>
      <td><input type="text" name="closer_channels[]" class="form-input" placeholder="Channels"></td>
      <td><input type="text" name="closer_notes[]" class="form-input" placeholder="Notes"></td>
      <td>
        <select name="closer_eval[]" class="form-select">
          <option value="">Select...</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_improvement">Needs Improvement</option>
          <option value="poor">Poor</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="delete-row-btn" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 1.2rem;">✕</button>
      </td>
    `;
    tbody.appendChild(row);
  },

  addCustomSystemRow() {
    const tbody = document.getElementById('additionalSystemsBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" name="custom_system_name[]" class="form-input" placeholder="System name"></td>
      <td><input type="text" name="custom_system_login[]" class="form-input" placeholder="Email or access link"></td>
      <td><input type="text" name="custom_system_notes[]" class="form-input" placeholder="Notes"></td>
      <td style="text-align: center;">
        <button type="button" class="delete-row-btn" style="background: none; border: none; color: var(--color-error); cursor: pointer; font-size: 1.2rem;">✕</button>
      </td>
    `;
    tbody.appendChild(row);
  },

  showToast(message, duration = 3000) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background-color: var(--color-primary-green);
      color: var(--color-bg-primary);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      z-index: 10000;
      animation: slideInUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .error {
    border-color: var(--color-error) !important;
  }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

