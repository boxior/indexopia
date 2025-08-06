type TaskFunction<T = any> = () => Promise<T>;

interface QueuedTask<T = any> {
    id: string;
    task: TaskFunction<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
    priority?: number;
}

class TaskQueue {
    private queue: QueuedTask[] = [];
    private maxConcurrentTasks = 2; // Process 2 tasks at a time
    private activeTasks = 0;

    async addTask<T>(id: string, task: TaskFunction<T>, priority = 0): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Remove any existing task with the same ID (latest wins)
            this.queue = this.queue.filter(queuedTask => queuedTask.id !== id);

            this.queue.push({
                id,
                task,
                resolve,
                reject,
                priority,
            });

            // Sort by priority (higher priority first)
            this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.activeTasks >= this.maxConcurrentTasks || this.queue.length === 0) {
            return;
        }

        const queuedTask = this.queue.shift();
        if (!queuedTask) return;

        this.activeTasks++;

        try {
            // Yield control to the browser before starting the task
            await this.yieldToMain();

            const result = await queuedTask.task();
            queuedTask.resolve(result);
        } catch (error) {
            queuedTask.reject(error);
        } finally {
            this.activeTasks--;

            // Process next task after a small delay to keep UI responsive
            setTimeout(() => this.processQueue(), 10);
        }
    }

    private yieldToMain(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    // Method to cancel pending tasks
    cancelTask(id: string) {
        this.queue = this.queue.filter(queuedTask => {
            if (queuedTask.id === id) {
                queuedTask.reject(new Error("Task cancelled"));
                return false;
            }
            return true;
        });
    }

    // Get queue status for debugging
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            activeTasks: this.activeTasks,
        };
    }
}

// Global singleton instance
export const globalTaskQueue = new TaskQueue();
