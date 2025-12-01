// import { TagManager } from './modules/tags.js';
// import { RepositoryManager } from './modules/repos.js';

function initSettings() {
  const addForm = document.getElementById('addForm');
  const repoNameInput = document.getElementById('repoName');
  
  if (!addForm || !repoNameInput) return;

  // Initialize Managers
  // UMD 패턴으로 로드된 글로벌 클래스 사용
  const tagManager = new TagManager('tagContainer', 'tagInput');
  const repoManager = new RepositoryManager(
    'repoList',
    (repo, reviewers) => editReviewer(repo, reviewers),
    (repo) => deleteReviewer(repo)
  );

  // Load saved reviewers
  loadReviewers();

  // Add new repository
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const repo = repoNameInput.value.trim();
    const currentTags = tagManager.getTags();
    
    if (!repo || currentTags.length === 0) {
      alert('레포지토리 이름과 최소 1명 이상의 리뷰어를 입력해주세요.');
      return;
    }

    // Add any remaining text in input as a tag
    const remainingInput = document.getElementById('tagInput').value.trim();
    if (remainingInput) {
      tagManager.addTag(remainingInput);
    }

    // Get updated tags
    const finalTags = tagManager.getTags();

    chrome.storage.sync.get(['reviewers'], (result) => {
      const currentReviewers = result.reviewers || {};
      currentReviewers[repo] = [...finalTags];
      
      chrome.storage.sync.set({ reviewers: currentReviewers }, () => {
        loadReviewers();
        addForm.reset();
        tagManager.clear();
        alert(`'${repo}' 설정이 저장되었습니다.`);
      });
    });
  });

  function loadReviewers() {
    chrome.storage.sync.get(['reviewers'], (result) => {
      const reviewersData = result.reviewers || {};
      repoManager.render(reviewersData);
    });
  }

  function editReviewer(repo, reviewers) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fill form
    repoNameInput.value = repo;
    tagManager.setTags(reviewers);
    
    // Focus input
    document.getElementById('tagInput').focus();
  }

  function deleteReviewer(repo) {
    chrome.storage.sync.get(['reviewers'], (result) => {
      const currentReviewers = result.reviewers || {};
      delete currentReviewers[repo];
      
      chrome.storage.sync.set({ reviewers: currentReviewers }, () => {
        loadReviewers();
      });
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}
