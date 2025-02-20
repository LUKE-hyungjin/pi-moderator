import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Pi Exchange - Home" },
    { name: "description", content: "Welcome to Pi Exchange!" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">환영합니다</h1>
        <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6">
          {/* 홈페이지 컨텐츠 */}
        </div>
      </div>
    </div>
  );
}