import { emailService } from '../src/services/emailService';

async function run() {
  console.log('Sending listing admin notification...');
  await emailService.sendListingRequestAdminNotification({
    companyName: 'Test Company',
    website: 'https://example.com',
    contactName: 'Tester',
    contactRole: 'QA',
    contactPhone: '+1234567890',
    email: 'devbug.hosting@gmail.com',
    serviceMatrix: [{ countries: ['Algeria'], services: ['EOR / PEO Services'] }],
    answers: {
      general: {
        legal_entity: 'Own entity',
        years_active: '1–3 years',
        tax_registration: 'XYZ',
      },
      'EOR / PEO Services': {
        full_handling: ['Income Tax', 'Statutory Benefits'],
        pricing_model: ['Per employee per month'],
        starting_price: '100–199',
      },
    },
    selectedPlan: 'Free Listing',
    submittedAt: new Date(),
  });

  console.log('Sending contact acknowledgement...');
  await emailService.sendContactAcknowledgement({
    fullName: 'Contact User',
    businessEmail: 'devbug.hosting@gmail.com',
    companyName: 'Contact Company',
    subject: 'General Inquiry',
    submissionId: 'test123',
  });

  console.log('Sending contact admin notification...');
  await emailService.sendContactNotification({
    fullName: 'Contact User',
    businessEmail: 'devbug.hosting@gmail.com',
    companyName: 'Contact Company',
    jobTitle: 'Tester',
    phone: '+1112223333',
    subject: 'General Inquiry',
    message: 'This is a test message to verify email templates.',
    submissionId: 'test123',
    submittedAt: new Date(),
  });

  console.log('Done sending test emails');
}

run().catch(err => {
  console.error('Error in test emails:', err);
  process.exit(1);
});
