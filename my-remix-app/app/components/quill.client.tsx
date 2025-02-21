import { useEffect } from 'react'
import { useQuill } from 'react-quilljs'
import "quill/dist/quill.snow.css";

type PropsType = {
    defaultValue?: string;
    onChange?: (value: string) => void;
}

export default function Quill({ defaultValue, onChange }: PropsType) {
    const { quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean']
            ]
        },
        theme: 'snow', // theme 추가
        placeholder: '내용을 입력해주세요...' // placeholder 추가
    })

    useEffect(() => {
        if (quill) {
            if (defaultValue) {
                quill.clipboard.dangerouslyPasteHTML(defaultValue)
            }

            quill.on('text-change', () => {
                const html = quill.root.innerHTML
                onChange?.(html)
            })
        }
    }, [quill, defaultValue, onChange])

    return (
        <div className="bg-white rounded-lg">
            <div ref={quillRef} style={{ height: '200px' }} />
            <style>{`
                .ql-container {
                    min-height: 150px;
                    background-color: #1a1a1a;
                    border-color: #333 !important;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .ql-editor {
                    min-height: 150px;
                    font-size: 16px;
                    color: #fff;
                }
                .ql-editor.ql-blank::before {
                    color: #666;
                }
                .ql-toolbar {
                    background-color: #1a1a1a;
                    border-color: #333 !important;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                .ql-toolbar .ql-stroke {
                    stroke: #fff;
                }
                .ql-toolbar .ql-fill {
                    fill: #fff;
                }
                .ql-toolbar .ql-picker {
                    color: #fff;
                }
            `}</style>
        </div>
    )
}