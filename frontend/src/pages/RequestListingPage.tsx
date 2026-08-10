import React, { useEffect, useMemo, useState } from 'react';
import { Header, Footer, Button, MultiSelect, Select } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { listingsApi } from '../services/api';
import { VENDOR_QUESTIONS } from '../features/auth/data/vendorQuestions';
import { COUNTRY_OPTIONS } from '../features/auth/data/countries';
import { ArrowRight, CheckCircle2, Plus, Trash2, AlertTriangle, Settings2, Globe2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isRequiredQuestionForService, validateQuestionnaireAnswersForMatrix } from '../utils/complianceQuestionnaire';

const PENDING_PLAN_KEY = 'thhiya_pending_plan';

const SERVICE_OPTIONS = VENDOR_QUESTIONS.services_available.options.map((service) => ({ value: service, label: service }));

type ServiceMatrixRow = { countries: string[]; services: string[] };

export const RequestListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, vendorProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('Free Listing');

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    contactName: '',
    contactRole: '',
    contactPhone: '',
  });

  const [serviceMatrix, setServiceMatrix] = useState<ServiceMatrixRow[]>([{ countries: [], services: [] }]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const validRows = useMemo(
    () => serviceMatrix.filter((row) => row.countries.length > 0 && row.services.length > 0),
    [serviceMatrix]
  );

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await listingsApi.getMyRequest();
        const req = response?.data;

        const fallbackForm = {
          companyName: vendorProfile?.companyName || user?.displayName || '',
          website: vendorProfile?.website || '',
          email: user?.email || '',
          contactName: vendorProfile?.contactPerson?.name || user?.displayName || '',
          contactRole: vendorProfile?.contactPerson?.role || '',
          contactPhone: vendorProfile?.contactPerson?.phone || '',
        };

        if (!mounted) return;

        if (req) {
          setFormData({
            companyName: req.companyName || fallbackForm.companyName,
            website: req.website || fallbackForm.website,
            email: req.email || fallbackForm.email,
            contactName: req.contactName || fallbackForm.contactName,
            contactRole: req.contactRole || fallbackForm.contactRole,
            contactPhone: req.contactPhone || fallbackForm.contactPhone,
          });
          setServiceMatrix(Array.isArray(req.serviceMatrix) && req.serviceMatrix.length ? req.serviceMatrix : [{ countries: [], services: [] }]);
          setAnswers(req.answers || {});
          const plan = req.selectedPlan || sessionStorage.getItem(PENDING_PLAN_KEY) || 'Free Listing';
          setSelectedPlan(plan);
          sessionStorage.setItem(PENDING_PLAN_KEY, plan);
        } else {
          setFormData(fallbackForm);
          const plan = sessionStorage.getItem(PENDING_PLAN_KEY) || 'Free Listing';
          setSelectedPlan(plan);
          sessionStorage.setItem(PENDING_PLAN_KEY, plan);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err.response?.data?.error || err.message || 'Failed to load listing details.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    hydrate();
    return () => { mounted = false; };
  }, [user?.displayName, user?.email, vendorProfile]);

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRow = () => setServiceMatrix((prev) => [...prev, { countries: [], services: [] }]);

  const removeRow = (index: number) => {
    setServiceMatrix((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next.length ? next : [{ countries: [], services: [] }];
    });
  };

  const updateRowCountries = (index: number, countries: string[]) => {
    setServiceMatrix((prev) => prev.map((row, i) => (i === index ? { ...row, countries } : row)));
  };

  const updateRowServices = (index: number, services: string[]) => {
    setServiceMatrix((prev) => prev.map((row, i) => (i === index ? { ...row, services } : row)));
  };

  const updateAnswer = (groupKey: string, service: string, questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        [service]: {
          ...prev[groupKey]?.[service],
          [questionId]: value,
        },
      },
    }));
  };

  const validate = () => {
    if (!formData.companyName.trim()) return 'Company name is required.';
    if (!formData.website.trim()) return 'Website is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.contactName.trim()) return 'Contact person is required.';
    if (!formData.contactRole.trim()) return 'Contact role is required.';
    if (!formData.contactPhone.trim()) return 'Contact phone is required.';
    if (!formData.contactPhone.startsWith('+')) return 'Contact phone must include country code.';
    if (validRows.length === 0) return 'Please add at least one country and service combination.';

    const questionnaireError = validateQuestionnaireAnswersForMatrix(serviceMatrix, answers);
    if (questionnaireError) return questionnaireError;

    return null;
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    setSuccess('');
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const effectivePlan = selectedPlan || sessionStorage.getItem(PENDING_PLAN_KEY) || 'Free Listing';

    try {
      setIsSaving(true);
      await listingsApi.upsertMyRequest({
        ...formData,
        serviceMatrix,
        answers,
        questionnaireAnswers: answers,
        serviceCoverage: serviceMatrix.flatMap((row) =>
          row.countries.map((country) => ({ country, services: row.services }))
        ),
        selectedPlan: effectivePlan,
      });

      sessionStorage.setItem(PENDING_PLAN_KEY, effectivePlan);
      setSuccess('Listing details updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update listing details.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (groupKey: string, question: any, service: string) => {
    const answer = answers[groupKey]?.[service]?.[question.id] || '';
    const isRequired = isRequiredQuestionForService(service, question.id);

    return (
      <div key={question.id} className="mb-5 last:mb-0">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {question.question}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {question.type === 'radio' && (
          <div className="flex flex-wrap gap-4">
            {question.options.map((option: string) => (
              <label key={option} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-red-600 h-4 w-4 border-gray-300 focus:ring-red-500"
                  name={`${groupKey}-${service}-${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => updateAnswer(groupKey, service, question.id, e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'select' && (
          <Select
            options={question.options.map((option: string) => ({ value: option, label: option }))}
            value={answer}
            onChange={(value) => updateAnswer(groupKey, service, question.id, value)}
            placeholder="Select..."
          />
        )}

        {question.type === 'checkbox_group' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((option: string) => (
              <label key={option} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-red-600 rounded border-gray-300 focus:ring-red-500"
                  checked={Array.isArray(answer) && answer.includes(option)}
                  onChange={(e) => {
                    const current = Array.isArray(answer) ? answer : [];
                    const next = e.target.checked
                      ? [...current, option]
                      : current.filter((value) => value !== option);
                    updateAnswer(groupKey, service, question.id, next);
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        )}

        {(question.type === 'input' || question.type === 'number') && (
          <input
            type={question.type === 'number' ? 'number' : 'text'}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 h-10 px-3 border"
            value={answer}
            onChange={(e) => updateAnswer(groupKey, service, question.id, e.target.value)}
          />
        )}

        {(question.type === 'textarea' || question.type === 'yes_no_explain' || question.type === 'yes_no_list') && (
          <textarea
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 min-h-[80px] p-3 border text-sm"
            value={answer}
            onChange={(e) => updateAnswer(groupKey, service, question.id, e.target.value)}
            placeholder="Please provide details..."
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-24 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">Listing Management</p>
                <h1 className="text-3xl font-black text-navy-900">Update your listing request</h1>
                <p className="text-sm text-gray-500 mt-2">All data is prefilled from your existing signup/request details. Update and save anytime.</p>
              </div>
              <div className="bg-navy-50 border border-navy-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Selected plan</p>
                <p className="text-lg font-bold text-navy-900">{selectedPlan || 'Free Listing'}</p>
                <button
                  type="button"
                  onClick={() => navigate('/pricing', { state: { selectedPlan, mode: 'update' } })}
                  className="text-xs text-red-600 font-bold mt-1 hover:text-red-700"
                >
                  Update Plan
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-red-500" /> Company & contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Company Name" value={formData.companyName} onChange={(value) => setField('companyName', value)} placeholder="e.g. Acme Corp" />
              <InputField label="Website" value={formData.website} onChange={(value) => setField('website', value)} placeholder="https://www.company.com" />
              <InputField label="Business Email" value={formData.email} onChange={(value) => setField('email', value)} placeholder="you@company.com" readOnly />
              <InputField label="Work Phone" value={formData.contactPhone} onChange={(value) => setField('contactPhone', value)} placeholder="+1 555 000 0000" />
              <InputField label="Contact Person" value={formData.contactName} onChange={(value) => setField('contactName', value)} placeholder="John Doe" />
              <InputField label="Role" value={formData.contactRole} onChange={(value) => setField('contactRole', value)} placeholder="CEO / Head of Growth" />
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-black text-navy-900 mb-6 flex items-center gap-2"><Globe2 className="w-5 h-5 text-red-500" /> Service coverage</h2>
            <div className="space-y-5">
              {serviceMatrix.map((row, idx) => (
                <div key={idx} className="relative bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <MultiSelect
                      label="TARGET MARKET"
                      options={COUNTRY_OPTIONS.filter((option) => !serviceMatrix.some((r, rIdx) => rIdx !== idx && r.countries.includes(option.value)))}
                      value={row.countries}
                      onChange={(countries) => updateRowCountries(idx, countries)}
                      placeholder="Select countries"
                    />
                    <MultiSelect
                      label="SERVICES PROVIDED"
                      options={SERVICE_OPTIONS}
                      value={row.services}
                      onChange={(services) => updateRowServices(idx, services)}
                      placeholder="Select services"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="absolute -top-3 -right-3 p-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-red-600"
                    aria-label="Remove service row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addRow}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add another market
              </button>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-black text-navy-900 mb-2 flex items-center gap-2"><Settings2 className="w-5 h-5 text-red-500" /> Compliance questionnaire</h2>
            <p className="text-sm text-gray-500 mb-6">Update all questionnaire details for each service and market grouping.</p>

            {validRows.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl p-4">Add at least one market and service above to edit questionnaire details.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-2">
                  {validRows.map((row, idx) => {
                    const label = row.countries.length > 2
                      ? `${row.countries.slice(0, 2).join(', ')} +${row.countries.length - 2}`
                      : row.countries.join(', ');

                    return (
                      <button
                        key={`${label}-${idx}`}
                        type="button"
                        onClick={() => setActiveGroupIndex(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${idx === activeGroupIndex ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'}`}
                      >
                        <p className="font-bold text-sm">{label || `Group ${idx + 1}`}</p>
                        <p className={`text-xs mt-1 ${idx === activeGroupIndex ? 'text-red-100' : 'text-gray-400'}`}>{row.services.join(', ')}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  {(() => {
                    const activeRow = validRows[activeGroupIndex];
                    if (!activeRow) return null;

                    const groupKey = `group-${activeGroupIndex}`;

                    return (
                      <div className="space-y-8">
                        <section>
                          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-4">General</h3>
                          {VENDOR_QUESTIONS.general.map((question) => renderField(groupKey, question, 'general'))}
                        </section>

                        {activeRow.services.map((service) => {
                          const isEOR = service.includes('EOR') || service.includes('PEO');
                          const isPayroll = service.includes('Payroll');
                          const isMarketing = service.includes('Marketing');
                          const isRecruitment = service.includes('Recruitment') || service.includes('Talent');
                          const showCompliance = isEOR || isPayroll || service.includes('Legal') || service.includes('Compliance');
                          const showWorkerTypes = isEOR || isRecruitment || isPayroll;
                          const showBenefits = isEOR || isPayroll;

                          return (
                            <section key={service} className="pt-6 border-t border-gray-200">
                              <h3 className="text-lg font-bold text-navy-900 mb-4">{service}</h3>

                              <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Terms</h4>
                                {VENDOR_QUESTIONS.pricing.map((question) => renderField(groupKey, question, service))}
                                {VENDOR_QUESTIONS.operational.map((question) => renderField(groupKey, question, service))}
                              </div>

                              {isEOR && (
                                <div className="mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">EOR Capabilities</h4>
                                  {VENDOR_QUESTIONS.eor_specific.map((question) => renderField(groupKey, question, service))}
                                </div>
                              )}

                              {showWorkerTypes && (
                                <div className="mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Worker & contracts</h4>
                                  {VENDOR_QUESTIONS.worker_types.map((question) => renderField(groupKey, question, service))}
                                </div>
                              )}

                              {showCompliance && (
                                <div className="mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Compliance & risk</h4>
                                  {VENDOR_QUESTIONS.compliance.map((question) => renderField(groupKey, question, service))}
                                  {showBenefits && VENDOR_QUESTIONS.benefits.map((question) => renderField(groupKey, question, service))}
                                  {VENDOR_QUESTIONS.risk.map((question) => renderField(groupKey, question, service))}
                                </div>
                              )}

                              <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Local support</h4>
                                {VENDOR_QUESTIONS.support.map((question) => renderField(groupKey, question, service))}
                              </div>

                              {isMarketing && (
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Marketing specifics</h4>
                                  {VENDOR_QUESTIONS.marketing_specific.map((question) => renderField(groupKey, question, service))}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm font-semibold text-green-700">{success}</p>
            </div>
          )}

          <section className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="ghost" onClick={() => navigate('/profile')} className="px-8 py-3 rounded-2xl">Back to Profile</Button>
            <Button onClick={handleSubmit} disabled={isSaving} className="px-8 py-3 rounded-2xl bg-navy-950 hover:bg-navy-900 text-white font-bold">
              <span className="inline-flex items-center gap-2">
                {isSaving && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                {isSaving ? 'Saving...' : 'Save listing details'}
              </span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}> = ({ label, value, onChange, placeholder, readOnly = false }) => (
  <div className="space-y-1">
    <label className="text-xs uppercase tracking-widest font-bold text-gray-400">{label}</label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full rounded-2xl border p-4 text-sm outline-none transition-all ${readOnly ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent'}`}
    />
  </div>
);
