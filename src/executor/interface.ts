import type { ExecutorResult } from "../types/executor";

export interface IOutlookExecutor {
  execute<T>(scriptCategory: string, scriptName: string, params?: Record<string, unknown>): Promise<ExecutorResult<T>>;
}
