'use client';

import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  multiline?: boolean;
}

export default function RichTextEditor({ value, onChange, label, multiline = true }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleChange();
  };

  const handleColor = (className: string = 'text-brand-electric') => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || selection.isCollapsed) return;
    
    // Wrap selection in span with given class
    const span = document.createElement('span');
    span.className = className; // className passed as argument
    const range = selection.getRangeAt(0);
    span.appendChild(range.extractContents());
    range.insertNode(span);
    
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="border border-gray-300 rounded-md overflow-hidden focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
        
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap gap-2 items-center">
          <button 
            type="button"
            onClick={() => execCommand('bold')}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded font-serif font-bold w-8 h-8 flex items-center justify-center"
            title="Negrita"
          >
            B
          </button>
          <button 
            type="button"
            onClick={() => execCommand('italic')}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded font-serif italic w-8 h-8 flex items-center justify-center"
            title="Cursiva"
          >
            I
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          {multiline && (
            <>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              <button 
                type="button"
                onClick={() => execCommand('insertHTML', '<br class=&quot;hidden md:block&quot; />')}
                className="px-2 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm flex items-center"
                title="Salto de línea (solo escritorio)"
              >
                ↵ Salto Escritorio
              </button>
              <button 
                type="button"
                onClick={() => execCommand('insertHTML', '<br />')}
                className="px-2 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm flex items-center"
                title="Salto de línea normal"
              >
                ↵ Salto Normal
              </button>
            </>
          )}
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleChange}
          onBlur={handleChange}
          className={`p-3 outline-none min-h-[${multiline ? '120px' : '40px'}] max-h-96 overflow-y-auto prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2`}
          style={{ minHeight: multiline ? '120px' : '40px' }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">Selecciona el texto y usa los botones para darle formato visualmente.</p>
    </div>
  );
}
