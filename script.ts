import "./wasm_exec.js";
import "./cmd/nasmfmt-wasm/nasmfmt.ts";
import { type FormatConfig } from "./cmd/nasmfmt-wasm/nasmfmt.ts";

const $ = (selector: string) => document.querySelector(selector) as HTMLElement;
const e = {
  highlighter: $("#highlighter"),
  commentIndent: $("#comment-indent") as HTMLInputElement,
  instructionIndent: $("#instruction-indent") as HTMLInputElement,
  error: $("#error"),
  code: $("#code") as HTMLTextAreaElement,
  copy: $("#copy") as HTMLButtonElement,
  format: $("#format") as HTMLButtonElement,
  footer: $("#footer"),
};

const formatConfig: FormatConfig = {
  instructionIndent: 8,
  commentIndent: 40,
};

function bindNumberInput<O extends Record<string, number>, K extends keyof O>(
  input: HTMLInputElement,
  obj: O,
  key: K,
) {
  // If the input has an ID, then use it to restore the state from
  // localStorage.
  if (input.id) {
    const value = parseInt(localStorage.getItem(`number-input-${input.id}`));
    if (value) {
      obj[key] = value as O[K];
    }
  }

  input.value = obj[key].toString();
  input.addEventListener("input", () => {
    const value = parseInt(input.value) as O[K];
    obj[key] = value;

    if (input.id) {
      localStorage.setItem(`number-input-${input.id}`, value.toString());
    }
  });
}

bindNumberInput(e.commentIndent, formatConfig, "commentIndent");
bindNumberInput(e.instructionIndent, formatConfig, "instructionIndent");

e.code.addEventListener("keydown", (ev) => {
  if (ev.key == "Tab") {
    ev.preventDefault();
    const start = e.code.selectionStart;
    const end = e.code.selectionEnd;
    const indent = " ".repeat(formatConfig.instructionIndent);
    e.code.value = e.code.value.substring(0, start) + indent + e.code.value.substring(end);
    e.code.selectionStart = e.code.selectionEnd = start + indent.length;
    return;
  }

  if (ev.ctrlKey && (ev.key == "Enter" || ev.key == "s")) {
    ev.preventDefault();
    e.format.click();
    return;
  }
});

e.copy.addEventListener("click", () => {
  e.code.select();
  document.execCommand("copy");
});

e.format.addEventListener("click", async () => {
  let error = "";
  try {
    e.code.value = await nasmfmt.format(e.code.value, formatConfig);
  } catch (e) {
    error = e.toString();
  } finally {
    e.error.textContent = error;
  }
});

e.footer.addEventListener("click", () => {
  const visible = e.footer.querySelector(".visible");
  visible.classList.remove("visible");
  const next = visible.nextElementSibling || e.footer.firstElementChild;
  next.classList.add("visible");
});

// Bind a handler to remove the "click-me" class from elements when clicked.
document.querySelectorAll(".click-me").forEach((el) => {
  // Restore all elements that have been clicked before.
  if (el.id && sessionStorage.getItem(`clicked-${el.id}`)) {
    el.classList.remove("click-me");
    return;
  }

  const onclick = () => {
    // If the element has an ID, then store the ID as clicked in sessionStorage
    // to prevent this from being shown again.
    if (el.id) {
      sessionStorage.setItem(`clicked-${el.id}`, "true");
    }
    el.classList.remove("click-me");
    el.removeEventListener("click", onclick);
  };

  el.addEventListener("click", onclick);
});

// Enable the UI
e.highlighter.removeAttribute("disabled");
