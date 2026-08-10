import React from 'react';
import { Card } from '../../../components/Card';

export const CompanyCardSkeleton: React.FC = () => {
    return (
        <Card className="flex flex-col h-full border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Header: Logo and Title Skeleton */}
            <div className="flex items-start justify-between mb-4 animate-pulse">
                <div className="flex items-center gap-4 w-full">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />

                    {/* Title and Rating Placeholder */}
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full bg-gray-200" />
                                ))}
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Skeleton */}
            <div className="flex gap-2 mb-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 mb-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Features List Skeleton */}
            <div className="space-y-3 mb-6 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-end animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-32" />
            </div>
        </Card>
    );
};
