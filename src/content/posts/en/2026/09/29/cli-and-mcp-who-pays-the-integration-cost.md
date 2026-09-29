---
author: "HAOGRE"
pubDatetime: 2026-09-29T08:31:56.309Z
title: "CLI and MCP: Who Pays the Integration Cost?"
modDatetime: 2026-09-29T08:48:41.597539+00:00
featured: false
draft: false
lang: en
translationKey: "CLI与MCP谁来承担接入成本"
tags:
  - "ai"
  - "programming"
  - "business"
description: "Five whys about CLI and MCP: execution costs, platform incentives, portability, and the business guarantees that neither interface provides on its own."
---

For a while, I kept seeing an argument that agents already knew how to use a terminal, so MCP was unnecessary overhead. Give the agent a CLI and let it work. Lately, MCP seems more prominent in my feed again. What actually separates the two, and why do preferences appear to swing back and forth?

I do not have adoption data that establishes a decline in CLI usage or a resurgence of MCP. A feed also reflects whom you follow. Still, the question is worth pursuing because both arguments often make sense: command-line tools are useful, and shared integration conventions have value.

“CLI is for developers; MCP is for platforms” felt too shallow. I tried asking why five times to see where the disagreement leads.

## First why: If both can call tools, why is there a debate?

A CLI is a command-line interface. A program accepts arguments and input, then returns output, errors, and an exit code. An agent can use it much as a script would.

In an environment where GitHub CLI is installed and authenticated, this command can retrieve an issue's title and body:

```bash
gh issue view 123 --repo owner/repo --json title,body
```

