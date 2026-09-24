const views = {
  schedule: { src: 'assets/schedule.png', alt: '项目坞季度甘特图：项目、迭代和阶段分层排列，阶段时间条外展示起止日期。图中为演示数据。', caption: '展开一个迭代，就能看清每个阶段的起点与终点。', index: '01 / 02' },
  gallery: { src: 'assets/gallery.png', alt: '项目坞项目画廊：用封面卡片整理官网、内容工作室等演示项目。', caption: '封面、状态和常用入口，让每一个项目都有自己的位置。', index: '02 / 02' }
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
const productImage = document.querySelector('#product-image');
const panel = document.querySelector('#product-panel');
let currentView = 'schedule';
function selectView(key) {
  const view = views[key];
  if (!view) return;
  currentView = key;
  productImage.src = view.src;
  productImage.alt = view.alt;
  document.querySelector('#preview-caption').textContent = view.caption;
  document.querySelector('.caption-index').textContent = view.index;
  panel.setAttribute('aria-labelledby', `tab-${key}`);
  tabs.forEach(tab => {
    const selected = tab.dataset.view === key;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectView(tab.dataset.view));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectView(tabs[next].dataset.view);
  });
});
document.querySelector('[data-show-schedule]').addEventListener('click', () => selectView('schedule'));
const dialog = document.querySelector('#preview-dialog');
const zoom = document.querySelector('#zoom-preview');
if (typeof dialog.showModal === 'function') {
  zoom.hidden = false;
  zoom.addEventListener('click', () => {
    const image = document.querySelector('#dialog-image');
    image.src = views[currentView].src;
    image.alt = views[currentView].alt;
    dialog.showModal();
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}
