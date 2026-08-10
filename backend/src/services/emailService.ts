import { logger } from '../utils/logger';
import EmailTracking from '../models/EmailTracking';
import { trackEmailSent } from '../utils/metrics';
import { randomBytes } from 'crypto';

// Email configuration from environment
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net';

// Email addresses
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thhiya.com';
const FROM_EMAIL = process.env.FROM_EMAIL || `Thhiya <noreply@${MAILGUN_DOMAIN}>`;
const FROM_NAME = process.env.FROM_NAME || 'Thhiya';

// Feature flag - set to true to enable email sending
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

// Base URL for tracking (should be your API server URL)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const formatAnswerValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value.trim() || '—';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const isPlainObject = (value: any): value is Record<string, any> => {
    return Object.prototype.toString.call(value) === '[object Object]';
};

const formatAnswerLabel = (value: string): string => {
    const cleaned = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) return '—';
    return cleaned.replace(/\b([a-z])/g, (match) => match.toUpperCase());
};

const renderAnswerValueHtml = (value: any): string => {
    if (value === null || value === undefined) {
        return '<span style="color: #1e293b; font-size: 12px;">—</span>';
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '<span style="color: #1e293b; font-size: 12px;">—</span>';
        }

        return `<div style="display: flex; flex-wrap: wrap; gap: 6px;">${value
            .map(item => `<span style="display: inline-block; padding: 4px 8px; border-radius: 999px; background: #eef4ff; border: 1px solid #d5e3ff; color: #1e293b; font-size: 11px; line-height: 1.3;">${escapeHtml(formatAnswerValue(item))}</span>`)
            .join('')}</div>`;
    }

    if (isPlainObject(value)) {
        const nestedEntries = Object.entries(value);
        if (nestedEntries.length === 0) {
            return '<span style="color: #1e293b; font-size: 12px;">—</span>';
        }

        return `<div style="display: grid; gap: 6px;">${nestedEntries.map(([nestedKey, nestedValue]) => `
            <div style="padding: 8px 10px; background: #ffffff; border: 1px solid #e1eaf5; border-radius: 6px;">
                <span style="display: block; margin-bottom: 2px; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700;">${escapeHtml(formatAnswerLabel(nestedKey))}</span>
                <span style="color: #1e293b; font-size: 12px; line-height: 1.5;">${escapeHtml(formatAnswerValue(nestedValue))}</span>
            </div>
        `).join('')}</div>`;
    }

    return `<span style="color: #1e293b; font-size: 12px; line-height: 1.5;">${escapeHtml(formatAnswerValue(value))}</span>`;
};

const renderAnswerRowsHtml = (fields: Record<string, any>): string => {
    const rows = Object.entries(fields);

    if (rows.length === 0) {
        return '<tr><td colspan="2" style="padding: 10px 12px; color: #64748b; font-size: 12px;">No answers provided.</td></tr>';
    }

    return rows
        .map(([fieldKey, fieldValue]) => `
            <tr>
                <td style="padding: 10px 12px; vertical-align: top; width: 38%; background: #f8fbff; border-bottom: 1px solid #e1eaf5; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.35px;">${escapeHtml(formatAnswerLabel(fieldKey))}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e1eaf5;">${renderAnswerValueHtml(fieldValue)}</td>
            </tr>
        `)
        .join('');
};

