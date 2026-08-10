import React, { useState, useMemo } from 'react';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { PAYROLL_DATA, TaxComponent } from './payrollData';
import { ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';

export const PayrollCalculator = () => {
    const [role, setRole] = useState('employee');
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [grossAmount, setGrossAmount] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(true);
    const [isCalculated, setIsCalculated] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    const countryOptions = useMemo(() => {
        // Get all base countries (split at ' — ' if present)
        const uniqueCountries = new Map<string, string>();
        PAYROLL_DATA.forEach(d => {
            const base = d.country.split(' — ')[0];
            if (!uniqueCountries.has(base)) {
                uniqueCountries.set(base, d.code);
            }
        });

        return Array.from(uniqueCountries.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, code]) => ({
                value: name,
                label: name,
                icon: `https://flagcdn.com/40x30/${code}.png`
            }));
    }, []);

    const provinceOptions = useMemo(() => {
        if (!country) return [];

        // Find if this country has states/provinces (entries starting with "Country — ")
        const subEntries = PAYROLL_DATA.filter(d => d.country.startsWith(`${country} — `));

        if (subEntries.length === 0) return [];

        return subEntries.map(d => {
            const stateName = d.country.replace(`${country} — `, '');
            return {
                value: stateName,
                label: stateName,
                icon: `https://flagcdn.com/40x30/${d.code}.png`
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [country]);

    const selectedCountryData = useMemo(() => {
        // If has province options, try to match specific state
        const hasStates = PAYROLL_DATA.some(d => d.country.startsWith(`${country} — `));

        if (hasStates) {
            if (!province) return null; // Wait for state selection
            return PAYROLL_DATA.find(d => d.country === `${country} — ${province}`);
        }

        // Otherwise direct match
        return PAYROLL_DATA.find(d => d.country === country);
    }, [country, province]);

    const currency = selectedCountryData?.currency || '';

    const calculateTax = (amount: number, components: TaxComponent[]) => {
        return components.reduce((acc, comp) => acc + (amount * comp.rate), 0);
    };

    const result = useMemo(() => {
        if (!selectedCountryData || !grossAmount) return null;
        const gross = parseFloat(grossAmount);
        if (isNaN(gross)) return null;

        const employerTax = calculateTax(gross, selectedCountryData.employer.components);
        const employeeTax = calculateTax(gross, selectedCountryData.employee.components);

        return {
            gross,
            employerTax,
            employeeTax,
            totalCost: gross + employerTax,
            net: gross - employeeTax,
        };
    }, [selectedCountryData, grossAmount]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const downloadSalaryBreakdown = () => {
        if (!result || !selectedCountryData) return;

        // Create CSV content
        let csvContent = "Salary Breakdown Report\n\n";
        csvContent += `Country,${country}\n`;
        csvContent += `Currency,${currency}\n`;
        csvContent += `Gross Monthly Salary,${result.gross}\n\n`;

        csvContent += "TOTAL COSTS\n";
        csvContent += `Total Cost,${result.totalCost}\n\n`;

        csvContent += "GROSS Salary Breakdown\n";

        if (selectedCountryData.employee.grossBreakdown && selectedCountryData.employee.grossBreakdown.length > 0) {
            csvContent += "Gross Salary Composition\n";
            csvContent += "Component,Rate,Amount\n";
            selectedCountryData.employee.grossBreakdown.forEach(comp => {
                csvContent += `${comp.label},${(comp.rate * 100).toFixed(2)}%,${(result.gross * comp.rate).toFixed(2)}\n`;
            });
            csvContent += `Total Gross Salary,,${result.gross}\n\n`;
        } else {
            csvContent += `Gross Salary,${result.gross}\n\n`;
        }

        csvContent += "Employee Contributions\n";
        csvContent += "Component,Rate,Amount\n";
        selectedCountryData.employee.components.forEach(comp => {
            csvContent += `${comp.label},${(comp.rate * 100).toFixed(2)}%,${(result.gross * comp.rate).toFixed(2)}\n`;
        });
        csvContent += `Total Employee Contributions,,${result.employeeTax.toFixed(2)}\n\n`;

        csvContent += `NET Salary,${result.net}\n\n`;

        csvContent += "Employer Contributions\n";
        csvContent += "Component,Rate,Amount\n";
        selectedCountryData.employer.components.forEach(comp => {
            csvContent += `${comp.label},${(comp.rate * 100).toFixed(2)}%,${(result.gross * comp.rate).toFixed(2)}\n`;
        });
        csvContent += `Total Employer Contributions,,${result.employerTax.toFixed(2)}\n`;

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `salary_breakdown_${country}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadSalaryBreakdownPDF = () => {
        if (!result || !selectedCountryData) return;

        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Salary Breakdown Report', 105, yPos, { align: 'center' });
        yPos += 15;

        // Basic Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Country: ${country}`, 20, yPos);
        yPos += 8;
        doc.text(`Currency: ${currency}`, 20, yPos);
        yPos += 8;
        doc.text(`Gross Monthly Salary: ${formatCurrency(result.gross)}`, 20, yPos);
        yPos += 15;

        // Total Costs
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL COSTS', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formatCurrency(result.totalCost)}`, 150, yPos);
        yPos += 12;

        // Gross Salary Section

        if (selectedCountryData.employee.grossBreakdown && selectedCountryData.employee.grossBreakdown.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('GROSS Salary Composition', 20, yPos);
            yPos += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);

            selectedCountryData.employee.grossBreakdown.forEach(comp => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(comp.label, 30, yPos);
                doc.text(`${(comp.rate * 100).toFixed(2)}%`, 120, yPos);
                doc.text(`${formatCurrency(result.gross * comp.rate)}`, 150, yPos);
                yPos += 6;
            });
            yPos += 4;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
        }

        doc.setFont('helvetica', 'bold');
        doc.text('GROSS Salary', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formatCurrency(result.gross)}`, 150, yPos);
        yPos += 15;

        // Employee Contributions
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Employee Contributions', 25, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');

        selectedCountryData.employee.components.forEach(comp => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(comp.label, 30, yPos);
            doc.text(`${(comp.rate * 100).toFixed(2)}%`, 120, yPos);
            doc.text(`${formatCurrency(result.gross * comp.rate)}`, 150, yPos);
            yPos += 6;
        });

        yPos += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Total Employee Contributions', 30, yPos);
        doc.text(`${formatCurrency(result.employeeTax)}`, 150, yPos);
        yPos += 12;

        // NET Salary
        doc.setFontSize(12);
        doc.text('NET Salary', 20, yPos);
        doc.text(`${formatCurrency(result.net)}`, 150, yPos);
        yPos += 12;

        // Employer Contributions
        doc.setFontSize(11);
        doc.text('Employer Contributions', 25, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');

        selectedCountryData.employer.components.forEach(comp => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(comp.label, 30, yPos);
            doc.text(`${(comp.rate * 100).toFixed(2)}%`, 120, yPos);
            doc.text(`${formatCurrency(result.gross * comp.rate)}`, 150, yPos);
            yPos += 6;
        });

        yPos += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Total Employer Contributions', 30, yPos);
        doc.text(`${formatCurrency(result.employerTax)}`, 150, yPos);

        // Save PDF
        doc.save(`salary_breakdown_${country}_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowDownloadMenu(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

                    {/* Top Controls Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Select
                            label="I am"
                            value={role}
                            onChange={setRole}
                            options={[
                                { value: 'employee', label: 'a Worker (e.g. Freelancer)' },
                                { value: 'employer', label: 'an Employer' },
                            ]}
                        />
                        <Select
                            label="Country of employment"
                            value={country}
                            onChange={(value) => {
                                setCountry(value);
                                setProvince(''); // Reset province when country changes
                                setIsCalculated(false);
                            }}
                            options={countryOptions}
                            placeholder="Select country"
                        />
                        {provinceOptions.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <Select
                                    label="Your state"
                                    value={province}
                                    onChange={(value) => {
                                        setProvince(value);
                                        setIsCalculated(false);
                                    }}
                                    options={provinceOptions}
                                    placeholder="Select a state"
                                />
                            </div>
                        )}
                        <Select
                            label="Currency"
                            value={currency}
                            onChange={() => { }} // Read-only effectively
                            options={currency ? [{
                                value: currency,
                                label: currency,
                                icon: selectedCountryData ? `https://flagcdn.com/40x30/${selectedCountryData.code}.png` : undefined
                            }] : []}
                            placeholder="Currency"
                        />
                    </div>

                    {/* Input/Output Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Enter GROSS amount*
                            </label>
                            <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
                                <label className="block text-xs font-medium text-gray-400 mb-1">GROSS</label>
                                <div className="flex justify-between items-baseline">
                                    <input
                                        type="number"
                                        value={grossAmount}
                                        onChange={(e) => {
                                            setGrossAmount(e.target.value);
                                            setIsCalculated(false);
                                        }}
                                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none text-xl font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0"
                                    />
                                    <span className="text-gray-500 font-medium ml-2">{currency}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Calculated NET amount*
                            </label>
                            <div className="relative rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <label className="block text-xs font-medium text-gray-400 mb-1">NET</label>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-semibold text-gray-900">
                                        {result ? formatCurrency(result.net).replace(currency, '').trim() : '0'}
                                    </span>
                                    <span className="text-gray-500 font-medium ml-2">{currency}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Total cost
                            </label>
                            <div className="relative rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <label className="block text-xs font-medium text-gray-400 mb-1">TOTAL</label>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-semibold text-gray-900">
                                        {result ? formatCurrency(result.totalCost).replace(currency, '').trim() : '0'}
                                    </span>
                                    <span className="text-gray-500 font-medium ml-2">{currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <div className="mb-8">
                        <Button
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-red-500/20"
                            onClick={() => setIsCalculated(true)}
                        >
                            Calculate
                        </Button>
                    </div>

                    {result && isCalculated && (
                        <div className="border-t border-gray-100 pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-500 text-sm">
                                    You are looking into employment in: <span className="font-bold text-navy-950 ml-1">{country}</span>
                                </p>
                            </div>

                            {/* Summary Section */}
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employer Cost Card */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-red-500 font-bold text-sm uppercase tracking-wide mb-6">EMPLOYER COST</h3>

                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Gross monthly salary</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(result.gross)}</span>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-gray-600 font-medium">Est. taxes & contributions</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(result.employerTax)}</span>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
                                        <span className="text-navy-950 font-bold text-lg">Total cost p/m*:</span>
                                        <span className="text-navy-950 font-bold text-xl">{formatCurrency(result.totalCost)}</span>
                                    </div>
                                </div>

                                {/* Employee Net Salary Card */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-red-500 font-bold text-sm uppercase tracking-wide mb-6">EMPLOYEE NET SALARY</h3>

                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                        <span className="text-gray-600 font-medium">Gross monthly salary</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(result.gross)}</span>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-gray-600 font-medium">Est. taxes & contributions</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(result.employeeTax)}</span>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
                                        <span className="text-navy-950 font-bold text-lg">Net salary p/m*:</span>
                                        <span className="text-navy-950 font-bold text-xl">{formatCurrency(result.net)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Breakdown */}
                            <div className="text-center mb-8">
                                <button
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center justify-center mx-auto gap-1"
                                >
                                    {showBreakdown ? 'Click here to hide the full breakdown' : 'Click here to show full breakdown'}
                                    {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {/* Detailed Breakdown Table */}
                            {showBreakdown && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {/* Total Costs Header */}
                                    <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                                        <span className="text-navy-950 font-bold uppercase text-sm">TOTAL COSTS</span>
                                        <span className="text-navy-950 font-bold">{formatCurrency(result.totalCost)}</span>
                                    </div>

                                    {/* Gross Salary Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-navy-950 font-bold">GROSS Salary</span>
                                            <span className="text-navy-950 font-bold">{formatCurrency(result.gross)}</span>
                                        </div>

                                        {/* Gross Breakdown */}
                                        {selectedCountryData?.employee.grossBreakdown && (
                                            <div className="space-y-3 pl-4 border-l-2 border-gray-100 mb-6">
                                                {selectedCountryData.employee.grossBreakdown.map((comp, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-600">{comp.label}</span>
                                                        <div className="flex items-center gap-8">
                                                            <span className="text-gray-400 text-xs">{(comp.rate * 100).toFixed(2)}%</span>
                                                            <span className="text-gray-900 font-medium w-24 text-right">
                                                                {formatCurrency(result.gross * comp.rate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Employee Contributions */}
                                        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                            {selectedCountryData?.employee.components.map((comp, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">{comp.label}</span>
                                                    <div className="flex items-center gap-8">
                                                        <span className="text-gray-400 text-xs">{(comp.rate * 100).toFixed(2)}%</span>
                                                        <span className="text-gray-900 font-medium w-24 text-right">
                                                            {formatCurrency(result.gross * comp.rate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100 mt-3">
                                                <span className="text-gray-600 font-medium">Total employee contributions</span>
                                                <span className="text-gray-900 font-bold w-24 text-right">
                                                    {formatCurrency(result.employeeTax)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Salary Section */}
                                    <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                        <span className="text-navy-950 font-bold">NET Salary</span>
                                        <span className="text-navy-950 font-bold">{formatCurrency(result.net)}</span>
                                    </div>

                                    {/* Employer Contributions Section */}
                                    <div>
                                        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                            {selectedCountryData?.employer.components.map((comp, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">{comp.label}</span>
                                                    <div className="flex items-center gap-8">
                                                        <span className="text-gray-400 text-xs">{(comp.rate * 100).toFixed(2)}%</span>
                                                        <span className="text-gray-900 font-medium w-24 text-right">
                                                            {formatCurrency(result.gross * comp.rate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100 mt-3">
                                                <span className="text-gray-600 font-medium">Total employer contributions</span>
                                                <span className="text-gray-900 font-bold w-24 text-right">
                                                    {formatCurrency(result.employerTax)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-8">
                                        {/* Download Button with Dropdown */}
                                        <div className="relative">
                                            <Button
                                                className="w-full justify-center bg-red-500 hover:bg-red-600 text-white border-none rounded-full py-3 font-bold flex items-center gap-2"
                                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                            >
                                                Download salary breakdown
                                                <ChevronDown size={16} />
                                            </Button>

                                            {showDownloadMenu && (
                                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                                                    <button
                                                        onClick={() => {
                                                            downloadSalaryBreakdown();
                                                            setShowDownloadMenu(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-900 font-medium"
                                                    >
                                                        Download as CSV
                                                    </button>
                                                    <button
                                                        onClick={downloadSalaryBreakdownPDF}
                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-900 font-medium border-t border-gray-100"
                                                    >
                                                        Download as PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-red-400 mt-4 text-center">
                                        * The amounts are estimates based on information you provide and may not reflect actual salary you will receive. The figures are subject to change in accordance with personal tax rates, local regulations and requirements for employment.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

