console.log("Skylock Tracker Loaded");

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SKYLOCK_OPEN_TABS") {
        window.postMessage({ 
            type: "SKYLOCK_OPEN_TABS", 
            urls: msg.urls 
        }, window.location.origin
    );
    }
});