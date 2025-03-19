'use client';

import { useRef, useEffect, useState } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

interface SuneditorComponentProps {
    setContents?: string;
    onChange: (content: string) => void;
    defaultValue?: string;
    height?: string;
    placeholder?: string;
    onError?: () => void;
}

export default function SuneditorComponent({
    setContents = '',
    onChange,
    defaultValue = '',
    height = '400px',
    placeholder = '내용을 입력하세요...',
    onError,
}: SuneditorComponentProps) {
    const editorRef = useRef<any>(null);
    const [content, setContent] = useState(setContents || defaultValue || '');
    const [hasError, setHasError] = useState(false);

    // 에디터 참조 저장을 위한 콜백
    const getSunEditorInstance = (sunEditor: any) => {
        editorRef.current = sunEditor;
    };

    // 초기 내용 설정 시 에러 처리
    useEffect(() => {
        const combinedContent = setContents || defaultValue || '';
        setContent(combinedContent);
    }, [setContents, defaultValue]);

    // 내용 변경 핸들러
    const handleChange = (newContent: string) => {
        setContent(newContent);
        onChange(newContent);
    };

    // 에러 감지 시 에러 처리 함수 호출
    useEffect(() => {
        if (hasError && onError) {
            onError();
        }
    }, [hasError, onError]);

    // 에러 발생 시 대체 텍스트 영역 표시
    if (hasError) {
        return (
            <textarea
                className="w-full h-full p-4 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                style={{ height }}
            />
        );
    }

    return (
        <>
            <style jsx global>{`
                .sun-editor {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.375rem;
                }
                .sun-editor .se-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1 1 auto;
                    height: 100%;
                }
                .sun-editor .se-wrapper {
                    flex: 1 1 auto;
                    position: relative;
                    height: auto !important;
                    min-height: 300px;
                    overflow: visible !important;
                }
                .sun-editor .se-wrapper .se-wrapper-inner {
                    position: absolute;
                    inset: 0;
                    overflow: visible !important;
                }
                /* 실제 콘텐츠 영역만 스크롤 가능하게 설정 */
                .sun-editor .se-wrapper .se-wrapper-wysiwyg {
                    overflow-y: auto !important;
                    height: 100% !important;
                }
                .sun-editor .se-wrapper-code, 
                .sun-editor .se-wrapper-source {
                    overflow-y: auto !important;
                    height: 100% !important;
                }
                .sun-editor-dark .se-btn-tray {
                    background-color: #1e293b;
                    border-color: #334155;
                }
                .sun-editor-dark .se-toolbar {
                    background-color: #1e293b;
                    border-color: #334155;
                }
                .sun-editor-dark .se-btn:hover {
                    background-color: #334155;
                }
                .sun-editor-dark .se-wrapper {
                    background-color: #0f172a;
                    color: #e2e8f0;
                }
                .dark .sun-editor {
                    border-color: #334155;
                }
            `}</style>
            <SunEditor
                getSunEditorInstance={getSunEditorInstance}
                setOptions={{
                    height,
                    buttonList: [
                        ['undo', 'redo'],
                        ['font', 'fontSize', 'formatBlock'],
                        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                        ['removeFormat'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['paragraphStyle', 'blockquote'],
                        ['align', 'list', 'lineHeight'],
                        ['outdent', 'indent'],
                        ['table', 'link', 'image'],
                        ['fullScreen', 'showBlocks', 'codeView'],
                    ],
                    minHeight: '300px',
                    placeholder,
                    showPathLabel: false,
                    stickyToolbar: '0',
                    resizingBar: false,
                    charCounter: true,
                    charCounterLabel: '글자 수:',
                    maxCharCount: 10000,
                    mode: 'classic',
                    iframe: false,
                    fullPage: false
                }}
                setDefaultStyle="font-family: sans-serif; font-size: 14px;"
                defaultValue={content}
                onChange={handleChange}
                height={height}
                onLoad={(reload) => {
                    try {
                        // 에디터 로드 후 스크롤 기능 활성화
                        if (editorRef.current && editorRef.current.core) {
                            const editor = editorRef.current.core.context.element;
                            if (editor.wysiwyg) {
                                // 편집 영역만 스크롤 설정
                                editor.wysiwyg.style.overflowY = 'auto';
                            }

                            // 다른 컨테이너는 overflow를 제거
                            document.querySelectorAll('.se-wrapper, .se-wrapper-inner').forEach(el => {
                                (el as HTMLElement).style.overflow = 'visible';
                            });
                        }
                    } catch (error) {
                        console.error('SunEditor 로드 오류:', error);
                        setHasError(true);
                        if (onError) onError();
                    }
                }}
            />
        </>
    );
} 