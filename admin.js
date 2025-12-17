/* ============================================
   ADMIN PORTAL - DELIVERY TRACKING MANAGEMENT
   ============================================ */

const AdminPortal = {
  selectedClient: null,
  selectedMonth: null,
  selectedWeek: 1,
  selectedArea: null,

  /**
   * Initialize admin portal
   */
  init() {
    this.populateMonthSelector();
    this.loadClients();
    this.setupEventListeners();
    this.setDefaultDateTime();
  },

  /**
   * Load all clients from localStorage
   */
  loadClients() {
    const clientSelector = document.getElementById('adminClientSelector');
    
    // Get all keys from localStorage that contain onboarding data
    const clients = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('energyplus_onboarding_')) {
        const data = JSON.parse(localStorage.getItem(key));
        const clientInfo = data.offer_and_economics || {};
        if (clientInfo.client_email) {
          clients.push({
            id: clientInfo.client_email,
            name: clientInfo.company_name || clientInfo.client_name || 'Unnamed Client',
            email: clientInfo.client_email
          });
        }
      }
    }

    // Populate selector
    if (clients.length === 0) {
      clientSelector.innerHTML = '<option value="">No clients found - complete an onboarding first</option>';
    } else {
      clientSelector.innerHTML = '<option value="">-- Select a client --</option>' +
        clients.map(c => `<option value="${c.id}">${c.name} (${c.email})</option>`).join('');
    }
  },

  /**
   * Populate month selector
   */
  populateMonthSelector() {
    const monthSelector = document.getElementById('adminMonthSelector');
    const months = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ value, label: monthYear });
    }
    
    monthSelector.innerHTML = months.map(m => 
      `<option value="${m.value}">${m.label}</option>`
    ).join('');
    
    // Set current month as default
    this.selectedMonth = months[0].value;
  },

  /**
   * Set default date/time to now
   */
  setDefaultDateTime() {
    const now = new Date();
    
    // Set date
    const dateInput = document.getElementById('updateDate');
    if (dateInput) {
      dateInput.value = now.toISOString().split('T')[0];
    }
    
    // Set time
    const timeInput = document.getElementById('updateTime');
    if (timeInput) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      timeInput.value = `${hours}:${minutes}`;
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Client selection
    document.getElementById('adminClientSelector').addEventListener('change', (e) => {
      this.selectedClient = e.target.value;
      this.onClientSelected();
    });

    // Month selection
    document.getElementById('adminMonthSelector').addEventListener('change', (e) => {
      this.selectedMonth = e.target.value;
      this.loadCurrentUpdates();
    });

    // Week selection
    document.getElementById('adminWeekSelector').addEventListener('change', (e) => {
      this.selectedWeek = parseInt(e.target.value);
      this.loadCurrentUpdates();
    });

    // Area selection
    document.getElementById('adminAreaSelector').addEventListener('change', (e) => {
      this.selectedArea = e.target.value;
      this.onAreaSelected();
    });

    // Progress slider
    document.getElementById('progressSlider').addEventListener('input', (e) => {
      document.getElementById('progressValue').textContent = `${e.target.value}%`;
    });

    // Add update button
    document.getElementById('addUpdateBtn').addEventListener('click', () => {
      this.addUpdate();
    });

    // Update KPIs button
    document.getElementById('updateKPIsBtn').addEventListener('click', () => {
      this.updateKPIs();
    });
  },

  /**
   * Handle client selection
   */
  onClientSelected() {
    if (this.selectedClient) {
      // Show client info
      document.getElementById('clientInfoDisplay').style.display = 'block';
      const clientName = document.getElementById('adminClientSelector').selectedOptions[0].text;
      document.getElementById('selectedClientName').textContent = clientName;
      
      // Show update form
      document.getElementById('updateForm').style.display = 'block';
    } else {
      document.getElementById('clientInfoDisplay').style.display = 'none';
      document.getElementById('updateForm').style.display = 'none';
    }
  },

  /**
   * Handle area selection
   */
  onAreaSelected() {
    if (this.selectedArea) {
      document.getElementById('addUpdateSection').style.display = 'block';
      this.loadCurrentUpdates();
      this.loadCurrentKPIs();
    } else {
      document.getElementById('addUpdateSection').style.display = 'none';
    }
  },

  /**
   * Load current updates for selected period
   */
  loadCurrentUpdates() {
    if (!this.selectedClient || !this.selectedArea) return;

    const storageKey = `delivery_${this.selectedClient}_${this.selectedMonth}_week${this.selectedWeek}`;
    const deliveryData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const areaData = deliveryData[`area${this.selectedArea}`] || { updates: [], progress: 0 };
    
    const container = document.getElementById('currentUpdatesDisplay');
    
    if (!areaData.updates || areaData.updates.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: var(--space-xl);">No updates yet for this period</p>';
      // Set slider to 0
      document.getElementById('progressSlider').value = 0;
      document.getElementById('progressValue').textContent = '0%';
      return;
    }
    
    // Set slider to current progress
    document.getElementById('progressSlider').value = areaData.progress || 0;
    document.getElementById('progressValue').textContent = `${areaData.progress || 0}%`;
    
    // Sort updates by date (newest first)
    const sortedUpdates = [...areaData.updates].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    container.innerHTML = `
      <div style="background: var(--color-bg-input); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-xs);">Current Progress</p>
        <p style="font-size: var(--font-size-xl); color: var(--color-primary-green); font-weight: var(--font-weight-bold); margin: 0;">${areaData.progress}%</p>
      </div>
      ${sortedUpdates.map((update, index) => {
        const date = new Date(update.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true
        });
        
        return `
          <div style="padding: var(--space-md); border-left: 3px solid var(--color-primary-green); background: var(--color-bg-input); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-xs);">
              <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0;">
                ${dateStr} at ${timeStr}
              </p>
              ${update.addedBy ? `<p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0;">by ${update.addedBy}</p>` : ''}
            </div>
            <p style="font-size: var(--font-size-base); color: var(--color-text-primary); margin: 0;">
              ${update.description}
            </p>
          </div>
        `;
      }).join('')}
    `;
  },

  /**
   * Add new update
   */
  addUpdate() {
    // Validate inputs
    const description = document.getElementById('updateDescription').value.trim();
    const date = document.getElementById('updateDate').value;
    const time = document.getElementById('updateTime').value;
    const addedBy = document.getElementById('updateAddedBy').value.trim();
    const progress = parseInt(document.getElementById('progressSlider').value);

    if (!description) {
      alert('Please enter an update description');
      return;
    }

    if (!date || !time) {
      alert('Please select date and time');
      return;
    }

    // Create timestamp
    const timestamp = new Date(`${date}T${time}`).toISOString();

    // Get existing data
    const storageKey = `delivery_${this.selectedClient}_${this.selectedMonth}_week${this.selectedWeek}`;
    const deliveryData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    // Initialize area data if doesn't exist
    if (!deliveryData[`area${this.selectedArea}`]) {
      deliveryData[`area${this.selectedArea}`] = { updates: [], progress: 0 };
    }

    // Add new update
    deliveryData[`area${this.selectedArea}`].updates.push({
      timestamp,
      description,
      addedBy: addedBy || 'Admin'
    });

    // Update progress
    deliveryData[`area${this.selectedArea}`].progress = progress;

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(deliveryData));

    // Also update the main progress tracking
    this.updateMainProgress(this.selectedArea, progress);

    // Show success message
    alert('✅ Update added successfully!');

    // Clear form
    document.getElementById('updateDescription').value = '';
    document.getElementById('updateAddedBy').value = '';
    this.setDefaultDateTime();

    // Reload current updates
    this.loadCurrentUpdates();
  },

  /**
   * Update main progress tracking (for dashboard)
   */
  updateMainProgress(areaId, progress) {
    const progressData = JSON.parse(localStorage.getItem('clientProgress') || '[]');
    const area = progressData.find(a => a.id === parseInt(areaId));
    
    if (area) {
      area.progress = progress;
      
      // Update status based on progress
      if (progress === 0) {
        area.status = 'Awaiting team review...';
      } else if (progress < 25) {
        area.status = 'Initial analysis in progress...';
      } else if (progress < 50) {
        area.status = 'Implementation underway...';
      } else if (progress < 75) {
        area.status = 'Active optimization...';
      } else if (progress < 100) {
        area.status = 'Finalizing...';
      } else {
        area.status = '✅ Complete!';
      }
      
      localStorage.setItem('clientProgress', JSON.stringify(progressData));
    }
  },

  /**
   * Load current KPIs for selected period
   */
  loadCurrentKPIs() {
    if (!this.selectedClient || !window.KPITracking) return;

    const weeklyKPIs = KPITracking.getWeeklyKPIs(this.selectedClient, this.selectedMonth, this.selectedWeek);
    const baselineKPIs = KPITracking.getKPIs(this.selectedClient);

    if (weeklyKPIs) {
      // Populate form with existing KPIs
      document.getElementById('kpi_cac').value = weeklyKPIs.cac || '';
      document.getElementById('kpi_cost_per_lead').value = weeklyKPIs.costPerLead || '';
      document.getElementById('kpi_speed_to_lead').value = weeklyKPIs.speedToLead || '';
      document.getElementById('kpi_lead_to_appointment').value = weeklyKPIs.leadToAppointment || '';
      document.getElementById('kpi_closing_rate').value = weeklyKPIs.closingRate || '';
      document.getElementById('kpi_overall_conversion').value = weeklyKPIs.overallConversion || '';
      document.getElementById('kpi_followup_completion').value = weeklyKPIs.followupCompletion || '';

      // Show comparison if baseline exists
      if (baselineKPIs && baselineKPIs.baseline) {
        this.showKPIComparison(baselineKPIs.baseline, weeklyKPIs);
      }
    } else {
      // Clear form
      document.getElementById('kpi_cac').value = '';
      document.getElementById('kpi_cost_per_lead').value = '';
      document.getElementById('kpi_speed_to_lead').value = '';
      document.getElementById('kpi_lead_to_appointment').value = '';
      document.getElementById('kpi_closing_rate').value = '';
      document.getElementById('kpi_overall_conversion').value = '';
      document.getElementById('kpi_followup_completion').value = '';
      
      document.getElementById('kpiComparisonDisplay').style.display = 'none';
    }
  },

  /**
   * Update KPIs for selected week
   */
  updateKPIs() {
    if (!this.selectedClient || !window.KPITracking) {
      alert('Please select a client first');
      return;
    }

    const kpis = {
      cac: document.getElementById('kpi_cac').value.trim(),
      costPerLead: document.getElementById('kpi_cost_per_lead').value.trim(),
      speedToLead: document.getElementById('kpi_speed_to_lead').value.trim(),
      leadToAppointment: document.getElementById('kpi_lead_to_appointment').value.trim(),
      closingRate: document.getElementById('kpi_closing_rate').value.trim(),
      overallConversion: document.getElementById('kpi_overall_conversion').value.trim(),
      followupCompletion: document.getElementById('kpi_followup_completion').value.trim()
    };

    // Check if at least one KPI is filled
    const hasData = Object.values(kpis).some(v => v !== '');
    if (!hasData) {
      alert('Please enter at least one KPI value');
      return;
    }

    // Update KPIs
    KPITracking.updateWeeklyKPIs(this.selectedClient, this.selectedMonth, this.selectedWeek, kpis);

    // Show success
    alert('✅ KPIs updated successfully!');

    // Reload to show comparison
    this.loadCurrentKPIs();
  },

  /**
   * Show KPI comparison between baseline and current
   */
  showKPIComparison(baseline, current) {
    const container = document.getElementById('kpiComparisonDisplay');
    if (!container || !window.KPITracking) return;

    const kpis = [
      { key: 'cac', label: 'CAC', baseline: baseline.cac, current: current.cac, lowerIsBetter: true },
      { key: 'costPerLead', label: 'Cost Per Lead', baseline: baseline.costPerLead, current: current.costPerLead, lowerIsBetter: true },
      { key: 'speedToLead', label: 'Speed to Lead', baseline: baseline.speedToLead, current: current.speedToLead, lowerIsBetter: true },
      { key: 'leadToAppointment', label: 'Lead to Appointment', baseline: baseline.leadToAppointment, current: current.leadToAppointment, lowerIsBetter: false },
      { key: 'closingRate', label: 'Close Rate', baseline: baseline.closingRate, current: current.closingRate, lowerIsBetter: false },
      { key: 'overallConversion', label: 'Overall Conversion', baseline: baseline.overallConversion, current: current.overallConversion, lowerIsBetter: false },
      { key: 'followupCompletion', label: 'Follow-Up Completion', baseline: baseline.followupCompletion, current: current.followupCompletion, lowerIsBetter: false }
    ];

    const html = `
      <div style="background: var(--color-bg-card); padding: var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: var(--font-size-base); margin-bottom: var(--space-md); color: var(--color-text-primary);">📊 KPI Comparison (Baseline vs This Week)</h4>
        <div style="display: grid; gap: var(--space-md);">
          ${kpis.map(kpi => {
            if (!kpi.baseline || !kpi.current) return '';
            const indicator = KPITracking.getImprovementIndicator(kpi.baseline, kpi.current, kpi.lowerIsBetter);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm); background: var(--color-bg-input); border-radius: var(--radius-sm);">
                <span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">${kpi.label}</span>
                <div style="display: flex; align-items: center; gap: var(--space-md);">
                  <span style="color: var(--color-text-muted); font-size: var(--font-size-sm);">${kpi.baseline}</span>
                  <span style="color: var(--color-text-primary); font-weight: var(--font-weight-bold);">${kpi.current}</span>
                  ${indicator}
                </div>
              </div>
            `;
          }).filter(Boolean).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  AdminPortal.init();
});

