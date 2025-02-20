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
        <div class="space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-4 text-white">[가입 첫날]</h3>
                <ol class="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                    <li>파이 네트워크 앱 & 브라우져 설치</li>
                    <li>파이 네트워크 가입</li>
                    <li>전화번호 인증</li>
                    <li>이름검토</li>
                    <li>이메일 주소 확인</li>
                    <li>PI 브라우져를 통해 지갑생성</li>
                    <li>락업설정 및 체크 리스트 확인</li>
                    <li>노드 설치(선택 . 필수❌)</li>
                </ol>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-4 text-white">[3일 후]</h3>
                <ol class="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                    <li>보안써클 활성화(방패)</li>
                </ol>
                <p class="mt-2 text-yellow-500">⚠ 번개(채굴) 버튼 3회 누른 이후 가능</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-4 text-white">[N일 후]</h3>
                <ol class="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                    <li>KYC 진행</li>
                </ol>
                <div class="mt-2 space-y-2 text-yellow-500">
                    <p>⚠ '22.07.25 현재 랜덤으로 KYC가 진행되고 있음으로 언제 나의 차례가 올지는 알 수 없음</p>
                    <p>⚠ 신분증이 오래된 경우 반드시 새로 만들어 둘 것을 권유 드립니다.</p>
                    <p>(KYC 신청 시 신분증 추천 순서 : 여권->민증->면허증)</p>
                </div>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-4 text-white">[주기적]</h3>
                <ol class="list-decimal list-inside space-y-2 ml-4 text-gray-300">
                    <li>앱에서 채굴한 파이 메인넷 지갑으로 전송</li>
                </ol>
                <div class="mt-4 space-y-2">
                    <div class="text-gray-300">
                        <p>▫ 1차 : KYC 통과 후, 가능</p>
                        <ul class="list-inside space-y-1 ml-4">
                            <li>✔ 마이그레이션(잔액이전) 신청</li>
                            <li>✔ 사용가능 잔액 만들기</li>
                        </ul>
                    </div>
                    <p class="text-gray-300">▫ N차 : 아직 주기가 정해지지 않았음</p>
                </div>
            </div>

            <div class="bg-red-900/50 p-4 rounded-lg mt-6">
                <p class="text-red-400">⛔ 댓글 금지</p>
                <p class="text-yellow-500">⚠ 댓글은 Q&A 게시판을 이용해주세요.</p>
            </div>
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
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">1️⃣ 블록체인</h3>
                        <div class="space-y-4 text-gray-300">
                            <p>Pi 블록체인은 모든 Pi 거래를 기록하는 에너지 효율적인 분산 원장으로, 앱 사용, 상품 및 서비스에 대한 Pi의 안전하고 검증 가능한 교환을 가능하게 합니다.</p>
                            
                            <p>Pi 블록체인은 전체 생태계의 중추 역할을 하며 안전한 거래를 위한 인프라와 Web3 개발을 위한 플랫폼을 제공합니다. 블록체인은 현재 메인넷의 폐쇄형 네트워크 기간에 있습니다. 이는 메인넷 블록체인이 활성화되어 있지만 다른 블록체인이나 거래소와의 외부 연결을 방지하는 방화벽이 있음을 의미합니다.</p>
                            
                            <p>Federated Byzantine Agreement를 사용하여 SCP(Stellar Consensus Protocol)에서 채택된 Pi 블록체인을 사용하면 장치를 통해 많은 수의 개인이 프로토콜 수준에 기여할 수 있습니다. 이러한 참여는 데스크톱 노드와 모바일 앱의 일일 Security Circle 확인을 통해 촉진됩니다. 그 대가로 참가자는 Pi의 능력주의 채굴 메커니즘을 통해 보상을 받습니다.</p>
                            
                            <p>Pi 블록체인의 고유한 기여는 분산 시스템에 전력을 공급하는 수만 개의 컴퓨터 노드와 보안을 강화하는 Trust Graph의 수천만 명의실제 인간에 있습니다. 작업 증명처럼 중복 해시에 에너지를 소비하는 대신 Pi의 합의 알고리즘은 노드 간 비용 효율적인 투표에 의존하여 신뢰 그래프에서 신뢰도가 높은 사람들의 투표 의견을 우선시합니다.</p>
                            
                            <p class="text-blue-400 hover:text-blue-300">
                                <a href="https://minepi.com/white-paper/" target="_blank" rel="noopener noreferrer">더 알아보기 minepi.com/white-paper/</a>
                            </p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• Testnet Pi 블록체인은 2020년 3월 14일에 출시되어 네트워크의 두 번째 단계인 Testnet 단계를 시작했습니다.</li>
                                <li>• Testnet의 안정성, 확장성 및 트랜잭션에 대한 지속적인 테스트입니다.</li>
                                <li>• Enclosed Mainnet Pi 블록체인은 2021년 12월 28일에 출시되어 Mainnet 단계의 Enclosed 기간이 시작되었습니다.</li>
                                <li>• 2021년 6월 10일에 출시된 타사 앱 개발 플랫폼을 통해 개발자는 SDK API 호출을 통해 블록체인과 상호 작용할 수 있습니다.</li>
                                <li>• 파이오니어가 Pi를 메인넷 지갑으로 마이그레이션하는 기능은 2022년 6월 28일에 시작되어 동봉된 메인넷 기간 내에 Pi를 사용할 수 있게 되었습니다.</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">진행중</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 네트워크가 부트스트래핑하고 유틸리티를 생성하는 동안 건강하고 원활한 생태계를 계속 지원하고 네트워크와의 장기적인 참여를 장려하기 위해 메인넷 마이그레이션 후 Pi 잠금을 구현합니다.</li>
                                <li>• 안정성과 100% 가동 시간을 보장합니다.</li>
                                <li>• 폐쇄형 네트워크 기간 동안 메인넷 마이그레이션 및 생태계 트랜잭션을 지원하고 최적화합니다.</li>
                                <li>• 유틸리티를 더 잘 지원할 수 있는 새로운 블록체인 기능에 대한 연구 및 설계.</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
            {
                id: "node",
                title: "2) 노드",
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">2️⃣ 노드</h3>
                        
                        <div class="space-y-4 text-gray-300">
                            <p>Pi 노드를 사용하면 개척자들은 컴퓨터에서 사용자 친화적인 방식으로 블록체인을 실행하여 네트워크 보안에 기여하고 데스크톱 애플리케이션에서 대부분의 Pi 모바일 앱 기능에 액세스할 수 있습니다.</p>
                            
                            <p>노드는 블록체인을 실행하여 Pi 생태계에서 필수적인 분산 역할을 수행하고, 분산 원장의 합의 구축 프로세스는 물론 트랜잭션의 보안 및 검증에 기여합니다. 노트북과 데스크탑에서 실행되도록 설계되었습니다.</p>
                            
                            <p>적극적이고 안정적인 서비스를 장려하기 위해 노드를 운영하는 개척자는 합의에 대한 기여도와 안정성, 신뢰성에 따라 채굴 속도를 높이는 보상을 받습니다.</p>
                            
                            <p>Pi 노드는 특히 Pi 애플리케이션에 대한 사용자 친화적인 접근성을 제공하여 사람들이 네트워크에서 사용할 수 있는 장치의 범위를 넓힙니다. 이는 또한 미래에 네트워크가 프로토콜 계층 애플리케이션을 가질 수 있는 잠재력을 창출합니다.</p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 2020년 3월 31일에 Pi 애플리케이션을 실행하기 위해 컴퓨터에 다운로드하고 설치할 수 있는 Node 소프트웨어의 첫 번째 릴리스</li>
                                <li>• 다운로드 가능한 Pi 노드의 두 번째 릴리스에는 합의 알고리즘 실행을 준비하기 위해 개별 노드를 설치하는 데 필요한 기술 준비 단계가 포함</li>
                                <li>• 2020년 9월 실제로 블록체인(테스트넷)을 실행하는 새로운 노드 버전이 출시</li>
                                <li>• 2020년 말까지 500개 이상의 활성 테스트넷 노드, Pi Day 2022까지 10,000개 이상. 현재 노드 애플리케이션을 통해 활성화되는 노드는 100,000개가 넘음</li>
                                <li>• 2021년 12월 백서 업데이트에 설명된 새로운 채굴 메커니즘을 기반으로 2022년 3월 14일 Pi 노드 운영에 대한 새로운 채굴 보상을 출시</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">주요 기능</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 커뮤니티 노드 운영자가 포트 확인과 같은 노드 배포를 테스트할 수 있는 기능</li>
                                <li>• Pi Node 데스크톱 앱(노드 프런트엔드)의 자동 업데이트 기능</li>
                                <li>• Pi 블록체인의 합의 프로토콜(노드 백엔드 컨테이너) 버전을 업그레이드하는 기능</li>
                                <li>• 개별 노드 운영자가 사용되지 않은 로컬 기록 블록체인 상태 데이터를 제거하여 로컬 디스크 공간을 회수하는 동시에 네트워크는 충분한 중복성을 통해 기록 데이터를 유지하는 기능</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">진행중</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 무한 스피너가 발생하는 사례, 성능에서 마이닝 부스트 연결 끊김, Docker 호환성 문제 등을 포함하여 커뮤니티에서 보고된 버그를 조사하고 수정</li>
                                <li>• 노드 문제를 더 효과적으로 표면화하기 위해 고급 분석 인프라를 개발</li>
                                <li>• 노드 보너스를 개선하고 보정</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
            {
                id: "kyc",
                title: "3) KYC",
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">3️⃣ KYC</h3>
                        
                        <div class="space-y-4 text-gray-300">
                            <p>Pi KYC 또는 "고객 파악"은 Pioneer 신원을 식별 및 확인하고, 규정을 준수하며 Pi 생태계 내의 개척자가 실제 개인인지 확인하는 절차입니다.</p>
                            
                            <p>KYC는 (1) 규정을 준수하고 (2) 메인넷 P2P 상호 작용이 실제로 이루어지고 책임이 있는지 확인하기 위해 Pioneer 신원을 확인합니다. 1인 1계정이라는 Pi 네트워크의 엄격한 정책은 네트워크 구성원이 진짜 인간인지 확인하기 위해 높은 정확도를 요구하며, 개인이 부당하게 가짜 계정을 만들어 Pi를 사재기하는 것을 방지합니다.</p>
                            
                            <p>KYC 통과는 파이오니어가 Pi 마이닝 앱에서 메인넷 블록체인으로 Pi 잔액을 마이그레이션하기 위한 전제 조건입니다.</p>
                            
                            <p>Pi KYC 솔루션의 혁신은 개인 정보를 보호하면서 기본 분산형 설계를 통해 확장성과 효율성을 달성하는 것입니다. 기계 자동화를 사용하여 커뮤니티 자체의 힘을 활용하는 Pi KYC 솔루션은 모든 개척자에게 법정화폐 비용이 없으며 Pi에서 노동력이 교환되고 생태계를 위해 Pi 암호화폐의 유틸리티가 생성됩니다.</p>
                            
                            <p class="text-blue-400 hover:text-blue-300">
                                <a href="https://minepi.com/blog/pi-network-kyc/" target="_blank" rel="noopener noreferrer">자세히 알아보기 minepi.com/blog/pi-network-kyc/</a>
                            </p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 2021년부터 2022년 초까지 Pi KYC 솔루션을 설계, 개발 및 테스트</li>
                                <li>• 2022년 6월에 대부분의 네트워크에 Scalable Pi KYC 솔루션 출시</li>
                                <li>• 출시 후 첫 달 이내에 100만 개의 파이오니어 신청서가 제출, 검증 및 검증</li>
                                <li>• 2023년 3월: 임시 KYC 프로그램을 통해 모든 적격 개척자에게 KYC 신청 공개</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">현재 구현된 기능</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 인간 검증인의 작업 품질을 분석하고 평가하는 시스템</li>
                                <li>• 여러 이미지가 포함된 문서나 유명 캐릭터의 사진이 포함된 문서 등 특수한 경우 처리</li>
                                <li>• KYC 퍼널을 지속적으로 간소화하여 버그나 기술적인 방해 요소 해결</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">진행중</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 검증인 등급 시스템의 고급 버전 개발</li>
                                <li>• 데이터 필드가 누락된 KYC 애플리케이션의 차단 해제 솔루션</li>
                                <li>• 임시 KYC 사례 등에 대한 검증인 검토 확장</li>
                                <li>• Pioneers의 거부 사유 이의제기 및 분류 시스템 구축</li>
                                <li>• UX 개선 및 온보딩 프로세스 간소화</li>
                                <li>• KYC 분석 파이프라인 개선</li>
                                <li>• 임시 KYC 사례 처리를 위한 추가 검사 구축</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
            {
                id: "token-model",
                title: "4) 토큰모델 및 채굴 매커니즘",
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">4️⃣ 토큰모델 및 채굴 매커니즘</h3>
                        
                        <div class="space-y-4 text-gray-300">
                            <p>Pi 토큰 모델 및 채굴 메커니즘은 보안, 성장, 포용, 유틸리티 생성, 안정성 및 수명 등과 같이 진화하는 네트워크 요구에 대한 기여를 식별하고 보상하기 위한 주요 프레임워크입니다.</p>
                            
                            <p>토큰 모델은 암호화폐 네트워크의 핵심 기반입니다. Pi Network가 네트워크 로드맵의 다양한 단계, 즉 베타 단계, 테스트넷 단계, 메인넷 단계(정확히 말하면 현재 메인넷 단계의 폐쇄형 네트워크 기간)를 진행하면서 네트워크의 다양한 요구 사항이 상대적으로 중요하게 진화했습니다.</p>
                            
                            <p>Pi의 토큰 모델과 채굴 메커니즘은 이러한 변화하는 요구 사항을 해결하고 네트워크가 의존하는 점점 더 다양한 형태의 기여를 장려하기 위해 그에 따라 발전했습니다. 특히 Pi 채굴 메커니즘은 이러한 기여를 능력주의적이고 공식적인 방식으로 보상합니다. Pi 보상은 토큰 공급 모델을 기반으로 Pi 블록체인에서 생성됩니다.</p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 시스템 전체의 기본 채굴 속도는 3.1415926 Pi/h에서 시작하여 참여 개척자 네트워크의 크기가 개척자 1000명에서 시작하여 10배 증가할 때마다 절반으로 줄었습니다. 시스템 전체의 기본 채굴 비율 변경을 위한 이 반감기 기반 시스템은 2022년 3월 1일까지 유효했습니다.</li>
                                <li>• 원래 채굴 메커니즘은 베타 및 테스트넷 단계와 폐쇄형 메인넷 기간 초기(2022년 3월 14일까지) 동안 네트워크의 성장, 배포 및 보안을 지원하기 위해 유효하게 유지되었습니다.</li>
                                <li>• 토큰 공급 모델의 설계와 보상 발행을 위한 동적 기본 채굴 비율을 기반으로 한 새로운 채굴 메커니즘은 2021년 12월 백서에 발표되었습니다.</li>
                                <li>• 2022년 3월 1일에 특정 보상 발행 공식이 출시되었으며, 이는 공급 한도에 따라 시스템 전반의 기본 채굴 비율을 매월 조정합니다.</li>
                                <li>• Pi 잠금, 앱 사용 및 노드 운영과 같이 보다 다양한 유형의 기여를 강화하는 새로운 마이닝 메커니즘이 2022년 3월 14일에 발효되었습니다.</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">진행중</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 2021년 12월 백서에 설정된 네트워크 목표 달성과 관련하여 월별 기본 채굴 속도 조정 및 채굴 메커니즘에 대한 지속적인 모니터링, 분석 및 평가입니다.</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
            {
                id: "pi-wallet",
                title: "5) 파이지갑",
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">5️⃣ 파이지갑</h3>
                        
                        <div class="space-y-4 text-gray-300">
                            <p>Pi Wallet은 현재 Pi와 Test-Pi만 암호화폐를 보관하고 전송하는 비수탁형 암호화폐 지갑으로, 안전하고 편리한 P2P 거래와 Pi Apps의 원활한 결제 경험 통합을 가능하게 합니다.</p>
                            
                            <p>간소화되고 분산된 Web3 생태계를 촉진하려는 Pi Network의 목표에 따라 Pi Wallet은 Pi 브라우저 앱 내 Pioneers의 사용자 경험에 직접 통합됩니다. 이를 통해 Pi 결제 피어 투 피어(P2P) 및 Pi 앱과 기존 비즈니스 전반에 걸쳐 더 쉽게 Pioneer가 Pi 블록체인에서 원활하게 거래할 수 있습니다.</p>
                            
                            <p>Pi Wallet은 또한 Pi Testnet에 대한 테스트를 지원하고 Pioneers가 Pi 암호화폐 마이그레이션 및 잠금을 관리할 수 있도록 지원합니다. 지갑의 비수탁형 설계는 보안과 분산화된 자기 주권에 대한 네트워크의 약속을 강조하며 다른 누구도 다른 사본을 갖고 있지 않기 때문에 개척자들은 고유한 암호를 보호해야 합니다.</p>
                            
                            <p>메인넷 지갑에 액세스하려면 KYC 인증이 필요하며, 이는 실제 인간이 책임 있는 블록체인 사용에 중점을 두는 Pi Network의 목표와 일치합니다.</p>
                            
                            <p class="text-blue-400 hover:text-blue-300">
                                <a href="https://minepi.com/faqs/how-do-we-create-and-use-the-pi-wallet-and-can-we-use-an-external-wallet-to-hold-our-pi-in-the-future/" target="_blank" rel="noopener noreferrer">자세히 알아보기</a>
                            </p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 2021년 4월 1일: 테스트넷 지갑 출시</li>
                                <li>• 2022년 6월 28일: Mainnet Pi Wallets 및 마이그레이션 기능 출시</li>
                                <li>• App-to-Pioneer 결제 기능 추가로 양방향 거래 가능</li>
                                <li>• Pi Apps용 두 가지 개발자 지갑 개발: 다중 서명 지갑과 표준 지갑</li>
                                <li>• 사용자 인터페이스 대폭 개선</li>
                                <li>• 오프체인 메모, 거래 기록, QR 코드 기능 등 추가 기능 구현</li>
                                <li>• 전 세계적 P2P Pi 거래 지원으로 Pi Commerce 프로그램 영감 제공</li>
                            </ul>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">진행중</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• Pi 앱 내 지갑의 보안 기능 강화</li>
                                <li>• 다양한 Pi 앱에 더 쉽게 통합할 수 있도록 Pi Wallet 백엔드 확장</li>
                                <li>• 메인넷 마이그레이션 후 Pi 잠금 구현</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
            {
                id: "block-explorer",
                title: "6) 블록탐색기",
                content: `
                <div class="space-y-6">
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="text-xl font-bold mb-4 text-white">6️⃣ 블록탐색기</h3>
                        
                        <div class="space-y-4 text-gray-300">
                            <p>Pi Network BlockExplorer를 사용하면 개척자는 거래 내역 보기 등 Pi 메인넷 및 테스트넷 블록체인을 탐색할 수 있습니다.</p>
                            
                            <p>BlockExplorer를 사용하면 과거 결제를 찾아 조사하고 Pi 블록체인에서 발생한 거래 상태를 볼 수 있습니다. 이를 통해 Pioneers는 보낸 사람의 주소, 받는 사람의 주소, 금액, 수수료 등과 같은 거래 정보를 확인할 수 있습니다.</p>
                            
                            <p>BlockExplorer는 일반 웹 도구를 사용하는 모든 사람이 블록체인에 대한 가시성을 허용하고 블록체인 기술의 투명성과 분산화를 보여주는 중요한 도구입니다.</p>
                        </div>

                        <div class="mt-8">
                            <h4 class="text-lg font-bold mb-4 text-white">역사</h4>
                            <ul class="space-y-3 text-gray-300">
                                <li>• 2021년 10월 13일: BlockExplorer를 통해 탐색할 수 있는 테스트넷 블록체인으로 출시</li>
                                <li>• 2022년: Enclosed Mainnet 출시 이후 BlockExplorer에 메인넷 블록체인 추가</li>
                                <li>• 최초 출시 직후 통찰력 있는 네트워크 수준 데이터를 요약하는 네트워크 통계 항목 출시</li>
                            </ul>
                        </div>

                        <div class="mt-4 text-blue-400">
                            <p>➡️ [미래 파이프라인 출시 예정]</p>
                        </div>
                    </div>
                </div>
                `
            },
        ]
    },
    {
        id: "util-bonus",
        title: "3. 유틸 보너스 받는 방법",
        content: `
        <div class="space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-6 text-white">유틸리티 보너스 받는 방법</h3>
                
                <div class="space-y-6">
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">필수 활동 목록</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Wallet.pi 메뉴에서 테스트파이 보내기(5회정도)<br/>
                                <span class="text-yellow-500">⚠️</span> 반드시 지갑 테스트 방 이용</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Brainstorm.pi 에서 게임하거나 영상보기(각 메뉴별 5분 내외). read more 선택해서 들어가 링크로 해당 사이트 접속해서 보세요.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Chat.pi 채팅방 이용하기(눈팅만으로도 됨)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>mine.pi 로 파이앱 들어가서 여러 메뉴 둘러보기. 특히 백서 들어가서 보이는 링크들 하나씩 클릭 해보세요.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>blockchain.pi 메뉴 들어가서 둘러보기</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>kyc.pi 열번정도 들어가보기</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">주의사항</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⚠️</span>
                                <span>이렇게 꾸준히 하시면 0.8~9는 계속 받을 수 있습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⚠️</span>
                                <span>유틸보너스도 기간 누적 형태라 지속적으로 리워드를 쌓아 주셔야 합니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⚠️</span>
                                <span>제일 중요한건 파이브라우져에서 채팅 게임 등 해당 화면 그대로 두고 다른 앱으로 전환하지 마세요. 꼭 파이 브라우져 제일 처음 실행 했을 때 나오는 화면으로 빠져 나와서 종료해세요. 그리고 아무런 액션 없이 하나의 화면에 오래 머무르지도 마세요.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">추가 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">✴️</span>
                                <span>해커톤 앱에서 파이 지불은 정상적인 파이 지불과정 입니다. 향후 실제 파이 지불도 유사한 과정을 거치게 될 것입니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">✴️</span>
                                <span>글로 부족한 부분은 네이버나 다음에 파이유틸로 검색 해보시면 자료 많습니다.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `
    },
    {
        id: "node-info",
        title: "4. 노드 일반 정보",
        content: `
        <div class="space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-6 text-white">노드 일반 정보</h3>
                
                <div class="space-y-6">
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">기본 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>파이 노드는 PC 에 설치하는 프로그램 이며 설치 후 운영 시, 노드 보너스를 받을 수 있고 파이앱의 채굴 속도를 높이는 역할을 합니다. 쉽게 비교하지면 비트코인 채굴과 유사하다고 보시면 됩니다. 하지만 직접적인 코인을 주지는 않는다는 차이점이 있습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>24시간 운영해야 최대 보상을 받을 수 있으며 채굴 버튼1회(24시간 기준) 기간 동안 동일 보너스 속도가 적용됩니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>node.minepi.com/node 에서 OS에 맞는 파일 다운로드 후 설치, 노드 프로그램 실행 후 폰의 노드메뉴에서 PC의 노드프로그램 코드를 입력한다. (설치시에만 쓰는 1회성 코드임)</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">운영 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">⚠️</span>
                                <span>노드는 1계정 1노드가 원칙입니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>노드 보너스 1점 당 레퍼럴 4명에 해당합니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>노드 보너스는 설치 후 1~3일 내에 나오기 시작합니다. (번개버튼 터치 후 나오는 화면 제일 아래 부분의 node bonus 참조)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>현재는 노드설 설치하면 바로 테스트 노드로 선정됩니다. 오픈 메인넷 진행 시에 정식노드 선정 작업이 다시 진행 될 수도 있습니다.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">포트 및 기술 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>포트 오픈은 슈퍼노드 후보의 조건 중 하나이며, 오픈 없이 일반 노드로 운영해도 보너스를 받을 수 있습니다. 그러나 포트 오픈된 일반노드와 그렇지 않은 일반노드 사이의 보너스 차이는 있을 수 있습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>포트 오픈 체크 사이트: pi-mods.de/nodeports (Slow선택, scan 선택) / 정상: 포트 3개 오픈</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Incoming은 포트만 오픈된게 확인되면 언젠가는 들어옵니다. 가끔씩 0 으로 되는 경우도 있는데 기다리면 또 상승합니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Incoming 64는 사양으로 정해지는게 아닙니다. 낮은 사양에서도 나옵니다. 64는 랜덤으로 연결이 잘 된 케이스라고 보시면 됩니다.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">하드웨어 및 운영 요구사항</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>노드 사양은 CPU I5(9세대 이상), RAM 8G, SSD 256G 정도 이면 원활하게 돌아 갑니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>전기세는 노드 전용으로만 돌리고 그래픽카드 사용하지 않는다면 눈에 띄일 정도로 증가되지 않습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔹️</span>
                                <span>노드 보너스 공식에 기본 채굴률이 들어가 있어서 기본 채굴률 내려가면 노드 보너스도 함께 내려갑니다.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">주의사항</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-red-500 mr-2">🚫</span>
                                <span>노드 프로그램에서 로그아웃하면 폰에서 로그아웃한것과 동일하게 24시간 기준 채굴 한것 초기화 됩니다. 조심하세요.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>도커는 노드 운영에 문제 없다면 현재 설치된 버전을 유지 하시는 것을 추천 드립니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>노드는 아직 튜닝 중이라 컴퓨터 사양 등 보상 적용의 기준이 명확하지 않습니다. 이달 말정도면 튜닝 결과가 나올 것으로 예상합니다.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">추가 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>공인 IP 1개 기준으로 모뎀 또는 공유기 사용시 포트 오픈된 노드(슈퍼노드 후보) 1개와 다수의 일반노드(서로 다른 계정) 운영 이가능하나 다수의 일반노드는 리워드가 작을 수 있습니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>현재 노드는 테스트넷에 연결된 상태이며 일반노드/슈퍼노드의 구분은 없는 것으로 판단 됩니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">🔸️</span>
                                <span>Availability는 가용성인데 노드의 기여도라고 봐지며 노드보상과 관련이 있어야 맞는데 아직은 관련도가 불명확합니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">✴️</span>
                                <span>상세 설치방법은 다음(daum)에서 노드FAQ로 검색 해보시거나 네이버 까페에서 노드로 검색해보세요.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `
    },
    {
        id: "node-install",
        title: "5. 노드 설치 과정",
        content: `
        <div class="space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-6 text-white">노드 설치 과정</h3>
                
                <div class="space-y-6">
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white flex items-center">
                            <span class="text-yellow-500 mr-2">⚠️</span>
                            <span>기본 요구사항</span>
                        </h4>
                        <p class="text-gray-300 ml-6">윈도우 10 이상 설치, 최신 업데이트 완료, 바이오스에서 가상화 사용 체크 필수</p>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">설치 단계</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">0️⃣</span>
                                <span>node.minepi.com/node 에서 OS에 맞는 파일 다운로드 후 설치, 노드 프로그램 실행 후 폰의 노드메뉴에서 PC의 노드프로그램 코드를 입력한다(설치시에만 쓰는 1회성 코드임)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">1️⃣</span>
                                <span>설문조사 진행(완료 후, 왼쪽 상단 뒤로가기 버튼)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">2️⃣</span>
                                <span>Linux용 Windows 하위 시스템, 가상머신 플랫폼 기능켜기(명령어로도 가능)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">3️⃣</span>
                                <span>도커 + WSL 설치 진행(재부팅)<br/>
                                - docker.com/products/docker-desktop<br/>
                                - 도커 설치 후 실행 시, wsl_update_x64.msi 설치</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">4️⃣</span>
                                <span>노드 프로그램 & 도커 실행</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">5️⃣</span>
                                <span>노드 프로그램에서 Check now 버튼 누르고, 포트오픈되면 Continue 버튼 선택(8-10번 먼저 진행 후 check now 버튼 눌러야함)<br/>
                                <span class="text-green-500">✔️</span>도커 서비스가 구동 안되면 Continue 버튼이 비활성화 됨</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">6️⃣</span>
                                <span>노드 프로그램 스위치 ON(Turn the node on for testing 화면)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">7️⃣</span>
                                <span>트러블 슈팅(TroubleShooting) 화면으로 이동</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">8️⃣</span>
                                <span>모뎀, 공유기에서 노드 PC 포트 포워딩 진행<br/>
                                <span class="text-green-500">✔️</span>노드 PC의 IP가 공인 IP면 포워딩필요 없음(IP가 192, 172로 시작하지 않으며 공인 IP면 포워딩필요 없음)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">9️⃣</span>
                                <span>방화벽 인바운드 포트 허용 설정: 31400-31409</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">🔟</span>
                                <span>방화벽 앱 통신허용 설정 : Docker Desktop Backend(개인,공용)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">1️⃣1️⃣</span>
                                <span>파이 웹사이트에서 포트 오픈 체크 : pi-mods.de/nodeports (Slow선택, scan 선택) / 정상: 포트 3개 오픈(31401 31402 31403)</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-blue-400 mr-2 min-w-[24px]">1️⃣2️⃣</span>
                                <span>트러블 슈팅 화면에서 모니터링</span>
                            </li>
                        </ul>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">추가 정보</h4>
                        <ul class="space-y-4 text-gray-300">
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">✴️</span>
                                <span>슬립모드는 해제 해두셔야합니다. 모니터는 꺼두셔도됩니다.</span>
                            </li>
                            <li class="flex items-start">
                                <span class="text-yellow-500 mr-2">✴️</span>
                                <span>네이버나 다음에서 파이노드설치로 검색 해보시면 자료 많습니다</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `
    },
    {
        id: "fireside",
        title: "6. 파이어사이드 플랫폼?",
        content: `
        <div class="space-y-6">
            <div class="bg-gray-800 p-6 rounded-lg">
                <h3 class="text-xl font-bold mb-6 text-white">파이어사이드 플랫폼</h3>
                
                <div class="space-y-6">
                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">파이어사이드의 목적은 무엇인가요?</h4>
                        <div class="space-y-4 text-gray-300">
                            <p class="flex items-start">
                                <span class="text-blue-400 mr-2">➡️</span>
                                <span>Fireside Forum은 암호화를 지원하는 Web3 소셜 네트워킹 앱입니다. 암호화폐와 토큰을 소셜 메커니즘의 핵심에 통합하여 온라인 행동을 자동으로 조정하고 더 나은 콘텐츠, 사회적 상호 작용 및 사용자 경험을 만들 수 있도록 지원합니다.</span>
                            </p>
                        </div>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">🔥 이란 무엇입니까?</h4>
                        <div class="space-y-4 text-gray-300">
                            <p class="flex items-start">
                                <span class="text-blue-400 mr-2">➡️</span>
                                <span>불은 게시물이 얼마나 "핫"한지 또는 추세를 나타내는 척도입니다. 시간이 지남에 따라 오래된 게시물의 화재가 줄어들어 새로운 게시물이 유행을 시작할 수 있습니다. 게시물을 "핫" 상태로 유지하려면 토큰을 사용하여 게시물에 불을 추가할 수 있습니다.</span>
                            </p>
                        </div>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">토큰이란 무엇입니까?</h4>
                        <div class="space-y-4 text-gray-300">
                            <p class="flex items-start">
                                <span class="text-blue-400 mr-2">➡️</span>
                                <span>토큰은 이 앱의 통화입니다. 1Pi로 100개의 토큰을 살 수 있습니다. (미래에는 토큰을 Pi로 다시 교환할 수 있지만 아직 확실하지 않습니다.) 게시물, 채널 및 댓글을 만들고 기존 게시물에 불을 추가하려면 토큰을 사용해야 합니다. 또한 게시물이 인기를 얻으면 "팁"으로 무료로 받을 수 있습니다.</span>
                            </p>
                        </div>
                    </div>

                    <div class="bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-bold mb-4 text-white">🔥 은 얼마나 오래 지속됩니까?</h4>
                        <div class="space-y-4 text-gray-300">
                            <p class="flex items-start">
                                <span class="text-blue-400 mr-2">➡️</span>
                                <span>인기 게시물에 대한 불은 개인이 계속해서 게시물에 불을 기여하는 한 무기한 지속될 수 있습니다. 그러나 게시물에 불이 추가될 때마다 해당 불의 특정 양이 24시간 후에 만료됩니다.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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