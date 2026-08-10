# Backend Services

## Email Service (Mailgun)

The email service provides functionality to send transactional emails using the Mailgun API.

### Features

- **User Acknowledgement Email**: Sent to form submitters confirming their BANT/MEDDIC/INTENT(BMI) form submission
- **Admin Notification Email**: Sent to admin when a new BANT/MEDDIC/INTENT(BMI) form is submitted
- **Production-Ready**: Feature flag to enable/disable email sending
- **Zero Dependencies**: Uses native `fetch` API (no external packages required)

### Configuration

Add the following environment variables to your `.env` file:

```env
# Enable/disable email sending (set to 'true' in production)
EMAIL_ENABLED=false

# Mailgun API credentials
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=sandbox123.mailgun.org
MAILGUN_BASE_URL=https://api.mailgun.net

# Email addresses
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=Thhiya <noreply@yourdomain.com>
FROM_NAME=Thhiya
```

### How to Enable

1. **Get Mailgun Credentials**:
   - Sign up at [Mailgun](https://www.mailgun.com/)
   - Go to Settings > API Security to get your API key
   - Use your sandbox domain for testing or add a custom domain for production

2. **Set Environment Variables**:
   ```env
   EMAIL_ENABLED=true
  # MAILGUN_API_KEY=your_mailgun_api_key_here
   MAILGUN_API_KEY=your_mailgun_api_key_here
   MAILGUN_DOMAIN=sandbox9cfd7c3942dd4aa8b4110d1d2c9c8eea.mailgun.org
   MAILGUN_BASE_URL=https://api.mailgun.net
   ADMIN_EMAIL=your-admin-email@company.com
   ```

3. **For Sandbox Testing**:
   - Go to Mailgun Dashboard > Sending > Domains
   - Select your sandbox domain
   - Add authorized recipients (only these can receive emails from sandbox)

### Usage

The email service is automatically integrated with the BANT/MEDDIC/INTENT(BMI) form controller. When a user submits the form:

1. Form data is saved to the database
2. An acknowledgement email is sent to the user
3. A notification email is sent to the admin

Emails are sent asynchronously and won't block the API response.

### Email Templates

- **User Acknowledgement**: Professional HTML email with submission summary and next steps
- **Admin Notification**: Detailed lead information with BANT/MEDDIC/INTENT(BMI) qualification and priority level

### Testing Without Sending Emails

When `EMAIL_ENABLED=false` (default), the service will:
- Log that email sending is disabled
- Log what email would have been sent (in debug mode)
- Return success without actually sending

This is useful for development and testing.

### Switching to Production

For production with a custom domain:

1. Add and verify your domain in Mailgun
2. Set up DNS records (SPF, DKIM, MX)
3. Update environment variables with production domain
4. Set `EMAIL_ENABLED=true`

### Error Handling

- Failed emails don't break form submissions
- Errors are logged for debugging
- Each email result includes success status and any error messages
