import React from 'react';
import { GA4Events } from '../../services/analytics';

interface OutboundLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    linkLabel?: string;
    children: React.ReactNode;
}

/**
 * OutboundLink Component
 * 
 * A drop-in replacement for <a> tags that automatically tracks outbound clicks
 * using GA4 analytics. Use this for any external links to track user engagement.
 * 
 * @example
 * <OutboundLink href="https://provider.com" linkLabel="visit_provider">
 *   Visit Provider
 * </OutboundLink>
 */
export const OutboundLink: React.FC<OutboundLinkProps> = ({
    href,
    linkLabel,
    children,
    onClick,
    ...props
}) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Track the outbound click
        GA4Events.outboundClick(href, linkLabel);

        // Call the original onClick if provided
        onClick?.(e);
    };

    return (
        <a
            href={href}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            {children}
        </a>
    );
};

export default OutboundLink;
