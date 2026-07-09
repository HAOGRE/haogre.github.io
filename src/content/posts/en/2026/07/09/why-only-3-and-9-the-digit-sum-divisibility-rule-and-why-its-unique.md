---
author: "HAOGRE"
pubDatetime: 2026-07-09T01:39:56.065Z
title: "Why Only 3 and 9: The Digit Sum Divisibility Rule and Why It's Unique"
featured: false
draft: false
lang: en
translationKey: "为什么只有3和9"
tags:
  - "musings"
  - "mathematics"
  - "miscellaneous"
description: "Uncover the math behind the digit sum divisibility rule for 3 and 9, and why no other number has it."
---

We learned in elementary school: to check if a number is divisible by 3, add up its digits and see if the sum is divisible by 3. For 12345, the sum is 15, which is divisible by 3, so 12345 is divisible by 3.

This rule is handy, but a question lingers: **Why?** And a deeper one: why does this "digit sum" trick work only for 3 and 9, but not for 2, 5, 4, 7, or 11? For 2 we look at the last digit, for 4 the last two digits, for 11 we alternately add and subtract digits, and for 7 there's no simple rule at all. What makes 3 and 9 so special?

The answer lies in a single congruence: **10 ≡ 1 (mod 3)**. And the reason other numbers don't have it is that 10 − 1 = 9, whose only positive divisors are 1, 3, and 9. This is no coincidence; it's a necessary consequence of decimal notation.

## 1. Stating the Rule Clearly

We need to prove: for any positive integer N, N is divisible by 3 if and only if the sum of its digits is divisible by 3.

Write N in decimal:

> N = aₙ·10ⁿ + aₙ₋₁·10ⁿ⁻¹ + … + a₁·10 + a₀

For example, 352 = 3·100 + 5·10 + 2. Here aₙ…a₀ are the digits.

We want to check if N mod 3 = 0. The key is the remainder of powers of 10 when divided by 3.

## 2. The Key Congruence: 10 ≡ 1 (mod 3)

3 × 3 = 9, 3 × 4 = 12, so 10 divided by 3 leaves remainder 1. In congruence notation:

> 10 ≡ 1 (mod 3)

This line is the root of it all. It means that when considering remainders modulo 3, 10 and 1 are equivalent.

Since 10 and 1 are equivalent, powers of 10 are equivalent to powers of 1:

> 100 = 10² ≡ 1² = 1 (mod 3)
> 1000 = 10³ ≡ 1³ = 1 (mod 3)
> …
> 10ⁿ ≡ 1 (mod 3)

Each term's 10ⁿ can be replaced by 1 modulo 3. Hence:

> N = aₙ·10ⁿ + … + a₁·10 + a₀
> ≡ aₙ·1 + … + a₁·1 + a₀  (mod 3)
> = aₙ + aₙ₋₁ + … + a₁ + a₀  (mod 3)

The last line is the digit sum. So **N mod 3 equals its digit sum mod 3**. The former is 0 iff the latter is 0, proving the rule.

Check with 12345: 1+2+3+4+5 = 15, 15 mod 3 = 0, so 12345 mod 3 = 0. Indeed, 12345 = 4115 × 3.

## 3. Why 9 Also Works, and More Thoroughly

Replace every 3 with 9, and the logic holds verbatim, because 10 ÷ 9 also leaves remainder 1:

> 10 ≡ 1 (mod 9)

So 9 also has the digit sum rule: N is divisible by 9 iff its digit sum is divisible by 9.

9 goes further. Since 10ⁿ ≡ 1 (mod 9), repeatedly summing digits until one digit remains gives the remainder of the original number modulo 9 (unless the result is 9, meaning remainder 0). This is the ancient "casting out nines" method, used to check multiplication long before calculators.

For 12345: 1+2+3+4+5=15, 1+5=6. So 12345 mod 9 = 6. Check: 12345 = 1371 × 9 + 6.

