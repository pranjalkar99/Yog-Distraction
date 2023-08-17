chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes('youtube.com/watch') && changeInfo.status === 'complete') {
      const videoId = new URL(tab.url).searchParams.get("v");
  
      chrome.storage.local.get([videoId], (result) => {
        if (result[videoId] && result[videoId].reloaded) {
          // If the tab has been reloaded once, show the warning
          
          // Clear the flag from storage
          chrome.storage.local.remove([videoId]);
        } else {
          // Send video ID to your server for analysis using GET request
          fetch(`http://127.0.0.1:8000/analyze_title/${videoId}?video_id=${videoId}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.category && (data.category != "education" || data.category != "science & technology") && data.category != "education"){
              // Set a flag indicating the tab should be reloaded
              chrome.storage.local.set({[videoId]: {reloaded: true}});
              chrome.tabs.update(tabId, {url: "warning.html"});
              // Reload the tab
            //   chrome.tabs.reload(tabId);
            }
          })
          .catch(error => {
            console.error("Error fetching video details:", error);
          });
        }
      });
    }
});
