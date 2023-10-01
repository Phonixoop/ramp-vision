export function getPathName(path) {
  return path?.substring(path.lastIndexOf("/") + 1);
}
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const reloadSession = () => {
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
