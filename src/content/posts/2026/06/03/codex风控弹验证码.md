---
author: "HAOGRE"
pubDatetime: 2026-06-03T12:36:16.335Z
title: "Codex 风控弹手机验证码：旧手机号不用了怎么办"
featured: false
draft: false
tags:
  - "随笔"
description: "OpenAI 账户关联手机号无法修改，但可提前在 MFA 中绑定新手机号。本文详解 Codex 风控验证的应对策略与操作步骤。"
---

## Codex 风控弹手机验证码：旧手机号不用了怎么办

这两天 V2EX 上有几篇帖子在聊同一件事：Codex 登录或授权时突然要求手机验证码，偏偏很多老账号当年注册时用的是接码平台、临时号，或者现在已经不用的手机号。平时 ChatGPT 网页还能进，一到 Codex 这里就卡住，才发现这个旧号码可能变成了账号风险点。

先说结论：OpenAI 目前不支持修改“账户关联手机号”。如果旧手机号已经停用，设置里没有入口可以把它换成新号。能提前做的，是在还登录得进去的时候，到 ChatGPT 的安全设置里打开 `Text message` 这种 MFA 手机验证方式，把它绑定到一个你能长期接收短信或 WhatsApp 验证码的手机号。

这一步不能保证解决所有 Codex 风控验证。它解决的是 MFA 登录验证这一类场景：以后系统要求你通过短信或 WhatsApp 做二次验证时，验证码会发到你在 MFA 里配置的号码。它不等于把账号历史关联手机号换成了新号。

## 为什么这次让人紧张

