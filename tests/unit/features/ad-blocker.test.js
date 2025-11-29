/**
 * @jest-environment jsdom
 */

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    sync: {
      get: jest.fn()
    }
  }
};

const {
  removeElementsBySelector,
  hideElementsBySelector,
  showElementsBySelector,
  restoreScrolling,
  applyAdBlocker,
  disableAdBlocker
} = require('../../../features/ad-blocker/content');

describe('광고 차단 기능', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    jest.clearAllMocks();
  });

  test('removeElementsBySelector가 DOM에서 요소를 제거하는지 검증', () => {
    document.body.innerHTML = '<div class="fc-ab-root"></div><div class="other"></div>';
    removeElementsBySelector('.fc-ab-root');
    expect(document.querySelector('.fc-ab-root')).toBeNull();
    expect(document.querySelector('.other')).not.toBeNull();
  });

  test('hideElementsBySelector가 head에 스타일 태그를 추가하는지 검증', () => {
    hideElementsBySelector('.fc-ab-root');
    const style = document.getElementById('adblock-style-fcabroot');
    expect(style).not.toBeNull();
    expect(style.innerHTML).toContain('.fc-ab-root');
    expect(style.innerHTML).toContain('display: none !important');
  });

  test('showElementsBySelector가 스타일 태그를 제거하는지 검증', () => {
    hideElementsBySelector('.fc-ab-root');
    expect(document.getElementById('adblock-style-fcabroot')).not.toBeNull();
    
    showElementsBySelector('.fc-ab-root');
    expect(document.getElementById('adblock-style-fcabroot')).toBeNull();
  });

  test('restoreScrolling이 overflow를 auto로 복원하는지 검증', () => {
    document.body.style.overflow = 'hidden';
    restoreScrolling();
    expect(document.body.style.overflow).toBe('auto');
  });
});
