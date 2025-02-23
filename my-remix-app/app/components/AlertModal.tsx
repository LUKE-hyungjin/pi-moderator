import type { AlertModalProps } from "~/types";

export function AlertModal({ isOpen, onClose, message }: AlertModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="bg-[#242424] rounded-lg p-6 max-w-lg w-full mx-4 relative z-10 border border-purple-500/20">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/20 mb-4">
                        <svg
                            className="h-6 w-6 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <div className="mt-2 text-center px-4">
                        <p className="text-white text-lg whitespace-pre-line">{message}</p>
                    </div>
                    <div className="mt-6">
                        <button
                            type="button"
                            className="w-full rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
                            onClick={onClose}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 