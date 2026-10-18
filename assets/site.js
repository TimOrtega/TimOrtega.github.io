const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav?.classList.contains('open')) { closeMenu(); menu.focus(); }
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  let count = 0;
  document.querySelectorAll('.project').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) count++;
  });
  document.querySelectorAll('.project-collection').forEach(group => {
    group.hidden = ![...group.querySelectorAll('.project')].some(card => !card.hidden);
  });
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
}));
if ('IntersectionObserver' in window && !document.body.classList.contains('case-page')) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) nav?.querySelectorAll('a').forEach(a => {
      if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }), { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
const dialog = document.querySelector('.photo-dialog');
let photoTrigger;
document.querySelectorAll('.zoom-image').forEach(link => link.addEventListener('click', e => {
  if (!dialog?.showModal || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); photoTrigger = link;
  const image = dialog.querySelector('img');
  image.src = link.href; image.alt = link.querySelector('img').alt;
  dialog.querySelector('p').textContent = link.closest('figure').querySelector('figcaption')?.textContent || image.alt;
  dialog.showModal();
}));
dialog?.querySelector('.close-photo').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => photoTrigger?.focus());
document.querySelectorAll('[data-load]').forEach(button => {
  const viewer = document.getElementById(button.dataset.load);
  const status = document.getElementById(viewer.id + '-status');
  const reset = document.querySelector(`[data-reset="${viewer.id}"]`);
  button.addEventListener('click', async () => {
    button.disabled = true; button.textContent = 'Loading 3D model…';
    status.textContent = 'Loading interactive model…';
    try {
      await Promise.race([
        customElements.whenDefined('model-viewer'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Viewer unavailable')), 12000))
      ]);
      if (location.protocol === 'file:') throw new Error('A web server is needed');
      const retry = viewer.hasAttribute('src');
      viewer.setAttribute('src', viewer.dataset.src + (retry ? '?retry=' + Date.now() : ''));
    } catch {
      button.disabled = false; button.textContent = 'Try loading again ↗';
      status.textContent = location.protocol === 'file:' ? 'Use the local preview server or GitHub Pages to load 3D models. You can also download the GLB.' : 'The 3D viewer could not start. The project photo and model download are still available.';
    }
  });
  viewer.addEventListener('load', () => {
    button.hidden = true; reset.hidden = false;
    status.textContent = 'Drag to rotate · scroll or pinch to zoom · right-drag to pan.';
  });
  viewer.addEventListener('error', () => {
    button.hidden = false; button.disabled = false; button.textContent = 'Retry model ↗';
    status.textContent = 'The model could not load. Please retry or download the GLB.';
  });
  reset.addEventListener('click', () => {
    viewer.cameraOrbit = '35deg 65deg auto'; viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
  });
});
