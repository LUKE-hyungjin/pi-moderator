'use client';

//import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Link as I18nLink } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Store, Receipt, ArrowRight, Phone, Mail, MapPin, Users, Clock, BookMarked, Landmark, BarChart, FileText, Building, Wallet } from 'lucide-react';

export default function ServicePage() {
    //const t = useTranslations('Map'); // 기존의 번역 키 재사용
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'education';

    // 서비스 타입별 데이터
    const serviceData = {
        education: {
            title: '파이코인 교육 서비스',
            subtitle: '파이코인 생태계에 대한 전문 교육을 제공합니다',
            description: '파이코인의 기본 개념부터 고급 사용법까지, 각 수준에 맞는 교육 프로그램을 제공합니다. 초보자도 쉽게 이해할 수 있는 교육 자료와 전문가들의 지도를 만나보세요.',
            icon: <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />,
            color: 'blue',
            mainImage: '/images/education_service.jpg',
            features: [
                {
                    title: '기초 교육',
                    description: '파이코인의 기본 개념과 용어를 학습하는 초보자를 위한 과정입니다.',
                    icon: <BookMarked className="h-8 w-8 text-blue-500" />
                },
                {
                    title: '중급 과정',
                    description: '파이코인 생태계의 핵심 기능과 활용법을 배우는 심화 과정입니다.',
                    icon: <Users className="h-8 w-8 text-blue-500" />
                },
                {
                    title: '전문가 과정',
                    description: '파이코인 개발 및 사업화에 관한 전문 지식을 제공하는 고급 과정입니다.',
                    icon: <BarChart className="h-8 w-8 text-blue-500" />
                }
            ],
            items: [
                {
                    title: '온라인 강의',
                    description: '전문 강사와 함께하는 라이브 강의',
                    image: '/images/online_course.jpg',
                    price: '무료 ~ 30,000원',
                    time: '주 2회, 60분'
                },
                {
                    title: '1:1 맞춤 컨설팅',
                    description: '개인별 상황에 맞는 파이코인 활용 전략',
                    image: '/images/consulting.jpg',
                    price: '50,000원부터',
                    time: '예약제, 90분'
                },
                {
                    title: '워크샵',
                    description: '실습 중심의 그룹 학습 프로그램',
                    image: '/images/workshop.jpg',
                    price: '100,000원',
                    time: '월 1회, 3시간'
                }
            ]
        },
        exchange: {
            title: '파이코인 중개 서비스',
            subtitle: '안전하고 신뢰할 수 있는 파이코인 거래를 지원합니다',
            description: '검증된 파트너와 함께 안전한 파이코인 거래를 경험하세요. 투명한 거래 시스템과 철저한 보안으로 여러분의 자산을 보호합니다.',
            icon: <Store className="h-16 w-16 text-pink-600 dark:text-pink-400" />,
            color: 'pink',
            mainImage: '/images/exchange_service.jpg',
            features: [
                {
                    title: '안전한 거래',
                    description: '검증된 중개인과 에스크로 서비스를 통한 안전한 거래를 보장합니다.',
                    icon: <Landmark className="h-8 w-8 text-pink-500" />
                },
                {
                    title: '투명한 수수료',
                    description: '모든 거래 수수료가 명확하게 공개되어 있어 추가 비용 걱정이 없습니다.',
                    icon: <Wallet className="h-8 w-8 text-pink-500" />
                },
                {
                    title: '빠른 처리',
                    description: '거래 신청 후 최대 24시간 이내에 처리되는 신속한 서비스를 제공합니다.',
                    icon: <Clock className="h-8 w-8 text-pink-500" />
                }
            ],
            items: [
                {
                    title: 'P2P 거래',
                    description: '개인 간 직접 거래 중개 서비스',
                    image: '/images/p2p_trade.jpg',
                    price: '거래금액의 1%',
                    time: '24시간 내 처리'
                },
                {
                    title: '대량 거래',
                    description: '기업 및 단체를 위한 대량 거래 서비스',
                    image: '/images/bulk_trade.jpg',
                    price: '협의 가능',
                    time: '예약제'
                },
                {
                    title: '정기 거래',
                    description: '정기적인 거래를 위한 구독 서비스',
                    image: '/images/regular_trade.jpg',
                    price: '거래금액의 0.8%',
                    time: '월 1회'
                }
            ]
        },
        tax: {
            title: '파이코인 세금 서비스',
            subtitle: '파이코인 관련 세금 신고 및 상담을 도와드립니다',
            description: '파이코인 거래와 관련된 세금 문제를 전문가와 함께 해결하세요. 복잡한 가상자산 세금 규정에 대한 정확한 정보와 개인 맞춤형 솔루션을 제공합니다.',
            icon: <Receipt className="h-16 w-16 text-green-600 dark:text-green-400" />,
            color: 'green',
            mainImage: '/images/tax_service.jpg',
            features: [
                {
                    title: '세금 상담',
                    description: '파이코인 관련 소득세, 양도세 등 세금 문제에 대한 전문 상담을 제공합니다.',
                    icon: <FileText className="h-8 w-8 text-green-500" />
                },
                {
                    title: '신고 대행',
                    description: '파이코인 거래에 따른 세금 신고를 대행해 드립니다.',
                    icon: <Building className="h-8 w-8 text-green-500" />
                },
                {
                    title: '절세 전략',
                    description: '합법적인 범위 내에서 세금 부담을 최소화하는 전략을 제시합니다.',
                    icon: <Wallet className="h-8 w-8 text-green-500" />
                }
            ],
            items: [
                {
                    title: '기본 상담',
                    description: '파이코인 과세 관련 기본 상담',
                    image: '/images/basic_tax_consult.jpg',
                    price: '30,000원',
                    time: '30분'
                },
                {
                    title: '종합 컨설팅',
                    description: '개인 상황에 맞는 세금 전략 수립',
                    image: '/images/tax_consulting.jpg',
                    price: '100,000원부터',
                    time: '90분'
                },
                {
                    title: '신고 대행',
                    description: '파이코인 거래 소득 신고 대행',
                    image: '/images/tax_filing.jpg',
                    price: '150,000원부터',
                    time: '상담 후 결정'
                }
            ]
        }
    };

    // 현재 타입에 해당하는 서비스 데이터
    const currentService = serviceData[type as keyof typeof serviceData] || serviceData.education;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black">
            {/* 헤더 섹션 */}
            <section className="w-full bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-black pt-16 pb-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className={`inline-flex items-center justify-center p-3 rounded-full bg-${currentService.color}-100 dark:bg-${currentService.color}-900/30`}>
                                {currentService.icon}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                                {currentService.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                {currentService.subtitle}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
                                {currentService.description}
                            </p>
                            <div className="pt-4">
                                <Button
                                    className={`bg-${currentService.color}-600 hover:bg-${currentService.color}-700 text-white rounded-full px-8 py-2 h-auto`}
                                >
                                    지금 문의하기 <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent dark:from-white/5 dark:to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-white/10 z-10"></div>
                            <Image
                                src={currentService.mainImage || '/images/service_default.jpg'}
                                alt={currentService.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover brightness-[1.02] dark:brightness-110 contrast-[1.02] dark:contrast-110"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 서비스 내비게이션 */}
            <section className="bg-white dark:bg-zinc-900 border-y border-gray-200 dark:border-zinc-800 sticky top-[73px] z-10">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue={type} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-transparent">
                            <I18nLink href="/service?type=education" className="w-full">
                                <TabsTrigger
                                    value="education"
                                    className={`w-full py-3 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500`}
                                >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    교육
                                </TabsTrigger>
                            </I18nLink>
                            <I18nLink href="/service?type=exchange" className="w-full">
                                <TabsTrigger
                                    value="exchange"
                                    className={`w-full py-3 data-[state=active]:bg-pink-50 dark:data-[state=active]:bg-pink-900/20 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500`}
                                >
                                    <Store className="h-4 w-4 mr-2" />
                                    중개
                                </TabsTrigger>
                            </I18nLink>
                            <I18nLink href="/service?type=tax" className="w-full">
                                <TabsTrigger
                                    value="tax"
                                    className={`w-full py-3 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500`}
                                >
                                    <Receipt className="h-4 w-4 mr-2" />
                                    세금
                                </TabsTrigger>
                            </I18nLink>
                        </TabsList>
                    </Tabs>
                </div>
            </section>

            {/* 핵심 기능 */}
            <section className="py-16 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        {currentService.title} 핵심 기능
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {currentService.features.map((feature, index) => (
                            <Card key={index} className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className={`inline-flex items-center justify-center p-2 rounded-lg bg-${currentService.color}-100 dark:bg-${currentService.color}-900/30 mb-4`}>
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 서비스 항목 */}
            <section className="py-16 bg-gray-50 dark:bg-black">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        제공 서비스
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {currentService.items.map((item, index) => (
                            <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700">
                                <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 dark:from-black/50 dark:via-transparent pointer-events-none"></div>
                                    <Image
                                        src={item.image || `/images/service_${index + 1}.jpg`}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300 brightness-100 dark:brightness-110 contrast-100 dark:contrast-110"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Wallet className="h-4 w-4" />
                                        <span>{item.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        <span>{item.time}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className={`text-${currentService.color}-600 border-${currentService.color}-300 hover:bg-${currentService.color}-50 dark:hover:bg-${currentService.color}-900/20 w-full`}>
                                        자세히 보기
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 문의 섹션 */}
            <section className="py-16 bg-zinc-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {currentService.title}에 대해 궁금한 점이 있으신가요?
                        </h2>
                        <p className="text-gray-300">
                            전문 상담사가 친절하게 답변해 드립니다. 편하신 방법으로 문의해주세요.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
                            <Button className={`flex items-center gap-2 bg-${currentService.color}-600 hover:bg-${currentService.color}-700 text-white`}>
                                <Phone className="h-4 w-4" />
                                전화 문의
                            </Button>
                            <Button className={`flex items-center gap-2 bg-${currentService.color}-600 hover:bg-${currentService.color}-700 text-white`}>
                                <Mail className="h-4 w-4" />
                                이메일 문의
                            </Button>
                            <Button className={`flex items-center gap-2 bg-${currentService.color}-600 hover:bg-${currentService.color}-700 text-white`}>
                                <MapPin className="h-4 w-4" />
                                오시는 길
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
} 