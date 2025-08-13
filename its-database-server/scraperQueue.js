const path = require('path');
const { fork } = require('child_process');
const MAX_CONCURRENT = 10;
let active = 0;
let activeTasks = []; // tracks running tasks with kill capability
const queue = [];

function runNext() {
  while (queue.length > 0 && activeTasks.length < MAX_CONCURRENT) {
    const { task, resolve, reject, label, cancelable } = queue.shift();
    // console.log(`[Queue] Running task: ${label}`);

    const promise = task();
    const taskRef = { task, resolve, reject, label, cancelable };
    activeTasks.push(taskRef);

    promise
      .then(res => resolve(res))
      .catch(err => reject(err))
      .finally(() => {
        // console.log(`[Queue] Task finished: ${label}`);
        activeTasks = activeTasks.filter(t => t !== taskRef);
        runNext();
      });
  }
}

function enqueue(task, label = 'anonymous', priority = false, cancelable = null) {
  return new Promise((resolve, reject) => {
    const taskObj = { task, resolve, reject, label, cancelable };

    if (priority) {
      // console.log(`[Queue] Priority task received: ${label}`);
      const interrupted = [];
      activeTasks = activeTasks.filter(t => {
        const isScraper = t.label?.startsWith("scrape:");
        if (isScraper && t.cancelable) {
          // console.warn(`[Queue] Cancelling active task: ${t.label}`);
          t.cancelable(); // kill the child process
          interrupted.push(t);
          return false;
        }
        return true;
      });

      queue.unshift(taskObj, ...interrupted);
    } else {
      // console.log(`[Queue] Normal task enqueued: ${label}`);
      queue.push(taskObj);
    }

    runNext();
  });
}


module.exports = enqueue;
