'use client';

import { useRef, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import plugins from 'suneditor/src/plugins';

interface SuneditorComponentProps {
    setContents?: string;
    onChange: (content: string) => void;
    defaultValue?: string;
    height?: string;
    placeholder?: string;
}

export default function SuneditorComponent({
    setContents = '',
    onChange,
    defaultValue = '',
    height = '400px',
    placeholder = '내용을 입력하세요...',
}: SuneditorComponentProps) {
    const editorRef = useRef<any>(null);
    const initialContentRef = useRef<string>(setContents || defaultValue);

    // 에디터 참조 저장을 위한 콜백
    const getSunEditorInstance = (sunEditor: any) => {
        editorRef.current = sunEditor;
    };

    // 초기 내용 설정을 위한 useEffect
    useEffect(() => {
        // 에디터 인스턴스가 있고 초기 콘텐츠가 있는 경우
        if (editorRef.current && initialContentRef.current) {
            try {
                setTimeout(() => {
                    if (editorRef.current) {
                        editorRef.current.setContents(initialContentRef.current);
                    }
                }, 100);
            } catch (error) {
                console.error('SunEditor setContents 오류:', error);
            }
        }
    }, []);

    // setContents prop이 변경될 때마다 에디터 내용 업데이트
    useEffect(() => {
        if (editorRef.current && setContents) {
            try {
                editorRef.current.setContents(setContents);
            } catch (error) {
                console.error('SunEditor setContents 업데이트 오류:', error);
            }
        }
    }, [setContents]);

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
                }
                .sun-editor .se-wrapper .se-wrapper-inner {
                    position: absolute;
                    inset: 0;
                    overflow-y: auto;
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
                    plugins: plugins,
                    minHeight: '300px',
                    placeholder,
                    showPathLabel: false,
                    stickyToolbar: '0',
                    resizingBar: false,
                    charCounter: true,
                    charCounterLabel: '글자 수:',
                    maxCharCount: 10000,
                }}
                setDefaultStyle="font-family: sans-serif; font-size: 14px;"
                defaultValue={defaultValue}
                onChange={(content) => onChange(content)}
            />
        </>
    );
} 