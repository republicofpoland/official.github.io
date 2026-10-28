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

function parseNewsCsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (insideQuotes) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      insideQuotes = true;
    } else if (character === ',') {
      row.push(cell);
      cell = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function parseNewsDate(value) {
  const input = value.trim();
  if (!input) return null;

  let match = input.match(/^(\d{4})\s*[年./-]\s*(\d{1,2})\s*[月./-]\s*(\d{1,2})\s*日?$/);
  if (match) return createUtcDate(Number(match[1]), Number(match[2]), Number(match[3]));

  match = input.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    return createUtcDate(Number(match[3]), month, day);
  }

  match = input.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) return createUtcDate(Number(match[1]), Number(match[2]), Number(match[3]));

  match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T/);
  if (match) return createUtcDate(Number(match[1]), Number(match[2]), Number(match[3]));

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime())
    ? null
    : new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

function createUtcDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatNewsDate(date, fallback) {
  if (!date) return fallback || 'DATE TBC';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
    .format(date)
    .toUpperCase();
}

function getNewsItems(csv) {
  const rows = parseNewsCsv(csv.replace(/^\uFEFF/, ''));
  const headers = rows[0] || [];
  if (
    headers[0]?.trim() !== '題名' ||
    headers[1]?.trim() !== '日付' ||
    headers[2]?.trim() !== '内容'
  ) {
    throw new Error('CSVの1行目が「題名,日付,内容」ではありません。公開CSV URLを確認してください。');
  }

  return rows
    .slice(1)
    .map((row, index) => {
      const title = (row[0] || '').trim();
      const rawDate = (row[1] || '').trim();
      const content = (row[2] || '').trim();
      if (!title || !content) return null;

      const date = parseNewsDate(rawDate);
      if (rawDate && !date) {
        console.warn(`お知らせの${index + 2}行目の日付を解析できません:`, rawDate);
      }
      return { title, content, date, rawDate, rowIndex: index };
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.date && second.date) return second.date - first.date;
      if (first.date) return -1;
      if (second.date) return 1;
      return first.rowIndex - second.rowIndex;
    });
}

function renderNewsItems(target, items, showReadMore) {
  const fragment = document.createDocumentFragment();
  const expandableContents = [];

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'news-item';

    const date = document.createElement('time');
    date.className = 'news-item-date';
    date.dateTime = item.date ? item.date.toISOString().slice(0, 10) : '';
    date.textContent = formatNewsDate(item.date, item.rawDate);

    const title = document.createElement('h3');
    title.className = 'news-item-title';
    title.textContent = item.title;

    const content = document.createElement('p');
    content.className = 'news-item-content';
    content.textContent = item.content;

    article.append(date, title, content);
    if (showReadMore) {
      const readMore = document.createElement('button');
      readMore.className = 'news-read-more';
      readMore.type = 'button';
      readMore.textContent = '続きを読む…';
      readMore.hidden = true;
      readMore.addEventListener('click', () => {
        const isExpanded = article.classList.toggle('is-expanded');
        readMore.textContent = isExpanded ? '閉じる' : '続きを読む…';
      });
      article.append(readMore);
      expandableContents.push({ content, readMore });
    }

    fragment.append(article);
  });

  target.replaceChildren(fragment);
  expandableContents.forEach(({ content, readMore }) => {
    const measurement = content.cloneNode(true);
    measurement.style.position = 'absolute';
    measurement.style.visibility = 'hidden';
    measurement.style.display = 'block';
    measurement.style.width = `${content.clientWidth}px`;
    measurement.style.maxHeight = 'none';
    measurement.style.webkitLineClamp = 'unset';
    document.body.append(measurement);
    readMore.hidden = measurement.clientHeight <= content.clientHeight + 1;
    measurement.remove();
  });
}

function getNewsCsvUrl(value) {
  const match = value.match(
    /^(https:\/\/docs\.google\.com)\/spreadsheets\/d\/([^/?#]+)(?:\/[^?#]*)?(?:\?([^#]*))?/i
  );
  if (!match) return value;

  const parameters = new URLSearchParams(match[3] || '');
  const gid = parameters.get('gid') || value.match(/#gid=(\d+)/)?.[1] || '0';
  return `${match[1]}/spreadsheets/d/${encodeURIComponent(match[2])}/export?format=csv&gid=${encodeURIComponent(gid)}`;
}

async function decodeNewsResponse(response) {
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get('content-type') || '';
  const charset = contentType.match(/charset\s*=\s*["']?([^;"'\s]+)/i)?.[1];
  let encoding = charset || 'utf-8';

  if (bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
  if (bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  if (contentType.toLowerCase().includes('text/html')) {
    throw new Error('CSVではなくHTMLが返されました。シートの公開設定とURLを確認してください。');
  }

  return new TextDecoder(encoding, { fatal: true }).decode(buffer);
}

function setupNews() {
  const target = document.getElementById('news-grid');
  const status = document.getElementById('news-status');
  if (!target || !status) return;

  const config = window.NEWS_CONFIG || {};
  const csvUrl = typeof config.csvUrl === 'string' ? config.csvUrl.trim() : '';
  const fetchUrl = csvUrl ? getNewsCsvUrl(csvUrl) : '';
  const showReadMore = target.dataset.newsLimit === '3';
  let hasLoadedData = false;
  let lastRenderedData = '';

  const showStatus = (message) => {
    status.textContent = message;
    status.hidden = !message;
  };

  if (!csvUrl) {
    target.setAttribute('aria-busy', 'false');
    showStatus('お知らせの公開CSV URLが未設定です。news-config.js にURLを設定してください。');
    console.info('お知らせは未設定です。news-config.js の csvUrl に公開CSV URLを設定してください。');
    return;
  }

  const loadNews = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      Number(config.requestTimeoutMs) || 10000
    );

    try {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${fetchUrl}${separator}_=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const items = getNewsItems(await decodeNewsResponse(response));
      const serialized = JSON.stringify(items);
      if (serialized !== lastRenderedData) {
        renderNewsItems(
          target,
          showReadMore ? items.slice(0, 3) : items,
          showReadMore
        );
        lastRenderedData = serialized;
      }
      hasLoadedData = true;
      target.setAttribute('aria-busy', 'false');
      showStatus(items.length ? '' : '現在、掲載中のお知らせはありません。');
    } catch (error) {
      console.error('お知らせの取得に失敗しました。公開CSV URLと公開設定を確認してください。', error);
      target.setAttribute('aria-busy', 'false');
      showStatus(
        hasLoadedData
          ? '最新情報を取得できませんでした。表示中のお知らせは前回取得分です。'
          : 'お知らせを取得できませんでした。時間をおいて再度ご確認ください。'
      );
    } finally {
      window.clearTimeout(timeout);
    }
  };

  loadNews();
  const refreshInterval = Number(config.refreshIntervalMs) || 5 * 60 * 1000;
  window.setInterval(loadNews, refreshInterval);
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
  if (!sections.length) return;

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
setupNews();
renderProjects();
renderTimeline();
setupNavigation();
setupReveal();
setupScrollTop();
setupSectionHighlight();
