const chooseImgBtn = document.querySelector("#Btn1");
const resetBtn = document.querySelector("#Btn2");
const downloadBtn = document.querySelector("#Btn3");
const imgInput = document.querySelector("#imageInput");
const image = document.querySelector("#image");
const controls = Array.from(document.querySelectorAll(".controls"));
const presetButtons = Array.from(document.querySelectorAll(".presetBtn"));
const currentObjectURLState = { value: null };

const filterConfigs = [
  { id: "brightness", unit: "%", cssName: "brightness" },
  { id: "contrast", unit: "%", cssName: "contrast" },
  { id: "saturation", unit: "%", cssName: "saturate" },
  { id: "hueRotation", unit: "deg", cssName: "hue-rotate" },
  { id: "blur", unit: "px", cssName: "blur" },
  { id: "grayscale", unit: "%", cssName: "grayscale" },
  { id: "sepia", unit: "%", cssName: "sepia" },
  { id: "opacity", unit: "%", cssName: "opacity" },
  { id: "invert", unit: "%", cssName: "invert" },
];

const controlMap = Object.fromEntries(
  filterConfigs.map(({ id }) => [id, document.querySelector(`#${id}`)]),
);

const valueBadgeMap = {};

const presetConfigs = {
  original: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotation: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    opacity: 100,
    invert: 0,
  },
  vivid: {
    brightness: 110,
    contrast: 125,
    saturation: 150,
    hueRotation: 8,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    opacity: 100,
    invert: 0,
  },
  warm: {
    brightness: 108,
    contrast: 112,
    saturation: 132,
    hueRotation: 18,
    blur: 0,
    grayscale: 0,
    sepia: 14,
    opacity: 100,
    invert: 0,
  },
  mono: {
    brightness: 102,
    contrast: 118,
    saturation: 0,
    hueRotation: 0,
    blur: 0,
    grayscale: 100,
    sepia: 0,
    opacity: 100,
    invert: 0,
  },
};

function setActivePreset(presetName) {
  presetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.preset === presetName);
  });
}

function formatControlValue(value, unit) {
  return `${value}${unit}`;
}

function updateControlValueBadges() {
  filterConfigs.forEach(({ id, unit }) => {
    const control = controlMap[id];
    const valueBadge = valueBadgeMap[id];

    if (!control || !valueBadge) return;
    valueBadge.textContent = formatControlValue(control.value, unit);
  });
}

function initializeControlValueBadges() {
  filterConfigs.forEach(({ id, unit }) => {
    const label = document.querySelector(`label[for="${id}"]`);

    if (!label) return;

    const valueBadge = document.createElement("span");
    valueBadge.className = "controlValue";
    valueBadge.textContent = formatControlValue(controlMap[id].value, unit);
    label.appendChild(valueBadge);
    valueBadgeMap[id] = valueBadge;
  });
}

function applyFilters() {
  updateControlValueBadges();

  const filterValue = filterConfigs
    .map(({ id, unit, cssName }) => `${cssName}(${controlMap[id].value}${unit})`)
    .join(" ");

  image.style.filter = filterValue;
}

function applyPreset(presetName) {
  const preset = presetConfigs[presetName];

  if (!preset) return;

  filterConfigs.forEach(({ id }) => {
    if (Object.prototype.hasOwnProperty.call(preset, id)) {
      controlMap[id].value = preset[id];
    }
  });

  setActivePreset(presetName);
  applyFilters();
}

function selectFile() {
  imgInput.click();
}

function reset() {
  controls.forEach((control) => {
    control.value = ["brightness", "contrast", "saturation", "opacity"].includes(control.id) ? 100 : 0;
  });

  setActivePreset("original");
  applyFilters();
}

chooseImgBtn.addEventListener("click", selectFile);

imgInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (currentObjectURLState.value) URL.revokeObjectURL(currentObjectURLState.value);
  currentObjectURLState.value = URL.createObjectURL(file);
  image.src = currentObjectURLState.value;
  image.style.width = "100%";
  image.style.height = "100%";
});

downloadBtn.addEventListener("click", () => {
  if (!image.src) return;

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");

  ctx.filter = image.style.filter || "none";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

controls.forEach((control, index) => {
  control.addEventListener("input", () => {
    setActivePreset("");
    applyFilters();
  });
});
resetBtn.addEventListener("click", reset);

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyPreset(button.dataset.preset);
  });
});

setActivePreset("original");
initializeControlValueBadges();
applyFilters();
