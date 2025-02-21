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
                [{ 'size': ['small', false, 'large', 'huge'] }],  // 텍스트 크기
                ['link', 'image'],
                [{ 'align': [] }],  // 정렬
                ['clean']
            ],
            imageResize: {
                displaySize: true   // 이미지 크기 표시
            }
        },
        theme: 'snow',
        placeholder: '내용을 입력해주세요...'
    });

    useEffect(() => {
        if (quill) {
            if (defaultValue) {
                quill.clipboard.dangerouslyPasteHTML(defaultValue)
            }

            // 이미지 핸들러 추가
            const handleImage = () => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();

                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) {
                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                            const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            const range = quill.getSelection(true);
                            quill.insertEmbed(range.index, 'image', data.url);
                        } catch (error) {
                            console.error('Image upload failed:', error);
                        }
                    }
                };
            };

            // 이미지 핸들러 등록
            const toolbar = quill.getModule('toolbar') as any;
            toolbar.addHandler('image', handleImage);

            quill.on('text-change', () => {
                const html = quill.root.innerHTML;
                onChange?.(html);
            });
        }
    }, [quill, defaultValue, onChange]);

    return (
        <div className="bg-white rounded-lg">
            <div ref={quillRef} style={{ height: '400px' }} /> {/* 높이 증가 */}
            <style>{`
                .ql-container {
                    min-height: 350px;
                    background-color: #1a1a1a;
                    border-color: #333 !important;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .ql-editor {
                    min-height: 350px;
                    font-size: 16px;
                    color: #fff;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 1em 0;
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
                .ql-toolbar .ql-picker-options {
                    background-color: #1a1a1a;
                    border-color: #333;
                }
                .ql-toolbar .ql-picker-item {
                    color: #fff;
                }
                .ql-toolbar .ql-picker-label {
                    color: #fff;
                }
            `}</style>
        </div>
    );
}