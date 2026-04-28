chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url) return;

    const socialMedia =
    tab.url.includes("facebook.com") ||
    tab.url.includes("twitter.com") ||
    tab.url.includes("instagram.com") ||
    tab.url.includes("x.com") ||
    tab.url.includes("tiktok.com") ||
    tab.url.includes("bsky.app");

    if (socialMedia) {
        console.log(`Social media tab detected: ${tab.url}`);

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((t) => {
                if (t.url && t.url.includes("localhost:5173")) {
                    chrome.tabs.sendMessage(t.id, {
                        type: "SKYLOCK_OPEN_TABS",
                        urls: [tab.url],
                    });
                }
            });
        });
    }
});