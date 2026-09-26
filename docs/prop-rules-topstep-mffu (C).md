# Topstep and My Funded Futures rule research (C)

Checked 2026-09-26. Official firm sources only. The companion `prop-rules-topstep-mffu (C).json` contains the rule-by-rule citations, sizes, stage labels and explicit uncertainties for the dashboard. This is a reference snapshot, not a real-time compliance engine. No personal accounts or trading data are included.

## Coverage

- Topstep: regular Combine billing paths, Standard and Consistency Express Funded paths, Live, and five limited Labs offerings. [Program parameters](https://help.topstep.com/en/articles/8284197-trading-combine-parameters), [Labs](https://www.topstep.com/labs).
- MFFU: Rapid Intraday in four sizes, Rapid EOD in two sizes, Builder in four sizes plus the reduced-drawdown 50K add-on, Pro and its one-day add-on. Legacy Builder 25K without DLL and both documented generations of Flex 25K/50K are kept separate. [Evaluation overview](https://help.myfundedfutures.com/en/articles/11802636-traders-evaluation-simplified), [Builder collection](https://help.myfundedfutures.com/en/collections/19480282-builder-plan), [Legacy collection](https://help.myfundedfutures.com/en/collections/16162798-legacy-plans).

Firm-level `rules` are shared policy summaries and must appear with every selected account plan. They are not account types. Program entries preserve stage differences rather than forcing each plan into the existing manual tracker's payout formula.

## Findings that need special handling

1. MFFU Builder 150K has contradictory payout amounts and a copied account-size reference in its official page. Its record is `needs-review`; do not calculate eligibility from it. [Builder 150K](https://help.myfundedfutures.com/en/articles/17035331-builder-plan-150k-comprehensive-guide).
2. New Builder 25K has a soft DLL, while an explicitly legacy no-DLL version remains documented. General overview articles have not caught up. The current page contains a stray extra zero in one DLL paragraph; table and FAQ agree with each other. [Current Builder 25K](https://help.myfundedfutures.com/en/articles/17036130-builder-plan-25k-a-comprehensive-look), [Legacy Builder 25K](https://help.myfundedfutures.com/en/articles/15862870-builder-plan-25k-legacy-no-dll).
3. Topstep Labs marketing and help text disagree on Combine consistency. All drops are presented as past drops on the public landing page. Keep their availability unconfirmed. The $6K challenge has fewer available details than the earlier challenges. [Labs help](https://help.topstep.com/en/articles/15520357-topstep-labs), [Labs landing page](https://www.topstep.com/labs).
4. Pro's official funded contract table gives an unusual micro ratio. Do not silently multiply by ten. Its discretionary conduct requirements remain despite having no numeric funded consistency percentage. [Pro details](https://help.myfundedfutures.com/en/articles/11802674-pro-plan-sim-funded-and-live-account-highlights), [Pro conduct consistency](https://help.myfundedfutures.com/en/articles/8694840-balancing-freedom-and-responsibility-consistency-for-sim-funded-pro-accounts-at-mffu).
5. The MFFU news policy broadly describes restrictions around all releases but then separately allows certain releases and plans. Preserve that ambiguity. [News policy](https://help.myfundedfutures.com/en/articles/8230009-news-trading-policy).

## Gaps

- Topstep's main XFA scaling chart was not present in extracted article text. The catalog cites the official article and tells users to check next-session limits in their platform; product-specific restrictions may further reduce them. [Scaling](https://help.topstep.com/en/articles/8284223-what-is-the-scaling-plan).
- MFFU's historical Core/Scale help links returned 404. Complete official Starter/Expert historical rule sets were not recovered; these were not invented or mislabeled as current.
- Some Rapid Intraday size-specific articles do not state inactivity; those entries explicitly require confirmation.
- Current offer availability, grandfathering and discretionary live risk settings cannot be determined from public documentation alone. Match the account's actual agreement and purchase generation.
- Linked firm terms include identity/region eligibility and additional discretionary restrictions beyond these operational trading summaries. This catalog is not claimed to reproduce every contractual clause.

Stats remain manual. None of this research authorizes overwriting saved account rules, balances, expenses or payout histories.
