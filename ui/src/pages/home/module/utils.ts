export function getUrlParams(): any {
  const result = {};
  let url = window.location.hash;
  const reg = /[?&][^?&]+=[^?&]+/g;
  const arr = url.match(reg);
  if (arr) {
    arr.forEach(v => {
      let item = v.substring(1).split('=');
      result[item[0]] = item[1];
    });
  }
  return result;
}

export function setEmojiNameCount(emojiName: string) {
  let cache:any = getEmojiNameCount();

  if (!cache.hasOwnProperty(emojiName)) {
    cache[emojiName] = 0;
  }

  cache[emojiName] = cache[emojiName] + 1;
  localStorage.setItem('cache-emoji-stat-v1', JSON.stringify(cache));
}

export function getEmojiNameCount() {
  let cache:any = localStorage.getItem('cache-emoji-stat-v1');

  if (!cache) {
    cache = {};
  } else {
    cache = JSON.parse(cache)
  }

  return cache;
}

export function getEventDate() {
  const today = new Date();
  console.log('today.toLocaleDateString()', today.toLocaleDateString());
  switch (today.toLocaleDateString()) {
    case '2023/8/7':
      // @ts-ignore
      if (!window.EVENT_DATE_TEMPORARY_CLOSE && !getCache('EVENT_DATE_TEMPORARY_CLOSE')) {
        return '/birthday';
      }
      break;
  }

  return '';
}

export function getCache<T>(key: string): T {
  return window.localStorage.getItem(key) as T;
}

export function setCache(key: string, value: any) {
  window.localStorage.setItem(key, value);
}
