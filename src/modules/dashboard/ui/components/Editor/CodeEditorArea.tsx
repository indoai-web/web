'use client';

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorAreaProps {
    content: string;
    onChange: (code: string) => void;
    filename: string;
    visible: boolean;
}

export const CodeEditorArea: React.FC<CodeEditorAreaProps> = ({
    content,
    onChange,
    filename,
    visible
}) => {
    return (
        <div className={`
            ${!visible ? 'w-0 opacity-0 pointer-events-none' : 'flex-1'} 
            bg-[#1e1e1e] overflow-auto custom-scrollbar border-r border-white-border relative group transition-all duration-500
        `}>
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 rounded bg-white/10 text-[9px] font-bold text-white/50 uppercase tracking-widest">
                    {filename}
                </span>
            </div>
            <Editor
                value={content}
                onValueChange={onChange}
                highlight={code => {
                    const ext = filename.split('.').pop()?.toLowerCase();
                    if (ext === 'tsx' || ext === 'ts' || ext === 'js' || ext === 'jsx') {
                        return highlight(code, languages.javascript, 'javascript');
                    } else if (ext === 'css') {
                        return highlight(code, languages.css, 'css');
                    } else if (ext === 'html') {
                        return highlight(code, languages.markup, 'markup');
                    }
                    return highlight(code, languages.clike, 'clike');
                }}
                padding={24}
                style={{
                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    minHeight: '100%',
                }}
                textareaClassName="focus:outline-none"
            />
        </div>
    );
};
