// --- Auto Review Request Feature ---
console.log("Code Review Script Loaded");

async function requestReviews(reviewers) {
  // 1. Reviewers 섹션의 설정(톱니바퀴) 버튼 찾기
  // 사이드바에서 "Reviewers" 텍스트 근처의 버튼을 찾아야 함.
  // 보통 id="reviewers-select-menu"를 가진 details 태그의 summary
  const reviewersMenu = document.querySelector('#reviewers-select-menu summary');
  
  if (!reviewersMenu) {
    console.error("Reviewers menu not found.");
    return { success: false, message: "Reviewers 메뉴를 찾을 수 없습니다." };
  }

  // 메뉴 열기
  reviewersMenu.click();
  
  // 메뉴가 열리고 input이 로드될 때까지 잠시 대기
  await new Promise(r => setTimeout(r, 500));

  const input = document.getElementById('review-filter-field');
  if (!input) {
    console.error("Review filter input not found.");
    return { success: false, message: "Reviewer 검색창을 찾을 수 없습니다." };
  }

  for (const reviewer of reviewers) {
    // 이미 리뷰어로 지정되어 있는지 확인 (선택된 상태인지)
    // GitHub UI에서 이미 선택된 사람은 체크박스가 체크되어 있거나 리스트에 표시됨.
    // 여기서는 단순히 검색해서 클릭하는 방식을 시도.
    
    // 입력창 초기화 및 입력
    input.value = reviewer;
    input.dispatchEvent(new Event('input', { bubbles: true })); // 이벤트 트리거

    // 검색 결과 대기
    await new Promise(r => setTimeout(r, 1000)); // 1초 대기

    // 검색 결과에서 해당 유저 찾기
    // GitHub UI 구조가 변경되었을 수 있으므로 좀 더 포괄적인 selector 사용
    const results = document.querySelectorAll('#reviewers-select-menu .select-menu-list .select-menu-item');
    console.log(`Found ${results.length} items in search result for ${reviewer}`);
    
    let found = false;

    for (const item of results) {
      // HTML 구조 기반으로 정보 추출
      const usernameEl = item.querySelector('.js-username');
      const descriptionEl = item.querySelector('.description');
      
      const username = usernameEl ? usernameEl.textContent.trim() : "";
      const description = descriptionEl ? descriptionEl.textContent.trim() : "";
      
      console.log(`Checking item: username="${username}", description="${description}"`);

      // username이나 description 중 하나라도 검색어와 일치하는지 확인
      // 대소문자 무시하고 포함 여부 확인 (GitHub 검색 동작과 유사하게)
      if (username.toLowerCase() === reviewer.toLowerCase() || 
          description.toLowerCase().includes(reviewer.toLowerCase())) {
        
        // 이미 선택된 상태인지 확인 (aria-checked="true")
        if (item.getAttribute('aria-checked') === 'true') {
          console.log(`${reviewer} is already requested.`);
        } else {
          item.click();
          console.log(`Requested review from ${reviewer}`);
        }
        found = true;
        break;
      }
    }

    if (!found) {
      console.warn(`User ${reviewer} not found in search results. (Checked ${results.length} items)`);
    }
    
    // 다음 사람을 위해 잠시 대기
    await new Promise(r => setTimeout(r, 300));
  }

  // 메뉴 닫기 (다시 클릭)
  reviewersMenu.click();
  
  return { success: true };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "requestReview") {
    console.log("Processing requestReview...", request.reviewers);
    requestReviews(request.reviewers).then(result => {
      console.log("requestReviews result:", result);
      sendResponse(result);
    })
    .catch(err => {
      console.error("requestReviews error:", err);
      sendResponse({ success: false, message: err.toString() });
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    requestReviews
  };
}
