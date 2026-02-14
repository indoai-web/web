import React from 'react';
import { notFound } from 'next/navigation';
import PreviewDispatcher from './PreviewDispatcher';

export default async function PreviewPage(props: { searchParams: Promise<{ version: string }> }) {
    const searchParams = await props.searchParams;
    const { version } = searchParams;

    if (!version) return notFound();

    return <PreviewDispatcher version={version} />;
}
