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
