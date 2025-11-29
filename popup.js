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

  // Code Review 요청 버튼 핸들러
  var requestReviewButton = document.getElementById('requestReviewButton');
  var statusMessage = document.getElementById('statusMessage');

  if (requestReviewButton) {
    requestReviewButton.addEventListener('click', function() {
      statusMessage.textContent = '처리 중...';
      statusMessage.style.color = 'blue';

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var url = currentTab.url;

        // GitHub PR 페이지인지 확인 및 repo 정보 추출
        // URL 패턴: https://github.com/owner/repo/pull/123
        var match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/\d+/);
        
        if (!match) {
          statusMessage.textContent = 'GitHub PR 페이지가 아닙니다.';
          statusMessage.style.color = 'red';
          return;
        }

        var owner = match[1];
        var repo = match[2];
        var repoKey = owner + '/' + repo;

        // reviewers.json 로드
        fetch(chrome.runtime.getURL('features/code-review/reviewers.json'))
          .then(response => response.json())
          .then(data => {
            var reviewers = data[repoKey];
            if (reviewers && reviewers.length > 0) {
              // Content Script로 메시지 전송
              chrome.tabs.sendMessage(currentTab.id, { 
                action: "requestReview", 
                reviewers: reviewers 
              }, function(response) {
                if (chrome.runtime.lastError) {
                  statusMessage.textContent = '오류: ' + chrome.runtime.lastError.message;
                  statusMessage.style.color = 'red';
                } else if (response && response.success) {
                  statusMessage.textContent = '리뷰 요청 완료!';
                  statusMessage.style.color = 'green';
                } else {
                  statusMessage.textContent = '실패: ' + (response ? response.message : '알 수 없는 오류');
                  statusMessage.style.color = 'red';
                }
              });
            } else {
              statusMessage.textContent = '이 저장소(' + repoKey + ')에 대한 리뷰어 설정이 없습니다.';
              statusMessage.style.color = 'orange';
            }
          })
          .catch(error => {
            console.error('Error loading reviewers.json:', error);
            statusMessage.textContent = '설정 파일 로드 실패';
            statusMessage.style.color = 'red';
          });
      });
    });
  }
});
