export interface ExecutorResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  exitCode?: number;
}