const renderQuestionnaireAnswersHtml = (answers: Record<string, any>): string => {
    if (!answers || Object.keys(answers).length === 0) {
        return '<p style="margin: 0; color: #64748b; font-size: 13px;">No questionnaire answers were provided.</p>';
    }

    return Object.entries(answers)
        .map(([groupKey, groupValue], groupIndex) => {
            if (!isPlainObject(groupValue)) {
                return `
                    <div style="margin-bottom: 14px; padding: 14px; background: #f8fbff; border: 1px solid #e1eaf5; border-radius: 10px;">
                        <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">${escapeHtml(formatAnswerLabel(groupKey))}</p>
                        ${renderAnswerValueHtml(groupValue)}
                    </div>
                `;
            }

            const sections = Object.entries(groupValue);
            const sectionCards = sections
                .map(([sectionKey, sectionValue]) => {
                    if (isPlainObject(sectionValue)) {
                        return `
                            <div style="margin-top: 10px; border: 1px solid #e1eaf5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                <div style="padding: 10px 12px; background: #f8fbff; border-bottom: 1px solid #e1eaf5; color: #0f1e3d; font-size: 12px; font-weight: 600;">${escapeHtml(formatAnswerLabel(sectionKey))}</div>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                    <tbody>
                                        ${renderAnswerRowsHtml(sectionValue)}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }

                    return `
                        <div style="margin-top: 10px; border: 1px solid #e1eaf5; border-radius: 10px; padding: 12px; background: #ffffff;">
                            <p style="margin: 0 0 6px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">${escapeHtml(formatAnswerLabel(sectionKey))}</p>
                            ${renderAnswerValueHtml(sectionValue)}
                        </div>
                    `;
                })
                .join('');

            return `
                <div style="margin-bottom: 14px; padding: 14px; background: #f8fbff; border: 1px solid #e1eaf5; border-radius: 10px;">
                    <p style="margin: 0; color: #0f1e3d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700;">${escapeHtml(formatAnswerLabel(groupKey)) || `Group ${groupIndex + 1}`}</p>
                    ${sectionCards || '<p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">No section answers provided.</p>'}
                </div>
            `;
        })
        .join('');
};

const formatAnswersForText = (answers: Record<string, any>): string => {
    if (!answers || Object.keys(answers).length === 0) {
        return 'none';
    }

    const lines: string[] = [];

    Object.entries(answers).forEach(([groupKey, groupValue]) => {
        lines.push(`${formatAnswerLabel(groupKey)}:`);

        if (!isPlainObject(groupValue)) {
            lines.push(`  - ${formatAnswerValue(groupValue)}`);
            return;
        }

        Object.entries(groupValue).forEach(([sectionKey, sectionValue]) => {
            lines.push(`  ${formatAnswerLabel(sectionKey)}:`);

            if (!isPlainObject(sectionValue)) {
                lines.push(`    - ${formatAnswerValue(sectionValue)}`);
                return;
            }

            Object.entries(sectionValue).forEach(([fieldKey, fieldValue]) => {
                lines.push(`    - ${formatAnswerLabel(fieldKey)}: ${formatAnswerValue(fieldValue)}`);
            });
        });
    });

    return lines.join('\n');
};

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    trackingId?: string;
    type?: 'user_acknowledgement' | 'admin_notification';
    bantSubmissionId?: string;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    trackingId?: string;
    error?: string;
}

/**
 * Generate a unique tracking ID
 */
const generateTrackingId = (): string => {
    return randomBytes(16).toString('hex');
};

/**
 * Add tracking pixel to HTML email
 */
const addTrackingPixel = (html: string, trackingId: string): string => {
    const trackingPixelUrl = `${API_BASE_URL}/api/email/track/open/${trackingId}`;
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;border:0;width:1px;height:1px;" />`;

    // Insert before closing body tag or at end
    if (html.includes('</body>')) {
        return html.replace('</body>', `${trackingPixel}</body>`);
    }
    return html + trackingPixel;
};

/**
 * Wrap links in HTML for click tracking
 */
const addLinkTracking = (html: string, trackingId: string): string => {
    // Match all href attributes with http/https URLs
    const linkRegex = /href="(https?:\/\/[^"]+)"/g;

    return html.replace(linkRegex, (match, url) => {
        // Don't track unsubscribe or tracking pixel links
        if (url.includes('/track/') || url.includes('unsubscribe')) {
            return match;
        }
        const encodedUrl = encodeURIComponent(url);
        const trackingUrl = `${API_BASE_URL}/api/email/track/click/${trackingId}?url=${encodedUrl}`;
        return `href="${trackingUrl}"`;
    });
};

/**
 * Mailgun Email Service with Tracking
 */
class EmailService {
    private isConfigured: boolean;

    constructor() {
        this.isConfigured = !!(MAILGUN_API_KEY && MAILGUN_DOMAIN);

        if (!this.isConfigured) {
            logger.warn('Email service not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.', {
                hasApiKey: !!MAILGUN_API_KEY,
                hasDomain: !!MAILGUN_DOMAIN,
            });
        } else {
            logger.info('Email service initialized', {
                domain: MAILGUN_DOMAIN,
                enabled: EMAIL_ENABLED,
            });
        }
    }

    /**
     * Check if email service is properly configured and enabled
     */
    isEnabled(): boolean {
        return EMAIL_ENABLED && this.isConfigured;
    }

    /**
     * Send an email using Mailgun API with tracking
     */
    async sendEmail(options: EmailOptions): Promise<EmailResult> {
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        const trackingId = options.trackingId || generateTrackingId();

        // If not enabled, log and skip
        if (!EMAIL_ENABLED) {
            logger.email.disabled(options.to, options.subject);
            return { success: true, messageId: 'disabled', trackingId };
        }

        // Check configuration
        if (!this.isConfigured) {
            logger.error('Email service not configured. Missing MAILGUN_API_KEY or MAILGUN_DOMAIN.', undefined, {
                service: 'email',
            });
            return {
                success: false,
                error: 'Email service not configured'
            };
        }

        // Log sending attempt
        logger.email.sending(options.to, options.subject);

        const startTime = Date.now();
        try {
            // Add tracking to HTML
            let trackedHtml = addTrackingPixel(options.html, trackingId);
            trackedHtml = addLinkTracking(trackedHtml, trackingId);

            // Build form data for Mailgun API
            const formData = new FormData();
            formData.append('from', FROM_EMAIL);
            formData.append('to', recipients);
            formData.append('subject', options.subject);
            formData.append('html', trackedHtml);

            if (options.text) {
                formData.append('text', options.text);
            }

            // Enable Mailgun tracking features
            formData.append('o:tracking', 'yes');
            formData.append('o:tracking-clicks', 'yes');
            formData.append('o:tracking-opens', 'yes');

            // Mailgun API endpoint
            const url = `${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`;

            // Make API request with Basic Auth
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.email.failed(options.to, options.subject, new Error(`Mailgun API error ${response.status}: ${errorText}`));

                const durationMs = Date.now() - startTime;

                // Save failed tracking record
                if (options.type) {
                    await this.saveTrackingRecord({
                        trackingId,
                        messageId: '',
                        type: options.type,
                        recipient: recipients,
                        subject: options.subject,
                        bantSubmissionId: options.bantSubmissionId,
                        status: 'failed',
                        failureReason: `Mailgun API error: ${response.status}`,
                    });

                    // Track metrics
                    trackEmailSent(options.type, false, durationMs);
                }

                return {
                    success: false,
                    error: `Mailgun API error: ${response.status}`,
                    trackingId,
                };
            }

            const result = await response.json() as { id?: string };
            logger.email.sent(options.to, options.subject, result.id);
            const durationMs = Date.now() - startTime;

            // Save tracking record
            if (options.type) {
                await this.saveTrackingRecord({
                    trackingId,
                    messageId: result.id || '',
                    type: options.type,
                    recipient: recipients,
                    subject: options.subject,
                    bantSubmissionId: options.bantSubmissionId,
                    status: 'sent',
                });

                // Track metrics
                trackEmailSent(options.type, true, durationMs);
            }

            return {
                success: true,
                messageId: result.id,
                trackingId,
            };
        } catch (error) {
            logger.email.failed(options.to, options.subject, error instanceof Error ? error : new Error(String(error)));
            const durationMs = Date.now() - startTime;

            // Save failed tracking record
            if (options.type) {
                await this.saveTrackingRecord({
                    trackingId,
                    messageId: '',
                    type: options.type,
                    recipient: recipients,
                    subject: options.subject,
                    bantSubmissionId: options.bantSubmissionId,
                    status: 'failed',
                    failureReason: error instanceof Error ? error.message : 'Unknown error',
                });

                // Track metrics
                trackEmailSent(options.type, false, durationMs);
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                trackingId,
            };
        }
    }

    /**
     * Save email tracking record to database
     */
    private async saveTrackingRecord(data: {
        trackingId: string;
        messageId: string;
        type: 'user_acknowledgement' | 'admin_notification';
        recipient: string;
        subject: string;
        bantSubmissionId?: string;
        status: 'sent' | 'failed';
        failureReason?: string;
    }): Promise<void> {
        try {
            const tracking = new EmailTracking({
                trackingId: data.trackingId,
                messageId: data.messageId,
                type: data.type,
                recipient: data.recipient,
                subject: data.subject,
                bantSubmissionId: data.bantSubmissionId,
                status: data.status,
                sentAt: new Date(),
                failedAt: data.status === 'failed' ? new Date() : undefined,
                failureReason: data.failureReason,
            });
            await tracking.save();
        } catch (error) {
            logger.error('Failed to save email tracking record', error);
        }
    }

    /**
     * Record email open event
     */
    async recordOpen(trackingId: string, metadata?: { ipAddress?: string; userAgent?: string }): Promise<boolean> {
        try {
            const tracking = await EmailTracking.findOne({ trackingId });
            if (!tracking) return false;

            const updateData: any = {
                $inc: { openCount: 1 },
            };

            // Only set openedAt and status on first open
            if (!tracking.openedAt) {
                updateData.$set = {
                    openedAt: new Date(),
                    status: 'opened',
                    ...metadata,
                };
            }

            await EmailTracking.updateOne({ trackingId }, updateData);
            return true;
        } catch (error) {
            logger.error('Failed to record email open', error);
            return false;
        }
    }

    /**
     * Record email click event
     */
    async recordClick(trackingId: string, url: string, metadata?: { ipAddress?: string; userAgent?: string }): Promise<boolean> {
        try {
            const tracking = await EmailTracking.findOne({ trackingId });
            if (!tracking) return false;

            const updateData: any = {
                $inc: { clickCount: 1 },
                $push: { clickedLinks: { url, clickedAt: new Date() } },
            };

            // Only set clickedAt and status on first click
            if (!tracking.clickedAt) {
                updateData.$set = {
                    clickedAt: new Date(),
                    status: 'clicked',
                    ...metadata,
                };
            }

            await EmailTracking.updateOne({ trackingId }, updateData);
            return true;
        } catch (error) {
            logger.error('Failed to record email click', error);
            return false;
        }
    }

    /**
     * Get email tracking statistics
     */
    async getTrackingStats(): Promise<{
        total: number;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        failed: number;
        openRate: number;
        clickRate: number;
    }> {
        try {
            const [total, statusCounts] = await Promise.all([
                EmailTracking.countDocuments(),
                EmailTracking.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } },
                ]),
            ]);

            const counts = statusCounts.reduce((acc, { _id, count }) => {
                acc[_id] = count;
                return acc;
            }, {} as Record<string, number>);

            const delivered = (counts.delivered || 0) + (counts.opened || 0) + (counts.clicked || 0);
            const opened = (counts.opened || 0) + (counts.clicked || 0);
            const clicked = counts.clicked || 0;

            return {
                total,
                sent: counts.sent || 0,
                delivered,
                opened,
                clicked,
                bounced: counts.bounced || 0,
                failed: counts.failed || 0,
                openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
                clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
            };
        } catch (error) {
            logger.error('Failed to get email tracking stats', error);
            return {
                total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0,
                openRate: 0, clickRate: 0,
            };
        }
    }

    /**
     * Get tracking records for a BANT/MEDDIC/INTENT(BMI) submission
     */
    async getTrackingForSubmission(bantSubmissionId: string): Promise<any[]> {
        try {
            return await EmailTracking.find({ bantSubmissionId })
                .sort({ sentAt: -1 })
                .lean();
        } catch (error) {
            logger.error('Failed to get tracking for submission', error);
            return [];
        }
    }

    /**
     * Send acknowledgement email to form submitter
     */
    async sendUserAcknowledgement(data: {
        fullName: string;
        businessEmail: string;
        companyName: string;
        servicesLookingFor: string[];
        targetCountryOrRegion: string;
        submissionId?: string;
    }): Promise<EmailResult> {
        const { fullName, businessEmail, companyName, servicesLookingFor, targetCountryOrRegion, submissionId } = data;

        const servicesList = servicesLookingFor
            .map(service => `<li style="margin-bottom: 8px; color: #374151;">${service}</li>`)
            .join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 48px 24px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 32px 40px; border-radius: 8px 8px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                                            Thhiya
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
                                Thank you for your inquiry, ${fullName}
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
                                We have received your submission and our team is reviewing your requirements. We appreciate your interest in partnering with Thhiya to support ${companyName}'s global expansion.
                            </p>

                            <!-- Request Summary -->
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 16px; color: #1e3a5f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Your Request Summary
                                </h3>
                                
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 500;">
                                    Services Requested:
                                </p>
                                <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 14px;">
                                    ${servicesList}
                                </ul>
                                
                                <p style="margin: 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                                    Target Region: <span style="color: #111827; font-weight: 400;">${targetCountryOrRegion}</span>
                                </p>
                            </div>

                            <!-- Next Steps -->
                            <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                                What to expect next
                            </h3>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="width: 32px; vertical-align: top;">
                                                    <div style="width: 24px; height: 24px; background-color: #1e3a5f; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-weight: 600; font-size: 12px;">1</div>
                                                </td>
                                                <td style="color: #374151; font-size: 14px; padding-left: 12px;">
                                                    <strong style="color: #111827;">Review</strong> — Our team will analyze your requirements within 24-48 business hours.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="width: 32px; vertical-align: top;">
                                                    <div style="width: 24px; height: 24px; background-color: #1e3a5f; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-weight: 600; font-size: 12px;">2</div>
                                                </td>
                                                <td style="color: #374151; font-size: 14px; padding-left: 12px;">
                                                    <strong style="color: #111827;">Match</strong> — We will curate a shortlist of verified service providers aligned with your needs.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="width: 32px; vertical-align: top;">
                                                    <div style="width: 24px; height: 24px; background-color: #1e3a5f; border-radius: 50%; color: #ffffff; text-align: center; line-height: 24px; font-weight: 600; font-size: 12px;">3</div>
                                                </td>
                                                <td style="color: #374151; font-size: 14px; padding-left: 12px;">
                                                    <strong style="color: #111827;">Connect</strong> — We will reach out with recommendations based on your stated preferences.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #4b5563; font-size: 14px;">
                                contact to support or contact@thhiya.com email
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px; color: #1e3a5f; font-size: 14px; font-weight: 600;">
                                            ${FROM_NAME}
                                        </p>
                                        <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px;">
                                            Global Expansion Solutions
                                        </p>
                                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                            &copy; ${new Date().getFullYear()} Thhiya. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `
Thank you for your inquiry, ${fullName}

We have received your submission and our team is reviewing your requirements. We appreciate your interest in partnering with Thhiya to support ${companyName}'s global expansion.

YOUR REQUEST SUMMARY
--------------------
Services Requested:
${servicesLookingFor.map(s => `- ${s}`).join('\n')}

Target Region: ${targetCountryOrRegion}

WHAT TO EXPECT NEXT
-------------------
1. Review — Our team will analyze your requirements within 24-48 business hours.
2. Match — We will curate a shortlist of verified service providers aligned with your needs.
3. Connect — We will reach out with recommendations based on your stated preferences.

contact to support or contact@thhiya.com email

Best regards,
${FROM_NAME}
Global Expansion Solutions

(c) ${new Date().getFullYear()} Thhiya. All rights reserved.
        `.trim();

        return this.sendEmail({
            to: businessEmail,
            subject: `Thank you for your inquiry — ${companyName}`,
            html,
            text,
            type: 'user_acknowledgement',
            bantSubmissionId: submissionId,
        });
    }

    /**
     * Send notification email to admin about new listing request
     */
    async sendListingRequestAdminNotification(data: {
        companyName: string;
        website: string;
        contactName: string;
        contactRole: string;
        contactPhone: string;
        email: string;
        serviceMatrix: { countries: string[]; services: string[] }[];
        answers: Record<string, any>;
        selectedPlan?: string | null;
        submittedAt: Date;
    }): Promise<EmailResult> {
        const {
            companyName,
            website,
            contactName,
            contactRole,
            contactPhone,
            email,
            serviceMatrix,
            answers,
            selectedPlan,
            submittedAt,
        } = data;

        const formattedDate = submittedAt.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });

        const matrixHtml = (serviceMatrix && serviceMatrix.length > 0)
            ? serviceMatrix.map((item, index) => {
                const countries = (item.countries || []).length ? item.countries.join(', ') : '—';
                const services = (item.services || []).length ? item.services.join(', ') : '—';
                return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e1eaf5; color: #1e293b; font-size: 13px;">Region ${index + 1}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e1eaf5; color: #1e293b; font-size: 13px;">${escapeHtml(countries)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e1eaf5; color: #1e293b; font-size: 13px;">${escapeHtml(services)}</td>
                </tr>`;
            }).join('')
            : `<tr><td colspan="3" style="padding: 14px; color: #64748b; font-size: 13px;">No service matrix provided.</td></tr>`;

        const answersHtml = renderQuestionnaireAnswersHtml(answers || {});

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thhiya Vendor Submission</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f8ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 12px; background: #f5f8ff;">
        <tr>
            <td align="center">
                <table role="presentation" width="760" cellspacing="0" cellpadding="0" style="max-width: 760px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 30, 61, 0.08); border: 1px solid #dbe4f0;">
                    <tr>
                        <td style="padding: 24px 28px; background: linear-gradient(135deg, #0f1e3d 0%, #1e3a5f 100%);">
                            <p style="margin: 0 0 6px; color: rgba(255,255,255,0.86); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px;">Admin Intake Notification</p>
                            <h1 style="margin: 0; color: #fff; font-size: 24px; line-height: 1.3; font-weight: 700;">New Vendor Submission Received</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 16px 28px; background: #f8fbff; border-bottom: 1px solid #e1eaf5;">
                            <p style="margin: 0; color: #475569; font-size: 12px;">
                                Submitted: <strong>${escapeHtml(formattedDate)}</strong>
                                &nbsp;|&nbsp;
                                Selected Plan: <strong>${escapeHtml(selectedPlan || 'Free Listing')}</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 22px 28px 8px;">
                            <h2 style="margin: 0 0 14px; color: #0f1e3d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px;">Company & Contact</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e1eaf5; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 12px 14px; background: #f8fbff; color: #64748b; font-size: 12px; width: 30%;">Company Name</td>
                                    <td style="padding: 12px 14px; color: #1e293b; font-size: 13px;">${escapeHtml(companyName)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 14px; background: #f8fbff; color: #64748b; font-size: 12px;">Website</td>
                                    <td style="padding: 12px 14px; font-size: 13px;"><a href="${escapeHtml(website)}" target="_blank" style="color: #dc2626; text-decoration: none;">${escapeHtml(website)}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 14px; background: #f8fbff; color: #64748b; font-size: 12px;">Contact Person</td>
                                    <td style="padding: 12px 14px; color: #1e293b; font-size: 13px;">${escapeHtml(contactName)} (${escapeHtml(contactRole)})</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 14px; background: #f8fbff; color: #64748b; font-size: 12px;">Email</td>
                                    <td style="padding: 12px 14px; font-size: 13px;"><a href="mailto:${escapeHtml(email)}" style="color: #dc2626; text-decoration: none;">${escapeHtml(email)}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 14px; background: #f8fbff; color: #64748b; font-size: 12px;">Phone</td>
                                    <td style="padding: 12px 14px; color: #1e293b; font-size: 13px;">${escapeHtml(contactPhone || '—')}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 16px 28px 8px;">
                            <h2 style="margin: 0 0 14px; color: #0f1e3d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px;">Service Matrix</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e1eaf5; border-radius: 10px; overflow: hidden;">
                                <thead>
                                    <tr style="background: #f8fbff;">
                                        <th align="left" style="padding: 11px 12px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e1eaf5;">Region</th>
                                        <th align="left" style="padding: 11px 12px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e1eaf5;">Countries</th>
                                        <th align="left" style="padding: 11px 12px; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e1eaf5;">Services</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${matrixHtml}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 16px 28px 28px;">
                            <h2 style="margin: 0 0 14px; color: #0f1e3d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px;">Questionnaire Answers</h2>
                            ${answersHtml}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `
New Vendor Submission Received

Submitted: ${formattedDate}
Selected Plan: ${selectedPlan || 'Free Listing'}

Company: ${companyName}
Website: ${website}
Contact: ${contactName} (${contactRole})
Email: ${email}
Phone: ${contactPhone || '-'}

Service Matrix:
${(serviceMatrix || []).length
                ? serviceMatrix.map((m, idx) => `  ${idx + 1}. Countries: ${(m.countries || []).join(', ') || '-'} | Services: ${(m.services || []).join(', ') || '-'}`).join('\n')
                : '  - none -'}

Answers:
${formatAnswersForText(answers || {})}
        `.trim();

        return this.sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Listing Request: ${companyName}`,
            html,
            text,
            type: 'admin_notification',
        });
    }

    /**
     * Send notification email to admin about new form submission
     */
    async sendAdminNotification(data: {
        fullName: string;
        businessEmail: string;
        companyName: string;
        jobTitle?: string;
        hqLocation?: string;
        websiteUrl?: string;
        servicesLookingFor: string[];
        targetCountryOrRegion: string;
        budget?: string;
        decisionMakingRole?: string;
        timeframe: string;
        projectHighlights: string[];
        vendorConnectionPreference: string;
        communicationMode: string[];
        additionalDetails?: string;
        submissionId: string;
        submittedAt: Date;
    }): Promise<EmailResult> {
        const {
            fullName,
            businessEmail,
            companyName,
            jobTitle,
            hqLocation,
            websiteUrl,
            servicesLookingFor,
            targetCountryOrRegion,
            budget,
            decisionMakingRole,
            timeframe,
            projectHighlights,
            vendorConnectionPreference,
            communicationMode,
            additionalDetails,
            submissionId,
            submittedAt,
        } = data;

        const servicesList = servicesLookingFor
            .map(service => `< li style = "margin-bottom: 4px; color: #374151;" > ${service} </li>`)
            .join('');

        const highlightsList = projectHighlights
            .map(highlight => `<li style="margin-bottom: 4px; color: #374151;">${highlight}</li>`)
            .join('');

        const commModesList = communicationMode
            .map(mode => `<span style="display: inline-block; background-color: #e5e7eb; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-right: 6px; color: #374151;">${mode}</span>`)
            .join('');

        // Determine priority based on timeframe and budget
        let priority = 'Standard';
        let priorityColor = '#6b7280';
        let priorityBg = '#f3f4f6';

        if (timeframe === 'Immediately (within 30 days)' || budget === '$100,000+') {
            priority = 'High';
            priorityColor = '#dc2626';
            priorityBg = '#fef2f2';
        } else if (timeframe === '1–3 months' || budget === '$50,000–$100,000') {
            priority = 'Medium';
            priorityColor = '#d97706';
            priorityBg = '#fffbeb';
        }

        const formattedDate = submittedAt.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 4px; color: rgba(255, 255, 255, 0.7); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            New Lead Submission
                                        </p>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                            ${companyName}
                                        </h1>
                                    </td>
                                    <td align="right">
                                        <span style="display: inline-block; background-color: ${priorityBg}; color: ${priorityColor}; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                            ${priority} Priority
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Submission Info Bar -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 12px 32px; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                Submitted: ${formattedDate} | ID: <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${submissionId}</code>
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px;">
                            <!-- Contact Information -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Contact Information
                                </h2>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${fullName}</p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Company</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${companyName}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                            <p style="margin: 0;"><a href="mailto:${businessEmail}" style="color: #2563eb; text-decoration: none; font-size: 14px;">${businessEmail}</a></p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Job Title</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px;">${jobTitle || '—'}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">HQ Location</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px;">${hqLocation || '—'}</p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Website</p>
                                            <p style="margin: 0;">${websiteUrl ? `<a href="${websiteUrl}" style="color: #2563eb; text-decoration: none; font-size: 14px;" target="_blank">${websiteUrl}</a>` : '—'}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Business Requirements -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Business Requirements
                                </h2>
                                
                                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
                                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Services Requested</p>
                                    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
                                        ${servicesList}
                                    </ul>
                                </div>

                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Target Region</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${targetCountryOrRegion}</p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Challenges to Address</p>
                                            <ul style="margin: 4px 0 0; padding-left: 18px; font-size: 13px; color: #374151;">
                                                ${highlightsList}
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- BANT/MEDDIC/INTENT(BMI) Qualification -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Qualification Criteria
                                </h2>
                                
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="25%" style="padding: 8px; background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 4px 0 0 4px;">
                                            <p style="margin: 0 0 4px; color: #92400e; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Budget</p>
                                            <p style="margin: 0; color: #78350f; font-size: 13px; font-weight: 500;">${budget || '—'}</p>
                                        </td>
                                        <td width="25%" style="padding: 8px; background-color: #eff6ff; border: 1px solid #93c5fd; border-left: none;">
                                            <p style="margin: 0 0 4px; color: #1e40af; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Authority</p>
                                            <p style="margin: 0; color: #1e3a8a; font-size: 13px; font-weight: 500;">${decisionMakingRole || '—'}</p>
                                        </td>
                                        <td width="25%" style="padding: 8px; background-color: #f0fdf4; border: 1px solid #86efac; border-left: none;">
                                            <p style="margin: 0 0 4px; color: #166534; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Need</p>
                                            <p style="margin: 0; color: #14532d; font-size: 13px; font-weight: 500;">${projectHighlights.length} items</p>
                                        </td>
                                        <td width="25%" style="padding: 8px; background-color: #fdf4ff; border: 1px solid #e879f9; border-left: none; border-radius: 0 4px 4px 0;">
                                            <p style="margin: 0 0 4px; color: #86198f; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Timeline</p>
                                            <p style="margin: 0; color: #701a75; font-size: 13px; font-weight: 500;">${timeframe}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Preferences -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Contact Preferences
                                </h2>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Vendor Connection</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px;">${vendorConnectionPreference}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Preferred Communication</p>
                                            <div>${commModesList}</div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            ${additionalDetails ? `
                            <!-- Additional Details -->
                            <div style="margin-bottom: 16px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Additional Notes
                                </h2>
                                <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${additionalDetails}</p>
                                </div>
                            </div>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 20px 32px; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 12px; text-align: center;">
                                This is an automated notification from Thhiya Lead Management System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `
NEW LEAD SUBMISSION
==================
${formattedDate}
Priority: ${priority}

CONTACT INFORMATION
-------------------
Name: ${fullName}
Company: ${companyName}
Email: ${businessEmail}
Job Title: ${jobTitle || '—'}
HQ Location: ${hqLocation || '—'}
Website: ${websiteUrl || '—'}

BUSINESS REQUIREMENTS
---------------------
Services Requested:
${servicesLookingFor.map(s => `- ${s}`).join('\n')}

Target Region: ${targetCountryOrRegion}

Challenges to Address:
${projectHighlights.map(h => `- ${h}`).join('\n')}

QUALIFICATION CRITERIA
----------------------
Budget: ${budget || '—'}
Authority: ${decisionMakingRole || '—'}
Need: ${projectHighlights.length} items
Timeline: ${timeframe}

CONTACT PREFERENCES
-------------------
Vendor Connection: ${vendorConnectionPreference}
Communication: ${communicationMode.join(', ')}

${additionalDetails ? `ADDITIONAL NOTES\n----------------\n${additionalDetails}\n` : ''}
---
Submission ID: ${submissionId}
        `.trim();

        return this.sendEmail({
            to: ADMIN_EMAIL,
            subject: `[${priority}] New Lead: ${companyName} — ${fullName}`,
            html,
            text,
            type: 'admin_notification',
            bantSubmissionId: submissionId,
        });
    }

    /**
     * Send acknowledgement email to contact form submitter
     */
    async sendContactAcknowledgement(data: {
        fullName: string;
        businessEmail: string;
        companyName: string;
        subject: string;
        submissionId?: string;
    }): Promise<EmailResult> {
        const { fullName, businessEmail, companyName, subject, submissionId } = data;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 48px 24px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 32px 40px; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                                Thhiya
                            </h1>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
                                Thank you for reaching out, ${fullName}
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px;">
                                We have received your message regarding "${subject}" and our team will get back to you shortly.
                            </p>

                            <!-- Request Summary -->
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 24px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 12px; color: #1e3a5f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Your Inquiry
                                </h3>
                                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                                    <strong>Company:</strong> ${companyName}
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                    <strong>Subject:</strong> ${subject}
                                </p>
                            </div>

                            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">
                                Our team typically responds within 24-48 business hours. In the meantime, feel free to explore our services at <a href="https://thhiya.com" style="color: #2563eb; text-decoration: none;">thhiya.com</a>.
                            </p>

                            <p style="margin: 0; color: #4b5563; font-size: 14px;">
                                If you have any urgent questions, you can reach us at <a href="mailto:contact@thhiya.com" style="color: #2563eb; text-decoration: none;">contact@thhiya.com</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; color: #1e3a5f; font-size: 14px; font-weight: 600;">
                                ${FROM_NAME}
                            </p>
                            <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px;">
                                Global Expansion Solutions
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                &copy; ${new Date().getFullYear()} Thhiya. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `
Thank you for reaching out, ${fullName}

We have received your message regarding "${subject}" and our team will get back to you shortly.

YOUR INQUIRY
------------
Company: ${companyName}
Subject: ${subject}

Our team typically responds within 24-48 business hours. In the meantime, feel free to explore our services at thhiya.com.

If you have any urgent questions, you can reach us at contact@thhiya.com.

Best regards,
${FROM_NAME}
Global Expansion Solutions

(c) ${new Date().getFullYear()} Thhiya. All rights reserved.
        `.trim();

        return this.sendEmail({
            to: businessEmail,
            subject: `Thank you for contacting us — ${companyName}`,
            html,
            text,
            type: 'contact_acknowledgement' as any,
            bantSubmissionId: submissionId,
        });
    }

    /**
     * Send notification email to admin about new contact form submission
     */
    async sendContactNotification(data: {
        fullName: string;
        businessEmail: string;
        companyName: string;
        jobTitle?: string;
        phone?: string;
        subject: string;
        message: string;
        submissionId: string;
        submittedAt: Date;
    }): Promise<EmailResult> {
        const {
            fullName,
            businessEmail,
            companyName,
            jobTitle,
            phone,
            subject,
            message,
            submissionId,
            submittedAt,
        } = data;

        const formattedDate = submittedAt.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1e3a5f; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                            <p style="margin: 0 0 4px; color: rgba(255, 255, 255, 0.7); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                New Contact Submission
                            </p>
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                ${subject}
                            </h1>
                        </td>
                    </tr>

                    <!-- Submission Info Bar -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 12px 32px; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                Submitted: ${formattedDate} | ID: <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${submissionId}</code>
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px;">
                            <!-- Contact Information -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Contact Information
                                </h2>
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${fullName}</p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Company</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${companyName}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                                            <p style="margin: 0;"><a href="mailto:${businessEmail}" style="color: #2563eb; text-decoration: none; font-size: 14px;">${businessEmail}</a></p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Job Title</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px;">${jobTitle || '—'}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px;">${phone || '—'}</p>
                                        </td>
                                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                                            <p style="margin: 0 0 2px; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                                            <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">${subject}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Message -->
                            <div style="margin-bottom: 28px;">
                                <h2 style="margin: 0 0 16px; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">
                                    Message
                                </h2>
                                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
                                    <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap;">${message}</p>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 16px 32px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                This is an automated notification from Thhiya Contact Form
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `
NEW CONTACT FORM SUBMISSION
===========================

Subject: ${subject}
Submitted: ${formattedDate}
ID: ${submissionId}

CONTACT INFORMATION
-------------------
Name: ${fullName}
Company: ${companyName}
Email: ${businessEmail}
Job Title: ${jobTitle || '—'}
Phone: ${phone || '—'}

MESSAGE
-------
${message}

---
Submission ID: ${submissionId}
        `.trim();

        return this.sendEmail({
            to: ADMIN_EMAIL,
            subject: `[Contact] ${subject} — ${companyName}`,
            html,
            text,
            type: 'contact_notification' as any,
            bantSubmissionId: submissionId,
        });
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
