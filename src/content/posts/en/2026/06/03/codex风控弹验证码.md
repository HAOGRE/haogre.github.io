---
author: "HAOGRE"
pubDatetime: 2026-06-03T12:36:16.335Z
title: "Codex Risk Control Phone Verification: What to Do When Your Old Phone Number Is No Longer in Use"
featured: false
draft: false
lang: en
tags:
  - "musings"
description: "OpenAI does not allow changing the account-linked phone number, but you can bind a new number in MFA settings. This article explains how to handle Codex risk control verification."
---

## Codex Risk Control Phone Verification: What to Do When Your Old Phone Number Is No Longer in Use

Recently, several posts on V2EX discussed the same issue: Codex suddenly requires phone verification during login or authorization, but many old accounts were registered with temporary numbers or numbers no longer in use. While ChatGPT web access still works, Codex gets stuck, revealing that the old number has become a risk point.

First, the conclusion: OpenAI currently does not support changing the "account-linked phone number." If your old number is deactivated, there is no option in settings to replace it. What you can do in advance, while still logged in, is to enable `Text message` MFA in ChatGPT's security settings and bind it to a phone number where you can reliably receive SMS or WhatsApp verification codes.

This step does not guarantee solving all Codex risk control verifications. It addresses MFA login verification scenarios: when the system later requires SMS or WhatsApp two-factor authentication, the code will be sent to the number configured in MFA. It does not replace the historical account-linked phone number.

## Why This Is Alarming

