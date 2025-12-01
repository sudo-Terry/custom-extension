(function(global) {
  class RepositoryManager {
    constructor(listId, onEdit, onDelete) {
      this.list = document.getElementById(listId);
      this.onEdit = onEdit;
      this.onDelete = onDelete;
    }

    render(data) {
      if (!this.list) return;

      this.list.innerHTML = '';
      const repos = Object.keys(data);

      if (repos.length === 0) {
        this.list.innerHTML = '<div class="empty-state">저장된 레포지토리가 없습니다.</div>';
        return;
      }

      repos.forEach(repo => {
        const item = document.createElement('div');
        item.className = 'repo-item';
        
        const reviewers = data[repo].join(', ');
        
        item.innerHTML = `
          <div class="repo-info">
            <h3><a href="https://github.com/${repo}" target="_blank" style="text-decoration: none; color: inherit;">${repo}</a></h3>
            <p>Reviewers: ${reviewers}</p>
          </div>
          <div class="repo-actions">
            <button class="btn-edit" data-repo="${repo}">수정</button>
            <button class="btn-delete" data-repo="${repo}">삭제</button>
          </div>
        `;
        
        this.list.appendChild(item);
      });

      this.attachEvents(data);
    }

    attachEvents(data) {
      // 수정 버튼 이벤트 리스너 추가
      this.list.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const repoToEdit = e.target.dataset.repo;
          const reviewers = data[repoToEdit];
          if (this.onEdit) this.onEdit(repoToEdit, reviewers);
        });
      });

      // 삭제 버튼 이벤트 리스너 추가
      this.list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const repoToDelete = e.target.dataset.repo;
          if (confirm(`'${repoToDelete}' 설정을 삭제하시겠습니까?`)) {
            if (this.onDelete) this.onDelete(repoToDelete);
          }
        });
      });
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RepositoryManager };
  } else {
    global.RepositoryManager = RepositoryManager;
  }
})(typeof window !== 'undefined' ? window : this);
