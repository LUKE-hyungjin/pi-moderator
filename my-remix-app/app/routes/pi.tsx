import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from "~/hooks/useTranslation";
import { useLanguage } from "~/contexts/LanguageContext";
import * as React from 'react';
import type { Section, TranslationValue } from "~/types";
import { translateToString } from "~/i18n/translations";

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
            title: translateToString(t("pi.intro.title")),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.intro.first_day.title'))}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.first_day.items') as string[]).map((item, index) => (
                                <li key={index}>{translateToString(item)}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.intro.after_3days.title'))}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.after_3days.items') as string[]).map((item, index) => (
                                <li key={index}>{translateToString(item)}</li>
                            ))}
                        </ol>
                        <p className="mt-2 text-yellow-500">{translateToString(t('pi.intro.after_3days.warning'))}</p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.intro.after_n_days.title'))}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.after_n_days.items') as string[]).map((item, index) => (
                                <li key={index}>{translateToString(item)}</li>
                            ))}
                        </ol>
                        <div className="mt-2 space-y-2 text-yellow-500">
                            {(t('pi.intro.after_n_days.warnings') as string[]).map((warning, index) => (
                                <p key={index}>{translateToString(warning)}</p>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.intro.periodic.title'))}</h3>
                        <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                            {(t('pi.intro.periodic.items') as string[]).map((item, index) => (
                                <li key={index}>{translateToString(item)}</li>
                            ))}
                        </ol>
                        <div className="mt-4 space-y-2">
                            <div className="text-gray-300">
                                <p>{translateToString(t('pi.intro.periodic.first_phase'))}</p>
                                <ul className="list-inside space-y-1 ml-4">
                                    {(t('pi.intro.periodic.first_phase.items') as string[]).map((item, index) => (
                                        <li key={index}>{translateToString(item)}</li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-gray-300">{translateToString(t('pi.intro.periodic.n_phase'))}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "blockchain",
            title: translateToString(t("pi.blockchain.title")),
            subsections: [
                {
                    id: "what-is",
                    title: translateToString(t("pi.blockchain.what_is.title")),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.blockchain.what_is.subtitle'))}</h3>
                                <div className="space-y-4 text-gray-300">
                                    {(t('pi.blockchain.what_is.description') as string[]).map((paragraph, index) => (
                                        <p key={index}>{translateToString(paragraph)}</p>
                                    ))}

                                    <p className="text-blue-400 hover:text-blue-300">
                                        <a href="https://minepi.com/white-paper/" target="_blank" rel="noopener noreferrer">
                                            {translateToString(t('pi.blockchain.what_is.learn_more'))}
                                        </a>
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.blockchain.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.blockchain.history.items') as string[]).map((item, index) => (
                                            <li key={index}>• {translateToString(item)}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.blockchain.ongoing.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.blockchain.ongoing.items') as string[]).map((item, index) => (
                                            <li key={index}>• {translateToString(item)}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.blockchain.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: "node",
                    title: translateToString(t("pi.node.title")),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.node.subtitle'))}</h3>

                                <div className="space-y-4 text-gray-300">
                                    {Array.isArray(t('pi.node.description'))
                                        ? (t('pi.node.description') as (string | TranslationValue)[]).map((paragraph: string | TranslationValue, index: number) => (
                                            <p key={index}>{translateToString(paragraph)}</p>
                                        ))
                                        : <p>{translateToString(t('pi.node.description'))}</p>
                                    }
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.node.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {Array.isArray(t('pi.node.history.items'))
                                            ? (t('pi.node.history.items') as (string | TranslationValue)[]).map((item: string | TranslationValue, index: number) => (
                                                <li key={index}>• {translateToString(item)}</li>
                                            ))
                                            : <li>• {translateToString(t('pi.node.history.items'))}</li>
                                        }
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.node.features.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.node.features.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.node.ongoing.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.node.ongoing.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.node.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: "kyc",
                    title: t("pi.kyc.title"),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.kyc.subtitle'))}</h3>

                                <div className="space-y-4 text-gray-300">
                                    {(t('pi.kyc.description') as string[]).map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}

                                    <p className="text-blue-400 hover:text-blue-300">
                                        <a href="https://minepi.com/blog/pi-network-kyc/" target="_blank" rel="noopener noreferrer">
                                            {translateToString(t('pi.kyc.learn_more'))}
                                        </a>
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.kyc.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.kyc.history.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.kyc.features.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.kyc.features.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.kyc.ongoing.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.kyc.ongoing.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.kyc.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: "token-model",
                    title: t("pi.token.title"),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.token.subtitle'))}</h3>

                                <div className="space-y-4 text-gray-300">
                                    {(t('pi.token.description') as string[]).map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.token.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.token.history.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.token.ongoing.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.token.ongoing.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.token.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: "pi-wallet",
                    title: t("pi.wallet.title"),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.wallet.subtitle'))}</h3>

                                <div className="space-y-4 text-gray-300">
                                    {(t('pi.wallet.description') as string[]).map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}

                                    <p className="text-blue-400 hover:text-blue-300">
                                        <a href="https://minepi.com/faqs/how-do-we-create-and-use-the-pi-wallet-and-can-we-use-an-external-wallet-to-hold-our-pi-in-the-future/"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            {translateToString(t('pi.wallet.learn_more'))}
                                        </a>
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.wallet.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.wallet.history.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.wallet.ongoing.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.wallet.ongoing.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.wallet.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    id: "block-explorer",
                    title: t("pi.explorer.title"),
                    content: (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 text-white">{translateToString(t('pi.explorer.subtitle'))}</h3>

                                <div className="space-y-4 text-gray-300">
                                    {(t('pi.explorer.description') as string[]).map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.explorer.history.title'))}</h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {(t('pi.explorer.history.items') as string[]).map((item, index) => (
                                            <li key={index}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4 text-blue-400">
                                    <p>{translateToString(t('pi.explorer.future'))}</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            id: "util-bonus",
            title: t("pi.util.title"),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.util.required.title'))}</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {Array.isArray(t('pi.util.required.items'))
                                        ? (t('pi.util.required.items') as Array<string | { text: string, warning: string }>).map((item, index) => (
                                            <li key={index}>
                                                • {typeof item === 'string'
                                                    ? item
                                                    : (
                                                        <>
                                                            {item.text}<br />
                                                            <span className="text-yellow-500 ml-4">⚠️ {item.warning}</span>
                                                        </>
                                                    )
                                                }
                                            </li>
                                        ))
                                        : null
                                    }
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.util.caution.title'))}</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {Array.isArray(t('pi.util.caution.items'))
                                        ? (t('pi.util.caution.items') as (string | TranslationValue)[]).map((item: string | TranslationValue, index: number) => (
                                            <li key={index}>• {translateToString(item)}</li>
                                        ))
                                        : <li>• {translateToString(t('pi.util.caution.items'))}</li>
                                    }
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.util.additional.title'))}</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {Array.isArray(t('pi.util.additional.items'))
                                        ? (t('pi.util.additional.items') as (string | TranslationValue)[]).map((item: string | TranslationValue, index: number) => (
                                            <li key={index}>• {translateToString(item)}</li>
                                        ))
                                        : <li>• {translateToString(t('pi.util.additional.items'))}</li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "node-detail-info",
            title: t("pi.node_detail.title"),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="space-y-6">
                            {[
                                { title: 'basic', icon: '•' },
                                { title: 'operation', icon: '•' },
                                { title: 'technical', icon: '•' },
                                { title: 'hardware', icon: '•' },
                                { title: 'caution', icon: '•' },
                                { title: 'additional', icon: '•' }
                            ].map(section => (
                                <div key={section.title}>
                                    <h4 className="text-lg font-bold mb-4 text-white">
                                        {translateToString(t(`pi.node_detail.${section.title}.title`))}
                                    </h4>
                                    <ul className="space-y-3 text-gray-300">
                                        {Array.isArray(t(`pi.node_detail.${section.title}.items`))
                                            ? (t(`pi.node_detail.${section.title}.items`) as Array<string | { text: string, isWarning?: boolean, isDanger?: boolean, isNote?: boolean }>).map((item, index) => (
                                                <li key={index}>
                                                    {typeof item === 'object' ? (
                                                        <>
                                                            • {item.text}
                                                            {item.isDanger && <span className="text-red-500 ml-2">🚫</span>}
                                                            {item.isWarning && <span className="text-yellow-500 ml-2">⚠️</span>}
                                                            {item.isNote && <span className="text-blue-400 ml-2">ℹ️</span>}
                                                        </>
                                                    ) : (
                                                        <>• {item}</>
                                                    )}
                                                </li>
                                            ))
                                            : <li>• {translateToString(t(`pi.node_detail.${section.title}.items`))}</li>
                                        }
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "node-install",
            title: t("pi.node_install.title"),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">
                                    {translateToString(t('pi.node_install.requirements.title'))}
                                </h4>
                                <p className="text-gray-300">
                                    • {translateToString(t('pi.node_install.requirements.content'))} ⚠️
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.node_install.steps.title'))}</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {Array.isArray(t('pi.node_install.steps.items'))
                                        ? (t('pi.node_install.steps.items') as Array<string | { text: string, hasCheckmark?: boolean, hasLineBreak?: boolean }>).map((item, index) => (
                                            <li key={index}>
                                                • {typeof item === 'object' ? (
                                                    <>
                                                        {item.text.split('\n').map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line}
                                                                {item.hasCheckmark && line.includes('✔️') && <span className="text-green-500 ml-2">✔️</span>}
                                                                {item.hasLineBreak && i < item.text.split('\n').length - 1 && <br />}
                                                            </React.Fragment>
                                                        ))}
                                                    </>
                                                ) : (
                                                    item
                                                )}
                                            </li>
                                        ))
                                        : <li>• {translateToString(t('pi.node_install.steps.items'))}</li>
                                    }
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold mb-4 text-white">{translateToString(t('pi.node_install.additional.title'))}</h4>
                                <ul className="space-y-3 text-gray-300">
                                    {Array.isArray(t('pi.node_install.additional.items'))
                                        ? (t('pi.node_install.additional.items') as (string | TranslationValue)[]).map((item: string | TranslationValue, index: number) => (
                                            <li key={index}>• {translateToString(item)}</li>
                                        ))
                                        : <li>• {translateToString(t('pi.node_install.additional.items'))}</li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "fireside",
            title: t("pi.fireside.title"),
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="space-y-6">
                            {[
                                'purpose',
                                'fire',
                                'token',
                                'duration'
                            ].map(section => (
                                <div key={section}>
                                    <h4 className="text-lg font-bold mb-4 text-white">
                                        {translateToString(t(`pi.fireside.${section}.title`))}
                                    </h4>
                                    <div className="text-gray-300">
                                        <p>
                                            • {translateToString(t(`pi.fireside.${section}.content`))}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                        <h2 className="text-2xl font-bold">{translateToString(t('pi.toc'))}</h2>
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
                            <h2 className="text-2xl font-bold mb-4 md:mb-6 hidden md:block">{translateToString(t('pi.toc'))}</h2>
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
                                            {translateToString(section.title)}
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
                                                        {translateToString(subsection.title)}
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
                                        {translateToString(selectedContent.title)}
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