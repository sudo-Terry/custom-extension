/**
 * @jest-environment jsdom
 */

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  }
};

const { requestReviews } = require('../../../features/code-review/content');

describe('코드 리뷰 기능', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // jest.useRealTimers();
  });

  test('requestReviews가 성공적으로 리뷰를 요청하는지 검증', async () => {
    // Setup DOM
    document.body.innerHTML = `
      <details id="reviewers-select-menu">
        <summary>Reviewers</summary>
        <div class="select-menu-list"></div>
      </details>
      <input id="review-filter-field" />
    `;

    const summary = document.querySelector('summary');
    const input = document.getElementById('review-filter-field');
    const list = document.querySelector('.select-menu-list');

    // Mock click methods
    summary.click = jest.fn();
    
    // Mock search results
    const mockUserItem = document.createElement('div');
    mockUserItem.className = 'select-menu-item';
    mockUserItem.innerHTML = '<div class="js-username">testuser</div>';
    mockUserItem.click = jest.fn();
    mockUserItem.getAttribute = jest.fn().mockReturnValue('false');

    list.appendChild(mockUserItem);

    const promise = requestReviews(['testuser']);

    // With real timers, we just await the promise.
    // The function waits internally: 500ms (menu) + 1000ms (search) + 300ms (next) = ~1.8s
    
    const result = await promise;

    expect(result.success).toBe(true);
    expect(summary.click).toHaveBeenCalledTimes(2); // Open and Close
    expect(input.value).toBe('testuser');
    expect(mockUserItem.click).toHaveBeenCalled();
  });

  test('requestReviews가 메뉴를 찾지 못했을 때 실패하는지 검증', async () => {
    const result = await requestReviews(['testuser']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Reviewers 메뉴를 찾을 수 없습니다');
  });
});
