/* ============================================
   DELIVERY TRACKING - CLIENT VIEW
   ============================================ */

const DeliveryTracking = {
  currentMonth: null,
  currentWeek: 1,
  clientId: null,

  /**
   * Initialize delivery tracking
   */
  init(clientData) {
    this.clientId = clientData.offer_and_economics?.client_email || 'demo-client';
    this.populateClientInfo(clientData);
    this.populateMonthSelector();
    this.setupEventListeners();
    this.loadDeliveryData();
  },

  /**
   * Populate client info bar
   */
  populateClientInfo(data) {
    const clientInfo = data.offer_and_economics || {};
    document.getElementById('deliveryCompanyName').textContent = 
      clientInfo.company_name || 'Not provided';
    
    // Get overall progress from dashboard
    const progressData = JSON.parse(localStorage.getItem('clientProgress') || '[]');
    const overallProgress = Math.round(
      progressData.reduce((sum, area) => sum + area.progress, 0) / progressData.length
    );
    document.getElementById('deliveryOverallProgress').textContent = `${overallProgress}%`;
  },

  /**
   * Populate month selector with last 6 months
   */
  populateMonthSelector() {
    const monthSelector = document.getElementById('monthSelector');
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
    this.currentMonth = months[0].value;
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Month selector
    document.getElementById('monthSelector').addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.loadDeliveryData();
    });

    // Week selector
    document.getElementById('weekSelector').addEventListener('change', (e) => {
      this.currentWeek = parseInt(e.target.value);
      this.loadDeliveryData();
    });

    // Back to dashboard button
    document.getElementById('backToDashboard').addEventListener('click', () => {
      document.getElementById('deliveryTracking').classList.add('hidden');
      document.getElementById('completion').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Expandable area headers
    document.querySelectorAll('.delivery-area-header').forEach(header => {
      header.addEventListener('click', () => {
        const areaId = header.dataset.area;
        this.toggleArea(areaId);
      });
    });
  },

  /**
   * Toggle area expansion
   */
  toggleArea(areaId) {
    const content = document.querySelector(`.delivery-area-content[data-area="${areaId}"]`);
    const icon = document.querySelector(`.delivery-area-header[data-area="${areaId}"] .expand-icon`);
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      icon.textContent = '▲';
    } else {
      content.style.display = 'none';
      icon.textContent = '▼';
    }
  },

  /**
   * Load delivery data for selected month/week
   */
  loadDeliveryData() {
    // Get delivery updates from localStorage
    const storageKey = `delivery_${this.clientId}_${this.currentMonth}_week${this.currentWeek}`;
    const deliveryData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    // Update each area
    for (let areaId = 1; areaId <= 6; areaId++) {
      const areaData = deliveryData[`area${areaId}`] || { updates: [], progress: 0 };
      this.renderAreaUpdates(areaId, areaData);
    }

    // Load and display KPIs
    this.loadKPIs();
  },

  /**
   * Load and display KPIs for selected week
   */
  loadKPIs() {
    if (!window.KPITracking) return;

    const kpiData = KPITracking.getKPIs(this.clientId);
    if (!kpiData) return;

    const weeklyKPIs = KPITracking.getWeeklyKPIs(this.clientId, this.currentMonth, this.currentWeek);
    const baseline = kpiData.baseline;

    if (!weeklyKPIs && !baseline) {
      document.getElementById('kpiDashboard').style.display = 'none';
      return;
    }

    // Show KPI dashboard
    document.getElementById('kpiDashboard').style.display = 'block';

    const kpis = [
      { 
        label: '💵 Cost Per Lead', 
        baseline: baseline.costPerLead, 
        current: weeklyKPIs?.costPerLead,
        lowerIsBetter: true,
        icon: '$',
        subtitle: 'Avg cost per lead'
      },
      { 
        label: '💰 Customer Acquisition Cost (CAC)', 
        baseline: baseline.cac, 
        current: weeklyKPIs?.cac,
        lowerIsBetter: true,
        icon: '🛒',
        subtitle: 'Cost to acquire 1 customer'
      },
      { 
        label: '🔄 Lead-to-Appointment Rate', 
        baseline: baseline.leadToAppointment, 
        current: weeklyKPIs?.leadToAppointment,
        lowerIsBetter: false,
        icon: '↔',
        subtitle: 'With ENERGY+'
      },
      { 
        label: '⚡ Speed-to-Lead', 
        baseline: baseline.speedToLead, 
        current: weeklyKPIs?.speedToLead,
        lowerIsBetter: true,
        icon: '⏱',
        subtitle: 'Top performers'
      },
      { 
        label: '📈 Close Rate', 
        baseline: baseline.closingRate, 
        current: weeklyKPIs?.closingRate,
        lowerIsBetter: false,
        icon: '📊',
        subtitle: 'Top teams'
      },
      { 
        label: '✅ Follow-Up Completion', 
        baseline: baseline.followupCompletion, 
        current: weeklyKPIs?.followupCompletion,
        lowerIsBetter: false,
        icon: '✓',
        subtitle: 'Of leads receive proper follow-up'
      }
    ];

    const container = document.getElementById('kpiMetricsDisplay');
    container.innerHTML = kpis.map(kpi => {
      const current = kpi.current || kpi.baseline || 'Not set';
      const hasImprovement = kpi.baseline && kpi.current;
      const indicator = hasImprovement ? 
        KPITracking.getImprovementIndicator(kpi.baseline, kpi.current, kpi.lowerIsBetter) : '';

      return `
        <div style="background: rgba(26, 26, 26, 0.8); padding: var(--space-xl); border-radius: var(--radius-lg); border: 1px solid rgba(51, 51, 51, 0.5); position: relative; overflow: hidden;">
          <div style="position: absolute; top: var(--space-lg); left: var(--space-lg); font-size: 2rem; opacity: 0.3;">${kpi.icon}</div>
          <div style="position: relative; z-index: 1;">
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-xs); font-weight: var(--font-weight-medium);">${kpi.label.replace(/^[^a-zA-Z]+/, '')}</p>
            <div style="display: flex; align-items: baseline; gap: var(--space-md); margin: var(--space-md) 0;">
              <p style="font-size: 2.5rem; color: var(--color-text-primary); font-weight: var(--font-weight-bold); margin: 0; line-height: 1;">${current}</p>
              ${indicator}
            </div>
            <p style="font-size: var(--font-size-xs); color: rgba(136, 136, 136, 0.8); margin: 0;">
              ${kpi.subtitle}
            </p>
            ${kpi.baseline && kpi.current && kpi.baseline !== kpi.current ? `
              <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-sm); opacity: 0.6;">
                Baseline: ${kpi.baseline}
              </p>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render updates for a specific area
   */
  renderAreaUpdates(areaId, areaData) {
    const container = document.querySelector(`.delivery-area-content[data-area="${areaId}"] .timeline-container`);
    const progressBadge = document.querySelector(`.area-progress-badge[data-area="${areaId}"]`);
    
    // Update progress badge
    progressBadge.textContent = `${areaData.progress || 0}%`;
    
    // Render updates
    if (!areaData.updates || areaData.updates.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: var(--space-xl);">No updates yet for this period</p>';
      return;
    }
    
    // Sort updates by date (newest first)
    const sortedUpdates = [...areaData.updates].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    container.innerHTML = sortedUpdates.map(update => {
      const date = new Date(update.timestamp);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
      
      return `
        <div class="timeline-item" style="display: flex; gap: var(--space-md); margin-bottom: var(--space-lg); padding-bottom: var(--space-lg); border-bottom: 1px solid var(--color-border);">
          <div style="flex-shrink: 0;">
            <div style="width: 12px; height: 12px; background: var(--color-primary-green); border-radius: 50%; margin-top: 6px;"></div>
          </div>
          <div style="flex: 1;">
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
        </div>
      `;
    }).join('');
  },

  /**
   * Show delivery tracking section
   */
  show() {
    document.getElementById('completion').classList.add('hidden');
    document.getElementById('deliveryTracking').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Export for use in other scripts
window.DeliveryTracking = DeliveryTracking;

