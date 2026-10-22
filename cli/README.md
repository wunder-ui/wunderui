# wunderui-cli

Add [WunderUI](https://wunderui.com) components and blocks to your project as source.

```bash
npx wunderui-cli add button badge date-picker
```

Writes each component with every file it needs into your source root (where `@/` points), installs its dependencies and, on first use, the WunderUI styles. The 83 free components are MIT ([wunder-ui/wunderui](https://github.com/wunder-ui/wunderui)); Core and Pro components and the blocks come with a [plan](https://wunderui.com/#pricing).

| Command | |
| --- | --- |
| `wunderui-cli add <name…>` | free components with their files, dependencies and styles |
| `wunderui-cli list --components` | every free component |
| `wunderui-cli login <key>` | store your licence key |
| `wunderui-cli add <category>/<block>` | a block (WunderUI Pro) |

Options: `--overwrite`, `--dry-run`, `--no-install`.

## Reference for people and agents

Offline answers from the same data as the [MCP server](https://github.com/Kl-webmedia/wunderui-mcp) (design.json, DESIGN.md), for the free components:

| Command | |
| --- | --- |
| `wunderui-cli component <name>` | props with type, values, default and required; variants; keyboard and ARIA; example |
| `wunderui-cli component --list` | every free component |
| `wunderui-cli search "<question>"` | components, blocks, docs topics and tokens, ranked |
| `wunderui-cli docs [topic]` | tokens, theming, motion, install, a11y, rules, copy … |
| `wunderui-cli build "<task>"` | a playbook: settings page, dashboard, login, table page, form, agent run |
| `wunderui-cli doctor` | checks the project; `--fix` shows safe changes, `--fix --write` applies them |

Every command takes `--json` (one envelope on stdout: `{ "ok", "data", "error": { "code", "message" } }`, no colour) and `--dense` (fewer lines and tokens). Exit codes: 0 ok, 1 error or failed check, 2 usage, 3 not found, 4 licence required, 5 network, 6 data missing. Core and Pro components show their name, category and plan; their details come through the MCP server or after `wunderui-cli login <key>`.
