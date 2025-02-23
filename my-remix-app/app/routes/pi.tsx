import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from "~/hooks/useTranslation";
import { useLanguage } from "~/contexts/LanguageContext";

// 목차 및 내용 데이터 구조
interface Section {
    id: string;
    title: string | string[];
    content: React.ReactNode;
    subsections?: Section[];
}

export default function PiRoute() {
    const { language } = useLanguage();
    const { t } = useTranslation(language);
    const [selectedSection, setSelectedSection] = useState("intro");
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    // useEffect를 추가하여 언어 변경 시 컴포넌트 리렌더링
    useEffect(() => {
        // 언어가 변경될 때마다 컨텐츠를 다시 계산
    }, [language]);

    const piContent: Section[] = useMemo(() => [
        {
            id: "intro",
            title: t("pi.intro.title"),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('pi.intro.first_day.title')}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.first_day.items') as string[]).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('pi.intro.after_3days.title')}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.after_3days.items') as string[]).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                        <p className="mt-2 text-yellow-500">{t('pi.intro.after_3days.warning')}</p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('pi.intro.after_n_days.title')}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.after_n_days.items') as string[]).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                        <div className="mt-2 space-y-2 text-yellow-500">
                            {(t('pi.intro.after_n_days.warnings') as string[]).map((warning, index) => (
                                <p key={index}>{warning}</p>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('pi.intro.periodic.title')}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.periodic.items') as string[]).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ol>
                        <div className="mt-4 space-y-2">
                            <div className="text-gray-300">
                                <p>{t('pi.intro.periodic.first_phase')}</p>
                                <ul className="list-inside space-y-1 ml-4">
                                    {(t('pi.intro.periodic.first_phase.items') as string[]).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-gray-300">{t('pi.intro.periodic.n_phase')}</p>
                        </div>
                    </div>
                </div>
            )
        }
    ], [language, t]);

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
                        <h2 className="text-2xl font-bold">{t('pi.toc')}</h2>
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
                        <div className="bg-[#242424] p-4 md:p-6 rounded-lg md:h-[calc(100vh-2rem)] md:sticky md:top-4 h-fit">
                            <h2 className="text-2xl font-bold mb-4 md:mb-6 hidden md:block">{t('pi.toc')}</h2>
                            <nav className="space-y-2 md:space-y-4">
                                {piContent.map((section) => (
                                    <div key={section.id} className="space-y-1 md:space-y-2">
                                        <button
                                            onClick={() => {
                                                setSelectedSection(section.id);
                                                setIsMenuOpen(false);
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
                                                            setIsMenuOpen(false);
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
                                    <div className="text-gray-300 prose prose-invert max-w-none">
                                        {selectedContent.content}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}