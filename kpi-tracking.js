/* ============================================
   KPI TRACKING SYSTEM
   ============================================ */

const KPITracking = {
  /**
   * Initialize KPI tracking for a client
   */
  initializeKPIs(clientId, baselineKPIs) {
    const kpiData = {
      clientId,
      baseline: {
        cac: baselineKPIs.kpi_cac || '',
        costPerLead: baselineKPIs.kpi_cost_per_lead || '',
        speedToLead: baselineKPIs.kpi_speed_to_lead || '',
        leadToAppointment: baselineKPIs.kpi_lead_to_appointment || '',
        closingRate: baselineKPIs.kpi_closing_rate || '',
        overallConversion: baselineKPIs.kpi_overall_conversion || '',
        followupCompletion: baselineKPIs.kpi_followup_completion || ''
      },
      weekly: {}
    };
    
    localStorage.setItem(`kpi_${clientId}`, JSON.stringify(kpiData));
    return kpiData;
  },

  /**
   * Get KPI data for a client
   */
  getKPIs(clientId) {
    const data = localStorage.getItem(`kpi_${clientId}`);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Update KPIs for a specific week
   */
  updateWeeklyKPIs(clientId, month, week, kpis) {
    const kpiData = this.getKPIs(clientId) || { clientId, baseline: {}, weekly: {} };
    const key = `${month}_week${week}`;
    
    kpiData.weekly[key] = {
      ...kpis,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`kpi_${clientId}`, JSON.stringify(kpiData));
    return kpiData;
  },

  /**
   * Get KPIs for a specific week
   */
  getWeeklyKPIs(clientId, month, week) {
    const kpiData = this.getKPIs(clientId);
    if (!kpiData) return null;
    
    const key = `${month}_week${week}`;
    return kpiData.weekly[key] || null;
  },

  /**
   * Calculate improvement percentage
   */
  calculateImprovement(baseline, current) {
    if (!baseline || !current) return null;
    
    // Remove $ and % symbols, convert to numbers
    const baseNum = parseFloat(baseline.replace(/[$,%]/g, ''));
    const currNum = parseFloat(current.replace(/[$,%]/g, ''));
    
    if (isNaN(baseNum) || isNaN(currNum)) return null;
    
    // For costs (CAC, Cost Per Lead), lower is better
    // For rates (Lead to Appt, Closing Rate), higher is better
    const improvement = ((currNum - baseNum) / baseNum) * 100;
    return improvement.toFixed(1);
  },

  /**
   * Get all weekly KPIs for timeline view
   */
  getAllWeeklyKPIs(clientId) {
    const kpiData = this.getKPIs(clientId);
    if (!kpiData) return [];
    
    // Convert weekly object to array and sort by date
    const weekly = Object.entries(kpiData.weekly).map(([key, data]) => ({
      period: key,
      ...data
    })).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    
    return weekly;
  },

  /**
   * Format KPI value for display
   */
  formatKPI(value, type) {
    if (!value) return 'Not set';
    
    switch(type) {
      case 'currency':
        return value.startsWith('$') ? value : `$${value}`;
      case 'percentage':
        return value.endsWith('%') ? value : `${value}%`;
      case 'time':
        return value;
      default:
        return value;
    }
  },

  /**
   * Get improvement indicator (up/down arrow with color)
   */
  getImprovementIndicator(baseline, current, lowerIsBetter = false) {
    const improvement = this.calculateImprovement(baseline, current);
    if (improvement === null) return '';
    
    const isPositive = lowerIsBetter ? improvement < 0 : improvement > 0;
    const arrow = isPositive ? '↓' : '↑';
    const color = isPositive ? 'var(--color-primary-green)' : 'var(--color-error)';
    const absImprovement = Math.abs(improvement);
    
    return `<span style="color: ${color}; font-weight: bold;">${arrow} ${absImprovement}%</span>`;
  }
};

// Export for use in other scripts
window.KPITracking = KPITracking;

