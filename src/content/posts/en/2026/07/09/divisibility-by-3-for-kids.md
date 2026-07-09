---
author: "HAOGRE"
pubDatetime: 2026-07-09T01:45:00.000Z
title: "Why Does \"Adding Up the Digits\" Work for Divisibility by 3? — A Version for Kids"
featured: false
draft: false
lang: en
translationKey: "被3整除的小朋友版"
tags:
  - "musings"
  - "mathematics"
  - "miscellaneous"
description: "Why can you tell if a number is divisible by 3 just by adding its digits? Explained with steps and leftovers for young readers."
---
You probably know this trick: to check if a number is divisible by 3, you don't actually have to divide it. Just add up all its digits, and see if that sum is divisible by 3.

For example, 123: 1 + 2 + 3 = 6, and 6 is divisible by 3, so 123 is also divisible by 3. If you actually do the division, 123 ÷ 3 = 41, and it works!

But — **why?** Why does adding up the digits work, instead of looking at the last digit or something else?

Even stranger: this "add the digits" trick only works for 3 and 9. To check divisibility by 2 or 5, you look at the last digit. For 4, you look at the last two digits. For 7, there's no easy trick at all. What makes 3 and 9 so special?

The answer is actually very simple, and it's hidden in one sentence: **In base 10, when you divide 10 by 3, the remainder is exactly 1.**

## Step 1: How a Number Is Built

The numbers we write are in base 10. That means every time you move one place to the left, you multiply by 10.

- A 1 in the ones place is just 1.
- A 1 in the tens place is actually 10.
- A 1 in the hundreds place is actually 100.
- A 1 in the thousands place is actually 1000.

So the number 352 can be broken down as:

> 352 = 3 hundreds + 5 tens + 2 ones
> = 3 × 100 + 5 × 10 + 2

Each digit stands on its own "step," and the higher the step, the bigger the number it represents.

![Decimal steps: each step to the left multiplies by 10](/uploads/2026/07/09/小朋友被3整除/01-steps.svg)

## Step 2: The Key Discovery — Every Step Leaves a Remainder of 1 When Divided by 3

Now we only care about one thing: **When we divide these steps (1, 10, 100, 1000, ...) by 3, what remainder does each leave?**

Take 10: 10 ÷ 3 = 3 remainder 1. 10 is 3 times 3 plus 1, so the remainder is 1.

What about 100? 100 ÷ 3 = 33 remainder 1. Still 1.

What about 1000? 1000 ÷ 3 = 333 remainder 1. Still 1.

Did you notice? **1, 10, 100, 1000, ... all leave a remainder of 1 when divided by 3.** Not a single exception.

That's the secret to the whole thing.

![Every step leaves remainder 1 when divided by 3](/uploads/2026/07/09/小朋友被3整除/02-remainder-one.svg)

## Step 3: Add Up the "Leftovers" from Each Digit

Let's go back to 352 = 3 × 100 + 5 × 10 + 2.

Replace each step with its remainder when divided by 3 (all of them are 1):

- 3 × 100: 100 leaves 1, so this part leaves 3 × 1 = 3.
- 5 × 10: 10 leaves 1, so this part leaves 5 × 1 = 5.
- 2 × 1: 1 leaves 1, so this part leaves 2 × 1 = 2.

Add them up: 3 + 5 + 2 = 10. This is the "skeleton" of the remainder when 352 is divided by 3.

In other words: **The remainder when 352 is divided by 3 is the same as the remainder when the sum of its digits is divided by 3.** Because each step secretly carries a leftover of 1, and collecting all those leftovers gives you exactly the sum of the digits.

So if the sum of the digits is divisible by 3, then 352 is divisible by 3. Let's check: 3 + 5 + 2 = 10, and 10 is not divisible by 3, so 352 is not divisible by 3. If you actually divide, 352 ÷ 3 = 117 remainder 1, so it's not divisible. Correct!

