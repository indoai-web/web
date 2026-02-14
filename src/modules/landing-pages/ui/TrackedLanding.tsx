'use client';

import React from 'react';
import { useTracker } from '@/shared/lib/useTracker';

interface TrackedLandingProps {
    version: string;
    children: React.ReactNode;
}

export default function TrackedLanding({ version, children }: TrackedLandingProps) {
    useTracker(version);
    return <>{children}</>;
}
