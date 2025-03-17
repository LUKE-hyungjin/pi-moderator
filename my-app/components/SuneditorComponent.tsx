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

    return (
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
                maxHeight: '600px',
                placeholder,
                showPathLabel: false,
                stickyToolbar: '0',
                resizingBar: true,
                charCounter: true,
                charCounterLabel: '글자 수:',
                maxCharCount: 10000,
            }}
            setDefaultStyle="font-family: sans-serif; font-size: 14px; overflow-y: auto;"
            defaultValue={defaultValue}
            onChange={(content) => onChange(content)}
        />
    );
} 