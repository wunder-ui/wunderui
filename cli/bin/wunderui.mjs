#!/usr/bin/env node
import { run } from "../src/index.mjs"
import { EXIT, envelope } from "../src/output.mjs"

const argv = process.argv.slice(2)

run(argv).catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  if (argv.includes("--json")) {
    // the envelope goes to stdout, like every answer in JSON mode
    const dense = argv.includes("--dense")
    process.stdout.write(`${JSON.stringify(envelope(error?.data ?? null, { code: error?.code ?? "ERROR", message }), null, dense ? 0 : 2)}\n`)
  } else if (!error?.shown) {
    console.error(`\n  ${message}\n`)
  }
  process.exitCode = typeof error?.exit === "number" ? error.exit : EXIT.ERROR
})
