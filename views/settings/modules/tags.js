(function(global) {
  class TagManager {
    constructor(containerId, inputId) {
      this.container = document.getElementById(containerId);
      this.input = document.getElementById(inputId);
      this.tags = [];

      if (!this.container || !this.input) return;

      this.init();
    }

    init() {
      this.container.addEventListener('click', () => {
        this.input.focus();
      });

      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const val = this.input.value.trim();
          if (val) {
            this.addTag(val);
            this.input.value = '';
          }
        } else if (e.key === 'Backspace' && !this.input.value && this.tags.length > 0) {
          this.removeTag(this.tags.length - 1);
        }
      });
    }

    addTag(text) {
      if (this.tags.includes(text)) return;
      this.tags.push(text);
      this.render();
    }

    removeTag(index) {
      this.tags.splice(index, 1);
      this.render();
    }

    setTags(newTags) {
      this.tags = [...newTags];
      this.render();
    }

    getTags() {
      return this.tags;
    }

    clear() {
      this.tags = [];
      this.render();
      this.input.value = '';
    }

    render() {
      // 기존 태그 제거 (입력창은 유지)
      const tags = this.container.querySelectorAll('.tag');
      tags.forEach(t => t.remove());

      // 입력창 앞에 태그 삽입
      this.tags.forEach((tag, index) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${tag} <span class="close" data-index="${index}">&times;</span>`;
        this.container.insertBefore(tagEl, this.input);
      });

      // 닫기 버튼에 클릭 이벤트 추가
      this.container.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          this.removeTag(index);
        });
      });
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TagManager };
  } else {
    global.TagManager = TagManager;
  }
})(typeof window !== 'undefined' ? window : this);
