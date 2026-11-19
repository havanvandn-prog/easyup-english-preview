const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
}

menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const tabs = [...document.querySelectorAll('.courses .tabs [role="tab"]')];
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
const dots = [...document.querySelectorAll('.course-dots button')];
let selected = 0;

function selectCourse(index, focusTab = false) {
  selected = (index + tabs.length) % tabs.length;
  tabs.forEach((tab, position) => {
    const active = position === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[position].hidden = !active;
    dots[position].setAttribute('aria-pressed', String(active));
  });
  if (focusTab) tabs[selected].focus();
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => selectCourse(index)));
dots.forEach((dot, index) => dot.addEventListener('click', () => selectCourse(index)));
document.querySelector('.course-arrow.prev').addEventListener('click', () => selectCourse(selected - 1));
document.querySelector('.course-arrow.next').addEventListener('click', () => selectCourse(selected + 1));
document.querySelector('.tabs').addEventListener('keydown', (event) => {
  const destinations = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: tabs.length - 1 };
  if (!Object.hasOwn(destinations, event.key)) return;
  event.preventDefault();
  selectCourse(destinations[event.key], true);
});

document.querySelectorAll('[data-section-tabs]').forEach((group) => {
  const choices = [...group.querySelectorAll('[role="tab"]')];
  const panels = choices.map((choice) => document.getElementById(choice.getAttribute('aria-controls')));
  const columns = group.classList.contains('faculty-layout') ? 2 : 1;

  function select(index) {
    choices.forEach((choice, position) => {
      const active = position === index;
      choice.setAttribute('aria-selected', String(active));
      choice.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    });
    group.querySelector('[role="tabpanel"][hidden] video')?.pause();
  }

  choices.forEach((choice, index) => {
    choice.addEventListener('click', () => select(index));
    choice.addEventListener('keydown', (event) => {
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
      if (!Object.hasOwn(offset, event.key) && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 :
        (index + offset[event.key] + choices.length) % choices.length;
      select(next);
      choices[next].focus();
    });
  });
});

const player = document.querySelector('#experience-player');
const videoChoices = [...document.querySelectorAll('.experience-video')];
videoChoices.forEach((choice) => {
  choice.addEventListener('click', () => {
    if (choice.getAttribute('aria-pressed') === 'false') {
      player.pause();
      player.src = choice.dataset.video;
      player.poster = choice.dataset.poster;
      player.setAttribute('aria-label', choice.dataset.title);
      videoChoices.forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
    }
    player.play().catch(() => {});
  });
});

const photoDialog = document.querySelector('.experience-lightbox');
const dialogImage = photoDialog.querySelector('img');
const dialogCaption = photoDialog.querySelector('#experience-photo-title');
const galleryCount = photoDialog.querySelector('.experience-gallery-count');
const galleryPhotos = [...document.querySelectorAll('.experience-photos a')];
const galleryButton = document.querySelector('.experience-gallery-open');
let photoTrigger;
let photoIndex = 0;
let swipeStart;

function showPhoto(index) {
  photoIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[photoIndex];
  const caption = photo.querySelector('img').alt;
  dialogImage.src = photo.href;
  dialogImage.alt = caption;
  dialogCaption.textContent = caption;
  galleryCount.textContent = String(photoIndex + 1) + ' / ' + galleryPhotos.length;
}

function openAlbum(index, trigger) {
  photoTrigger = trigger;
  showPhoto(index);
  photoDialog.showModal();
}

galleryButton.querySelector('span').textContent = 'Xem tất cả ' + galleryPhotos.length + ' ảnh';
galleryButton.hidden = false;
galleryButton.addEventListener('click', () => openAlbum(0, galleryButton));
galleryPhotos.forEach((link, index) => {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openAlbum(index, link);
  });
});
photoDialog.querySelector('.experience-gallery-close').addEventListener('click', () => photoDialog.close());
photoDialog.querySelector('.experience-gallery-arrow.prev').addEventListener('click', () => showPhoto(photoIndex - 1));
photoDialog.querySelector('.experience-gallery-arrow.next').addEventListener('click', () => showPhoto(photoIndex + 1));
photoDialog.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
});
dialogImage.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch' && event.isPrimary) {
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }
});
dialogImage.addEventListener('pointerup', (event) => {
  if (swipeStart?.id !== event.pointerId) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  swipeStart = undefined;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
});
dialogImage.addEventListener('pointercancel', () => { swipeStart = undefined; });
photoDialog.addEventListener('close', () => {
  swipeStart = undefined;
  photoTrigger?.focus();
});

const tuitionForm = document.querySelector('#trial-form');
const selectedPlan = tuitionForm.querySelector('.form-selected-plan');
document.querySelectorAll('[data-tuition-plan]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const plan = link.dataset.tuitionPlan;
    tuitionForm.elements.tuition_plan.value = plan;
    selectedPlan.textContent = 'Gói quan tâm: ' + plan;
    selectedPlan.hidden = false;
  });
});

tuitionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.hidden = false;
  status.textContent = 'Bản xem thử. Để đặt lịch học thử, vui lòng gọi 086 767 8896.';
});
