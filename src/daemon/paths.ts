import { getConfigDir } from "../lib/config";
import { join } from "path";

export const SOCKET_PATH = join(getConfigDir(), "daemon.sock");
export const PID_PATH = join(getConfigDir(), "daemon.pid");
export const LOG_PATH = join(getConfigDir(), "daemon.log");
