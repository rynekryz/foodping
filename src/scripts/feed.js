import { haptic } from './lib/haptic.js';
import { htmlToText, safeUrl } from './lib/safe.js';

// feeds

const FEED_CACHE_KEY = 'feedCache_v1';

const RSS_FEEDS = [
  { url: 'https://blog.myfitnesspal.com/feed/', source: 'MyFitnessPal' },
  { url: 'https://www.eatingwell.com/feed/', source: 'EatingWell' },
  { url: 'https://nutritionfacts.org/feed/', source: 'NutritionFacts' },
  { url: 'https://dontwastethecrumbs.com/feed/', source: 'Don\'t Waste the Crumbs' },
  { url: 'https://www.skinnytaste.com/feed/', source: 'Skinnytaste' },
  { url: 'https://zerowastechef.com/feed/', source: 'Zero-Waste Chef' },
];

let feedLoaded = false;

export const ensureFeed = () => { if (!feedLoaded) return loadFeed(); };

function create(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function symbol(name, className = '') {
  return create('span', `material-symbols-outlined ${className}`.trim(), name);
}

function picture(url, lazy) {
  const img = document.createElement('img');
  img.alt = '';
  img.referrerPolicy = 'no-referrer';
  if (lazy) img.loading = 'lazy';
  img.src = url;
  img.addEventListener('error', () => img.parentElement?.remove());
  return img;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function extractRssImage(item) {
  if (item.enclosure?.link) return item.enclosure.link;
  if (item['media:content']?.url) return item['media:content'].url;
  if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;
  const imgMatch = (item.content || item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function cleanPost(post) {
  if (!post || typeof post !== 'object') return null;
  const title = htmlToText(post.title);
  if (!title) return null;
  return {
    title,
    link: safeUrl(post.link) || '',
    pubDate: typeof post.pubDate === 'string' ? post.pubDate : '',
    author: htmlToText(post.author),
    content: htmlToText(post.content || post.description),
    imgUrl: safeUrl(post.imgUrl),
    source: htmlToText(post.source),
  };
}

function getCachedPosts() {
  try {
    const posts = JSON.parse(localStorage.getItem(FEED_CACHE_KEY));
    return Array.isArray(posts) ? posts.map(cleanPost).filter(Boolean) : null;
  } catch {
    return null;
  }
}

function cachePosts(posts) {
  try { localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(posts)); } catch {}
}

function mergeAndDedupe(cached, fresh) {
  const seen = new Set(cached.map(p => p.link));
  const merged = [...cached];
  fresh.forEach(p => { if (!seen.has(p.link)) merged.push(p); });
  merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return merged;
}

function externalLink(url, iconName, text, extraClass = '') {
  const link = create('a', `feed-detail-link ${extraClass}`.trim());
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.append(symbol(iconName), text);
  return link;
}

function openFeedDetail(post) {
  haptic(32);
  const detail = document.getElementById('feedDetail');

  const backBtn = create('button', 'feed-back-btn');
  backBtn.append(symbol('arrow_back'));
  backBtn.addEventListener('click', closeFeedDetail);

  const bar = create('div', 'feed-detail-bar');
  bar.append(backBtn, create('span', 'feed-detail-bar-title', 'Post'));

  const body = create('div', 'feed-detail-body');

  if (post.imgUrl) {
    const wrap = create('div', 'feed-detail-img');
    const img = picture(post.imgUrl, false);
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openImageViewer(post.imgUrl));
    wrap.append(img);
    body.append(wrap);
  }

  const meta = create('div', 'feed-detail-meta');
  meta.append(
    create('span', 'feed-tag', post.source),
    create('span', 'feed-time', post.author || ''),
    create('span', 'feed-time', timeAgo(post.pubDate)),
  );
  body.append(meta, create('div', 'feed-detail-title', post.title));

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean).slice(0, 8);
  if (paragraphs.length) {
    const text = create('div', 'feed-detail-text');
    paragraphs.forEach(p => text.append(create('p', '', p)));
    body.append(text);
  } else if (post.link) {
    body.append(externalLink(post.link, 'link', `${post.link.replace(/^https?:\/\//, '').slice(0, 55)}…`));
  } else {
    body.append(create('p', 'feed-detail-empty', 'No text content.'));
  }

  if (post.link) body.append(externalLink(post.link, 'open_in_new', 'Read full article', 'feed-link-spaced'));

  detail.replaceChildren(bar, body);
  detail.classList.add('open');
  history.pushState({ feedDetail: true }, '');
}

function closeFeedDetail() {
  haptic(22);
  document.getElementById('feedDetail').classList.remove('open');
  if (history.state?.feedDetail) history.back();
}

window.addEventListener('popstate', () => {
  if (document.getElementById('imgViewer')) return;
  if (document.getElementById('feedDetail').classList.contains('open')) closeFeedDetail();
});

function openImageViewer(src) {
  document.getElementById('imgViewer')?.remove();

  const viewer = create('div');
  viewer.id = 'imgViewer';
  viewer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0);
    transition: background 0.32s cubic-bezier(.4,0,.2,1);
    cursor: zoom-out;
  `;

  const img = document.createElement('img');
  img.referrerPolicy = 'no-referrer';
  img.src = src;
  img.style.cssText = `
    max-width: 92vw;
    max-height: 88vh;
    border-radius: 14px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.38);
    opacity: 0;
    transform: scale(0.82);
    transition: opacity 0.32s cubic-bezier(.4,0,.2,1), transform 0.32s cubic-bezier(.4,0,.2,1), border-radius 0.32s cubic-bezier(.4,0,.2,1);
    will-change: transform, opacity;
    cursor: zoom-out;
    user-select: none;
    -webkit-user-select: none;
  `;

  viewer.append(img);
  document.body.append(viewer);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      viewer.style.background = '#000';
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    });
  });

  function animateOut() {
    viewer.style.background = 'rgba(0,0,0,0)';
    img.style.opacity = '0';
    img.style.transform = 'scale(0.82)';
    img.style.borderRadius = '28px';
    setTimeout(() => viewer.remove(), 340);
    haptic(22);
  }

  viewer.addEventListener('click', () => history.back());
  img.addEventListener('click', e => { e.stopPropagation(); history.back(); });

  history.pushState({ imgViewer: true }, '');

  window.addEventListener('popstate', function handler() {
    animateOut();
    window.removeEventListener('popstate', handler);
  });
}

function showFeedSkeleton() {
  document.getElementById('feedList').innerHTML = Array.from({ length: 5 }, () => `
    <div class="feed-skel-card">
      <div class="feed-skel feed-skel-img"></div>
      <div class="feed-skel feed-skel-title"></div>
      <div class="feed-skel feed-skel-title2"></div>
      <div class="feed-skel feed-skel-meta"></div>
    </div>
  `).join('');
}

function renderPosts(posts) {
  const list = document.getElementById('feedList');
  list.replaceChildren();

  posts.forEach((post, i) => {
    const card = create('div', 'feed-card' + (i === 0 ? ' feed-card-featured' : ''));
    card.style.animationDelay = `${i * 35}ms`;
    card.addEventListener('click', () => openFeedDetail(post));

    if (post.imgUrl) {
      const wrap = create('div', 'feed-card-img');
      wrap.append(picture(post.imgUrl, true));
      card.append(wrap);
    }

    const meta = create('div', 'feed-card-meta');
    meta.append(create('span', 'feed-tag', post.source), create('span', 'feed-time', timeAgo(post.pubDate)));

    const footer = create('div', 'feed-card-footer');
    footer.append(meta, symbol('chevron_right', 'feed-card-chevron'));

    card.append(
      create('span', 'feed-card-index', String(i + 1).padStart(2, '0')),
      create('div', 'feed-card-title', post.title),
      footer,
    );
    list.append(card);
  });
}

async function fetchRssFeed(feedInfo) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedInfo.url)}&count=10`;
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000), cache: 'no-store', referrerPolicy: 'no-referrer' });
  if (!res.ok) throw new Error('bad status');
  const json = await res.json();
  if (json.status !== 'ok' || !Array.isArray(json.items) || !json.items.length) throw new Error('empty');
  return json.items
    .map(item => cleanPost({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      author: item.author,
      description: item.description,
      content: item.content || item.description,
      imgUrl: item.thumbnail || extractRssImage(item),
      source: feedInfo.source,
    }))
    .filter(Boolean);
}

