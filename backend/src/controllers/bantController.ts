import { Context } from 'hono';
import BANTSubmission, {
    SERVICE_OPTIONS,
    BUDGET_OPTIONS,
    DECISION_ROLE_OPTIONS,
    PROJECT_HIGHLIGHTS_OPTIONS,
    TIMEFRAME_OPTIONS,
    VENDOR_CONNECTION_OPTIONS,
    COMMUNICATION_MODE_OPTIONS,
} from '../models/BANTSubmission';
import { logger } from '../utils/logger';
import { emailService } from '../services/emailService';
import { trackFormSubmission, trackLeadGenerated, formValidationErrors } from '../utils/metrics';

class BANTController {
    /**
     * Get form options/metadata for the BANT/MEDDIC/INTENT(BMI) form
     */
    async getFormOptions(c: Context) {
        try {
            return c.json({
                success: true,
                data: {
                    serviceOptions: SERVICE_OPTIONS,
                    budgetOptions: BUDGET_OPTIONS,
                    decisionRoleOptions: DECISION_ROLE_OPTIONS,
                    projectHighlightsOptions: PROJECT_HIGHLIGHTS_OPTIONS,
                    timeframeOptions: TIMEFRAME_OPTIONS,
                    vendorConnectionOptions: VENDOR_CONNECTION_OPTIONS,
                    communicationModeOptions: COMMUNICATION_MODE_OPTIONS,
                },
            });
        } catch (error) {
            logger.error('Failed to fetch form options', error);
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
     * Submit a new BANT/MEDDIC/INTENT(BMI) form
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

            const submission = new BANTSubmission(submissionData);
            await submission.save();

            // Track metrics
            const duration = Date.now() - startTime;
            trackFormSubmission('bant', 'success', source, duration);
            trackLeadGenerated(
                source,
                submission.servicesLookingFor || [],
                submission.targetCountryOrRegion || 'unknown'
            );

            // Send emails asynchronously (don't block the response)
            this.sendNotificationEmails(submission).catch((error) => {
                logger.error('Failed to send notification emails', error);
            });

            return c.json(
                {
                    success: true,
                    message: 'Thank you for your submission! Our team will review your requirements and get back to you shortly.',
                    data: {
                        id: submission._id,
                        submittedAt: submission.createdAt,
                    },
                },
                201
            );
        } catch (error: any) {
            logger.error('Failed to submit BANT/MEDDIC/INTENT(BMI) form', error);
            const source = c.req.query('source') || 'unknown';

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err: any) => {
                    // Track each validation error
                    formValidationErrors.inc({ form_type: 'bant', field_name: err.path });
                    return {
                        field: err.path,
                        message: err.message,
                    };
                });

                trackFormSubmission('bant', 'validation_error', source);

