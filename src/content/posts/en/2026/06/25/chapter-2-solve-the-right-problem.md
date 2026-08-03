---
author: "HAOGRE"
pubDatetime: 2026-06-25T14:30:00.000Z
title: "Chapter 2: Solve the Right Problem"
featured: false
draft: false
lang: en
translationKey: "02-第2章-解决正确的问题"
tags:
  - "AI"
  - "business"
  - "musings"
description: "How to validate that you are solving a problem worth solving before writing the first line of code."
---

> “All execution is wasted when you are working on the wrong problem.”

## 2.1 An Autopsy of the Proof-of-Concept Graveyard

Silicon Valley has a phrase for it: POC purgatory. Projects enter and never come out. They are not dead enough to declare a failure, but not alive enough to justify more investment. So they remain “in progress” in quarterly updates year after year, like a room full of patients on life support.

Researchers at MIT systematically examined this graveyard and identified the five biggest obstacles to scaling enterprise AI projects, ranked by frequency:

1. Employees do not want to use the new tool—ironically, many of them use ChatGPT heavily in private
2. Concerns about model output quality
3. Poor user experience
4. Lack of executive support
5. Difficulty managing change

Notice what is missing: insufficiently intelligent models, unaffordable compute, and immature technology. None of them appear on the list. Nearly everything killing these projects happens at the level of problem definition and organizational reality, not technology.

One detail from the report deserves its own paragraph. A company spent $50,000 on a professional contract-analysis tool with an impressive feature list. A senior lawyer simply refused to use it and continued drafting contracts with free ChatGPT. Her reason was simple: the purchased tool produced rigid summaries and could not be customized to her working style. Procurement reported that the system was “deployed”; in daily life, the official system sat idle while employees went around it. (See Appendix C.) The real cause of the first obstacle is not employee conservatism. Consumer products have raised their expectations. People who use excellent tools at home cannot tolerate “artificial stupidity” at work.

An even sharper comparison: **projects delivered with external professional vendors succeed at roughly twice the rate of projects built internally**. External teams are not necessarily smarter. They simply cannot afford to lose: when you are paid for outcomes, the cost of defining the wrong problem comes out of your own pocket.

That is the first principle of this chapter: **all execution is wasted on the wrong problem, and enterprises contain far more wrong problems than we imagine**. The only question here is how to make sure you are solving the right one before writing the first line of code.

## 2.2 PSF: Finding Problem-Solution Fit

Startup methodology has a core concept called PMF, or Product-Market Fit: get the product right and the market will pull growth forward. In the FDE world, the corresponding unit is not product and market, but problem and solution. I call it PSF: Problem-Solution Fit.

The difference is subtle but important. PMF asks whether the market wants your product; PSF asks whether this customer’s specific problem is valuable enough and feasible for your capabilities to solve. An enterprise may contain hundreds of possible applications for AI, but a worthwhile one must pass three tests.

First, the pain test: is this a specific person’s specific pain? “Improve customer-service efficiency” is a direction, not a pain point. “Every Monday morning, the support manager spends three hours manually consolidating escalated tickets from four systems, when her real job should be analyzing why they were escalated” is a pain point.

Second, the economics test: what is this problem worth? How many person-hours does it consume each week? What labor cost does that represent? What does one error cost? What could the freed capacity accomplish? Many companies fund impressive front-office demonstrations while the returns accumulate in unglamorous back-office work such as contract review, procurement, and risk control.

![Image 1](/uploads/2026/06/25/chapter-2-solve-the-right-problem/ch3_1_1785725126077.jpg)

Third, the feasibility test: what can we actually do with our current capabilities and the customer’s data reality? Where is the data, and what condition is it in? It may be scattered across seven systems, inconsistent across three versions, or stored in the private spreadsheet of a veteran employee. What accuracy threshold does the problem require? “90% accurate with human review” may be the optimal answer where “99% usable” would require an order of magnitude more engineering.

You have found Problem-Solution Fit only after passing all three tests. And all three must be passed on site. Making decisions from second-hand information in a headquarters meeting room is the root of nearly every mistake in this chapter.

## 2.3 Refusing the Expensive POC Graveyard

In 2025, a Chinese enterprise-AI services company published unusually blunt advice for potential customers: if the scenario has not been validated, attend a demonstration first; if the data can be exported from one spreadsheet, a lightweight service is enough; if you only want to understand AI, use a free option. The sharpest line was: “FDE requires heavy investment. We would rather you start later than start at the wrong time.” (See Appendix C.)