![Collecting the 1s each digit carries gives the digit sum](/uploads/2026/07/09/小朋友被3整除/03-collect-ones.svg)

## Step 4: Why Does 9 Also Have This Trick?

Because 10 ÷ 9 also leaves a remainder of 1.

10 = 9 × 1 + 1, remainder 1. 100 = 9 × 11 + 1, remainder 1. 1000 = 9 × 111 + 1, remainder 1. Every step leaves a remainder of 1 when divided by 9, so the "add the digits" trick works for 9 too.

9 is even more powerful: if you keep adding the digits until you get a single digit, that digit is the remainder when the original number is divided by 9 (if it's 9, the remainder is 0, meaning it's divisible by 9). This is the ancient "casting out nines" method, invented over a thousand years before calculators, to quickly check if a multiplication is correct.

## Step 5: Why Don't Other Numbers Work?

This is the most important question. The form of the trick depends on **what remainder 10 leaves when divided by that number.**

**2 and 5: 10 divided by them leaves remainder 0.** Because 10 itself is a multiple of 2 and 5 (2 × 5 = 10). Starting from the tens place, all steps leave remainder 0, only the ones place leaves 1. So to check divisibility by 2 or 5, you only need to look at the last digit — that's why "look at the last digit" works.

**4 and 25: 100 divided by them leaves remainder 0.** From the hundreds place onward, all steps leave remainder 0, so only the last two digits matter. That's why you look at the last two digits for divisibility by 4.

**11: 10 divided by 11 leaves remainder 10, which is the same as −1.** This is a special case: the remainders of the steps alternate between 1 and −1 (1, −1, 1, −1, ...). So to check divisibility by 11, you add the digits in odd positions and the digits in even positions separately, then see if the difference is divisible by 11. It's related to 3 and 9, but instead of adding all digits, you add and subtract alternately.

**7 and 13: 10 divided by them leaves a remainder that is neither 0, 1, nor −1.** 10 ÷ 7 leaves remainder 3, and 10 ÷ 13 leaves remainder 10. The remainders of the steps jump around without a pattern, so there's no simple trick for 7 or 13.

## Step 6: The Real Answer

Putting all these cases together, the pattern becomes clear:

| Remainder when 10 is divided by the number | What the trick looks like | Which numbers have this trick |
|---|---|---|
| 0 | Look at the last few digits | 2, 5; 4, 25; 8, 125 |
| 1 | Add up all the digits | 3, 9 |
| −1 | Add and subtract digits in alternating positions | 11 |
| Other random remainders | No easy trick | 7, 13, ... |

The "add the digits" trick only works when 10 divided by the number leaves remainder 1. And 10 ÷ 3 leaves remainder 1, and 10 ÷ 9 leaves remainder 1, which corresponds to the fact that 10 − 1 = 9, and the only divisors of 9 are 1, 3, and 9.

So this trick is a "patent" of 3 and 9. It's not a coincidence; it's because in base 10, 10 − 1 = 9.

![Only 3 and 9 have the "add digits" patent](/uploads/2026/07/09/小朋友被3整除/04-patent.svg)

If you change the base, the patent changes owner: in base 8, 8 − 1 = 7, so in octal, adding digits checks divisibility by 7; in base 12, 12 − 1 = 11, so it checks divisibility by 11. The trick follows the base, because it's rooted in the fact that 10 divided by 3 leaves remainder 1, and the opposite of 1 is always "base minus one."

## One-Sentence Summary

The secret of the whole article is just one sentence:

**Every decimal step (1, 10, 100, 1000, ...) leaves a remainder of 1 when divided by 3, so the remainder when a number is divided by 3 is the same as the remainder when the sum of its digits is divided by 3. The same goes for 9. Other numbers don't have this trick because their steps don't leave remainder 1.**

Next time someone asks you why the trick for 3 is to add the digits, you can tell them: because 10 is one more than a multiple of 3, and each digit secretly carries an extra 1, so collecting them gives you the digit sum.