                return c.json(
                    {
                        success: false,
                        error: 'Validation failed',
                        validationErrors,
                    },
                    400
                );
            }

            trackFormSubmission('bant', 'server_error', source);

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
     * Sends acknowledgement to user and notification to admin
     */
    private async sendNotificationEmails(submission: any): Promise<void> {
        const emailPromises: Promise<any>[] = [];
        const submissionId = submission._id.toString();

        // Send acknowledgement email to the form submitter
        emailPromises.push(
            emailService.sendUserAcknowledgement({
                fullName: submission.fullName,
                businessEmail: submission.businessEmail,
                companyName: submission.companyName,
                servicesLookingFor: submission.servicesLookingFor,
                targetCountryOrRegion: submission.targetCountryOrRegion,
                submissionId,
            })
        );

        // Send notification email to admin
        emailPromises.push(
            emailService.sendAdminNotification({
                fullName: submission.fullName,
                businessEmail: submission.businessEmail,
                companyName: submission.companyName,
                jobTitle: submission.jobTitle,
                hqLocation: submission.hqLocation,
                websiteUrl: submission.websiteUrl,
                servicesLookingFor: submission.servicesLookingFor,
                targetCountryOrRegion: submission.targetCountryOrRegion,
                budget: submission.budget,
                decisionMakingRole: submission.decisionMakingRole,
                timeframe: submission.timeframe,
                projectHighlights: submission.projectHighlights,
                vendorConnectionPreference: submission.vendorConnectionPreference,
                communicationMode: submission.communicationMode,
                additionalDetails: submission.additionalDetails,
                submissionId: submission._id.toString(),
                submittedAt: submission.createdAt,
            })
        );

        // Wait for all emails to be sent
        const results = await Promise.allSettled(emailPromises);

        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error(`Email ${index === 0 ? 'user acknowledgement' : 'admin notification'} failed:`, result.reason);
            } else if (!result.value.success) {
                logger.warn(`Email ${index === 0 ? 'user acknowledgement' : 'admin notification'} not sent:`, result.value.error);
            }
        });
    }

    /**
     * Get all BANT/MEDDIC/INTENT(BMI) submissions (Admin only)
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
                    { targetCountryOrRegion: { $regex: search, $options: 'i' } },
                ];
            }

            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const skip = (pageNum - 1) * limitNum;

            const [submissions, total] = await Promise.all([
                BANTSubmission.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                BANTSubmission.countDocuments(query),
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
            logger.error('Failed to fetch BANT/MEDDIC/INTENT(BMI) submissions', error);
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
     * Get a single BANT/MEDDIC/INTENT(BMI) submission by ID (Admin only)
     */
    async getById(c: Context) {
        try {
            const { id } = c.req.param();

            const submission = await BANTSubmission.findById(id).lean();

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
            logger.error('Failed to fetch BANT/MEDDIC/INTENT(BMI) submission', error);
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
     * Update a BANT/MEDDIC/INTENT(BMI) submission (Admin only)
     */
    async update(c: Context) {
        try {
            const { id } = c.req.param();
            const body = await c.req.json();

            // Only allow updating certain fields
            const allowedUpdates = ['status', 'notes', 'assignedTo', 'matchedVendors'];
            const updates: any = {};

            for (const key of allowedUpdates) {
                if (body[key] !== undefined) {
                    updates[key] = body[key];
                }
            }

            const submission = await BANTSubmission.findByIdAndUpdate(
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
            logger.error('Failed to update BANT/MEDDIC/INTENT(BMI) submission', error);
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
     * Get submission statistics (Admin only)
     */
    async getStats(c: Context) {
        try {
            const [
                totalSubmissions,
                newSubmissions,
                inProgressSubmissions,
                matchedSubmissions,
                closedSubmissions,
                recentSubmissions,
                serviceBreakdown,
                countryBreakdown,
            ] = await Promise.all([
                BANTSubmission.countDocuments(),
                BANTSubmission.countDocuments({ status: 'new' }),
                BANTSubmission.countDocuments({ status: 'in-progress' }),
                BANTSubmission.countDocuments({ status: 'matched' }),
                BANTSubmission.countDocuments({ status: 'closed' }),
                BANTSubmission.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('fullName companyName businessEmail createdAt status')
                    .lean(),
                BANTSubmission.aggregate([
                    { $unwind: '$servicesLookingFor' },
                    { $group: { _id: '$servicesLookingFor', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
                BANTSubmission.aggregate([
                    { $group: { _id: '$targetCountryOrRegion', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
            ]);

            return c.json({
                success: true,
                data: {
                    total: totalSubmissions,
                    byStatus: {
                        new: newSubmissions,
                        'in-progress': inProgressSubmissions,
                        matched: matchedSubmissions,
                        closed: closedSubmissions,
                    },
                    recentSubmissions,
                    serviceBreakdown,
                    countryBreakdown,
                },
            });
        } catch (error) {
            logger.error('Failed to fetch BANT/MEDDIC/INTENT(BMI) stats', error);
            return c.json(
                {
                    success: false,
                    error: 'Failed to fetch statistics',
                },
                500
            );
        }
    }

    /**
     * Delete a BANT/MEDDIC/INTENT(BMI) submission (Admin only)
     */
    async delete(c: Context) {
        try {
            const { id } = c.req.param();

            const submission = await BANTSubmission.findByIdAndDelete(id);

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
            logger.error('Failed to delete BANT/MEDDIC/INTENT(BMI) submission', error);
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

export default new BANTController();
