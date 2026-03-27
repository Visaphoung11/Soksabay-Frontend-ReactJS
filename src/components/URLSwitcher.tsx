import React, { useState, useEffect } from "react";

const URLSwitcher: React.FC = () => {
    const [currentURL, setCurrentURL] = useState("");
    const [customURL, setCustomURL] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("API_BASE_URL");
        if (saved) {
            setCurrentURL(saved);
            setCustomURL(saved);
        }
    }, []);

    const handleSwitch = (url: string) => {
        localStorage.setItem("API_BASE_URL", url);
        setCurrentURL(url);
        setCustomURL(url);
        window.location.reload(); // Reload to apply new URL
    };

    // Collapsed state - just shows current URL and toggle button
    if (!isExpanded) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <div className="text-xs text-slate-600 mb-1">API URL:</div>
                        <div className="text-xs font-mono text-slate-900 truncate max-w-[200px]">
                            {currentURL || "localhost:8080"}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                        ⚙️
                    </button>
                </div>
            </div>
        );
    }

    // Expanded state - full controls
    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">API URL Switcher</h3>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="px-2 py-1 bg-slate-500 text-white text-xs rounded hover:bg-slate-600"
                >
                    −
                </button>
            </div>
            
            <div className="space-y-2">
                <div>
                    <label className="text-xs text-slate-600 block mb-1">Current URL:</label>
                    <input
                        type="text"
                        value={currentURL}
                        readOnly
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-slate-50"
                    />
                </div>
                
                <div>
                    <label className="text-xs text-slate-600 block mb-1">Custom URL:</label>
                    <input
                        type="text"
                        value={customURL}
                        onChange={(e) => setCustomURL(e.target.value)}
                        placeholder="https://your-api-url.com/api/v1"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                    />
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSwitch("http://localhost:8080/api/v1")}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                        Localhost
                    </button>
                    <button
                        onClick={() => handleSwitch("https://service-provider-latest-2.onrender.com/api/v1")}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                        Production
                    </button>
                    <button
                        onClick={() => handleSwitch(customURL)}
                        disabled={!customURL}
                        className="flex-1 px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                        Custom
                    </button>
                </div>
            </div>
        </div>
    );
};

export default URLSwitcher;
