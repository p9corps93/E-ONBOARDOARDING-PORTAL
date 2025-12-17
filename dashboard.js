/* ============================================
   CLIENT PROGRESS DASHBOARD
   ============================================ */

const Dashboard = {
  /**
   * Initialize the dashboard with client data
   * @param {Object} data - Client onboarding data
   */
  init(data) {
    this.populateClientInfo(data);
    this.initializeProgress();
    this.initializeKPIs(data);
    this.setupEventListeners();
  },

  /**
   * Initialize KPI tracking with baseline data
   */
  initializeKPIs(data) {
    if (!window.KPITracking) return;

    const clientId = data.offer_and_economics?.clientEmail || data.offer_and_economics?.client_email || 'demo-client';
    const baselineKPIs = data.kpi_tracking || {};

    // Only initialize if we have KPI data and haven't initialized before
    const existingKPIs = KPITracking.getKPIs(clientId);
    if (!existingKPIs && (baselineKPIs.kpi_cac || baselineKPIs.kpi_cost_per_lead)) {
      KPITracking.initializeKPIs(clientId, baselineKPIs);
    }
  },

  /**
   * Populate client information section
   */
  populateClientInfo(data) {
    const clientInfo = data.offer_and_economics || {};
    
    document.getElementById('dashboardCompany').textContent = 
      clientInfo.company_name || 'Not provided';
    
    document.getElementById('dashboardContact').textContent = 
      clientInfo.client_name || 'Not provided';
    
    document.getElementById('dashboardEmail').textContent = 
      clientInfo.client_email || 'Not provided';
    
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('dashboardDate').textContent = today;
  },

  /**
   * Initialize progress tracking
   * In a real implementation, this would load from a database
   * For now, we'll simulate progress starting at 0%
   */
  initializeProgress() {
    // Define progress areas with their current status
    const progressAreas = [
      {
        id: 1,
        name: 'Offer & Economics',
        progress: 0,
        status: 'Awaiting team review...'
      },
      {
        id: 2,
        name: 'Lead Flow',
        progress: 0,
        status: 'Awaiting team review...'
      },
      {
        id: 3,
        name: 'Appointment Flow',
        progress: 0,
        status: 'Awaiting team review...'
      },
      {
        id: 4,
        name: 'Deal Flow',
        progress: 0,
        status: 'Awaiting team review...'
      },
      {
        id: 5,
        name: 'Team Performance',
        progress: 0,
        status: 'Awaiting team review...'
      },
      {
        id: 6,
        name: 'Systems & Access',
        progress: 0,
        status: 'Awaiting team review...'
      }
    ];

    // Save initial progress to localStorage
    localStorage.setItem('clientProgress', JSON.stringify(progressAreas));

    // Update UI
    this.updateProgressUI();

    // Optional: Simulate progress for demo (remove in production)
    if (window.location.search.includes('demo=true')) {
      this.simulateProgress();
    }
  },

  /**
   * Update progress UI from stored data
   */
  updateProgressUI() {
    const progressData = JSON.parse(localStorage.getItem('clientProgress') || '[]');
    
    // Calculate overall progress
    const overallProgress = Math.round(
      progressData.reduce((sum, area) => sum + area.progress, 0) / progressData.length
    );

    // Update overall circular progress
    this.updateCircularProgress(overallProgress);
    document.getElementById('overallProgressPercent').textContent = `${overallProgress}%`;

    // Update individual progress bars
    progressData.forEach(area => {
      const percentElement = document.getElementById(`progress${area.id}Percent`);
      const fillElement = document.getElementById(`progress${area.id}Fill`);
      const statusElement = document.getElementById(`progress${area.id}Status`);

      if (percentElement) percentElement.textContent = `${area.progress}%`;
      if (fillElement) {
        setTimeout(() => {
          fillElement.style.width = `${area.progress}%`;
        }, 100 * area.id); // Stagger animations
      }
      if (statusElement) statusElement.textContent = area.status;
    });
  },

  /**
   * Update circular progress bar
   */
  updateCircularProgress(percent) {
    const circle = document.getElementById('overallProgressCircle');
    const circumference = 534.07; // 2 * PI * 85 (radius)
    const offset = circumference - (percent / 100) * circumference;
    
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 300);
  },

  /**
   * Update specific area progress (called by Energy+ team)
   * @param {number} areaId - Area ID (1-6)
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} status - Status message
   */
  updateAreaProgress(areaId, progress, status) {
    const progressData = JSON.parse(localStorage.getItem('clientProgress') || '[]');
    const area = progressData.find(a => a.id === areaId);
    
    if (area) {
      area.progress = progress;
      area.status = status;
      localStorage.setItem('clientProgress', JSON.stringify(progressData));
      this.updateProgressUI();
    }
  },

  /**
   * DEMO ONLY: Simulate progress over time
   * Remove this in production
   */
  simulateProgress() {
    console.log('🎬 Demo mode: Simulating progress...');
    
    // Simulate progress updates every 2 seconds
    let updates = [
      { area: 1, progress: 25, status: 'Team reviewing your offer structure...' },
      { area: 2, progress: 15, status: 'Analyzing lead generation channels...' },
      { area: 1, progress: 50, status: 'Optimizing pricing strategy...' },
      { area: 3, progress: 30, status: 'Setting up appointment automation...' },
      { area: 2, progress: 40, status: 'Creating content calendar...' },
      { area: 4, progress: 20, status: 'Reviewing sales scripts...' },
      { area: 1, progress: 75, status: 'Finalizing offer optimization...' },
      { area: 5, progress: 35, status: 'Assessing team structure...' },
      { area: 3, progress: 60, status: 'Implementing booking system...' },
      { area: 6, progress: 45, status: 'Integrating core systems...' },
      { area: 2, progress: 70, status: 'Launching lead campaigns...' },
      { area: 4, progress: 55, status: 'Training on new sales process...' },
      { area: 1, progress: 100, status: '✅ Offer optimization complete!' },
      { area: 5, progress: 65, status: 'Team training in progress...' },
      { area: 3, progress: 85, status: 'Fine-tuning appointment flow...' },
      { area: 6, progress: 80, status: 'Finalizing system integrations...' },
      { area: 2, progress: 100, status: '✅ Lead flow optimized!' },
      { area: 4, progress: 90, status: 'Deal flow performing well...' },
      { area: 3, progress: 100, status: '✅ Appointment system live!' },
      { area: 5, progress: 100, status: '✅ Team optimization complete!' },
      { area: 6, progress: 100, status: '✅ All systems integrated!' },
      { area: 4, progress: 100, status: '✅ Deal flow maximized!' }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index >= updates.length) {
        clearInterval(interval);
        console.log('🎉 Demo complete: All areas at 100%');
        return;
      }

      const update = updates[index];
      this.updateAreaProgress(update.area, update.progress, update.status);
      index++;
    }, 2000); // Update every 2 seconds
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // START SCALING button
    const startScalingBtn = document.getElementById('startScalingBtn');
    if (startScalingBtn) {
      startScalingBtn.addEventListener('click', () => {
        const data = DataManager.load();
        if (window.DeliveryTracking) {
          DeliveryTracking.init(data);
          DeliveryTracking.show();
        }
      });
    }

    // Export button - download PDF report
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = DataManager.load();
        if (window.PDFGenerator) {
          PDFGenerator.generatePDF(data).then(pdfBlob => {
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            const companyName = data.offer_and_economics?.company_name || 'Client';
            a.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Progress-Report.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          });
        }
      });
    }

    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new onboarding? This will clear your current data.')) {
          DataManager.reset();
          localStorage.removeItem('clientProgress');
          window.location.reload();
        }
      });
    }
  }
};

// Export for use in other scripts
window.Dashboard = Dashboard;

