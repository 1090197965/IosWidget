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