[6 月 2 日的 V2EX 帖子](https://v2ex.com/t/1217218)里，楼主提到自己是几年前 ChatGPT 刚火时注册的账号，当时用过接码平台。最近网页和手机端都被要求重新登录，其中 Codex 要二次验证，验证码发向旧手机号，导致账号卡住。楼主后来补充，自己怀疑可能和反代、IP 质量有关，但这只是社区讨论里的猜测，OpenAI 没有公开说明这类触发规则。

[6 月 3 日的跟进帖](https://v2ex.com/t/1217594)里，同一个楼主说，第二天准备换稳定手机号时，部分 Plus 账号的二次验证又消失了，可以直接登录；但帖子里也有人反馈自己的账号仍然会弹验证。这个细节反而更值得注意：风控验证可能是灰度的、临时的，也可能和账号状态、登录环境、订阅类型有关。今天不弹，不代表以后一定不弹。

所以如果你的 OpenAI 账号还在正常登录状态里，最好现在就把可控的安全验证方式补齐，不要等到被风控挡在门外时再找手机号。

## 官方文档里的几个关键点

OpenAI 帮助文档写得比较明确：

1. [账户关联手机号不能修改](https://help.openai.com/en/articles/9135134-how-to-change-the-phone-number-associated-with-your-account)。这个限制同时适用于 ChatGPT 和 OpenAI API。
2. [MFA 可以在 ChatGPT 的 Security 设置里管理](https://help.openai.com/en/articles/7967234-enabling-multi-factor-authentication-mfa-with-openai)。可用方式包括 Authenticator app、Push notification、Text message、Passkey 等。
3. Text message 是 MFA 的一种方式，可以通过短信或 WhatsApp 收 6 位验证码。开启时会让你输入手机号并完成验证。
4. 如果启用了多个 MFA 方式，OpenAI 会优先使用更安全的方式，但登录时通常也可以选择其他已启用的方法。
5. [ChatGPT 新账号使用本身已经不再要求手机验证](https://help.openai.com/en/articles/8982976)，但 API 平台首次生成 API key 仍可能要求手机验证。这个和 Codex 登录时遇到的风控验证不是完全一回事。

这里最容易混淆的是“账户关联手机号”和“MFA 手机号”。前者现在没法改；后者可以在安全设置里开启和管理。你在 MFA 里绑定的新手机号，不会把旧的账户关联手机号覆盖掉。

## 建议现在就做的事

如果你的旧手机号已经停用，但 ChatGPT 现在还能登录，建议按这个顺序处理：

1. 打开 ChatGPT，进入 `Settings`。
2. 选择 `Security`。
3. 在 `Multi-factor authentication (MFA)` 里，先开启 `Authenticator app`，把一次性验证码保存到你常用的密码管理器或验证器里。
4. 再开启 `Text message`，绑定一个你能长期持有、能稳定接收短信或 WhatsApp 的手机号。
5. 如果页面支持 `Passkey`，也可以加上，但要确认自己知道恢复方式，避免以后换设备时反而把自己锁住。
6. 检查 `Active sessions` 和可信设备，不要在验证方式还没配好前随便“退出所有设备”。

下面这张图里，`Text message` 就是可以提前打开的 MFA 手机验证入口。

![image-20260602200124310](/uploads/2026/06/03/codex风控弹验证码/image-20260602200124310.png)

开启时，系统会让你输入收到的 6 位验证码。这个验证码会发到你刚刚为 `Text message` 配置的手机号。

![Snipaste_2026-06-02_20-00-58](/uploads/2026/06/03/codex风控弹验证码/Snipaste_2026-06-02_20-00-58.png)

配置完成后，在安全设置里能看到 `Text message` 已经打开，并显示当前绑定的手机号。

![image-20260603202550708](/uploads/2026/06/03/codex风控弹验证码/image-20260603202550708.png)

## 旧手机号已经不用了，提前绑定新号有没有意义

有意义，但要把边界想清楚。

如果后续弹的是 MFA 登录验证，短信或 WhatsApp 验证码会走你在 `Text message` 里绑定的新手机号。这个场景下，提前绑定新号能明显降低风险。

如果后续弹的是另一种“手机号验证”，比如平台要求重新验证账号历史关联手机号，或者某个 Codex 风控流程单独要求手机验证，OpenAI 没有公开说明它一定会读取 MFA 里的新手机号。遇到这种情况，设置里的新手机号不一定能替代旧号。

即便如此，只要你还登录得进去，仍然建议提前打开 `Text message`。因为旧手机号停用后，最坏的情况是你没有任何可收码的手机号验证方式；而提前绑定新号，至少能覆盖官方文档明确说明的 MFA 场景。

## 如果已经卡在验证码页面

如果页面提供 `Try another method`，先看看能不能切到 Authenticator app、Passkey、Push notification、Email 等其他方式。前提是这些方式之前已经启用过。

如果页面只允许向旧手机号发码，而旧号已经完全不可用，目前没有公开的自助换绑入口。可以联系 OpenAI Support，说明旧手机号已停用、你仍能证明账号所有权，但预期要保守，因为官方文档目前写的是不支持修改账户关联手机号。

不要在这种时候反复换 IP、反复提交验证码、到处找一次性接码平台重试。V2EX 讨论里也有人怀疑 IP 质量、反代、跨区订阅、账号使用方式可能影响风控，但这些都没有官方确认。已经被风控卡住时，继续高频折腾可能只会让账号状态更复杂。

## 几个常见问题

**MFA 手机号必须和账户关联手机号一致吗？**

不一定。从 MFA 设置流程看，`Text message` 会让你单独输入手机号并完成验证。它是一个登录二次验证方式，不是账户关联手机号的换绑入口。

**以后验证码会发到哪个手机号？**

如果是 MFA 的短信或 WhatsApp 验证，通常会发到你在 `Text message` 里配置的号码。如果是其他手机号验证流程，尤其是 Codex 风控弹出的验证，OpenAI 没有公开保证一定使用 MFA 号码。

**现在 Codex 验证消失了，是不是就安全了？**

不建议这么判断。V2EX 的跟进帖里确实有人发现验证短时消失，但同帖也有人仍然会弹。这个现象更像风控策略的临时变化或灰度差异。

**旧手机号已经废了，最推荐的做法是什么？**

趁账号还能登录，开启 Authenticator app、Text message、Passkey 等多个 MFA 方式，并把 `Text message` 绑定到一个长期可用的新手机号。它不能把旧账户手机号换掉，但能减少未来登录验证时无号可收的风险。

## 最后

这件事没有什么神奇解法。OpenAI 现在不给改账户关联手机号，Codex 的风控验证又不是用户能控制的开关。账号还在、还能登录、还能补安全设置的时候，就把能补的都补上：可用邮箱、Authenticator app、Text message、Passkey，还有一个长期能收码的手机号。

等真的被验证码挡住，再想起当年的接码平台、临时号、已经停用的手机号，通常就很被动了。

且用且珍惜吧。

## 参考

- [OpenAI Help: How to change the phone number associated with your account](https://help.openai.com/en/articles/9135134-how-to-change-the-phone-number-associated-with-your-account)
- [OpenAI Help: Enabling or disabling multi-factor authentication (MFA)](https://help.openai.com/en/articles/7967234-enabling-multi-factor-authentication-mfa-with-openai)
- [OpenAI Help: Phone number requirement for new API keys](https://help.openai.com/en/articles/8982976)
- [V2EX: 天塌了。codex 登录要二次验证](https://v2ex.com/t/1217218)
- [V2EX: codex 二次验证消失了](https://v2ex.com/t/1217594)
