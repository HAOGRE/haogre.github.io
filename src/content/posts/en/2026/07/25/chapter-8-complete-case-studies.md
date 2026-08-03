---
author: "HAOGRE"
pubDatetime: 2026-07-25T15:40:00.000Z
title: "Chapter 8: Complete Case Studies"
featured: false
draft: false
lang: en
translationKey: "08-第8章-完整案例集"
tags:
  - "AI"
  - "business"
  - "miscellaneous"
description: "Five real-world cases show how FDE evolved from field practice into a scalable organizational and business model."
---

The methodology in the first seven chapters was distilled from real-world practice. This chapter reconstructs those scenes through five case studies, spanning the inventors of the model and its newest inheritors, from Silicon Valley to China. As you read, keep returning to one question: before these methods had names, how were they discovered almost instinctively?

## 8.1 Palantir: Turning a “Dumb” Method into a Moat Over Twenty Years

### Building Software for Users You Cannot Interview

In 2003, Silicon Valley was still lying in the ruins of the dot-com crash. Peter Thiel assembled a group of Stanford-trained young people to build data-analysis software for U.S. intelligence agencies. The name came from The Lord of the Rings: the Palantir, a seeing stone that could reveal distant places.

The crazy part was not the technology. It was the users. Bob McGrew later recalled the central problem: “One of the challenges of building software for spies is that I don’t know any spies. You probably don’t either. And even if you found one, and asked how they actually worked, they probably wouldn’t tell you.”

Every standard software practice—interviews, surveys, usability tests—failed in front of this user group. Stephen Cohen’s response was almost endearingly simple: build a demo, show it to intelligence officials, and ask what they thought. The answer was blunt: “This is terrible. It has nothing to do with what we do.” Cohen did not retreat. He asked what should be different, wrote down every answer, rebuilt the demo, and returned. Again and again.

That loop contained the genes of FDE: in complex domains, customers often do not know what they need until they see something usable; the fastest way to discover what they need is to put the builders next to the users.

### From Emergency Tactic to Organizational Strategy

Palantir soon encountered the classic enterprise-software problem: the second customer wanted something subtly but critically different from the first. The standard answer was to extract commonality, build a general product, and say no to the differences.

Palantir’s customers would not accept no. Shyam Sankar’s solution was considered heretical: build a highly configurable platform, send engineers to the customer site, and complete the last mile there.

Sankar also changed the accounting story. Custom work for one customer was usually treated as a service cost and a threat to margins. He reframed it as product discovery. Field customization was not merely spending; it was intelligence for the next product iteration. A cost center became an R&D center.

Forward-deployed engineers embedded with customers. Deployment strategists understood the customer’s mission and organization. Platform engineers worked from the rear, serving multiple customers. By 2016, Palantir had more forward-deployed engineers than platform engineers—a software company with most of its forces on the front line.

### Trials: War Zones, Hurricanes, and Oil Fields

In Iraq and Afghanistan, Palantir engineers discovered that soldiers did not want beautiful intelligence charts. They wanted to mark a suspicious road on a map. An engineer quickly built a crude tool that made dangerous road segments visible to everyone. It later became a standard platform feature. It could only have been born while an engineer and a soldier were looking at the same road.

Around 2007, Sankar and a small team worked for two weeks inside a secure U.S. military counter-IED operations center. He strapped a telephone to his head with elastic bands so both hands were free to code: one ear listened to analysts, the other to colleagues in Silicon Valley. The analysts said the result was useful. Sankar, exhausted, told CEO Alex Karp, “This isn’t sustainable. We’re done.” Karp’s answer became part of the culture: turn the unsustainable into a system.

During Hurricane Sandy relief efforts in 2012, Palantir assembled fragmented rescue data into a live map. Oil rigs, aircraft assembly lines, and bank trading floors followed. Palantir pushed field deployment deeper into software delivery than the industry had seen before.

