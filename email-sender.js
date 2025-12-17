/* ============================================
   EMAIL SENDER (EmailJS Integration)
   ============================================ */

const EmailSender = {
  // ============================================
  // CONFIGURATION
  // ============================================
  // TODO: Replace these with your EmailJS credentials
  // Get them from: https://dashboard.emailjs.com
  
  SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
  TEMPLATE_ID_TEAM: 'YOUR_TEAM_TEMPLATE_ID',
  TEMPLATE_ID_CLIENT: 'YOUR_CLIENT_TEMPLATE_ID',
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',
  
  TEAM_EMAIL: 'p9corps@gmail.com',
  
  /**
   * Initialize EmailJS
   */
  init() {
    if (window.emailjs && this.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      emailjs.init(this.PUBLIC_KEY);
      console.log('✅ EmailJS initialized');
      return true;
    }
    console.warn('⚠️ EmailJS not configured yet');
    return false;
  },
  
  /**
   * Send emails with PDF to both team and client
   * @param {Object} data - The onboarding data
   * @param {Blob} pdfBlob - The generated PDF
   */
  async sendEmails(data, pdfBlob) {
    // Check if EmailJS is configured
    if (!this.isConfigured()) {
      console.warn('⚠️ EmailJS not configured. Skipping email send.');
      return { success: false, message: 'EmailJS not configured' };
    }
    
    try {
      // Get client info
      const clientInfo = data.offer_and_economics || {};
      const companyName = clientInfo.company_name || 'Client';
      const clientName = clientInfo.client_name || 'Client';
      const clientEmail = clientInfo.client_email;
      
      // Convert PDF blob to base64
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Generate filename
      const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-Onboarding.pdf`;
      
      // ============================================
      // EMAIL TO TEAM
      // ============================================
      const teamParams = {
        to_email: this.TEAM_EMAIL,
        to_name: 'Energy+ Team',
        client_name: clientName,
        company_name: companyName,
        client_email: clientEmail || 'Not provided',
        submission_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        pdf_attachment: pdfBase64,
        pdf_filename: fileName
      };
      
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID_TEAM,
        teamParams
      );
      
      console.log('✅ Email sent to team');
      
      // ============================================
      // EMAIL TO CLIENT (if email provided)
      // ============================================
      if (clientEmail && clientEmail.trim() !== '') {
        const clientParams = {
          to_email: clientEmail,
          to_name: clientName,
          company_name: companyName,
          submission_date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          pdf_attachment: pdfBase64,
          pdf_filename: fileName
        };
        
        await emailjs.send(
          this.SERVICE_ID,
          this.TEMPLATE_ID_CLIENT,
          clientParams
        );
        
        console.log('✅ Email sent to client');
      }
      
      return {
        success: true,
        message: 'Emails sent successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending emails:', error);
      return {
        success: false,
        message: error.message || 'Failed to send emails'
      };
    }
  },
  
  /**
   * Convert blob to base64
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  
  /**
   * Check if EmailJS is properly configured
   */
  isConfigured() {
    return (
      this.SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID' &&
      this.TEMPLATE_ID_TEAM !== 'YOUR_TEAM_TEMPLATE_ID' &&
      this.TEMPLATE_ID_CLIENT !== 'YOUR_CLIENT_TEMPLATE_ID' &&
      this.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
      window.emailjs
    );
  }
};

// Initialize EmailJS when page loads
document.addEventListener('DOMContentLoaded', () => {
  EmailSender.init();
});

