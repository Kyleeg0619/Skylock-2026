chrome.tabs.query({}, (tabs) => {
    const urls = tabs.map(tab => tab.url);

    for (const tab of tabs) {
        if (tab.url && tab.url.includes("http://localhost:5173/")) {
            chrome.tabs.sendMessage(tab.id, { 
                type: "SKYLOCK_OPEN_TABS", 
                urls 
            });
        }
    }
});