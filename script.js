const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    const formData = new FormData(contactForm);

    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then((response) => {
        if (response.ok) {
          note.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
        } else {
          note.textContent = 'Не удалось отправить сообщение. Попробуйте позвонить нам.';
        }
        note.hidden = false;
        contactForm.reset();
        setTimeout(() => {
          note.hidden = true;
        }, 5000);
      })
      .catch(() => {
        note.textContent = 'Не удалось отправить сообщение. Попробуйте позвонить нам.';
        note.hidden = false;
      });
  });
}

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(26, 92, 58, 0.1)'
    : 'none';
});

// Лайтбокс для фото питомцев и новостей
(() => {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Закрыть">&times;</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Предыдущее фото">&#8249;</button>
    <img class="lightbox-img" src="" alt="">
    <button class="lightbox-nav lightbox-next" aria-label="Следующее фото">&#8250;</button>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lightbox-img');
  const counterEl = overlay.querySelector('.lightbox-counter');
  const btnClose = overlay.querySelector('.lightbox-close');
  const btnPrev = overlay.querySelector('.lightbox-prev');
  const btnNext = overlay.querySelector('.lightbox-next');

  let currentGroup = [];
  let currentIndex = 0;

  function getGroup(img) {
    const newsParent = img.closest('.news-photos, .volunteer-photos');
    if (newsParent) {
      return Array.from(newsParent.querySelectorAll('img'));
    }
    if (img.classList.contains('pet-photo-img')) {
      return Array.from(document.querySelectorAll('.pet-photo-img'));
    }
    return [img];
  }

  function show(index) {
    if (!currentGroup.length) return;
    currentIndex = (index + currentGroup.length) % currentGroup.length;
    const img = currentGroup[currentIndex];
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || '';
    const multi = currentGroup.length > 1;
    counterEl.textContent = multi ? `${currentIndex + 1} / ${currentGroup.length}` : '';
    btnPrev.style.display = multi ? 'flex' : 'none';
    btnNext.style.display = multi ? 'flex' : 'none';
  }

  function openLightbox(img) {
    currentGroup = getGroup(img);
    const idx = currentGroup.indexOf(img);
    show(idx === -1 ? 0 : idx);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.pet-photo-img, .news-photos img, .volunteer-photos img');
    if (img) openLightbox(img);
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => show(currentIndex - 1));
  btnNext.addEventListener('click', () => show(currentIndex + 1));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(currentIndex - 1);
    if (e.key === 'ArrowRight') show(currentIndex + 1);
  });

  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) {
      show(dx > 0 ? currentIndex - 1 : currentIndex + 1);
    }
  });
})();

// Кнопка "Поделиться" на карточках питомцев
(() => {
  const toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.textContent = 'Ссылка скопирована!';
  document.body.appendChild(toast);

  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-share');
    if (!btn) return;

    const name = btn.dataset.name || 'этого питомца';
    const slug = btn.dataset.slug || '';
    const url = `${location.origin}${location.pathname}${slug ? '#' + slug : ''}`;
    const text = `Познакомьтесь: ${name} ищет дом! Приют «Право на Жизнь»`;

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text, url });
      } catch (err) {
        // пользователь отменил — ничего не делаем
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована!');
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    } catch (err) {
      showToast(url);
    }
  });
})();

// Подсчёт питомцев в приюте
(() => {
  function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  const WORDS = {
    cat: ['кошка', 'кошки', 'кошек'],
    dog: ['собака', 'собаки', 'собак']
  };

  function countWord(n, animal) {
    const [one, few, many] = WORDS[animal];
    return `${n} ${pluralize(n, one, few, many)}`;
  }

  function countLocalPets() {
    const el = document.getElementById('pet-count');
    if (!el) return;
    const badge = document.querySelector('.pet-count-badge');
    const animal = badge ? badge.dataset.animal : null;
    const count = document.querySelectorAll('.pet-card').length;
    el.textContent = animal ? countWord(count, animal) : count;
  }

  async function fetchPetCount(url) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.querySelectorAll('.pet-card').length;
    } catch (err) {
      return null;
    }
  }

  async function fillRemotePetCounts() {
    const catsEl = document.getElementById('cats-count');
    const dogsEl = document.getElementById('dogs-count');
    const totalEl = document.getElementById('home-total-count');
    if (!catsEl && !dogsEl && !totalEl) return;

    const [catsCount, dogsCount] = await Promise.all([
      fetchPetCount('cats.html'),
      fetchPetCount('dogs.html')
    ]);

    if (catsEl) {
      catsEl.textContent = catsCount !== null ? `${countWord(catsCount, 'cat')} в поиске дома` : '';
    }
    if (dogsEl) {
      dogsEl.textContent = dogsCount !== null ? `${countWord(dogsCount, 'dog')} в поиске дома` : '';
    }
    if (totalEl && catsCount !== null && dogsCount !== null) {
      totalEl.textContent = `${catsCount + dogsCount}+`;
    }
  }

  countLocalPets();
  fillRemotePetCounts();
})();

// Поиск и фильтр питомцев на cats.html / dogs.html
(() => {
  const searchInput = document.getElementById('pet-search');
  if (!searchInput) return;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const countEl = document.getElementById('pet-filter-count');
  const grid = document.querySelector('.catalog-grid');
  const cards = Array.from(document.querySelectorAll('.pet-card'));
  let activeGender = 'all';

  let noResultsEl = null;
  function ensureNoResultsEl() {
    if (!noResultsEl) {
      noResultsEl = document.createElement('p');
      noResultsEl.className = 'pet-no-results';
      noResultsEl.textContent = 'Никого не нашли по вашему запросу — попробуйте другое имя.';
      grid.appendChild(noResultsEl);
    }
    return noResultsEl;
  }

  function applyFilter() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const genderText = card.querySelector('.pet-meta')?.textContent || '';
      const matchesName = !query || name.includes(query);
      const matchesGender = activeGender === 'all' || genderText.includes(activeGender);
      const visible = matchesName && matchesGender;
      card.classList.toggle('pet-hidden', !visible);
      if (visible) visibleCount++;
    });

    if (countEl) {
      countEl.textContent = `Показано: ${visibleCount} из ${cards.length}`;
    }

    const noResults = ensureNoResultsEl();
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', applyFilter);

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeGender = btn.dataset.gender;
      applyFilter();
    });
  });

  applyFilter();
})();

// Блок "Последние новости" на главной странице
(() => {
  const container = document.getElementById('latest-news-grid');
  if (!container) return;

  fetch('news.html')
    .then((res) => res.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const posts = Array.from(doc.querySelectorAll('.news-post')).slice(0, 3);

      if (posts.length === 0) {
        container.closest('section').style.display = 'none';
        return;
      }

      container.innerHTML = '';
      posts.forEach((post) => {
        const rubricTitle = post.closest('.news-rubric')?.querySelector('.news-rubric-title')?.textContent || '';
        const title = post.querySelector('.news-post-summary-text')?.textContent || '';
        const img = post.querySelector('.news-photos img');
        const imgSrc = img ? img.getAttribute('src') : '';

        const card = document.createElement('a');
        card.href = 'news.html';
        card.className = 'latest-news-card';
        card.innerHTML = `
          ${imgSrc ? `<img src="${imgSrc}" alt="${title}">` : ''}
          <div class="latest-news-card-body">
            <span class="latest-news-tag">${rubricTitle}</span>
            <h3>${title}</h3>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(() => {
      const section = container.closest('section');
      if (section) section.style.display = 'none';
    });
})();
