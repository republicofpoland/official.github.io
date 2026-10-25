const governmentData = [
  {
    meta: '行政',
    title: '大統領',
    text: '大統領は国家の統治と外交方針を総括し、共和国の方向性を定めます。'
  },
  {
    meta: '立法',
    title: '政府',
    text: '各省庁の連携により、政策の実行と行政の安定を支えています。'
  },
  {
    meta: '外交',
    title: '外務',
    text: '対外関係の維持と協調を通じて、信頼ある外交関係を構築します。'
  },
  {
    meta: '開発',
    title: '国家事業',
    text: 'インフラ整備と都市計画を通じて、共和国の基盤を強化しています。'
  }
];

const newsData = [
  {
    date: '2026.10.12',
    tag: 'インフラ',
    title: '公共事業の審議が長期戦略の継続を確認',
    summary: '交通と市民サービスの強化を目的とした次期計画が進行中です。',
    link: '#home'
  },
  {
    date: '2026.09.28',
    tag: '外交',
    title: '地域対話を継続し、協調を重視した交渉を進行',
    summary: '共和国は対話と相互理解を基に、建設的な関係の構築を進めています。',
    link: '#contact'
  },
  {
    date: '2026.08.19',
    tag: '都市計画',
    title: '首都地区の再整備が新段階へ',
    summary: '市民生活や景観を重視した次期整備計画が進められています。',
    link: '#projects'
  }
];

const projectData = [
  {
    meta: 'インフラ',
    title: '鉄道網の近代化',
    text: '交通アクセスと全国的な結びつきを強めるための整備計画です。'
  },
  {
    meta: '都市設計',
    title: '首都地区の再整備',
    text: '公共空間と秩序ある景観を重視した都市計画の進行です。'
  },
  {
    meta: '公共事業',
    title: '国営インフラの拡張',
    text: '国全体の生活基盤を支える設備の整備と維持を進めています。'
  },
  {
    meta: '市民参加',
    title: '市民参加型施策',
    text: '市民の声と透明性を重視した制度づくりを進めています。'
  }
];

const timelineData = [
  {
    year: '2024.03.05',
    title: '建国宣言',
    text: 'ソビエト連邦が崩壊し、からし氏の指揮の元、ワルシャワを首都にポーランド共和国が建国される。'
  },
  {
    year: '2024.04.21',
    title: '内乱の終結',
    text: '内乱によりからし氏、ぱらお氏が失脚し、新たにひろろん氏が国家元首に就任。'
  },
  {
    year: '2024.04.22',
    title: 'ポーランド王国の建国',
    text: 'ひろろん氏が皇帝となり、ポーランド王国が建国される。その際、首都がワルシャワからクラクフに遷都される。'
  },
  {
    year: '2024~2025',
    title: '経済計画の実施',
    text: '第一次経済計画を実施し、世界有数の経済大国となる。'
  }
];

function renderGovernment() {
  const target = document.getElementById('government-grid');
  if (!target) return;

  target.innerHTML = governmentData
    .map(
      (item) => `
        <article class="card-panel">
          <span class="meta">${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join('');
}

function renderNews() {
  const target = document.getElementById('news-grid');
  if (!target) return;

  target.innerHTML = newsData
    .map(
      (item) => `
        <article class="news-card">
          <span class="date">${item.date}</span>
          <span class="tag">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <a href="${item.link}">続きを読む</a>
        </article>
      `
    )
    .join('');
}

function renderProjects() {
  const target = document.getElementById('project-grid');
  if (!target) return;

  target.innerHTML = projectData
    .map(
      (item, index) => `
        <article class="project-card">
          <div class="project-visual" aria-hidden="true"></div>
          <div class="project-body">
            <span class="meta">${item.meta}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
        </article>
      `
    )
    .join('');
}

function renderTimeline() {
  const target = document.getElementById('history-grid');
  if (!target) return;

  target.innerHTML = timelineData
    .map(
      (item) => `
        <article class="timeline-item">
          <span class="year">${item.year}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join('');
}

function setupNavigation() {
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function setupReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupScrollTop() {
  const scrollButton = document.querySelector('.scroll-top');
  if (!scrollButton) return;

  const updateVisibility = () => {
    if (window.scrollY > 260) {
      scrollButton.classList.add('is-visible');
    } else {
      scrollButton.classList.remove('is-visible');
    }
  };

  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });

  scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupSectionHighlight() {
  const links = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = Array.from(document.querySelectorAll('main section[id], header[id]'));

  const callback = () => {
    const scrollPosition = window.scrollY + 120;
    let currentId = '#home';

    sections.forEach((section) => {
      const top = section.offsetTop;
      if (scrollPosition >= top) currentId = '#' + section.id;
    });

    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === currentId);
    });
  };

  callback();
  window.addEventListener('scroll', callback, { passive: true });
}

renderGovernment();
renderNews();
renderProjects();
renderTimeline();
setupNavigation();
setupReveal();
setupScrollTop();
setupSectionHighlight();
