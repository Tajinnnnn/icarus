---
creator: Codex (C)
verified: 2026-09-26
scope: Apex Trader Funding and Alpha Futures
---

# Apex and Alpha Futures rule research

The structured, sourced findings are in [prop-rules-apex-alpha (C).json](<prop-rules-apex-alpha (C).json>). Every rule links to an official source. This is a manual reference, not an eligibility engine or a copy of the firm's complete contract. No personal accounts, balances, credentials, or vault data are included.

## Coverage

| Firm | Account families covered | Size coverage |
| --- | --- | --- |
| Apex | EOD evaluation → simulated PA; Intraday evaluation → simulated PA | 25K, 50K, 100K, 150K |
| Apex | Legacy Full, including the promotional return | 25K, 50K, 100K, 150K, 250K, 300K; historical 75K separately flagged |
| Apex | Legacy Static | Historical 100K |
| Apex | Invited Live Prop Program | Assigned risk allocation, not simulated headline account size |
| Alpha Futures | Standard and Advanced evaluation → Qualified | 50K, 100K, 150K |
| Alpha Futures | Zero evaluation → Qualified | 25K, 50K, 100K |
| Alpha Futures | Direct Qualified, without evaluation | 25K, 50K, 100K, 150K |
| Alpha Futures | Live Program and Alpha Prime | Invited allocation derived from eligible Qualified accounts |
| Alpha Futures | Historical live and earlier Standard purchase terms | Historical profiles, with gaps identified |

The current Apex routes are documented separately in its [EOD collection](https://apextraderfunding.com/hc-category/eod-trailing-drawdown-accounts/) and [Intraday collection](https://apextraderfunding.com/hc-category/intraday-trailing-drawdown-accounts/). Alpha's current families and shared rules are linked from its [rules collection](https://help.alpha-futures.com/en/collections/9730678-trading-rules-and-parameters).

## Findings that matter for implementation

- **Do not combine Apex EOD and Intraday payout presets.** Their qualifying-day dollar thresholds and later payout caps differ. Both have a six-payout PA lifecycle. See [EOD payouts](https://apextraderfunding.com/help-center/eod-trailing-drawdown-accounts/eod-payouts/) and [Intraday payouts](https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-payouts/).
- **Apex's legacy availability documentation conflicts.** The retirement overview still says purchasing ended, while the official sales page currently advertises a limited return. Keep the legacy rule family and purchase date distinct from new EOD/Intraday. [Retirement overview](https://apextraderfunding.com/help-center/legacy-products/legacy-products-overview/), [current promotional offering](https://apextraderfunding.com/legacy-products/).
- **Apex inactivity depends on purchase generation.** Old Legacy and promotional Legacy do not share the same qualifying activity requirement. [Old Legacy policy](https://apextraderfunding.com/help-center/performance-accounts-pa/legacy-pa-inactivity-policy/), [new PA policy](https://apextraderfunding.com/help-center/billing/inactivity-policy-on-performance-accounts-pa/).
- **Alpha Direct is a separate payout model.** It uses fresh cycle-profit milestones and consistency, without the winning-day requirement of evaluation-to-Qualified plans. [Direct overview](https://help.alpha-futures.com/en/articles/15838742-direct-account-overview), [payout policy](https://help.alpha-futures.com/en/articles/9492051-payout-policy).
- **Qualified Alpha fee labels on the marketing page are misleading.** The dedicated subscription article says Qualified traders do not pay a monthly subscription. Use that policy, not the repeated price displayed on marketing cards. [Subscription policy](https://help.alpha-futures.com/en/articles/9492068-monthly-subscription).
- **These programs are not automation permission.** Apex and Alpha currently prohibit fully automated trading; Alpha permits manually managed indicator signals and owner-operated copying under its separate rules. A manual statistics tracker does not execute trades. [Apex prohibited activities](https://apextraderfunding.com/help-center/getting-started/prohibited-activities/), [Alpha prohibited practices](https://help.alpha-futures.com/en/articles/9508585-prohibited-trading-practices).

## Explicit gaps and conflicts

1. Apex's historical 75K target/payout table was not found in the current payout article. The evaluation article still identifies that old size. Do not invent its missing fields. [Legacy evaluation rules](https://apextraderfunding.com/help-center/evaluation-accounts-ea/legacy-evaluation-rules/).
2. Apex's 50K scaling table overlaps at exactly $5,999. The platform-assigned tier should control that edge. [Scaling levels](https://apextraderfunding.com/help-center/additional-helpful-items/scaling-levels-pa-explained/).
3. Alpha's consistency article alternates strict and inclusive wording at the exact 40% and 20% boundaries. The catalog records this rather than automatically declaring a payout ready at equality. [Consistency policy](https://help.alpha-futures.com/en/articles/9492048-consistency-rule).
4. Alpha's payout policy expressly scopes the 50%-profit withdrawal rule to evaluation-to-Qualified plans; its homepage phrasing is broader. Direct users should confirm the applicable cap in their own dashboard. [Payout policy](https://help.alpha-futures.com/en/articles/9492051-payout-policy), [homepage](https://alpha-futures.com/).
5. Earlier Alpha Standard contracts are only partially recoverable from current public pages. Allocation grandfathering is explicit; older payout tables have been replaced. The historical card is marked “needs review.” [Allocation policy](https://help.alpha-futures.com/en/articles/9492088-maximum-allocation), [current Standard overview](https://help.alpha-futures.com/en/articles/11632512-standard-account-overview).
6. Alpha's current live path starts at zero while mentioning a percentage-based DLL; its older live rules article describes a legacy balance. Actual live onboarding must settle the DLL basis and assigned limits. [Current path to live](https://help.alpha-futures.com/en/articles/10743344-path-to-live-structure), [legacy live rules](https://help.alpha-futures.com/en/articles/11023753-live-account-rules-and-parameters).

Promotional prices, coupons, payment processing timelines, jurisdiction eligibility, tax treatment, and full legal agreements are not reproduced. The catalog covers trading, risk, payout, account-generation, and lifecycle rules relevant to a manual dashboard; linked firm documents remain the authority.
