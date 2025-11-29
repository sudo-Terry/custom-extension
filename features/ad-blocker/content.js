// console.log("content.js loaded.");

const TARGET_SELECTORS = [
  '.fc-ab-root',
  '.fc-ab-dialog',
  '.fc-dialog-overlay'
];

// 요소를 DOM에서 완전히 제거하는 함수
function removeElementsBySelector(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      // console.log(`Removed element matching selector: ${selector}`, element);
    }
  });
}

// CSS를 사용하여 요소를 숨기는 함수 ( !important 강제 적용)
function hideElementsBySelector(selector) {
  const styleId = `adblock-style-${selector.replace(/[^a-zA-Z0-9]/g, '')}`;
  let existingStyle = document.getElementById(styleId);
  if (!existingStyle) {
    existingStyle = document.createElement('style');
    existingStyle.id = styleId;
    existingStyle.innerHTML = `
      ${selector} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(existingStyle);
    // console.log(`Hid elements matching selector: ${selector} using CSS.`, existingStyle);
  } else {
    // console.log(`Style for ${selector} already exists.`);
  }
}

// CSS를 사용하여 요소를 다시 보이게 하는 함수
function showElementsBySelector(selector) {
  const styleId = `adblock-style-${selector.replace(/[^a-zA-Z0-9]/g, '')}`;
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
    // console.log(`Removed hiding style for selector: ${selector}`);
  }
}

// 스크롤 복원 함수
function restoreScrolling() {
  document.body.style.overflow = 'auto';
  // console.log("Scrolling restored.");
}

// 팝업 제거 및 스크롤 복원 적용 함수
function applyAdBlocker() {
  // console.log('Applying Ad Blocker...');
  TARGET_SELECTORS.forEach(selector => {
    removeElementsBySelector(selector);
    hideElementsBySelector(selector); // 혹시 모를 상황 대비하여 hide도 적용
  });
  restoreScrolling();
}

// 팝업 제거 기능 비활성화 함수
function disableAdBlocker() {
  // console.log('Disabling Ad Blocker...');
  // remove()된 요소는 되돌릴 수 없으므로, 주로 hideBySelector로 숨겨진 요소들을 다시 보이게 함
  TARGET_SELECTORS.forEach(selector => {
    showElementsBySelector(selector);
  });
  // 스크롤 복원은 항상 유지 (필요에 따라 되돌릴 수 있음)
  restoreScrolling();
}

// 팝업 스크립트로부터 메시지 수신 대기
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log('Message received from popup.js:', request);
  if (request.action === "toggleAdBlock") {
    if (request.enabled) {
      applyAdBlocker();
    } else {
      disableAdBlocker();
    }
  }
});

// 저장된 상태에 따라 콘텐츠 스크립트 로드 시 설정 적용
chrome.storage.sync.get({'adBlockEnabled': false}, function(data) {
  // console.log('Loaded adBlockEnabled state in content.js:', data.adBlockEnabled);
  if (data.adBlockEnabled === true) {
    applyAdBlocker();
  }
});

// 동적으로 나타날 수 있는 팝업을 제거하기 위해 DOM 변경 감지
const observer = new MutationObserver(function(mutations) {
  // console.log('DOM change detected by MutationObserver.', mutations);
  chrome.storage.sync.get({'adBlockEnabled': false}, function(data) {
    if (data.adBlockEnabled === true) {
      applyAdBlocker();
    }
  });
});

// 문서 본문에서 구성된 변경 사항 관찰 시작
observer.observe(document.body, { childList: true, subtree: true });

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    removeElementsBySelector,
    hideElementsBySelector,
    showElementsBySelector,
    restoreScrolling,
    applyAdBlocker,
    disableAdBlocker
  };
}