The costs were real: elite engineers, global travel, duplicated work, free pilots, and projects with effectively negative margins. Palantir absorbed them through large contracts and a venture-capital mindset toward pilots: most bets could fail, as long as the winners paid for the portfolio.

Commercialization also failed once. Metropolis received a poor response; Foundry opened the enterprise market. At Airbus, an A380 fuel-pump problem had resisted two years of investigation. Palantir connected sensor data to its platform and solved it in two weeks: fuel shifted away from the pump during ascent. Airbus later built Skywise on the platform, connecting tens of thousands of users and more than ten thousand aircraft.

### Breakout: Training Camps Ignite a Business Empire

When generative AI exploded in 2023, every enterprise wanted to use it, but few knew how. Palantir compressed two decades of field practice into AIP boot camps. Customers arrived with real data and real problems. Forward-deployed engineers worked alongside them to produce a deployable AI application in one to five days.

Day 0 focused the battlefield. Day 1 connected the data and built the ontology. Days 2 and 3 connected the large language model to the workflow. Days 4 and 5 put the system in executives’ hands for an immediate decision.

The camps compressed enterprise-software sales cycles from nine to twelve months to a matter of weeks. Walgreens, J.D. Power, major healthcare companies, and global banks moved rapidly from pilots to deployments. Some customers even began running camps for their own customers—the model started reproducing itself.

Commercial growth and major government contracts validated the idea that field work could function as R&D. The U.S. Navy used Foundry and AIP to modernize submarine industrial bases, while the U.S. Army consolidated scattered service contracts into a long-term framework. Government trust was the compound interest earned through two decades in the field.

![Image 1](/Users/haogre/.gemini/antigravity-cli/brain/d4dffd42-6b6d-4063-b3a3-ad5b7fc7e2fe/ch4_3_1785725175383.jpg)

An engineer who spent a full year embedded in Toulouse worked four days a week on the assembly floor with manufacturing workers, writing software for the A350 line. He called it “Asana for building airplanes.” That is the plainest possible definition of forward deployment.

### Methodological Reconstruction

Palantir is almost an index of the book: demo loops and the fact that customers often do not know what they want; customization as product discovery; lighthouse customers; pilots as portfolio investments; field tools growing into platforms; and the foundational belief that complexity cannot be eliminated remotely. Someone has to be there.

## 8.2 OpenAI: When the People Who Built ChatGPT Started Doing the Field Work

### The Shift from “Model as Product” to “Deployment as Strategy”

OpenAI’s first seven years were a technological epic. GPT advanced rapidly, and ChatGPT achieved extraordinary user growth. But by 2024, the enterprise market exposed a different problem: customers did not merely need a model. They needed help putting it to work.

OpenAI responded in two steps. First, in 2024 it created a forward-deployment engineering team, starting with two engineers and expanding across San Francisco, New York, London, Dublin, Munich, Paris, Zurich, Tokyo, Singapore, and Sydney.

Second, on May 11, 2026, it established a deployment company controlled by OpenAI and backed by major investment and consulting firms. The venture received more than $4 billion in initial capital and acquired applied-AI consultancy Tomoro, bringing in roughly 150 deployment engineers.

The structure connected customer acquisition with capital returns. The investors controlled portfolios spanning healthcare, manufacturing, finance, retail, and logistics—an immediate pool of potential customers. OpenAI retained strategic control.

A company with one of the world’s most powerful models had created a separate, multibillion-dollar company specifically to send people into customer organizations. It was the heaviest vote yet for FDE.

### The Field: John Deere’s Farms

John Deere wanted to solve precision weed control. Blanket herbicide application was expensive, harmful to crops, and environmentally costly. The ideal was “spray only what you see,” but each field differed in weeds, crops, growth, and timing.

OpenAI’s deployment team traveled to Iowa, followed agronomists into the fields, studied their workflow and hard agricultural deadlines, reviewed hundreds of real cases, and built a custom evaluation system with the experts.

The result was a reduction in chemical use of up to 70% and a sixfold increase in farmer interaction. Three details matter: the deadline was the farming season, not the project plan; evaluation came before model optimization; and the target was agreed with experts before work began.

