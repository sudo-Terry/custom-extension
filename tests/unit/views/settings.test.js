const { TagManager } = require('../../../views/settings/modules/tags');
const { RepositoryManager } = require('../../../views/settings/modules/repos');

describe('TagManager', () => {
  let tagManager;
  let container, input;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="tagContainer">
        <input id="tagInput" type="text" />
      </div>
    `;
    container = document.getElementById('tagContainer');
    input = document.getElementById('tagInput');
    tagManager = new TagManager('tagContainer', 'tagInput');
  });

  test('태그를 추가하고 렌더링해야 함', () => {
    tagManager.addTag('tag1');
    expect(tagManager.getTags()).toContain('tag1');
    expect(container.innerHTML).toContain('tag1');
  });

  test('중복 태그는 추가되지 않아야 함', () => {
    tagManager.addTag('tag1');
    tagManager.addTag('tag1');
    expect(tagManager.getTags().length).toBe(1);
  });

  test('태그를 삭제해야 함', () => {
    tagManager.addTag('tag1');
    tagManager.removeTag(0);
    expect(tagManager.getTags().length).toBe(0);
  });

  test('초기화(clear) 시 태그와 입력창을 비워야 함', () => {
    tagManager.addTag('tag1');
    input.value = 'temp';
    tagManager.clear();
    expect(tagManager.getTags().length).toBe(0);
    expect(input.value).toBe('');
  });
});

describe('RepositoryManager', () => {
  let repoManager;
  let list;
  let onEdit, onDelete;

  beforeEach(() => {
    document.body.innerHTML = '<div id="repoList"></div>';
    list = document.getElementById('repoList');
    onEdit = jest.fn();
    onDelete = jest.fn();
    repoManager = new RepositoryManager('repoList', onEdit, onDelete);
    
    // Mock confirm
    window.confirm = jest.fn(() => true);
  });

  test('데이터가 없을 때 빈 상태를 표시해야 함', () => {
    repoManager.render({});
    expect(list.innerHTML).toContain('저장된 레포지토리가 없습니다');
  });

  test('레포지토리 목록을 렌더링해야 함', () => {
    const data = { 'owner/repo': ['user1', 'user2'] };
    repoManager.render(data);
    expect(list.innerHTML).toContain('owner/repo');
    expect(list.innerHTML).toContain('user1, user2');
  });

  test('수정 버튼 클릭 시 콜백을 호출해야 함', () => {
    const data = { 'owner/repo': ['user1'] };
    repoManager.render(data);
    
    const editBtn = list.querySelector('.btn-edit');
    editBtn.click();
    
    expect(onEdit).toHaveBeenCalledWith('owner/repo', ['user1']);
  });

  test('삭제 버튼 클릭 시 확인 후 콜백을 호출해야 함', () => {
    const data = { 'owner/repo': ['user1'] };
    repoManager.render(data);
    
    const deleteBtn = list.querySelector('.btn-delete');
    deleteBtn.click();
    
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('owner/repo');
  });
});
