# wunderui-cli

Add [WunderUI](https://wunderui.com) components and blocks to your project as source.

```bash
npx wunderui-cli add button badge date-picker
```

Writes each component with every file it needs into your source root (where `@/` points), installs its dependencies and, on first use, the WunderUI styles. The 76 free components are MIT ([wunder-ui/wunderui](https://github.com/wunder-ui/wunderui)); Core and Pro components and the blocks come with a [plan](https://wunderui.com/#pricing).

| Command | |
| --- | --- |
| `wunderui-cli add <name…>` | free components with their files, dependencies and styles |
| `wunderui-cli list --components` | every free component |
| `wunderui-cli login <key>` | store your licence key |
| `wunderui-cli add <category>/<block>` | a block (WunderUI Pro) |

Options: `--overwrite`, `--dry-run`, `--no-install`.
