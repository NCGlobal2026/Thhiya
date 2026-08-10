import { Context } from 'hono';
import ContactSubmission, { SUBJECT_OPTIONS } from '../models/ContactSubmission';
import { logger } from '../utils/logger';
import { emailService } from '../services/emailService';
import { trackFormSubmission, formValidationErrors } from '../utils/metrics';

class ContactController {
    /**
     * Get form options/metadata for the contact form
     */
    async getFormOptions(c: Context) {
        try {
            return c.json({
                success: true,
                data: {
                    subjectOptions: SUBJECT_OPTIONS,
                },
            });
        } catch (error) {
            logger.error('Failed to fetch contact form options', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch form options',
                },
                500
            );
        }
    }

    /**
     * Submit a new contact form
     */
    async submit(c: Context) {
        const startTime = Date.now();
        const source = c.req.query('source') || 'unknown';

        try {
            const body = await c.req.json();

            // Extract metadata from request
            const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
            const userAgent = c.req.header('user-agent') || 'unknown';

            // Create submission with metadata
            const submissionData = {
                ...body,
                ipAddress,
                userAgent,
                status: 'new',
            };

            const submission = new ContactSubmission(submissionData);
            await submission.save();

            // Track metrics
            const duration = Date.now() - startTime;
            trackFormSubmission('contact', 'success', source, duration);

            // Send emails asynchronously (don't block the response)
            this.sendNotificationEmails(submission).catch((error) => {
                logger.error('Failed to send contact notification emails', error);
            });

            return c.json(
                {
                    success: true,
                    message: 'Thank you for reaching out! Our team will get back to you shortly.',
                    data: {
                        id: submission._id,
                        submittedAt: submission.createdAt,
                    },
                },
                201
            );
        } catch (error: any) {
            logger.error('Failed to submit contact form', error);
            const source = c.req.query('source') || 'unknown';

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err: any) => {
                    formValidationErrors.inc({ form_type: 'contact', field_name: err.path });
                    return {
                        field: err.path,
                        message: err.message,
                    };
                });

                trackFormSubmission('contact', 'validation_error', source);

                return c.json(
                    {
                        success: false,
                        error: 'Validation failed',
                        validationErrors,
                    },
                    400
                );
            }

            trackFormSubmission('contact', 'server_error', source);

            return c.json(
                {
                    success: false,
                    error: 'Failed to submit form. Please try again.',
                },
                500
            );
        }
    }

    /**
     * Send notification emails after form submission
     */
    private async sendNotificationEmails(submission: any): Promise<void> {
        const emailPromises: Promise<any>[] = [];

        // Send acknowledgement email to the form submitter
        emailPromises.push(
            emailService.sendContactAcknowledgement({
                fullName: submission.fullName,
                businessEmail: submission.businessEmail,
                companyName: submission.companyName,
                subject: submission.subject,
                submissionId: submission._id.toString(),
            })
        );

        // Send notification email to admin
        emailPromises.push(
            emailService.sendContactNotification({
                fullName: submission.fullName,
                businessEmail: submission.businessEmail,
                companyName: submission.companyName,
                jobTitle: submission.jobTitle,
                phone: submission.phone,
                subject: submission.subject,
                message: submission.message,
                submissionId: submission._id.toString(),
                submittedAt: submission.createdAt,
            })
        );

        // Wait for all emails to be sent
        const results = await Promise.allSettled(emailPromises);

        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error(`Contact email ${index === 0 ? 'user acknowledgement' : 'admin notification'} failed:`, result.reason);
            } else if (!result.value?.success) {
                logger.warn(`Contact email ${index === 0 ? 'user acknowledgement' : 'admin notification'} not sent:`, result.value?.error);
            }
        });
    }

    /**
     * Get all contact submissions (Admin only)
     */
    async list(c: Context) {
        try {
            const { status, page = '1', limit = '20', search } = c.req.query();

            const query: any = {};

            if (status && status !== 'all') {
                query.status = status;
            }

            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { companyName: { $regex: search, $options: 'i' } },
                    { businessEmail: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } },
                ];
            }

            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const skip = (pageNum - 1) * limitNum;

            const [submissions, total] = await Promise.all([
                ContactSubmission.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                ContactSubmission.countDocuments(query),
            ]);

            return c.json({
                success: true,
                data: submissions,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            logger.error('Failed to fetch contact submissions', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch submissions',
                },
                500
            );
        }
    }

    /**
     * Get a single contact submission by ID (Admin only)
     */
    async getById(c: Context) {
        try {
            const { id } = c.req.param();

            const submission = await ContactSubmission.findById(id).lean();

            if (!submission) {
                return c.json(
                    {
                        success: false,
                        error: 'Submission not found',
                    },
                    404
                );
            }

            return c.json({
                success: true,
                data: submission,
            });
        } catch (error) {
            logger.error('Failed to fetch contact submission', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch submission',
                },
                500
            );
        }
    }

    /**
     * Update a contact submission (Admin only)
     */
    async update(c: Context) {
        try {
            const { id } = c.req.param();
            const body = await c.req.json();

            // Only allow updating certain fields
            const allowedUpdates = ['status', 'notes'];
            const updates: any = {};

            for (const key of allowedUpdates) {
                if (body[key] !== undefined) {
                    updates[key] = body[key];
                }
            }

            const submission = await ContactSubmission.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            ).lean();

            if (!submission) {
                return c.json(
                    {
                        success: false,
                        error: 'Submission not found',
                    },
                    404
                );
            }

            return c.json({
                success: true,
                message: 'Submission updated successfully',
                data: submission,
            });
        } catch (error) {
            logger.error('Failed to update contact submission', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to update submission',
                },
                500
            );
        }
    }

    /**
     * Delete a contact submission (Admin only)
     */
    async delete(c: Context) {
        try {
            const { id } = c.req.param();

            const submission = await ContactSubmission.findByIdAndDelete(id);

            if (!submission) {
                return c.json(
                    {
                        success: false,
                        error: 'Submission not found',
                    },
                    404
                );
            }

            return c.json({
                success: true,
                message: 'Submission deleted successfully',
            });
        } catch (error) {
            logger.error('Failed to delete contact submission', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to delete submission',
                },
                500
            );
        }
    }
}

export default new ContactController();
