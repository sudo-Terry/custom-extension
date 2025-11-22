document.addEventListener('DOMContentLoaded', function() {
  var adBlockToggle = document.getElementById('adBlockToggle');

  // 토글의 저장된 상태를 로드
  chrome.storage.sync.get({ 'adBlockEnabled': false }, function(data) {
    adBlockToggle.checked = data.adBlockEnabled;
    console.log('Loaded adBlockEnabled state:', adBlockToggle.checked);
  });

  // 토글 변경 시 상태를 저장하고 콘텐츠 스크립트로 메시지 전송
  adBlockToggle.addEventListener('change', function() {
    var isEnabled = this.checked;
    chrome.storage.sync.set({ 'adBlockEnabled': isEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleAdBlock", enabled: isEnabled });
    });
  });
});