### The Field: BBVA’s 120,000 Employees

BBVA began with 3,300 enterprise ChatGPT accounts. Employees then created more than 20,000 custom assistants. Eighty-three percent used the system weekly, saving roughly three hours per week on average. Eighteen months later, deployment covered 120,000 employees across 25 countries, and the bank’s ambition had expanded to becoming an AI-native global bank.

### Methodological Reconstruction

OpenAI’s case shows a model company becoming self-aware: as model capabilities converge, deployment becomes the main battlefield for differentiation; while product forms remain uncertain, the field becomes the crucial site of product discovery. Co-creation, validation, delivery, and the use of private-capital networks as distribution each map to core themes in this book.

## 8.3 Anthropic and Three Vertical Pioneers: Three Variations on FDE

If Palantir invented the model and OpenAI pushed it into the headlines, Anthropic and a group of vertical AI companies show how FDE changes across different environments.

### Variation One: Anthropic—Safety and Auditability as Differentiation

Anthropic’s FDE function sits within applied AI. Its deployments must meet standards for safety and reliability, and its engineers act as ambassadors for the company’s mission. The safety DNA became a product feature in its work with financial-technology company FIS: embedded engineers helped build a financial-crime detection agent that reduced investigations from hours to minutes, with every decision replayable and traceable.

In regulated industries, explaining every AI decision to a regulator is not a bonus. It is an admission ticket. Anthropic also makes knowledge transfer part of the goal: customers should eventually be able to build and extend their own agents.

![Image 2](/Users/haogre/.gemini/antigravity-cli/brain/d4dffd42-6b6d-4063-b3a3-ad5b7fc7e2fe/ch5_1_1785725248635.jpg)

### Variation Two: Sierra and Decagon—Delivery as Product

Sierra made FDE the business model itself. Customers pay for resolved conversations rather than software. Sierra’s field team handles implementation while the customer supplies brand voice and operating rules. Internally, the role is called Agent Engineer, emphasizing a narrower and deeper technical craft.

Decagon took a different route, productizing delivery experience into agent workflows. Customer operations teams define multi-step processes in natural language, and the AI executes them. Decagon’s FDE goal is to make nontechnical operators self-sufficient.

### Variation Three: Harvey—Entering Places Ordinary Software Cannot

Legal services combine strict confidentiality, data-residency requirements, and fragmented decision-making. Self-serve software struggles to enter this market. Harvey uses FDE to embed in top law firms, starting with one practice group and expanding across the firm. Deployments can take six to nine months, with engineers responsible from data pipelines through partner-by-partner adoption.

Harvey shows where FDE reaches its natural boundary: when confidentiality, data residency, and user autonomy all matter at once, productized delivery is often insufficient. Someone has to enter the organization to bring the system in.

## 8.4 China: Growing FDE in Project-Based Soil

China’s enterprise-software market has diligent delivery engineers and demanding customization, but also a deep project-based curse. Large customers demand bespoke work, vendors lose money on each project, and delivery becomes outsourcing. The question is whether FDE is a cure or simply a new name for the same disease.

### The Big-Tech Path: Volcano Engine’s Doubao FDE

Volcano Engine created an FDE team in 2026 to co-create with industries and lighthouse customers. Its public definition is clear: FDE is neither sales nor presales, but a role requiring strong technical implementation skills. The platform’s advantage is its model, toolchain, and cloud infrastructure. Its challenge is whether field work will truly receive the status of R&D rather than remain a cost center.

### The Pioneer Path: FDE Is Not On-Site Outsourcing

Local service providers distinguish FDE from on-site outsourcing in three ways: FDE delivers by phase and accepts results-based validation; it works from a product foundation; and it leaves after the work is complete, with capability remaining in the customer’s system and team.

These correspond to outcome-based pricing, platform leverage, and knowledge transfer. Some providers also refuse unvalidated scenarios, overly simple data work, and customers who merely want to “learn about AI.”