Every enterprise-AI practitioner should put that sentence on the wall. It captures a truth that runs against the instinct to sell: **the ability to reject bad projects is one of the FDE model’s most important profit capabilities**.

FDE costs are front-loaded. The best engineers, most expensive travel, and longest on-site commitment all happen before payment. A wrong project does not merely lose one deal; it can trap an elite team and create a collapse in opportunity cost.

FDE teams therefore need a mechanism for saying no, not just the courage to say no. Every POC needs a graduation standard: a deadline, metrics, and a threshold that determines whether it graduates into a paid deployment. Teams should also watch for three danger signals: no clear business owner, no access to real data, and a request to cover every scenario in the company from the first meeting. Finally, “not now” should come with a roadmap for “when”: fix the missing foundations through another scenario, then return next quarter.

## 2.4 Pain Is the First Engine of Deployment

Where do the right problems come from? Textbooks say requirements research. FDE field experience says **pain. And pain does not appear in meeting rooms; it appears at the workplace**.

Follow a real user through a real day. Do not interview them; sit beside them and watch how they work. Which systems do they open? Where do they copy and paste between spreadsheets? When do they frown? Which official processes do they bypass? I call this the shadowing method.

Observe workarounds, not processes. Official process diagrams show how an organization should operate. Workarounds show how it actually operates. Every workaround is an unmet pain point. Why does an employee export data to a spreadsheet and calculate it again? Why does everyone know to find one particular colleague for a certain table? Why does someone manually verify the figures before every decision meeting? Workarounds are organizational scars; beneath each one is a failed system and an opportunity for FDE.

Be wary of translated pain points. Every handoff through IT, procurement, or a consultant introduces distortion. Your first responsibility is to bypass the translation and reach the nerve of the pain itself.

Once you have found the real pain, validate at the lowest possible cost: can our solution actually relieve it?

## 2.5 Validate Value with a Minimum Viable Deployment

MVP validates whether the market wants a product. MVD—Minimum Viable Deployment—validates whether a solution can create value for this specific customer in its real environment. **Value cannot be inherited; it must be validated one customer at a time.**

MVD has three rules. Use real data, without exception. Narrow the scope, not the ambition: do not build a crippled version of a grand solution; choose a small slice with a high density of visible value. And set a deadline measured in weeks, not months.

![Image 2](/uploads/2026/06/25/chapter-2-solve-the-right-problem/ch3_2_1785725138373.jpg)

### The Bootcamp: Industrializing MVD

Palantir’s AIP Bootcamp turns MVD into five standard actions: preparation, connection, construction, demonstration, and decision. The customer brings real data. FDEs work shoulder to shoulder with the customer’s technical staff, build a workflow that can perform real actions within days, and let business executives operate it themselves before deciding whether to proceed commercially.

The bootcamp solves the real-data, deadline, judge, and trust problems at the same time. Teams without a mature platform can use a two-week sprint: spend the first week on site connecting data and setting metrics, then build a narrowly focused prototype in the second week and make the go-or-no-go decision at the end. The format can be simplified; the rules cannot.

## 2.6 Should You Accommodate the Customer’s Existing Environment?

FDE practice suggests a middle path: be compatible with legacy systems at the data layer, but never accommodate them at the architecture layer. I call this “read old, write new.”

Read the data wherever it lives—even in a mainframe, a shared spreadsheet, or a private interface. But keep the validation system within a boundary you control, interacting with legacy systems through interfaces rather than embedding code inside them. At the process layer, follow human habits, not system habits. **The greatest enemy of a new system is not the old system; it is the old habit.**

## 2.7 User Research Where Action Speaks Louder Than Words

Traditional research is built around asking. FDE research is built around watching and doing.

Customers often do not know what they want, especially in a new category. What customers say and what they do are frequently different. And the highest-quality research happens through shared work. While coding, debugging, and handling real data together, customers naturally reveal facts that would never appear in a formal interview—and those facts often determine whether deployment succeeds.

Together, the FDE research method can be summarized in one sentence: **use shadowing to find pain, use Minimum Viable Deployment to validate the solution, and use shared work to discover the truth**.

The right problem is now identified and its value has been preliminarily validated. The next battlefield is turning that validated point solution into a real contract and a real relationship: how to win the customer.