## 4. What About Other Numbers?

That's the real question. Why don't 2, 5, 4, 11, 7 have a digit sum rule? Looking at the remainder of 10 modulo n makes it clear.

**2 and 5: 10 ≡ 0.** 10 is a multiple of 2 and 5, so 10 ≡ 0 (mod 2) and 10 ≡ 0 (mod 5). Then N = … + a₁·10 + a₀ ≡ a₀ (mod 2). All higher terms vanish, leaving only the last digit. So divisibility by 2 or 5 depends only on the last digit. The rule is "look at the last digit," not digit sum.

**4 and 25: 100 ≡ 0.** 100 is a multiple of 4 and 25, so all digits from the hundreds place up vanish, leaving only the last two digits. N ≡ (last two digits) (mod 4). The rule is "look at the last two digits."

**8 and 125: 1000 ≡ 0.** Look at the last three digits.

**11: 10 ≡ −1.** This is another special case. 10 divided by 11 leaves remainder 10, i.e., −1:

> 10 ≡ −1 (mod 11)

Then 10² ≡ (−1)² = 1, 10³ ≡ −1, alternating. Substituting into N:

> N ≡ aₙ·(±1) + … + a₁·(−1) + a₀  (mod 11)

Odd-position digits are subtracted, even-position added (counting from the right). So the rule for 11 is: the difference between the sum of digits in odd positions and the sum in even positions must be divisible by 11. It's related to 3 and 9, as powers of 10 take simple values ±1; but 3 and 9 take +1 (all added), while 11 takes ±1 (alternating).

**7, 13, …: 10's remainder is neither 0 nor ±1.** 10 ÷ 7 leaves remainder 3, 10 ÷ 13 leaves remainder 10. Powers of 10 modulo 7 cycle through 3, 2, 6, 4, 5, 1… with no simple pattern. So 7 and 13 have no concise "look at a few digits" rule; any rule would involve a recursive process like "chop off the last digit, multiply by something, and add back," far less elegant than the digit sum rule.

## 5. The Real Answer: Why Only 3 and 9

Putting all cases together reveals the pattern. The form of the divisibility rule depends entirely on the remainder of 10 modulo n:

| Remainder of 10 mod n | Rule Form | Holders |
|---|---|---|
| 0 | Look at last few digits | 2, 5; 4, 25; 8, 125 |
| 1 | Digit sum | 3, 9 |
| −1 | Alternating sum | 11 |
| Other | No simple rule | 7, 13, … |

The "digit sum" rule corresponds exactly to 10 ≡ 1 (mod n). This condition is equivalent to n dividing 10 − 1 = 9. The positive divisors of 9 are 1, 3, and 9; excluding the trivial 1 leaves 3 and 9.

**Thus the digit sum rule is exclusive to 3 and 9, not by coincidence but as a necessary consequence of 10 − 1 = 9 in decimal.** In other bases, the patent changes hands: in octal, 8 − 1 = 7, so 7 gets the digit sum rule; in duodecimal, 12 − 1 = 11, so 11 gets it; in hexadecimal, the divisors of 15 (3, 5, 15) all enjoy it. The rule follows the base, because the root is 10 ≡ 1, and the counterpart of 1 is always "base minus one."

## 6. Back to That One Congruence

The entire article rests on a single line: 10 ≡ 1 (mod 3).

It tells us that when checking divisibility by 3, 10 and 1 are indistinguishable, so every digit's "weight" from right to left is 1, and summing them gives the digit sum. The same holds for 9. Other numbers either make 10 become 0 (look at last digits), or −1 (alternating sum), or a chaotic sequence (no simple rule)—they lack the blessing of "all weights equal to 1," and thus lack the digit sum rule.

The specialness of 3 and 9 lies not in the numbers themselves, but in the fact that they happen to divide 10 − 1. In any base b, the position of "dividing b − 1" is always occupied, just under a different name.
