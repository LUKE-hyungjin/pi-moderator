import { Link } from '@remix-run/react';
import { useState } from 'react';

// 목차 및 내용 데이터 구조
interface Section {
    id: string;
    title: string;
    content: string;
    subsections?: Section[];
}

// 모든 내용을 여기서 관리
const piContent: Section[] = [
    {
        id: "intro",
        title: "1. 파이코인 신규가입후 해야할 것 들",
        content: `
        <div class="space-y-4">
            <p class="text-lg">파이코인을 시작하기 위해 다음 단계들을 따라주세요:</p>
            <ol class="list-decimal list-inside space-y-2 ml-4">
                <li>파이코인 앱 설치하기</li>
                <li>KYC 인증하기</li>
                <li>채굴 시작하기</li>
                <li>보안 서클 형성하기</li>
            </ol>
        </div>
        `
    },
    {
        id: "blockchain",
        title: "2. 블록체인 필수사항",
        content: "",
        subsections: [
            {
                id: "what-is",
                title: "1) 블록체인이란?",
                content: `...기존 내용...`
            },
            {
                id: "node",
                title: "2) 노드",
                content: `...기존 내용...`
            },
            {
                id: "kyc",
                title: "3) KYC",
                content: `
                <div class="space-y-4">
                    <p class="text-lg">KYC(Know Your Customer)는 고객 신원 확인 절차입니다.</p>
                </div>
                `
            },
            {
                id: "token-model",
                title: "4) 토큰모델 및 채굴 매커니즘",
                content: `
                <div class="space-y-4">
                    <p class="text-lg">파이코인의 토큰 모델과 채굴 메커니즘에 대한 설명</p>
                </div>
                `
            },
            {
                id: "pi-wallet",
                title: "5) 파이지갑",
                content: `
                <div class="space-y-4">
                    <p class="text-lg">파이 지갑의 기능과 사용법</p>
                </div>
                `
            },
            {
                id: "block-explorer",
                title: "6) 블록탐색기",
                content: `
                <div class="space-y-4">
                    <p class="text-lg">블록체인 탐색기 사용법</p>
                </div>
                `
            }
        ]
    },
    {
        id: "util-bonus",
        title: "3. 유틸 보너스 받는 방법",
        content: `
        <div class="space-y-4">
            <p class="text-lg">유틸리티 보너스를 받는 방법에 대한 설명</p>
        </div>
        `
    },
    {
        id: "node-info",
        title: "4. 노드 일반 정보",
        content: `
        <div class="space-y-4">
            <p class="text-lg">노드에 대한 일반적인 정보와 설명</p>
        </div>
        `
    },
    {
        id: "node-install",
        title: "5. 노드 설치 과정",
        content: `
        <div class="space-y-4">
            <p class="text-lg">노드 설치를 위한 단계별 가이드</p>
        </div>
        `
    },
    {
        id: "fireside",
        title: "6. 파이어사이드 플랫폼?",
        content: `
        <div class="space-y-4">
            <p class="text-lg">파이어사이드 플랫폼에 대한 설명</p>
        </div>
        `
    }
];

export default function Pi() {
    const [selectedSection, setSelectedSection] = useState("intro");  // 기본값으로 intro 선택
    const [isMenuOpen, setIsMenuOpen] = useState(false);  // 모바일 메뉴 상태 추가

    // 현재 선택된 섹션이나 서브섹션 찾기
    const findSelectedContent = () => {
        for (const section of piContent) {
            if (section.id === selectedSection) {
                return {
                    title: section.title,
                    content: section.content
                };
            }
            if (section.subsections) {
                const subsection = section.subsections.find(sub => sub.id === selectedSection);
                if (subsection) {
                    return {
                        title: subsection.title,
                        content: subsection.content
                    };
                }
            }
        }
        return null;
    };

    const selectedContent = findSelectedContent();

    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="container mx-auto p-4 max-w-7xl">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* 모바일 토글 버튼 */}
                    <div className="md:hidden flex justify-between items-center bg-[#242424] p-4 rounded-lg">
                        <h2 className="text-2xl font-bold">목차</h2>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* 목차 부분 */}
                    <div className={`w-full md:w-2/5 lg:w-1/3 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
                        <div className="bg-[#242424] p-4 md:p-6 rounded-lg md:h-[calc(100vh-2rem)] md:sticky md:top-4">
                            <h2 className="text-2xl font-bold mb-4 md:mb-6 hidden md:block">목차</h2>
                            <nav className="space-y-2 md:space-y-4">
                                {piContent.map((section) => (
                                    <div key={section.id} className="space-y-1 md:space-y-2">
                                        <button
                                            onClick={() => {
                                                setSelectedSection(section.id);
                                                setIsMenuOpen(false);  // 모바일에서 선택 시 메뉴 닫기
                                            }}
                                            className={`text-left w-full text-base md:text-lg py-2 px-3 ${selectedSection === section.id
                                                ? "bg-blue-500 text-white rounded"
                                                : "text-gray-300 hover:text-gray-100"
                                                }`}
                                        >
                                            {section.title}
                                        </button>
                                        {section.subsections && (
                                            <div className="pl-4 md:pl-6 space-y-1 md:space-y-2">
                                                {section.subsections.map((subsection) => (
                                                    <button
                                                        key={subsection.id}
                                                        onClick={() => {
                                                            setSelectedSection(subsection.id);
                                                            setIsMenuOpen(false);  // 모바일에서 선택 시 메뉴 닫기
                                                        }}
                                                        className={`text-left w-full text-sm md:text-base py-1.5 px-3 ${selectedSection === subsection.id
                                                            ? "bg-blue-500 text-white rounded"
                                                            : "text-gray-300 hover:text-gray-100"
                                                            }`}
                                                    >
                                                        {subsection.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* 내용 부분 */}
                    <div className="w-full md:w-3/5 lg:w-2/3">
                        <div className="bg-[#242424] p-4 md:p-6 rounded-lg min-h-[calc(100vh-2rem)]">
                            {selectedContent && (
                                <>
                                    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                                        {selectedContent.title}
                                    </h1>
                                    <div
                                        className="text-gray-300 prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}