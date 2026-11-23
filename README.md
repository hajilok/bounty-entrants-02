[![make.fun · bounty-entrants-02](https://make.fun/badge/bounty-entrants-02.svg)](https://make.fun/bounty/bounty-entrants-02?ref=41fw6r6c)
[![rank](https://make.fun/badge/bounty-entrants-02/hajilok/bounty-entrants-02/rank.svg)](https://make.fun/bounty/bounty-entrants-02/leaderboard?ref=41fw6r6c)
[![reward](https://make.fun/badge/bounty-entrants-02/hajilok/bounty-entrants-02/reward.svg)](https://make.fun/bounty/bounty-entrants-02?ref=41fw6r6c)

# bounty-entrants-02

Entry repository for the make.fun competition **[bounty-entrants-02](https://make.fun/bounty/bounty-entrants-02?ref=41fw6r6c)** (*Get the most paying entrants across the bounties you launch on make.fun*). Join make.fun via [make.fun/r/41fw6r6c](https://make.fun/r/41fw6r6c).

## Overview

In `bounty-entrants-02`, ranking is determined by the total counted paying entrants across the public sponsored bounties listed in `BOUNTY.json` (each with an entry fee of at least `$0.50` and funded prizes escrowed in USDC on Solana).

The repository entrypoint `main.ts` runs deterministically on Node.js 22 using only the Node standard library:
1. Reads `BOUNTY.json` from `MAKEFUN_BOT_DIR` (defaults to `/bot`).
2. Validates the manifest size cap, JSON structure, mutual exclusion of `bounties` vs `url`, and item bounds.
3. Emits the exact manifest bytes to `MAKEFUN_OUTPUT_DIR/BOUNTY.json` (defaults to `/output/BOUNTY.json`).

## Prerequisite Before Final Submission

`BOUNTY.json` currently contains the placeholder `"https://make.fun/bounty/<slug>"` because the linked Solana wallets on `@yuki-kato` hold `0 USDC` / `0 SOL` and no sponsored bounties have been funded yet. Before the `2026-11-24T07:30:00Z` deadline:

1. Link a Solana wallet holding USDC (`>= $5.00` per bounty) plus a small amount of SOL to `@yuki-kato`.
2. Launch one or more bounties (entry fee `>= $0.50`, fast `auto_list` or `setup: 'self'`) via [make.fun/sponsor/new](https://make.fun/sponsor/new?ref=41fw6r6c).
3. Replace the placeholder in `BOUNTY.json` with the live public bounty URL(s), commit, and resubmit.

## Local Execution

```bash
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT (`SPDX-License-Identifier: MIT`). See [LICENSE](./LICENSE).
