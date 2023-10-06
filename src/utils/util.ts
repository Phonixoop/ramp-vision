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

export function en(inputString) {
  const persianToEnglishMap = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };

  return inputString.replace(/[۰-۹]/g, (match) => persianToEnglishMap[match]);
}
