/* ============================================
   PDF GENERATION
   ============================================ */

const PDFGenerator = {
  /**
   * Generates a branded PDF from the onboarding data
   * @param {Object} data - The complete onboarding data
   * @returns {Blob} - PDF file as a blob
   */
  async generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Branding colors
    const primaryGreen = [0, 255, 127]; // #00FF7F
    const darkBg = [18, 18, 18]; // #121212
    const lightGray = [200, 200, 200];
    const white = [255, 255, 255];
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    const contentWidth = rightMargin - leftMargin;
    
    // Helper: Add new page if needed
    const checkPageBreak = (neededSpace = 20) => {
      if (yPosition + neededSpace > 270) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };
    
    // Helper: Add section header
    const addSectionHeader = (title, emoji) => {
      checkPageBreak(30);
      doc.setFillColor(...primaryGreen);
      doc.rect(leftMargin, yPosition, contentWidth, 10, 'F');
      doc.setTextColor(...darkBg);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${emoji} ${title}`, leftMargin + 3, yPosition + 7);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
    };
    
    // Helper: Add field
    const addField = (label, value) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      
      const valueText = value || 'Not provided';
      const lines = doc.splitTextToSize(valueText, contentWidth - 5);
      doc.text(lines, leftMargin, yPosition + 5);
      yPosition += 5 + (lines.length * 5) + 3;
    };
    
    // ============================================
    // TITLE PAGE
    // ============================================
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('ENERGY+', pageWidth / 2, 40, { align: 'center' });
    
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Client Onboarding Report', pageWidth / 2, 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(today, pageWidth / 2, 65, { align: 'center' });
    
    yPosition = 90;
    doc.setTextColor(0, 0, 0);
    
    // ============================================
    // CLIENT INFORMATION
    // ============================================
    addSectionHeader('Client Information', '📋');
    
    const clientInfo = data.offer_and_economics || {};
    addField('Company Name', clientInfo.company_name);
    addField('Client Name', clientInfo.client_name);
    addField('Email', clientInfo.client_email);
    addField('Phone', clientInfo.client_phone);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 1: OFFER & ECONOMICS
    // ============================================
    addSectionHeader('Offer & Economics', '🔴');
    
    addField('Offers / Services', clientInfo.offers_services);
    addField('Niche', clientInfo.niche);
    addField('ICP (Ideal Customer Profile)', clientInfo.icp);
    addField('Big Promise / Transformation', clientInfo.big_promise);
    addField('Why Are People Buying Your Offer?', clientInfo.why_buying);
    addField('Best-Seller Offer', clientInfo.best_seller);
    addField('Conditional Guarantee', clientInfo.guarantee);
    addField('Pricing Structure', clientInfo.pricing_structure);
    addField('Payment Options', clientInfo.payment_options);
    addField('Deposits', clientInfo.deposits);
    addField('Profit Margins Per Client', clientInfo.profit_margins);
    addField('Client Onboarding Process', clientInfo.onboarding_process);
    addField('What\'s Broken?', clientInfo.whats_broken);
    
    yPosition += 5;
    
    // Funding Options
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    checkPageBreak(15);
    doc.text('🟡 Funding Options', leftMargin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    
    addField('Funding / Incentives', clientInfo.funding_incentives);
    addField('Financing Options', clientInfo.financing_options);
    addField('Incentive Paperwork', clientInfo.incentive_paperwork);
    addField('Client Confusion About Funding', clientInfo.funding_confusion);
    addField('Client Community', clientInfo.client_community);
    addField('Upsells', clientInfo.upsells);
    addField('Active Clients Count', clientInfo.active_clients_count);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 2: LEAD FLOW
    // ============================================
    const leadFlow = data.lead_flow || {};
    
    // Organic
    addSectionHeader('Lead Flow - Organic', '🟢');
    addField('Facebook (organic)', leadFlow.facebook_organic);
    addField('Instagram (organic)', leadFlow.instagram_organic);
    addField('YouTube', leadFlow.youtube);
    addField('TikTok', leadFlow.tiktok);
    addField('Online Community', leadFlow.online_community);
    addField('Local Community Presence', leadFlow.local_community);
    addField('Posting Frequency', leadFlow.posting_frequency);
    addField('Responsible for Content Distribution', leadFlow.content_distribution);
    addField('Leadflow Bottlenecks', leadFlow.organic_bottlenecks);
    
    yPosition += 5;
    
    // Funnels
    addSectionHeader('Lead Flow - Funnels & Opt-ins', '🟩');
    addField('Funnel Software Used', leadFlow.funnel_software);
    addField('Opt-in Funnels', leadFlow.optin_funnels);
    addField('VSL Funnels', leadFlow.vsl_funnels);
    addField('Booking Funnels', leadFlow.booking_funnels);
    addField('Lead Magnets', leadFlow.lead_magnets);
    addField('Best Performing Lead Magnet', leadFlow.best_lead_magnet);
    addField('Front-end Funnel Assets', leadFlow.funnel_assets);
    
    yPosition += 5;
    
    // Paid Ads
    addSectionHeader('Lead Flow - Paid Ads', '🟦');
    addField('Ad Platforms Used', leadFlow.ad_platforms);
    addField('Daily Ad Spend per Channel', leadFlow.ad_spend);
    addField('Media Buying', leadFlow.media_buying);
    addField('Paid Ads Bottlenecks', leadFlow.paid_ads_bottlenecks);
    addField('Ads Library Link', leadFlow.ads_library);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 3: APPOINTMENT FLOW
    // ============================================
    const appointmentFlow = data.appointment_flow || {};
    
    addSectionHeader('Appointment Flow', '🔵');
    addField('Booking Software Used', appointmentFlow.booking_software);
    addField('Booking Process', appointmentFlow.booking_process);
    addField('Discovery + Closing Calls?', appointmentFlow.discovery_closing);
    addField('Best Performing Channel', appointmentFlow.best_channel);
    addField('Appointment-Setting Scripts', appointmentFlow.appointment_scripts);
    addField('Call Confirmation Process', appointmentFlow.confirmation_process);
    addField('Discovery Call Sequences', appointmentFlow.discovery_sequences);
    addField('Closing Call Sequences', appointmentFlow.closing_sequences);
    addField('Disqualify / Cancel Process', appointmentFlow.disqualify_process);
    addField('Loom / Call Recordings', appointmentFlow.call_recordings);
    addField('Bottlenecks in Appointment Flow', appointmentFlow.appointment_bottlenecks);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 4: DEAL FLOW
    // ============================================
    const dealFlow = data.deal_flow || {};
    
    addSectionHeader('Deal Flow', '🟣');
    addField('Sales Scripts', dealFlow.sales_scripts);
    addField('Discovery Scripts', dealFlow.discovery_scripts);
    addField('Sales Call Recordings', dealFlow.sales_recordings);
    addField('Discovery Call Recordings', dealFlow.discovery_recordings);
    addField('Best Performing Sales Reps', dealFlow.best_reps);
    addField('Deal Flow Bottlenecks', dealFlow.deal_bottlenecks);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 5: TEAM FLOW
    // ============================================
    const teamFlow = data.team_flow || {};
    
    addSectionHeader('Team Flow - Performance', '🟣');
    
    // Setters
    if (teamFlow.setters && teamFlow.setters.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Setters:', leftMargin, yPosition);
      yPosition += 5;
      
      teamFlow.setters.forEach((setter, index) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${setter.name || 'N/A'} - ${setter.role || 'N/A'}`, leftMargin + 5, yPosition);
        yPosition += 5;
        if (setter.channels) {
          doc.text(`   Channels: ${setter.channels}`, leftMargin + 5, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 3;
    }
    
    // Triagers
    if (teamFlow.triagers && teamFlow.triagers.length > 0) {
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Triagers:', leftMargin, yPosition);
      yPosition += 5;
      
      teamFlow.triagers.forEach((triager, index) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${triager.name || 'N/A'} - ${triager.responsibilities || 'N/A'}`, leftMargin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    
    // Closers
    if (teamFlow.closers && teamFlow.closers.length > 0) {
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Closers:', leftMargin, yPosition);
      yPosition += 5;
      
      teamFlow.closers.forEach((closer, index) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${closer.name || 'N/A'} - ${closer.closing_role || 'N/A'}`, leftMargin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    
    yPosition += 5;
    addField('Setter EOD Report Link', teamFlow.setter_eod_link);
    addField('Triager EOD Report Link', teamFlow.triager_eod_link);
    addField('Closer EOD Report Link', teamFlow.closer_eod_link);
    addField('Setter Show Report', teamFlow.setter_show_report);
    addField('Triager Show Report', teamFlow.triager_show_report);
    addField('Closer Show Report', teamFlow.closer_show_report);
    addField('Team Onboarding Assets', teamFlow.onboarding_assets);
    addField('Team Communication Software', teamFlow.communication_software);
    addField('Call Review Process', teamFlow.call_review_process);
    
    yPosition += 5;
    
    // ============================================
    // SECTION 6: SYSTEMS & LOGINS
    // ============================================
    const systemsLogins = data.systems_and_logins || {};
    
    addSectionHeader('Systems & Logins', '🔐');
    
    // Core Business
    if (systemsLogins.core_business) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Core Business Systems:', leftMargin, yPosition);
      yPosition += 7;
      
      Object.entries(systemsLogins.core_business).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          addField(label, value);
        }
      });
    }
    
    // Social Media
    if (systemsLogins.social_media) {
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Social Media:', leftMargin, yPosition);
      yPosition += 7;
      
      Object.entries(systemsLogins.social_media).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          addField(label, value);
        }
      });
    }
    
    // Paid Advertising
    if (systemsLogins.paid_advertising) {
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Paid Advertising:', leftMargin, yPosition);
      yPosition += 7;
      
      Object.entries(systemsLogins.paid_advertising).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          addField(label, value);
        }
      });
    }
    
    // Website
    if (systemsLogins.website_url) {
      addField('Website URL', systemsLogins.website_url);
    }
    
    // Additional Systems
    if (systemsLogins.additional_systems && systemsLogins.additional_systems.length > 0) {
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Additional Systems:', leftMargin, yPosition);
      yPosition += 7;
      
      systemsLogins.additional_systems.forEach((system, index) => {
        checkPageBreak(20);
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}. ${system.system_name || 'N/A'}`, leftMargin + 5, yPosition);
        yPosition += 5;
        if (system.login_access) {
          const lines = doc.splitTextToSize(`   Access: ${system.login_access}`, contentWidth - 10);
          doc.text(lines, leftMargin + 5, yPosition);
          yPosition += lines.length * 5;
        }
        yPosition += 3;
      });
    }
    
    // ============================================
    // FOOTER
    // ============================================
    const totalPages = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(
        `Energy+ Onboarding Report - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        285,
        { align: 'center' }
      );
    }
    
    // Return PDF as blob
    return doc.output('blob');
  }
};

