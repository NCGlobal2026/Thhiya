export interface TaxComponent {
    label: string;
    rate: number;
}

export interface PayrollCountry {
    country: string;
    code: string; // ISO 2-letter country code
    currency: string;
    employer: {
        components: TaxComponent[];
    };
    employee: {
        components: TaxComponent[];
        grossBreakdown?: TaxComponent[];
    };
}

export const PAYROLL_DATA: PayrollCountry[] = [
    {
        "country": "Albania",
        "code": "al",
        "currency": "ALL",
        "employer": {
            "components": [
                {
                    "label": "Social contribution tax",
                    "rate": 0.15
                },
                {
                    "label": "Contributions for health care",
                    "rate": 0.017
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social contribution tax",
                    "rate": 0.095
                },
                {
                    "label": "Contributions for health care",
                    "rate": 0.017
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.091
                }
            ]
        }
    },
    {
        "country": "Algeria",
        "code": "dz",
        "currency": "DZD",
        "employer": {
            "components": [
                {
                    "label": "Social insurance",
                    "rate": 0.115
                },
                {
                    "label": "Workplace accidents and occupational diseases",
                    "rate": 0.0125
                },
                {
                    "label": "Retirement",
                    "rate": 0.11
                },
                {
                    "label": "Early Retirement",
                    "rate": 0.0025
                },
                {
                    "label": "Unemployment Insurance",
                    "rate": 0.01
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social insurance",
                    "rate": 0.015
                },
                {
                    "label": "Retirement",
                    "rate": 0.0675
                },
                {
                    "label": "Early Retirement",
                    "rate": 0.0025
                },
                {
                    "label": "Unemployment Insurance",
                    "rate": 0.005
                },
                {
                    "label": "Income Tax Due",
                    "rate": 0.187
                }
            ]
        }
    },
    {
        "country": "Armenia",
        "code": "am",
        "currency": "AMD",
        "employer": {
            "components": []
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax",
                    "rate": 0.2
                },
                {
                    "label": "Social payment",
                    "rate": 0.05
                },
                {
                    "label": "Military duty",
                    "rate": 0.015
                }
            ]
        }
    },
    {
        "country": "Australia",
        "code": "au",
        "currency": "AUD",
        "employer": {
            "components": [
                {
                    "label": "Superannuation",
                    "rate": 0.12
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Tax",
                    "rate": 0.42178
                },
                {
                    "label": "Medicare levy",
                    "rate": 0.02
                },
                {
                    "label": "Tax offset",
                    "rate": 0
                }
            ]
        }
    },
    {
        "country": "Austria",
        "code": "at",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.0378
                },
                {
                    "label": "Accident insurance",
                    "rate": 0.011
                },
                {
                    "label": "Pension contributions",
                    "rate": 0.1255
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.0295
                },
                {
                    "label": "Insolvency protection",
                    "rate": 0.001
                },
                {
                    "label": "Employer contributions",
                    "rate": 0.037
                },
                {
                    "label": "Local tax",
                    "rate": 0.03
                },
                {
                    "label": "Supplement employer contributions",
                    "rate": 0.0038
                },
                {
                    "label": "Company provision",
                    "rate": 0.0153
                },
                {
                    "label": "Housing subsidies",
                    "rate": 0.00032
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax",
                    "rate": 0.40298
                },
                {
                    "label": "Health insurance",
                    "rate": 0.0025
                },
                {
                    "label": "Pension contributions",
                    "rate": 0.00661
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.0019
                },
                {
                    "label": "Housing subsidies",
                    "rate": 0.005
                },
                {
                    "label": "Chamber of labour",
                    "rate": 0.00032
                }
            ]
        }
    },
    {
        "country": "Bosnia and Herzegovina",
        "code": "ba",
        "currency": "BAM",
        "employer": {
            "components": [
                {
                    "label": "Pension and invalid insurance",
                    "rate": 0.025
                },
                {
                    "label": "Health insurance",
                    "rate": 0.02
                },
                {
                    "label": "Unemployment",
                    "rate": 0.005
                },
                {
                    "label": "FP%",
                    "rate": 0.005
                },
                {
                    "label": "Natural/Other disasters",
                    "rate": 0.00311
                },
                {
                    "label": "Water protection",
                    "rate": 0.00311
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Pension and invalid insurance",
                    "rate": 0.17
                },
                {
                    "label": "Health insurance",
                    "rate": 0.125
                },
                {
                    "label": "Unemployment",
                    "rate": 0.015
                },
                {
                    "label": "Income Tax",
                    "rate": 0.0687
                },
                {
                    "label": "Deduction",
                    "rate": 0.003
                },
                {
                    "label": "Transport",
                    "rate": 0.00053
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Meal allowance (22 working days)",
                    "rate": 0.00336
                }
            ]
        }
    },
    {
        "country": "Brazil",
        "code": "br",
        "currency": "IROS",
        "employer": {
            "components": [
                {
                    "label": "FGTS",
                    "rate": 0.00008
                },
                {
                    "label": "INSS EMP%",
                    "rate": 0.2
                },
                {
                    "label": "INSS EMP",
                    "rate": 0.0002
                },
                {
                    "label": "TRAB%",
                    "rate": 0.02
                },
                {
                    "label": "TRAB",
                    "rate": 0.00002
                },
                {
                    "label": "TERCE%",
                    "rate": 0.058
                },
                {
                    "label": "TERCE",
                    "rate": 0.000058
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "INSS",
                    "rate": 0.00909
                },
                {
                    "label": "RENDA",
                    "rate": 0.26354
                }
            ]
        }
    },
    {
        "country": "Bulgaria",
        "code": "bg",
        "currency": "BGN",
        "employer": {
            "components": [
                {
                    "label": "Social security",
                    "rate": 0.00567
                },
                {
                    "label": "Health insurance",
                    "rate": 0.00198
                },
                {
                    "label": "Labour accident insurance",
                    "rate": 0.00017
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Pension fund",
                    "rate": 0.00272
                },
                {
                    "label": "Fund",
                    "rate": 0.00058
                },
                {
                    "label": "Unemployment fund",
                    "rate": 0.00017
                },
                {
                    "label": "Fund",
                    "rate": 0.00091
                },
                {
                    "label": "Health insurance",
                    "rate": 0.00132
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.09943
                }
            ]
        }
    },
    {
        "country": "Croatia",
        "code": "hr",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.165
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Pension fund 1",
                    "rate": 0.01404
                },
                {
                    "label": "Pension fund",
                    "rate": 0.00001
                },
                {
                    "label": "Pension fund 2",
                    "rate": 0.00468
                },
                {
                    "label": "Pension fund",
                    "rate": 0.00002
                },
                {
                    "label": "Income base",
                    "rate": 0.98128
                },
                {
                    "label": "Tax base",
                    "rate": 0.97528
                },
                {
                    "label": "Income tax lower",
                    "rate": 0
                },
                {
                    "label": "Income tax higher",
                    "rate": 0
                },
                {
                    "label": "Total income tax",
                    "rate": 0
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Personal allowance base (Exemption)",
                    "rate": 0.006
                }
            ]
        }
    },
    {
        "country": "Cyprus",
        "code": "cy",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "SIC payable by employer (on monthly max of",
                    "rate": 0.00488
                },
                {
                    "label": "Redundancy fund payable by employer (on monthly max of",
                    "rate": 0.00067
                },
                {
                    "label": "Industrial training payable by employer (on monthly max of",
                    "rate": 0.00028
                },
                {
                    "label": "Cohesion fund on total gross - payable by employer",
                    "rate": 0.02
                },
                {
                    "label": "2, payable by employer (on monthly max of",
                    "rate": 0.029
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "SIC of employee (on monthly max of",
                    "rate": 0.00488
                },
                {
                    "label": "Ge% payable by employee (on monthly max of",
                    "rate": 0.0265
                },
                {
                    "label": "Taxable income",
                    "rate": 0.96862
                },
                {
                    "label": "PAYE - employee's income tax",
                    "rate": 0.33059
                }
            ]
        }
    },
    {
        "country": "Czechia",
        "code": "cz",
        "currency": "CZK",
        "employer": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.09
                },
                {
                    "label": "Social insurance",
                    "rate": 0.248
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.045
                },
                {
                    "label": "Social insurance",
                    "rate": 0.071
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.1243
                }
            ]
        }
    },
    {
        "country": "Denmark",
        "code": "dk",
        "currency": "DKK",
        "employer": {
            "components": []
        },
        "employee": {
            "components": [
                {
                    "label": "AM-Bridrag",
                    "rate": 0.07992
                },
                {
                    "label": "ATP",
                    "rate": 0.00099
                },
                {
                    "label": "A-Tax",
                    "rate": 0.5055
                }
            ]
        }
    },
    {
        "country": "Egypt",
        "code": "eg",
        "currency": "EGP",
        "employer": {
            "components": [
                {
                    "label": "Social Insurance",
                    "rate": 0.02719
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social Insurance",
                    "rate": 0.11
                },
                {
                    "label": "Social Participation",
                    "rate": 0.0005
                },
                {
                    "label": "Income tax",
                    "rate": 0.127
                }
            ]
        }
    },
    {
        "country": "Estonia",
        "code": "ee",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Social tax",
                    "rate": 0.33
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.008
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax",
                    "rate": 0.21208
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.016
                },
                {
                    "label": "Pension",
                    "rate": 0.02
                }
            ]
        }
    },
    {
        "country": "Finland",
        "code": "fi",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Pension insurance",
                    "rate": 0.1826
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.002
                },
                {
                    "label": "Social insurance",
                    "rate": 0.0187
                },
                {
                    "label": "Accident insurance",
                    "rate": 0.0032
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Pension Insurance",
                    "rate": 0.0715
                },
                {
                    "label": "Unemployment Insurance",
                    "rate": 0.0059
                },
                {
                    "label": "Income tax",
                    "rate": 0.6
                }
            ]
        }
    },
    {
        "country": "France",
        "code": "fr",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Social Security - general",
                    "rate": 0.13
                },
                {
                    "label": "Social Security - invalidity contributions",
                    "rate": 0.00019
                },
                {
                    "label": "Social Security - death contributions",
                    "rate": 0.0048
                },
                {
                    "label": "Social Security - health contributions",
                    "rate": 0.00061
                },
                {
                    "label": "Contributions for injuries at work",
                    "rate": 0.0066
                },
                {
                    "label": "Social security - limited",
                    "rate": 0.00336
                },
                {
                    "label": "Social security - unlimited",
                    "rate": 0.0202
                },
                {
                    "label": "Social security - additional - tranche",
                    "rate": 0.00244
                },
                {
                    "label": "Social security - additional - tranche",
                    "rate": 0.07355
                },
                {
                    "label": "Social security - family",
                    "rate": 0.0345
                },
                {
                    "label": "Contributions for unemployement",
                    "rate": 0.0425
                },
                {
                    "label": "APEC - managerial organization fee",
                    "rate": 0
                },
                {
                    "label": "ADESATT contributions",
                    "rate": 0.0002
                },
                {
                    "label": "Other contributons",
                    "rate": 0.02146
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social Security - invalidity contributions",
                    "rate": 0.00845
                },
                {
                    "label": "Social Security - death contributions",
                    "rate": 0.00019
                },
                {
                    "label": "Social Security - health contributions",
                    "rate": 0.00061
                },
                {
                    "label": "Social security - limited",
                    "rate": 0.00271
                },
                {
                    "label": "Social security - unlimited",
                    "rate": 0.004
                },
                {
                    "label": "Social security - additional - tranche",
                    "rate": 0.00163
                },
                {
                    "label": "Social security - additional - tranche",
                    "rate": 0.09473
                },
                {
                    "label": "APEC - managerial organization fee",
                    "rate": 0
                },
                {
                    "label": "CSG deduction - deduction on income",
                    "rate": 0.068
                },
                {
                    "label": "income",
                    "rate": 0.029
                }
            ]
        }
    },
    {
        "country": "Georgia",
        "code": "ge",
        "currency": "GEL",
        "employer": {
            "components": [
                {
                    "label": "Employee contributions for pension",
                    "rate": 0.02
                },
                {
                    "label": "Taxable income",
                    "rate": 0.98
                },
                {
                    "label": "Income tax - tax rate",
                    "rate": 0
                },
                {
                    "label": "Income tax due",
                    "rate": 0.196
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Employer contributions for pension",
                    "rate": 0.02
                }
            ]
        }
    },
    {
        "country": "Germany",
        "code": "de",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Pension insurance",
                    "rate": 0.00679
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.00095
                },
                {
                    "label": "Health insurance",
                    "rate": 0.00394
                },
                {
                    "label": "Care insurance",
                    "rate": 0.00077
                },
                {
                    "label": "Umlage 1 further employer contribution2.79",
                    "rate": 0.0279
                },
                {
                    "label": "Umlage 2 further employer contribution0.55",
                    "rate": 0.0055
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Pension insurance",
                    "rate": 0.00679
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.00095
                },
                {
                    "label": "Health insurance",
                    "rate": 0.00404
                },
                {
                    "label": "Care insurance",
                    "rate": 0.00094
                },
                {
                    "label": "Personal tax",
                    "rate": 0.42713
                }
            ]
        }
    },
    {
        "country": "Greece",
        "code": "gr",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Efka",
                    "rate": 0.2229
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Efka",
                    "rate": 0.1387
                },
                {
                    "label": "Payroll tax",
                    "rate": 0.39429
                }
            ]
        }
    },
    {
        "country": "India",
        "code": "in",
        "currency": "INR",
        "employer": {
            "components": [
                {
                    "label": "Employer PF Contribution",
                    "rate": 0.018
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Employee PF Contribution",
                    "rate": 0.018
                },
                {
                    "label": "Professional Tax",
                    "rate": 0.002
                },
                {
                    "label": "Income Tax",
                    "rate": 0.06825
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Basic Salary",
                    "rate": 0.509
                },
                {
                    "label": "House Rent Allowance",
                    "rate": 0.2036
                },
                {
                    "label": "Leave Travel Allowance",
                    "rate": 0.0509
                },
                {
                    "label": "Special Allowance",
                    "rate": 0.2365
                }
            ]
        }
    },
    {
        "country": "Indonesia",
        "code": "id",
        "currency": "IDR",
        "employer": {
            "components": [
                {
                    "label": "Health Insurance (BPJS Kesehatan)",
                    "rate": 0.04
                },
                {
                    "label": "Work Accident Insurance (Jaminan Kecelakaan Kerja - JKK)",
                    "rate": 0.0054
                },
                {
                    "label": "Death Insurance (Jaminan Kematian - JKM)",
                    "rate": 0.003
                },
                {
                    "label": "Old Age Security (Jaminan Hari Tua - JHT)",
                    "rate": 0.037
                },
                {
                    "label": "Pension Security (Jaminan Pensiun - JP)2",
                    "rate": 0.02
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Old Age Security (Jaminan Hari Tua - JHT)",
                    "rate": 0.02
                },
                {
                    "label": "Pension Security (Jaminan Pensiun - JP)1",
                    "rate": 0.01
                },
                {
                    "label": "Health Insurance (BPJS Kesehatan)",
                    "rate": 0.01
                },
                {
                    "label": "Income Tax",
                    "rate": 0.048
                }
            ]
        }
    },
    {
        "country": "Ireland",
        "code": "ie",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Pay Related Social Insurance",
                    "rate": 0.1115
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Tax Credits",
                    "rate": 0.00167
                },
                {
                    "label": "Income Tax",
                    "rate": 0.39119
                },
                {
                    "label": "Universal Social Charge",
                    "rate": 0.0767
                },
                {
                    "label": "Pay Related Social Insurance",
                    "rate": 0.041
                }
            ]
        }
    },
    {
        "country": "Israel",
        "code": "il",
        "currency": "ILS",
        "employer": {
            "components": [
                {
                    "label": "National insurance (SS)",
                    "rate": 0.00264
                },
                {
                    "label": "Pension fund",
                    "rate": 0.065
                },
                {
                    "label": "Severance pay",
                    "rate": 0.0833
                },
                {
                    "label": "Education fund - Keren Hishtalmut",
                    "rate": 0.075
                },
                {
                    "label": "Disability insurance",
                    "rate": 0.025
                },
                {
                    "label": "Convalescence pay - Dmey Avraa 5 days per annum",
                    "rate": 0.0032
                },
                {
                    "label": "Total employer contribution",
                    "rate": 0.25414
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social security",
                    "rate": 0.06593
                },
                {
                    "label": "Education fund - Keren Hishtalmut",
                    "rate": 0.025
                },
                {
                    "label": "Pension fund",
                    "rate": 0.06
                },
                {
                    "label": "Health insurance",
                    "rate": 0.04887
                }
            ]
        }
    },
    {
        "country": "Italy",
        "code": "it",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "IVS contributions",
                    "rate": 0.2331
                },
                {
                    "label": "Pension fund",
                    "rate": 0.005
                },
                {
                    "label": "Ulteriori N%",
                    "rate": 0.003
                },
                {
                    "label": "Ulteriori N",
                    "rate": 0.000003
                },
                {
                    "label": "Contributo %",
                    "rate": 0.002
                },
                {
                    "label": "Contributo",
                    "rate": 0.000002
                },
                {
                    "label": "Additional N%",
                    "rate": 0
                },
                {
                    "label": "Additional N",
                    "rate": 0
                },
                {
                    "label": "CUAF",
                    "rate": 0.0000248
                },
                {
                    "label": "Maternity",
                    "rate": 0.0046
                },
                {
                    "label": "CIG < 50 dependents",
                    "rate": 0.017
                },
                {
                    "label": "Exemption cuaf R600",
                    "rate": 0.008
                },
                {
                    "label": "Reduction ctr L.266/2005",
                    "rate": 0.01
                },
                {
                    "label": "Fondo Est",
                    "rate": 0.00013
                },
                {
                    "label": "Inail",
                    "rate": 0.00016
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "IVS contributions",
                    "rate": 0.0949
                },
                {
                    "label": "Fondo Est",
                    "rate": 0.00002
                },
                {
                    "label": "National income tax",
                    "rate": 0.38394
                },
                {
                    "label": "Regional/municipal tax",
                    "rate": 0.0227
                },
                {
                    "label": "Municipal tax",
                    "rate": 0.008
                }
            ]
        }
    },
    {
        "country": "Kenya",
        "code": "ke",
        "currency": "KES",
        "employer": {
            "components": [
                {
                    "label": "NSSF Tier 1",
                    "rate": 0.0042
                },
                {
                    "label": "NSSF Tier",
                    "rate": 0.00001
                },
                {
                    "label": "NSSF Tier 2",
                    "rate": 0.0174
                },
                {
                    "label": "NSSF Tier",
                    "rate": 0.00002
                },
                {
                    "label": "Housing Levy",
                    "rate": 0.015
                },
                {
                    "label": "NITA",
                    "rate": 0.0005
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "SHIF",
                    "rate": 0.0000275
                },
                {
                    "label": "NSSF Tier 1",
                    "rate": 0.0042
                },
                {
                    "label": "NSSF Tier",
                    "rate": 0.00001
                },
                {
                    "label": "NSSF Tier 2",
                    "rate": 0.0174
                },
                {
                    "label": "NSSF Tier",
                    "rate": 0.00002
                },
                {
                    "label": "PAYE",
                    "rate": 0.21255
                },
                {
                    "label": "Housing Levy ( Gross Pay)",
                    "rate": 0.015
                }
            ]
        }
    },
    {
        "country": "Kosovo",
        "code": "xk",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "IIE contributions paid by employer",
                    "rate": 0.05
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Total taxes",
                    "rate": 0.09471
                },
                {
                    "label": "IIE contributions",
                    "rate": 0.05
                },
                {
                    "label": "Taxed salary",
                    "rate": 0.95
                }
            ]
        }
    },
    {
        "country": "Latvia",
        "code": "lv",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Social tax",
                    "rate": 0.2359
                },
                {
                    "label": "Business risk fee",
                    "rate": 0
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social tax",
                    "rate": 0.105
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.22823
                }
            ]
        }
    },
    {
        "country": "Lithuania",
        "code": "lt",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Social insurance",
                    "rate": 0.0177
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social insurance",
                    "rate": 0.0872
                },
                {
                    "label": "Health Insurance",
                    "rate": 0.0698
                },
                {
                    "label": "Sickness Social Security",
                    "rate": 0.0199
                },
                {
                    "label": "Maternity Social Security",
                    "rate": 0.0181
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.30735
                }
            ]
        }
    },
    {
        "country": "Malta",
        "code": "mt",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Social Security",
                    "rate": 0.1
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social Security",
                    "rate": 0.1
                },
                {
                    "label": "Income Tax",
                    "rate": 0.34217
                }
            ]
        }
    },
    {
        "country": "Mauritius",
        "code": "mu",
        "currency": "MUR",
        "employer": {
            "components": [
                {
                    "label": "NPF (Employer - ) Capped at",
                    "rate": 0.018
                },
                {
                    "label": "NSF (Employer - ) Capped at",
                    "rate": 0.0075
                },
                {
                    "label": "HRDC Levy ()",
                    "rate": 0.015
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "PAYE (approx - editable)",
                    "rate": 0.15833
                },
                {
                    "label": "NPF (Employee - ) Capped at",
                    "rate": 0.009
                },
                {
                    "label": "NSF (Employee - ) Capped at",
                    "rate": 0.003
                }
            ]
        }
    },
    {
        "country": "Moldova",
        "code": "md",
        "currency": "MDL",
        "employer": {
            "components": [
                {
                    "label": "Employer contribution",
                    "rate": 0.07
                }
            ]
        },
        "employee": {
            "components": []
        }
    },
    {
        "country": "Morocco",
        "code": "ma",
        "currency": "MAD",
        "employer": {
            "components": [
                {
                    "label": "Family allocation",
                    "rate": 0.064
                },
                {
                    "label": "Social allocation",
                    "rate": 0.00539
                },
                {
                    "label": "Professional training",
                    "rate": 0.016
                },
                {
                    "label": "Mandatory medical care",
                    "rate": 0.0411
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social security",
                    "rate": 0.00269
                },
                {
                    "label": "Mandatory medical care",
                    "rate": 0.0226
                },
                {
                    "label": "PROFESSIONAL EXPE%",
                    "rate": 0.02917
                },
                {
                    "label": "PROFESSIONAL EXPE",
                    "rate": 0.00025
                },
                {
                    "label": "Income tax",
                    "rate": 0.32702
                }
            ]
        }
    },
    {
        "country": "Nepal",
        "code": "np",
        "currency": "NPR",
        "employer": {
            "components": [
                {
                    "label": "Social Security Fund",
                    "rate": 0.12
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social Security Fund Deposit",
                    "rate": 0.066
                },
                {
                    "label": "Withholding Taxes",
                    "rate": 0.02083
                }
            ]
        }
    },
    {
        "country": "Netherlands",
        "code": "nl",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Sick pay insurance (ZVW)",
                    "rate": 0.00412
                },
                {
                    "label": "Work Resumption fund ( WAO )",
                    "rate": 0.00397
                },
                {
                    "label": "Child care Premium (WHK)",
                    "rate": 0.00051
                },
                {
                    "label": "Unemployment contributions (Awf laag)t",
                    "rate": 0.00173
                },
                {
                    "label": "Health contributions (WKO)",
                    "rate": 0.00032
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Personal income tax",
                    "rate": 0.04312
                }
            ]
        }
    },
    {
        "country": "Nigeria",
        "code": "ng",
        "currency": "NGN",
        "employer": {
            "components": [
                {
                    "label": "Gross income with relief",
                    "rate": 0.92
                },
                {
                    "label": "Housing fund",
                    "rate": 0.025
                },
                {
                    "label": "Pension fund",
                    "rate": 0.08
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.04925
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Contributions for pension fund",
                    "rate": 0.1
                }
            ]
        }
    },
    {
        "country": "North Macedonia",
        "code": "mk",
        "currency": "MKD",
        "employer": {
            "components": []
        },
        "employee": {
            "components": [
                {
                    "label": "Personal income tax base",
                    "rate": 0.0954
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.06173
                },
                {
                    "label": "Pension and disability insurance",
                    "rate": 0.188
                },
                {
                    "label": "Health insurance",
                    "rate": 0.075
                },
                {
                    "label": "Disability",
                    "rate": 0.005
                },
                {
                    "label": "Contributions for unemployment",
                    "rate": 0.012
                }
            ]
        }
    },
    {
        "country": "Norway",
        "code": "no",
        "currency": "NOK",
        "employer": {
            "components": [
                {
                    "label": "Social security",
                    "rate": 0.191
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax",
                    "rate": 0.5
                }
            ]
        }
    },
    {
        "country": "Pakistan",
        "code": "pk",
        "currency": "PKR",
        "employer": {
            "components": [
                {
                    "label": "Social security contribution",
                    "rate": 0.0185
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax",
                    "rate": 0.0125
                },
                {
                    "label": "Social security",
                    "rate": 0.0037
                }
            ]
        }
    },
    {
        "country": "Peru",
        "code": "pe",
        "currency": "PEN",
        "employer": {
            "components": [
                {
                    "label": "Pension fund",
                    "rate": 0.00538
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.27528
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.00373
                }
            ]
        }
    },
    {
        "country": "Poland",
        "code": "pl",
        "currency": "PLN",
        "employer": {
            "components": [
                {
                    "label": "Pension insurance",
                    "rate": 0.0976
                },
                {
                    "label": "Disability insurance",
                    "rate": 0.065
                },
                {
                    "label": "Accident insurance",
                    "rate": 0.0067
                },
                {
                    "label": "Labour fund",
                    "rate": 0.0245
                },
                {
                    "label": "FSGP - Employee Guaranteed Benefits Fund",
                    "rate": 0.001
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Old age pension insurance",
                    "rate": 0.0976
                },
                {
                    "label": "Pension insurance",
                    "rate": 0.015
                },
                {
                    "label": "Sickness insurance",
                    "rate": 0.0245
                },
                {
                    "label": "Medical insurance",
                    "rate": 0.07766
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.10025
                }
            ]
        }
    },
    {
        "country": "Portugal",
        "code": "pt",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Accident insurance costs",
                    "rate": 0.01
                },
                {
                    "label": "Social security",
                    "rate": 0.27708
                },
                {
                    "label": "FCT - Work compensation fund",
                    "rate": 0
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Withholding tax rate salary",
                    "rate": 0.46481
                },
                {
                    "label": "Withholding tax rate vacation",
                    "rate": 0.03873
                },
                {
                    "label": "Withholding tax rate christmas",
                    "rate": 0.03873
                },
                {
                    "label": "Social security",
                    "rate": 0.12833
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Food allowance",
                    "rate": 0.00126
                },
                {
                    "label": "Holiday allowance",
                    "rate": 0.08333
                },
                {
                    "label": "Christmas allowance",
                    "rate": 0.08333
                },
                {
                    "label": "WFH Allowance",
                    "rate": 0.00022
                },
                {
                    "label": "Total earnings",
                    "rate": 1.16815
                }
            ]
        }
    },
    {
        "country": "Romania",
        "code": "ro",
        "currency": "RON",
        "employer": {
            "components": [
                {
                    "label": "Unemployment insurance",
                    "rate": 0.0225
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.1
                },
                {
                    "label": "Social contribution",
                    "rate": 0.25
                },
                {
                    "label": "Salary tax",
                    "rate": 0.065
                }
            ]
        }
    },
    {
        "country": "Slovakia",
        "code": "sk",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Health insurance",
                    "rate": 0.11
                },
                {
                    "label": "Guarantee insurance",
                    "rate": 0.0025
                },
                {
                    "label": "Disability insurance",
                    "rate": 0.03
                },
                {
                    "label": "Sickness insurance",
                    "rate": 0.014
                },
                {
                    "label": "Reserve insurance",
                    "rate": 0.0475
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.01
                },
                {
                    "label": "Old-age insurance",
                    "rate": 0.14
                },
                {
                    "label": "Accident insurance",
                    "rate": 0.008
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Old-age insurance",
                    "rate": 0.04
                },
                {
                    "label": "Disability insurance",
                    "rate": 0.03
                },
                {
                    "label": "Health insurance",
                    "rate": 0.04
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.01
                },
                {
                    "label": "Health funds",
                    "rate": 0.014
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.16454
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Meal allowance",
                    "rate": 0.00076
                }
            ]
        }
    },
    {
        "country": "Slovenia",
        "code": "si",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Pension insurance",
                    "rate": 0.0885
                },
                {
                    "label": "Health contributions",
                    "rate": 0.0656
                },
                {
                    "label": "Injury insurance",
                    "rate": 0.0053
                },
                {
                    "label": "Unemployment insurance contributions0.06",
                    "rate": 0.0006
                },
                {
                    "label": "Parental protection contributions",
                    "rate": 0
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "General relief",
                    "rate": 0.00438
                },
                {
                    "label": "Pension insurance",
                    "rate": 0.155
                },
                {
                    "label": "Health insurance",
                    "rate": 0.0636
                },
                {
                    "label": "Health insurance fixed",
                    "rate": 0.00035
                },
                {
                    "label": "Unemployment insurance",
                    "rate": 0.0014
                },
                {
                    "label": "Parental protection contributions",
                    "rate": 0.001
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.37493
                }
            ],
            "grossBreakdown": [
                {
                    "label": "Meal allowance",
                    "rate": 0.00114
                }
            ]
        }
    },
    {
        "country": "Spain",
        "code": "es",
        "currency": "EUR",
        "employer": {
            "components": [
                {
                    "label": "Common contingencies + intergenerational equity mechanism",
                    "rate": 0.01191
                },
                {
                    "label": "Accidents at work and occupational diseases fund",
                    "rate": 0.00101
                },
                {
                    "label": "Unemployment fund",
                    "rate": 0.0027
                },
                {
                    "label": "Personal education fund",
                    "rate": 0.00029
                },
                {
                    "label": "Social fund for guarantee salaries",
                    "rate": 0.0001
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Common contingencies + intergenerational equity mechanism",
                    "rate": 0.00237
                },
                {
                    "label": "Professional training",
                    "rate": 0.00005
                },
                {
                    "label": "Unemployment fund",
                    "rate": 0.00076
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.45914
                }
            ]
        }
    },
    {
        "country": "Sweden",
        "code": "se",
        "currency": "SEK",
        "employer": {
            "components": [
                {
                    "label": "Contributions for pension fund",
                    "rate": 0.1272
                },
                {
                    "label": "Contributions for health insurance",
                    "rate": 0.187
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Tax",
                    "rate": 0.3
                }
            ]
        }
    },
    {
        "country": "Tunisia",
        "code": "tn",
        "currency": "TND",
        "employer": {
            "components": [
                {
                    "label": "Social Security Contribution",
                    "rate": 0.1757
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Social Security",
                    "rate": 0.0968
                },
                {
                    "label": "Personal income tax",
                    "rate": 0.35524
                },
                {
                    "label": "Social Solidarity Contribution (CSS)",
                    "rate": 0.00004
                }
            ]
        }
    },
    {
        "country": "Turkey",
        "code": "tr",
        "currency": "TRY",
        "employer": {
            "components": [
                {
                    "label": "SSI Employer",
                    "rate": 0.2075
                },
                {
                    "label": "SSI Employer Unemployment",
                    "rate": 0.02
                },
                {
                    "label": "SSI Employer 5510 Exemption",
                    "rate": 0.04
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "SSI Employee Contribution",
                    "rate": 0.14
                },
                {
                    "label": "SSI Unemployment Employee Contribution",
                    "rate": 0.01
                },
                {
                    "label": "Income Tax",
                    "rate": 0.1275
                },
                {
                    "label": "Stamp Tax",
                    "rate": 0.0076
                },
                {
                    "label": "Min. Wage Income Tax Exemption",
                    "rate": 0.03316
                },
                {
                    "label": "Min. Wage Stamp Tax Exemption",
                    "rate": 0.00197
                }
            ]
        }
    },
    {
        "country": "Ukraine",
        "code": "ua",
        "currency": "UAH",
        "employer": {
            "components": [
                {
                    "label": "Social contributions (employer tax)",
                    "rate": 0.22
                }
            ]
        },
        "employee": {
            "components": [
                {
                    "label": "Income tax (employee tax)",
                    "rate": 0.18
                },
                {
                    "label": "Military tax (employee tax)",
                    "rate": 0.05
                }
            ]
        }
    },
    {
        country: "United Kingdom",
        code: "gb",
        currency: "GBP",
        employer: {
            components: [
                {
                    label: "Employer NIC",
                    rate: 0.14937
                },
                {
                    label: "Employer pension",
                    rate: 0.0011
                }
            ]
        },
        employee: {
            components: [
                {
                    label: "Tax",
                    rate: 0.43903
                },
                {
                    label: "Employee NIC",
                    rate: 0.02168
                },
                {
                    label: "Employee pension",
                    rate: 0.00147
                }
            ]
        }
    },
    {
        country: "Uzbekistan",
        code: "uz",
        currency: "UZS",
        employer: {
            components: [
                {
                    label: "Social Tax",
                    rate: 0.12
                }
            ]
        },
        employee: {
            components: [
                {
                    label: "Income tax",
                    rate: 0.12
                }
            ]
        }
    },
    {
        country: "Vietnam",
        code: "vn",
        currency: "VND",
        employer: {
            components: [
                {
                    label: "Social insurance",
                    rate: 0.215
                }
            ]
        },
        employee: {
            components: [
                {
                    label: "Social insurance",
                    rate: 0.105
                }
            ]
        }
    },
    {
        country: "Canada — Alberta",
        code: "ca",
        currency: "CAD",
        employer: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0232 },
                { label: "Workers Comp", rate: 0.0022 },
            ]
        },
        employee: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0166 },
            ]
        }
    },
    {
        country: "Canada — British Columbia",
        code: "ca",
        currency: "CAD",
        employer: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0232 },
                { label: "Workers Comp", rate: 0.0155 },
            ]
        },
        employee: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0166 },
            ]
        }
    },
    {
        country: "Canada — Ontario",
        code: "ca",
        currency: "CAD",
        employer: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0232 },
                { label: "WSIB", rate: 0.0167 },
                { label: "Health Tax", rate: 0.0195 },
            ]
        },
        employee: {
            components: [
                { label: "CPP", rate: 0.0595 },
                { label: "EI", rate: 0.0166 },
            ]
        }
    },
    {
        country: "Canada — Quebec",
        code: "ca",
        currency: "CAD",
        employer: {
            components: [
                { label: "HSF (Avg)", rate: 0.0275 },
                { label: "EI", rate: 0.0178 },
                { label: "QPIP", rate: 0.00692 },
                { label: "QPP", rate: 0.064 },
                { label: "Labor Standards", rate: 0.0005 },
                { label: "Workforce Skills", rate: 0.01 },
                { label: "CNESST", rate: 0.019 },
            ]
        },
        employee: {
            components: [
                { label: "EI", rate: 0.0127 },
                { label: "QPIP", rate: 0.00494 },
                { label: "QPP", rate: 0.064 },
            ]
        }
    },
    {
        country: "United States — California",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Florida",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Illinois",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0.0495 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Massachusetts",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Paid Family Leave insurance", rate: 0.0018 },
                { label: "Paid medical Leave", rate: 0.0028 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — New York",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "paid Family Leave insurance", rate: 0.0039 },
                { label: "SDI", rate: 0.0003 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — North Carolina",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Oregon",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — South Carolina",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Texas",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Virginia",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    },
    {
        country: "United States — Georgia",
        code: "us",
        currency: "USD",
        employer: {
            components: [
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
                { label: "Unemployment tax", rate: 0.004 },
            ]
        },
        employee: {
            components: [
                { label: "Federal income tax", rate: 0 },
                { label: "State income tax", rate: 0.0549 },
                { label: "Social security", rate: 0.062 },
                { label: "Medicare", rate: 0.0145 },
            ]
        }
    }
];





