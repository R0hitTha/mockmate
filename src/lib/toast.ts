export interface ToastOptions {
  duration?: number;
}

class ToastManager {
  private notify(type: "success" | "error" | "info", message: string, options?: ToastOptions) {
    if (typeof window === "undefined") return;

    let container = document.getElementById("mockmate-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "mockmate-toast-container";
      container.className =
        "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none";
      document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    const colors = {
      success: "bg-emerald-600 text-white border-emerald-700",
      error: "bg-red-600 text-white border-red-700",
      info: "bg-blue-600 text-white border-blue-700",
    }[type];

    toastEl.className = `${colors} px-4 py-3 rounded-lg shadow-lg border text-xs font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center justify-between gap-3`;
    
    const textSpan = document.createElement("span");
    textSpan.textContent = message;
    toastEl.appendChild(textSpan);

    container.appendChild(toastEl);

    requestAnimationFrame(() => {
      toastEl.classList.remove("translate-y-2", "opacity-0");
    });

    const duration = options?.duration || 3500;
    setTimeout(() => {
      toastEl.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => {
        toastEl.remove();
      }, 300);
    }, duration);
  }

  success(msg: string, options?: ToastOptions) {
    this.notify("success", msg, options);
  }

  error(msg: string, options?: ToastOptions) {
    this.notify("error", msg, options);
  }

  info(msg: string, options?: ToastOptions) {
    this.notify("info", msg, options);
  }
}

export const toast = new ToastManager();

