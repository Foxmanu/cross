import { toast } from "react-toastify";

const queue = [];
let processing = false;

export function enqueueNotification(message, options = {}) {
  queue.push({ message, options });
  if (!processing) processQueue();
}

async function processQueue() {
  processing = true;
  while (queue.length) {
    const { message, options } = queue.shift();
    toast.info(message, { ...options });
    // Wait for the toast to close before showing the next one
    await new Promise((resolve) =>
      setTimeout(resolve, options.autoClose || 4000)
    );
  }
  processing = false;
}