In the [June 2 V2EX post](https://v2ex.com/t/1217218), the OP mentioned registering during ChatGPT's early days using a temporary number. Recently, both web and mobile required re-login, and Codex demanded two-factor verification with the code sent to the old number, locking the account. The OP speculated it might be related to reverse proxy or IP quality, but these are community guesses; OpenAI has not disclosed trigger rules.

In the [June 3 follow-up](https://v2ex.com/t/1217594), the same OP said that the next day, some Plus accounts no longer required two-factor verification and could log in directly, but others still saw the prompt. This detail is noteworthy: risk control verification may be grayscale, temporary, or related to account status, login environment, or subscription type. Not seeing it today doesn't guarantee it won't appear later.

So if your OpenAI account is still accessible, it's best to complete controllable security verification methods now, rather than scrambling for a phone number when blocked.

## Key Points from Official Documentation

OpenAI's help docs are clear:

1. [Account-linked phone number cannot be changed](https://help.openai.com/en/articles/9135134-how-to-change-the-phone-number-associated-with-your-account). This applies to both ChatGPT and OpenAI API.
2. [MFA can be managed in ChatGPT's Security settings](https://help.openai.com/en/articles/7967234-enabling-multi-factor-authentication-mfa-with-openai). Available methods include Authenticator app, Push notification, Text message, Passkey, etc.
3. Text message is an MFA method that receives a 6-digit code via SMS or WhatsApp. Enabling it requires entering and verifying a phone number.
4. If multiple MFA methods are enabled, OpenAI prioritizes the most secure one, but you can usually choose another during login.
5. [New ChatGPT accounts no longer require phone verification](https://help.openai.com/en/articles/8982976), but generating an API key for the first time on the API platform may still require it. This is not exactly the same as Codex's risk control verification.

The most confusing part is distinguishing "account-linked phone number" from "MFA phone number." The former cannot be changed; the latter can be enabled and managed in security settings. Binding a new number in MFA does not overwrite the old account-linked number.

## What to Do Now

If your old phone number is deactivated but ChatGPT is still accessible, follow this order:

1. Open ChatGPT and go to `Settings`.
2. Select `Security`.
3. Under `Multi-factor authentication (MFA)`, first enable `Authenticator app` and save the one-time codes in your password manager or authenticator.
4. Then enable `Text message` and bind a phone number you can keep long-term and reliably receive SMS or WhatsApp.
5. If `Passkey` is supported, add it, but ensure you know the recovery method to avoid locking yourself out when changing devices.
6. Check `Active sessions` and trusted devices; do not "Sign out of all devices" before verification methods are configured.

In the image below, `Text message` is the MFA phone verification entry you can enable in advance.

![image-20260602200124310](/uploads/2026/06/03/codex风控弹验证码/image-20260602200124310.png)

When enabling, the system will ask you to enter a 6-digit code sent to the number you just configured for `Text message`.

![Snipaste_2026-06-02_20-00-58](/uploads/2026/06/03/codex风控弹验证码/Snipaste_2026-06-02_20-00-58.png)

After configuration, the security settings will show `Text message` enabled with the bound phone number.

![image-20260603202550708](/uploads/2026/06/03/codex风控弹验证码/image-20260603202550708.png)

## Does Binding a New Number in Advance Help If the Old One Is Gone?

Yes, but with clear boundaries.

If the subsequent prompt is an MFA login verification, the SMS or WhatsApp code will go to the new number bound in `Text message`. In this scenario, binding a new number significantly reduces risk.

If the prompt is a different "phone verification"—for example, the platform requires re-verifying the historical account-linked number, or a specific Codex risk control flow demands phone verification—OpenAI has not publicly stated that it will read the MFA number. In such cases, the new number in settings may not replace the old one.

Nevertheless, as long as you can still log in, it's still advisable to enable `Text message` in advance. After the old number is deactivated, the worst case is having no phone number capable of receiving codes; binding a new number at least covers the MFA scenarios explicitly documented.

## If You Are Already Stuck on the Verification Page

If the page offers `Try another method`, check if you can switch to Authenticator app, Passkey, Push notification, Email, or other methods—provided they were previously enabled.

If the page only allows sending codes to the old number and it's completely inaccessible, there is no public self-service option to change it. You can contact OpenAI Support, explain that the old number is deactivated and you can prove account ownership, but keep expectations low, as the official docs state that changing the account-linked phone number is not supported.

Do not repeatedly change IPs, resubmit codes, or try temporary number services. V2EX discussions also speculate about IP quality, reverse proxy, cross-region subscriptions, and account usage affecting risk control, but none are officially confirmed. Once blocked, high-frequency tinkering may only complicate the account status.

## Frequently Asked Questions

**Does the MFA phone number have to match the account-linked phone number?**

Not necessarily. From the MFA setup flow, `Text message` asks you to enter a separate phone number and verify it. It is a login two-factor method, not a replacement for the account-linked number.

**Which phone number will receive future verification codes?**

For MFA SMS or WhatsApp verification, it will usually go to the number configured in `Text message`. For other phone verification flows, especially Codex risk control prompts, OpenAI has not publicly guaranteed that the MFA number will be used.

**If Codex verification disappears now, am I safe?**

It's not advisable to assume so. In the V2EX follow-up, some users saw verification temporarily disappear, while others still encountered it. This suggests temporary changes or grayscale differences in risk control strategies.

**What is the best approach if the old number is dead?**

While the account is still accessible, enable multiple MFA methods such as Authenticator app, Text message, and Passkey, and bind `Text message` to a long-term usable new number. It won't replace the old account-linked number, but it reduces the risk of being unable to receive codes during future login verifications.

## Final Thoughts

There is no magic solution. OpenAI currently does not allow changing the account-linked phone number, and Codex's risk control verification is not a user-controlled switch. While your account is still active, you can still log in, and you can still update security settings, do everything you can: add a usable email, enable Authenticator app, Text message, Passkey, and have a long-term phone number that can receive codes.

Once you are actually blocked by a verification code, remembering the temporary number or deactivated phone you used years ago will leave you in a passive position.

Cherish your account while you can.

## References

- [OpenAI Help: How to change the phone number associated with your account](https://help.openai.com/en/articles/9135134-how-to-change-the-phone-number-associated-with-your-account)
- [OpenAI Help: Enabling or disabling multi-factor authentication (MFA)](https://help.openai.com/en/articles/7967234-enabling-multi-factor-authentication-mfa-with-openai)
- [OpenAI Help: Phone number requirement for new API keys](https://help.openai.com/en/articles/8982976)
- [V2EX: 天塌了。codex 登录要二次验证](https://v2ex.com/t/1217218)
- [V2EX: codex 二次验证消失了](https://v2ex.com/t/1217594)