async function fetchAll() {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchRssFeed));
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
}

function showFeedError() {
  const list = document.getElementById('feedList');
  list.innerHTML = `
    <div class="feed-error">
      <span class="material-symbols-outlined">wifi_off</span>
      <p>Couldn't load feed</p>
      <button class="md-btn" style="width:auto;padding:.6rem 1.5rem">Retry</button>
    </div>
  `;
  const retry = list.querySelector('.md-btn');
  retry.addEventListener('click', e => { e.stopPropagation(); haptic(64); });
  retry.addEventListener('click', () => loadFeed(true));
}

async function fetchAndRender(showSkeleton) {
  const refreshBtn = document.getElementById('feedRefreshBtn');
  const setRefreshing = state => {
    if (!refreshBtn) return;
    refreshBtn.classList.toggle('spinning', state);
    refreshBtn.disabled = state;
  };

  if (showSkeleton) showFeedSkeleton();
  setRefreshing(true);
  const fresh = await fetchAll();
  setRefreshing(false);

  if (!fresh.length) { showFeedError(); return; }
  fresh.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  cachePosts(fresh);
  feedLoaded = true;
  renderPosts(fresh);
}

async function fetchFreshInBackground(cached) {
  const fresh = await fetchAll();
  if (!fresh.length) return;
  const merged = mergeAndDedupe(cached, fresh);
  cachePosts(merged);
  if (merged.length > cached.length) renderPosts(merged);
}

export async function loadFeed(forceRefresh = false) {
  if (forceRefresh) {
    localStorage.removeItem(FEED_CACHE_KEY);
    feedLoaded = false;
    return fetchAndRender(true);
  }

  const cached = getCachedPosts();
  if (cached?.length) {
    feedLoaded = true;
    renderPosts(cached);
    fetchFreshInBackground(cached);
    return;
  }

  return fetchAndRender(true);
}
