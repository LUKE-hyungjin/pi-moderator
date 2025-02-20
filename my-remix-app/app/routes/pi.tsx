export default function Pi() {
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">Pi 코인 얻는 방법</h2>
                <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 space-y-4">
                    <ol className="list-decimal list-inside space-y-4">
                        <li>
                            <b>매일 채굴 버튼 클릭</b>
                            <span> - 채굴 세션은 24시간마다 갱신됩니다.</span>
                        </li>
                        <li>
                            <b>보안 서클 구성</b>
                            <span> - KYC를 통과할 수 있는 약 10명의 멤버로 구성하세요.</span>
                        </li>
                        {/* 나머지 리스트 아이템들 */}
                    </ol>
                </div>
            </div>
        </div>
    );
}