The repository and issue number are placeholders. The [GitHub CLI documentation](https://cli.github.com/manual/gh_issue_view) explicitly provides `--json` and `--jq`. A CLI does not have to return terminal text meant only for people.

MCP, the Model Context Protocol, defines communication between AI applications and external capabilities. A host manages MCP clients; those clients connect to servers, discover tools, and invoke them using agreed message formats. The [MCP architecture](https://modelcontextprotocol.io/specification/2025-06-18/architecture) also includes resources and prompt templates. This article focuses on tool invocation, the part most often compared with CLI usage.

Both can let an agent use a capability, but they standardize different things. A CLI uses operating-system conventions for processes and input/output, while each program defines its commands. MCP also specifies capability discovery, parameter descriptions, and invocation messages. Tool authors still define what the business operations mean.

| Concern                       | CLI approach                                                        | MCP approach                                              |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| Discover available operations | Read help, documentation, or a companion Skill                      | Discover tools and descriptions through the protocol      |
| Understand arguments          | Learn the program's commands and options                            | Read the tool's declared input schema                     |
| Compose several operations    | Use a shell or another scripting language                           | Let the host, agent, or code execution layer compose them |
| Maintain the execution setup  | Install programs and manage versions, dependencies, and credentials | Maintain clients, servers, connections, and authorization |

MCP can connect to a local process, and a CLI can access a remote service. “Local versus cloud” and “text versus JSON” are unreliable dividing lines.

The debate exists because the two can offer alternative paths for a particular task. Neither interface, on its own, guarantees correct business behavior, sufficiently narrow permissions, or results suited to a model.

## Second why: Why does CLI often look cheaper to developers?

Developers usually start with an environment that already works.

Git is installed, cloud authentication is configured, test commands live in the project, and someone knows where to find the logs. An agent with terminal access can use those existing investments. Wrapping an established command in an MCP server may add maintenance without much immediate benefit.

CLI tools are also easy to compose. To find recent failed jobs in a directory, a script can read, filter, sort, and aggregate files, then return only the relevant results. The model does not need to read every log or act as a loop and conditional engine in natural language.

This is what I like about the CLI approach. Programs can handle deterministic work directly. The model decides what to inspect and how to combine operations; the execution environment moves and processes the data.

There is a cost hidden in that convenience. An environment being ready does not mean it was free to prepare. The developer has already paid for it in time and effort.

<figure>
  <img src="/uploads/2026/09/29/CLI%E4%B8%8EMCP%E8%B0%81%E6%9D%A5%E6%89%BF%E6%8B%85%E6%8E%A5%E5%85%A5%E6%88%90%E6%9C%AC/01-hidden-cost.webp" alt="Xiaohei lifts a workbench to reveal long receipts folded into its legs." width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Figure 1. A ready-to-use environment still had a setup cost.</figcaption>
</figure>

Give the same workflow to a colleague unfamiliar with terminals, or to hundreds of users with different identities, permissions, and devices, and installation, authentication, upgrades, and diagnosis become visible again. A platform can preinstall CLIs and manage containers and credentials. Doing so means building integration infrastructure of its own.

**CLI has a low incremental cost inside an established development environment. Extending that conclusion to every user can make previously paid costs disappear from the accounting.**

## Third why: Can MCP eliminate those costs?

It cannot. It can standardize part of the integration work and let tool providers and AI applications share it.

A common protocol becomes useful when a service needs to work with multiple AI clients. The provider does not have to reinvent the entire discovery and invocation mechanism for each host. Clients can use shared conventions to identify tools, pass arguments, and handle results. Real integrations still need compatibility testing, permission configuration, and product work. Implementing MCP does not make behavior identical across all clients.

A rough accounting looks like this:

```text
Total cost of using a tool
= interface adaptation + environment operations + model calls
  + permission governance + recovery from failures
```

This is a checklist for missing costs, not an equation with measured coefficients. An individual developer may focus on model calls and scripting efficiency. A platform may care about the work required to add another service. An enterprise will also ask who has access, how to revoke it when someone leaves, and how to investigate failed operations.

MCP provides protocol foundations for some of this work without completing the governance. For example, the [2025-06-18 authorization specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) defines authorization for HTTP-based transports. Authorization is optional, and local STDIO connections use a different approach to obtaining credentials. An MCP label does not establish that auditing, approvals, and least-privilege access are in place.

A CLI can also use OAuth, run in a sandbox, and produce audit logs. Security depends on actual permissions, isolation, and server-side validation. The interface name is insufficient evidence.

At this point, I see MCP's value as **turning reusable integration conventions into a shared protocol, reducing work that each consumer would otherwise repeat.** How much it saves depends on the number of tools and users, and on how mature the existing environment is.

## Fourth why: If CLI uses fewer tokens, why reconsider MCP?

“CLI saves tokens” often bundles several practices together: reading help on demand, using scripts for loops, filtering data in the execution environment, and returning only a summary to the model. Those practices are useful, but they are not exclusive to command-line interfaces.

Anthropic's [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), published on November 4, 2025, addresses the same issue. Loading every tool definition into context and routing every intermediate result through the model adds cost. The article proposes exposing MCP tools as code interfaces, allowing an agent to discover tools on demand and process data in an execution environment.

That example changed how I think about the comparison. MCP can connect the services, code can handle loops and filtering, and the model can receive only the information that needs its judgment. The composition style associated with CLI workflows can coexist with MCP integration.

<figure>
  <img src="/uploads/2026/09/29/CLI%E4%B8%8EMCP%E8%B0%81%E6%9D%A5%E6%89%BF%E6%8B%85%E6%8E%A5%E5%85%A5%E6%88%90%E6%9C%AC/02-process-before-context.webp" alt="Xiaohei turns a crank to reduce a long strip of records to a few result cards." width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Figure 2. Connecting services and processing data can happen in different layers.</figcaption>
</figure>

A code execution layer still needs sandboxing, resource limits, and state management. For one tool and one query, an extra orchestration layer may not be worthwhile. The savings reported in that article also belong to specific examples; they are not a universal performance guarantee.

A useful comparison should hold the task, model, permissions, and returned data volume constant, then measure success rate, elapsed time, context consumption, and recovery cost. Comparing MCP calls that route every step through the model with a carefully composed CLI script changes both the protocol and the execution strategy. The result cannot be attributed to MCP alone.

If people are reconsidering MCP, one plausible explanation is that costs associated with early implementations are being addressed separately, making the protocol's integration value easier to see. There is a technical basis for that explanation. It still does not establish a market-wide shift.

## Fifth why: Once execution efficiency is no longer an absolute divider, what remains at stake?

The next questions are who maintains the entry point, who provides long-term support, and who determines how users discover and use tools.

Developers value the autonomy of a CLI. With a program, documentation, and legitimate credentials, they can compose workflows, save scripts, and replace individual steps. The provider need not design a new product interface for every combination.

Platforms have reasons to prefer a common protocol. They can gather external capabilities and build connection management, discovery, authorization screens, and a consistent experience around them. Service providers also benefit if one integration reaches more clients.

This is my analysis of incentives, not a claim that every platform has the same agenda. An open protocol can reduce migration barriers. But a portable protocol does not make an entire workflow portable. If approval rules, user authorization, state, and tool distribution remain inside one host, changing platforms may still be difficult.

I would ask one more question: once the tool definitions can move, can the user's workflows, authorization relationships, and execution records move with them? That reveals more about switching costs than a “supports MCP” label.

<figure>
  <img src="/uploads/2026/09/29/CLI%E4%B8%8EMCP%E8%B0%81%E6%9D%A5%E6%89%BF%E6%8B%85%E6%8E%A5%E5%85%A5%E6%88%90%E6%9C%AC/03-portable-handle.webp" alt="Xiaohei carries an MCP handle while the suitcase remains tied to authorization and history folders." width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Figure 3. A portable interface does not make the whole workflow portable.</figcaption>
</figure>

My working hypothesis about the apparent resurgence is that, as discussion expands from personal coding environments to AI products serving many users, the people bearing the costs change. So do the criteria used to evaluate an interface. Testing that hypothesis requires evidence of active integrations, repeated use, and maintenance investment. Support announcements, server directories, and social posts are insufficient.

## A shared protocol leaves the hardest guarantees unfinished

Following these five questions also led me to a counterexample: a tool can have a complete schema and an MCP interface and still be difficult to use reliably.

Consider a tool for refunding a customer. It accepts an order number, an amount, and a reason. Correct types establish the shape of the request. They do not establish whether the order has already been refunded, whether the amount exceeds the payment, whether the user has permission, or whether retrying after a timeout will issue a second refund.

The business implementation must enforce those constraints. Idempotency keys, state validation, permission checks, traceable operation identifiers, and explicit approval states do not appear automatically when an interface changes.

<figure>
  <img src="/uploads/2026/09/29/CLI%E4%B8%8EMCP%E8%B0%81%E6%9D%A5%E6%89%BF%E6%8B%85%E6%8E%A5%E5%85%A5%E6%88%90%E6%9C%AC/04-retry-once.webp" alt="Xiaohei blocks a duplicate refund so two requests leave only one coin in the tray." width="1536" height="864" loading="lazy" decoding="async" />
  <figcaption>Figure 4. Retrying a request must not issue a second refund.</figcaption>
</figure>

CLI tools face the same problem. A JSON-capable command that returns only “operation failed” on errors, or mixes progress messages into successful output, is hard for an agent to handle reliably. An MCP tool named `execute`, accepting arbitrary commands and unrestricted parameters, can erase the boundaries that its interface seemed to establish.

**My view is that an agent-ready tool should first have clear business boundaries, verifiable results, and a way to recover from failure. CLI and MCP determine how those capabilities are reached. The tool's implementation determines whether the work can be completed reliably.**

If I were designing an internal tool today, I would start with stable inputs and outputs, distinguishable errors, and appropriate validation and duplicate-execution protection for writes. Where a mature CLI already exists and developers are the main users, I would improve it. When the tool needs to enter multiple AI products and serve more people outside engineering, I would add an MCP interface. Both should share the business implementation, so that two entry points do not grow two different sets of refund rules.

Nor does a model becoming better at reading documentation make interface contracts unnecessary. A model may learn how to invoke a tool faster. The system still needs deterministic checks for whether the action is authorized, what happened, and whether a failed operation can safely be retried.

The next time I read that “CLI won” or “MCP is back,” I will look for the missing cost breakdown: who handles installation and operations, who manages identities and permissions, where intermediate data travels, and who deals with failure. Without those conditions, the supposed winner may simply reflect different people counting different costs.