### A Contrast: Set-Top Boxes and Paper Contracts

FDE works best when a customer has a clear problem, accessible data, and sufficient digital foundations. If a customer refuses to use basic word-processing features but wants to spend heavily on AI, the better advice may be to start with general-purpose tools and return to FDE once concrete needs emerge.

### The Other Side: Vacuum Layers and Dirty Work

In many Chinese projects, FDE still resembles outsourced labor. Sales overpromises, executives disappear after signing, decision-makers are absent, and engineers are trapped between layers of the organization. They end up studying presentation logic simply to secure acceptance.

The difficulty is not just technical. It lies in intermediated requirements, weak digital foundations, impatient executives, and the complex politics of responsibility inside organizations.

### Three Special Questions for Chinese FDE

First is pricing. A workable transition is phased payment, value metrics in acceptance criteria, and annual maintenance and evolution contracts.

Second is the platform. Without reusable foundations, FDE becomes on-site outsourcing. High-frequency customization must first be turned into reusable components.

Third is talent. Chinese engineers are accustomed to hard work, fast response, and solving problems end to end—traits that fit FDE. But many have been trapped in a labor-day pricing system. The spread of FDE may reprice tens of thousands of delivery engineers.

### Verdict

FDE will not cure every chronic disease in Chinese enterprise software, but it offers a chance to redefine proximity to customers as a high-end capability rather than a sign of low-end outsourcing. China does not lack engineers willing to go into the field. It lacks the platforms, methods, and pricing structures that make field work compound.

## 8.5 180 Days Inside an AI Startup: A Full FDE Review

The final case comes from N Company, an anonymous Chinese AI startup I followed. It had neither Palantir’s platform nor OpenAI’s aura, but its 180-day journey shows how a resource-constrained team can run FDE. The numbers have been blurred, while the proportions and decision logic remain true.

### Days 1–30: Choose the Battlefield, Not the Contract

N Company had three leads: a major securities firm, a regional retail chain, and a top-tier hospital. It did not choose the largest budget. It chose the retail group, where the CFO owned the project, the problem was specific, and the data was reachable.

The discipline was simple: prioritize by strategic and learning value, not contract size.

### Days 31–75: Enter the Field, Shadow the Work, Kill the Big Plan

Two engineers and one industry consultant entered the customer. For the first two weeks they wrote no product code. They followed regional managers through stores and watched how they used group chats and spreadsheets.

They discovered that managers trusted a handwritten store-manager sheet more than the official reporting system because the system data arrived three days late and was often wrong. The team abandoned its original “intelligent analytics platform” and narrowed the deployment to a store anomaly digest: every morning, summarize sales changes, inventory anomalies, and complaint spikes across 3,000 stores in a report readable within three minutes.

### Days 76–120: The Battle for Activation

After launch, the AI misclassified promotional peaks as abnormal spikes. The team connected the promotion calendar within 48 hours and publicly thanked the manager who had reported the error.

A senior regional director initially stayed aloof. The team invited him to revise the evaluation criteria, and his experience became part of the system’s rules. Two weeks later, he was its strongest internal evangelist. By day 90, the digest’s organic open rate exceeded 85%. By day 120, the CIO presented it at the quarterly operating meeting.

### Days 121–180: The First Brick of Replication

The team turned its reusable assets into a playbook: retail data connectors, an anomaly-signal evaluation framework, and a store-scenario diligence checklist. It then used the retail case to open a second customer in fast-moving consumer goods. Delivery for the second project was 40% faster than for the first. The replication flywheel had completed its first turn.

In 180 days, a small team produced no funding headline and no breakthrough technology. It validated the book’s simplest conclusion: **the right question + real data + close service + disciplined accumulation = a snowball that can keep rolling.**

Five case studies are complete. From intelligence agencies to Iowa fields, from elite law firms to Chinese retail chains, the wider the contexts, the clearer the common method becomes. Two questions remain: what boundaries should this force observe, and what should newcomers do first?
