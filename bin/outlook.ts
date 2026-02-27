#!/usr/bin/env bun
import { runMain } from "citty";
import main from "../src/index";

await runMain(main);
process.exit(0);
