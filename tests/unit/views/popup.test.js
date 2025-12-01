const { initPopup } = require('../../../views/popup/popup');

describe('Popup', () => {
  let settingsButton, adBlockToggle, requestReviewButton, statusMessage;
  let mockStorage = {};

  beforeEach(() => {
    // DOM Setup
    document.body.innerHTML = `
      <button id="settingsButton"></button>
      <input type="checkbox" id="adBlockToggle" />
      <button id="requestReviewButton"></button>
      <div id="statusMessage"></div>
    `;

    settingsButton = document.getElementById('settingsButton');
    adBlockToggle = document.getElementById('adBlockToggle');
    requestReviewButton = document.getElementById('requestReviewButton');
    statusMessage = document.getElementById('statusMessage');

    // Mock Chrome API
    mockStorage = {};
    global.chrome = {
      runtime: {
        openOptionsPage: jest.fn(),
        getURL: jest.fn(path => `chrome-extension://id/${path}`),
        lastError: null
      },
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            callback(mockStorage);
          }),
          set: jest.fn((items, callback) => {
            mockStorage = { ...mockStorage, ...items };
            if (callback) callback();
          })
        }
      },
      tabs: {
        query: jest.fn((query, callback) => {
          callback([{ id: 1, url: 'https://github.com/owner/repo/pull/123' }]);
        }),
        sendMessage: jest.fn((tabId, message, callback) => {
          if (callback) callback({ success: true });
        })
      }
    };

    // Mock window.open
    window.open = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('설정 버튼 클릭 시 옵션 페이지를 열어야 함', () => {
    initPopup();
    settingsButton.click();
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });

  test('광고 차단 토글 상태를 로드하고 변경 시 저장해야 함', () => {
    mockStorage = { adBlockEnabled: true };
    
    initPopup();
    
    // 로드 확인
    expect(adBlockToggle.checked).toBe(true);

    // 변경 시뮬레이션
    adBlockToggle.checked = false;
    adBlockToggle.dispatchEvent(new Event('change'));

    // 저장 및 메시지 전송 확인
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { adBlockEnabled: false }
    );
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      { action: 'toggleAdBlock', enabled: false }
    );
  });

  test('리뷰 요청 버튼 클릭 시 메시지를 전송해야 함', () => {
    mockStorage = {
      reviewers: {
        'owner/repo': ['user1']
      }
    };

    initPopup();
    requestReviewButton.click();

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      { action: 'requestReview', reviewers: ['user1'] },
      expect.any(Function)
    );
  });

  test('GitHub PR 페이지가 아닐 경우 에러 메시지를 표시해야 함', () => {
    chrome.tabs.query.mockImplementation((query, callback) => {
      callback([{ id: 1, url: 'https://google.com' }]);
    });

    initPopup();
    requestReviewButton.click();

    expect(statusMessage.textContent).toContain('GitHub PR 페이지가 아닙니다');
  });
});
