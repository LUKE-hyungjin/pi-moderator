import { useEffect, useRef } from 'react'
import SunEditor from 'suneditor-react'
import 'suneditor/dist/css/suneditor.min.css'
import plugins from 'suneditor/src/plugins'

type PropsType = {
    defaultValue?: string;
    onChange?: (value: string) => void;
    setContents?: string;
}

export default function Editor({ defaultValue, onChange, setContents }: PropsType) {
    const editor = useRef<any>();


    return (
        <div className="bg-white rounded-lg">
            <SunEditor
                getSunEditorInstance={(sunEditor) => {
                    editor.current = sunEditor;
                }}
                setContents={setContents || defaultValue}
                onChange={onChange}
                setOptions={{
                    height: '400px',
                    buttonList: [
                        ['undo', 'redo'],
                        ['font', 'fontSize', 'formatBlock'],
                        ['bold', 'underline', 'italic', 'strike'],
                        ['fontColor', 'hiliteColor'],
                        ['align', 'list', 'lineHeight'],
                        ['table', 'link', 'image'],
                        ['fullScreen', 'showBlocks', 'codeView'],
                        ['removeFormat']
                    ],
                    plugins: plugins
                }}
                defaultValue={defaultValue}
                placeholder="내용을 입력해주세요..."
            />
            <style>{`
                .sun-editor { 
                    background-color: #1e1e1e;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .sun-editor .se-toolbar { 
                    background-color: #252525; 
                    border-color: #333;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    padding: 5px;
                    border-bottom: 1px solid #333;
                }
                .sun-editor .se-wrapper { 
                    background-color: #1e1e1e; 
                    border: none;
                    min-height: 400px !important;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
                .sun-editor .se-wrapper-wysiwyg { 
                    color: #e0e0e0; 
                    background-color: #1e1e1e;
                    min-height: 400px !important;
                    padding: 20px;
                    line-height: 1.6;
                    font-size: 16px;
                }
                .sun-editor .se-btn { 
                    color: #e0e0e0;
                    border-radius: 6px;
                    margin: 0 2px;
                }
                .sun-editor .se-btn:hover { 
                    background-color: #3a3a3a;
                    transition: all 0.2s ease;
                }
                .sun-editor .se-btn:active {
                    background-color: #4a4a4a;
                }
                .sun-editor .se-placeholder { 
                    color: #666;
                    font-style: italic;
                }
                .sun-editor .se-resizing-bar { display: none; }
                .sun-editor .se-toolbar-separator {
                    background-color: #333;
                    margin: 0 6px;
                }
                .sun-editor .se-dropdown {
                    background-color: #252525;
                    border-color: #333;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                }
                .sun-editor .se-list-layer {
                    background-color: #252525;
                    border-color: #333;
                    border-radius: 8px;
                }
                .sun-editor .se-list-inner .se-list-basic li:hover {
                    background-color: #3a3a3a;
                }
            `}</style>
        </div>
    );
}