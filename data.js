/* ============================================
   DATA MANAGEMENT & PERSISTENCE
   ============================================ */

const DataManager = {
  STORAGE_KEY: 'energyplus_onboarding_data',

  // Initialize data structure
  init() {
    const existingData = this.load();
    if (!existingData) {
      this.save(this.getEmptyDataStructure());
    }
  },

  // Get empty data structure
  getEmptyDataStructure() {
    return {
      currentStep: 1,
      completedSteps: [],
      lastUpdated: new Date().toISOString(),
      offer_and_economics: {
        // Client Information
        clientName: '',
        clientEmail: '',
        companyName: '',
        phoneNumber: '',
        
        // Section A: Offers/Services
        offers: '',
        niche: '',
        icp: '',
        bigPromise: '',
        whyBuying: '',
        bestSeller: '',
        guarantee: '',
        
        // Section B: Pricing & Payment
        pricingStructure: '',
        paymentOptions: '',
        deposits: '',
        profitMargins: '',
        
        // Section C: Client Management
        onboardingProcess: '',
        whatsBroken: '',
        clientCommunity: '',
        upsells: '',
        activeClients: '',
        
        // Section D: Funding Options
        fundingQualify: '',
        financingOptions: '',
        paperworkProcess: '',
        fundingConfusion: ''
      },
      lead_flow: {
        // Section A: Organic
        organicChannels: [],
        onlineCommunity: '',
        localPresence: '',
        postingFrequency: '',
        contentResponsible: '',
        leadflowBottlenecks: '',
        
        // Section B: Funnels & Opt-ins
        funnelSoftware: '',
        optinFunnels: '',
        vslFunnels: '',
        bookingFunnels: '',
        leadMagnets: '',
        bestLeadMagnet: '',
        funnelAssets: '',
        
        // Section C: Paid Ads
        adPlatforms: [],
        dailyAdSpend: '',
        mediaBuying: '',
        paidAdsBottlenecks: '',
        adsLibrary: ''
      },
      appointment_flow: {
        // Section A: Booking & Process
        bookingSoftware: '',
        bookingProcess: '',
        discoveryClosing: '',
        bestChannel: '',
        
        // Section B: Scripts & Sequences
        settingScripts: '',
        confirmationProcess: '',
        discoverySequences: '',
        closingSequences: '',
        disqualifyProcess: '',
        recordings: '',
        apptBottlenecks: ''
      },
      deal_flow: {
        // Section A: Sales Process
        salesScripts: '',
        discoveryScripts: '',
        
        // Section B: Performance
        closedCallRecordings: '',
        discoveryCallRecordings: '',
        topPerformers: '',
        dealFlowBottlenecks: ''
      },
      kpi_tracking: {
        kpi_cac: '',
        kpi_cost_per_lead: '',
        kpi_speed_to_lead: '',
        kpi_lead_to_appointment: '',
        kpi_closing_rate: '',
        kpi_followup_completion: ''
      },
      team_flow: {
        // Section A: Setters
        setters: [],
        setterEOD: '',
        setterShow: '',
        
        // Section B: Triagers
        triagers: [],
        triagerEOD: '',
        triagerShow: '',
        
        // Section C: Closers
        closers: [],
        closerEOD: '',
        closerShow: '',
        
        // Section D: Operations
        onboardingAssets: '',
        commSoftware: '',
        callReview: ''
      },
      systems_and_logins: {
        // Systems checkboxes
        systems: [],
        
        // Core Business Systems
        login_google_email: '',
        notes_google_email: '',
        login_zapier: '',
        notes_zapier: '',
        login_make: '',
        notes_make: '',
        login_payment: '',
        notes_payment: '',
        login_domain: '',
        notes_domain: '',
        login_sms: '',
        notes_sms: '',
        login_scheduler: '',
        notes_scheduler: '',
        login_funnel: '',
        notes_funnel: '',
        login_crm: '',
        notes_crm: '',
        login_email_marketing: '',
        notes_email_marketing: '',
        
        // Social Media
        login_fb_bm: '',
        notes_fb_bm: '',
        login_fb_page: '',
        notes_fb_page: '',
        login_instagram: '',
        notes_instagram: '',
        login_tiktok: '',
        notes_tiktok: '',
        login_linkedin: '',
        notes_linkedin: '',
        login_youtube: '',
        notes_youtube: '',
        login_twitter: '',
        notes_twitter: '',
        login_pinterest: '',
        notes_pinterest: '',
        
        // Paid Ads
        login_meta_ads: '',
        notes_meta_ads: '',
        login_google_ads: '',
        notes_google_ads: '',
        login_tiktok_ads: '',
        notes_tiktok_ads: '',
        login_linkedin_ads: '',
        notes_linkedin_ads: '',
        login_youtube_ads: '',
        notes_youtube_ads: '',
        
        // Website
        websiteUrl: '',
        websiteNotes: '',
        
        // Custom Systems
        customSystems: []
      }
    };
  },

  // Load data from localStorage
  load() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },

  // Save data to localStorage
  save(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  // Get specific section data
  getSection(sectionName) {
    const data = this.load();
    return data ? data[sectionName] : null;
  },

  // Update specific section
  updateSection(sectionName, sectionData) {
    const data = this.load();
    if (data) {
      data[sectionName] = { ...data[sectionName], ...sectionData };
      this.save(data);
    }
  },

  // Get current step
  getCurrentStep() {
    const data = this.load();
    return data ? data.currentStep : 1;
  },

  // Set current step
  setCurrentStep(step) {
    const data = this.load();
    if (data) {
      data.currentStep = step;
      this.save(data);
    }
  },

  // Mark step as completed
  completeStep(step) {
    const data = this.load();
    if (data && !data.completedSteps.includes(step)) {
      data.completedSteps.push(step);
      this.save(data);
    }
  },

  // Check if step is completed
  isStepCompleted(step) {
    const data = this.load();
    return data ? data.completedSteps.includes(step) : false;
  },

  // Export data as JSON
  exportJSON() {
    const data = this.load();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `energyplus-onboarding-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  // Clear all data
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.init();
  },

  // Get completion percentage
  getCompletionPercentage() {
    const data = this.load();
    if (!data) return 0;
    return Math.round((data.completedSteps.length / 6) * 100);
  }
};

// Initialize on load
DataManager.init();

