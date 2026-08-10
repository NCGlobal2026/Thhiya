import React, { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { Container } from './Container';
import { BrandMark } from './BrandMark';
import { Link } from 'react-router-dom';
import { BANTModal } from './bant';

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5ZM.5 8h4V24h-4V8Zm7 0h3.83v2.19h.05c.53-1.01 1.84-2.08 3.79-2.08 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.62c0-1.82-.03-4.16-2.53-4.16-2.54 0-2.93 1.98-2.93 4.03V24h-4V8Z" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.54l-5.12-6.7L5.24 22H2l7.6-8.69L1.5 2h6.7l4.63 6.1L18.244 2Zm-1.147 18h1.8L7.22 3.9H5.29L17.097 20Z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [isBANTModalOpen, setIsBANTModalOpen] = useState(false);

  const footerSections = [
    {
      title: 'Services',
      links: [
        { name: 'Employer of Record', href: '#eor' },
        { name: 'Global Payroll', href: '#payroll' },
        { name: 'Compliance & Legal', href: '#compliance' },
        { name: 'Benefits Administration', href: '#benefits' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#about' },
        { name: 'Our Team', href: 'https://www.linkedin.com/company/bug-aeterium' },
        { name: 'Careers', href: '#careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Blog', href: '/blogs', isRoute: true },
        { name: 'Case Studies', href: '#cases' },
        { name: 'Documentation', href: '/privacy-policy' },
        { name: 'Support', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy', isRoute: true },
        { name: 'Terms of Service', href: '/terms-of-service', isRoute: true },
        // { name: 'Data Protection', href: '#data-protection' },
        { name: 'Cookie Policy', href: '/cookie-policy', isRoute: true },
      ],
    },
  ];

  return (
    <footer className="bg-navy-950 text-white">
      <Container className="section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <BrandMark variant="white" className="text-2xl mb-4 block" />
            <p className="text-gray-400 text-sm mb-6">
              Your trusted partner for global expansion and workforce management.
            </p>
            <button
              onClick={() => setIsBANTModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Get Matched
            </button>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/bug-aeterium"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our LinkedIn page"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@thhiya.com"
                aria-label="Send us an email"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compliance Disclaimer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h5 className="font-semibold mb-2 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              Data Privacy & Compliance
            </h5>
            <p className="text-sm text-gray-400">
              <BrandMark variant="white" className="inline text-base align-baseline" weight="medium" /> is committed to protecting your privacy and maintaining compliance.
              We implement industry-standard security measures to safeguard your information
              and ensure transparent data handling practices. You maintain full control over
              your data sharing preferences.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-400 gap-4">
            <div>
              <p>
                © {new Date().getFullYear()}{' '}
                <BrandMark variant="white" className="inline text-base align-baseline" weight="medium" />
                {' '}All rights reserved.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                All trademarks and logos belong to their respective owners and are used for identification purposes only.
              </p>
            </div>
            <p className="mt-2 md:mt-0">
              Built with care for global businesses
            </p>
          </div>
        </div>
      </Container>

      {/* BANT/MEDDIC/INTENT(BMI) Modal */}
      <BANTModal
        isOpen={isBANTModalOpen}
        onClose={() => setIsBANTModalOpen(false)}
        source="footer"
      />
    </footer>
  );
};
