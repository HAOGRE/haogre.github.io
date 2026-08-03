---
author: "HAOGRE"
pubDatetime: 2026-07-20T13:10:00.000Z
title: "Chapter 7: Scaling Through Replication"
featured: false
draft: false
lang: en
translationKey: "07-第7章-规模化复制"
tags:
  - "AI"
  - "business"
  - "programming"
description: "How FDE teams turn field experience into knowledge, components, and platforms that compound delivery efficiency."
---

> “If you don’t turn what you learn in the field into product assets, all you have are a pile of bespoke projects.”
> — Barry, former Palantir Forward Deployed Engineer

## 7.1 Using Replicability as a Delivery Lever

The highest form of internet growth is getting one user to bring in more users—the growth engine shifts from purchased to endogenous. FDE has to answer the same question: **after every customer, the next customer should be easier to serve—not because you hired more people, but because you retained what you learned last time.**

This is the book’s “last mile” because it is the final boundary between the FDE model and consulting or outsourcing. What happens if you remove this chapter from the playbook described in the previous six? You get an elite team that can handle hard deployments, signs one customer, delivers one customer, earns enough to cover costs, and moves on to the next. Revenue and headcount grow in perfect lockstep. Congratulations: you have reinvented the consultancy.

Barry draws the line bluntly in his memoir: “If you don’t turn what you learn in the field into product assets, all you have are a pile of bespoke projects.” McGrew describes the same boundary from another angle: the FDE model works when “the amount of customization declines with each subsequent customer.” If your custom work does not decline as your customer count grows, you are not doing FDE. You are selling billable hours.

Replicability has three levels of leverage. Each is harder than the last—and more valuable too.

- **Level one | Knowledge replication (the playbook):** Turn “how to do it” into documentation—delivery templates, checklists, and training materials. This shifts dependence from individual experience to organizational memory, cutting new-hire ramp time from a year to three months. It is the most basic lever, and where most teams stop.

- **Level two | Component replication (tools and code):** Turn “what we have done” into “what can be used directly”—integration connectors, evaluation frameworks, deployment templates, and industry data models. The next team no longer starts from zero; it starts on the shoulders of the previous project. The automation assets discussed in Section 4.7 belong here.

- **Level three | Product replication (platform capabilities):** Abstract recurring customization into standard platform capabilities. From then on, the requirement no longer needs an engineer on site. Palantir’s ontology, Decagon’s agent workflow configuration, and Sierra’s agent platform are all products of this third level. It changes the economics of the entire business: **the first two levels lower delivery costs; the third eliminates them.**

The progression is the full version of McGrew’s “gravel roads and highways” metaphor: FDE repairs the gravel road to solve the immediate problem; the component team lays a better roadbed for the next vehicle; the platform team pours a highway so everyone can pass. The remaining seven sections of this chapter describe that complete journey from road repair to road building.

## 7.2 Bad News Travels Fast: Spreading Lessons from Failed Deployments

Turning incidents into assets is a rare organizational capability. An FDE organization’s attitude toward failure determines whether it can replicate: **failure is the raw material of replication, and an organization that hides failure is burying a gold mine as trash.**

One point must be clear: failure is not an anomaly in the FDE model. It is inevitable. Barry’s memoir is unsparing: “There were plenty of failures—vast amounts of time, money, and travel expenses burned spectacularly.” Palantir institutionalized the acceptance of failure: treat pilots like venture investments, expect most to die, and conduct a postmortem when they do. He also stresses that teams whose projects crashed, whose work came to nothing, or whose engineers burned out deserve thanks—the lessons were bought with their effort. This is difficult to learn because engineers naturally celebrate success and hide failure.

Turning failure into organizational assets requires three mechanisms.

- **Blameless postmortems:** The only rule for a postmortem is to focus on the work, not the person. Once postmortems are tied to performance reviews, people start polishing the story—and polished failures have no teaching value. Blamelessness does not mean refusing accountability. It means redefining accountability as whether the team extracted the lessons honestly and completely. A project lead who conducts an honest postmortem may contribute more to the organization than someone whose project succeeded by luck.

![Image 1](/uploads/2026/07/20/chapter-7-scaling-through-replication/ch3_3_1785725147343.jpg)

- **Structured lessons:** A postmortem cannot end with “pay more attention next time.” Its output must be searchable and actionable knowledge: What are the high-risk signals for this customer type? Which integration assumption was disproved? Which evaluation metric was designed incorrectly? These conclusions should enter the “danger zones” section of the playbook and the due-diligence checklist for new projects, so the next team arrives with historical lessons already in hand. **A failure has only truly been learned from when the lesson is written into the process.**

- **Selective external sharing:** The most counterintuitive layer is sharing failure lessons externally, after anonymization. It is highly effective trust marketing. As discussed in Section 3.5, Barry’s article openly exposing Palantir’s own problems became one of the best explanations of the Palantir model. Readers can tell who is reciting booth talk and who is describing the trenches. A team willing to dissect its failures publicly sends a powerful signal: “We have already paid the tuition for this industry’s wrong turns.” That is exactly what enterprise customers want to hear.

## 7.3 Riding the Wave: Standing on the Industry’s Tailwinds

Using attention generated by external events is a classic marketing tactic. FDE teams are currently standing on an extraordinary wave—but the window will not stay open forever.

The industry wave of 2025 and 2026 is formed by several currents converging. One report made a “95% failure rate” the recurring anxiety of every enterprise technology leader—your customer’s anxiety is your opportunity. OpenAI and Anthropic founded deployment companies on the same day, pushing “deployment” onto the financial front page; the money spent by giants educating the market benefits the entire category. An 800% increase in FDE job postings made the role a regular subject in technology media. Even “should we hire FDEs?” became an enterprise concern. Together, these currents created a rare situation: **customers are actively looking for you and discussing the thing you want to sell.**

The first move in riding the wave is to define the agenda. Attention on a trend is a public resource. Whoever defines the topic through their content captures that attention. a16z set the tone for the category with a major industry essay; communities such as OpenFDE aggregate practitioners while also aggregating the power to define the field. For a specific company, the best way to claim that power is to publish what it has been keeping in reserve: playbooks, failure reviews, and value data. Exclusive first-hand knowledge is the only currency of agenda-setting.

The second move is to bind yourself to the industry agenda. The main driver of enterprise AI procurement is shifting from “efficiency” to “survival.” CEOs are being asked in board meetings, “What is our AI strategy?” That anxiety eventually becomes budget. Translate your offering into board language: not “we can optimize your customer-service workflow,” but “we can help you bring a measurable AI scorecard to the next board meeting.” The same delivery, anchored at a different agenda level, reaches a different pool of money.

The third move is to build assets during the wave rather than consume it. Waves stop. The discussion sparked by a report cools, and media buzzwords go stale. The most valuable thing during a wave is not signing a few extra deals, but turning the attention it brings into durable assets: lighthouse customers, authority in the industry’s methodology, and a replicable delivery system. **When the wave recedes, those who were swimming naked retreat; those with assets reach shore.**

## 7.4 Building a Word-of-Mouth Loop Outside the Customer

In FDE, advertising-free, reputation-driven distribution happens mainly through three circles.

The first is the practitioner community. FDE is an emerging professional community. In 2025 it was still scattered inside individual companies; by 2026 it had dedicated communities such as OpenFDE, compensation reports, and interview guides. For early movers, the formation of this community is a gift: contribute methods, tools, and data, and your name becomes associated with the new profession. This is how concepts have always spread: the first evangelists eventually become synonymous with the concept itself.

The second is the customer’s industry community. Every industry has its own small circles—banking forums, law-firm partner conferences, and hospital-management summits. The trust premium discussed in Section 3.3 mainly circulates inside these closed communities. The ticket in is not advertising; it is a customer advocate invited to speak. Your job is to give that person something worth saying, and help them say it well. A customer’s ten-minute presentation at an industry summit is worth more than a hundred days in your own trade-show booth.

The third is the ecosystem-partner network. Section 3.7 discussed the customer-acquisition value of ecosystem bundling; here the focus is its distribution value. Cloud solution architects, consulting advisers, and systems-integrator project managers move between customer sites every day. Their list of “teams we trust” is one of the fastest and most accurate channels of promotion. The key is to help them win: make sure ecosystem partners gain revenue, case studies, and reputation from working with you. **Those who help others succeed are remembered by the entire network.**

Together, the three circles form a flywheel: delivery creates stories, stories spread through the circles, distribution creates new opportunities, and new opportunities create new stories. Unlike traditional marketing, the fuel is entirely “value already delivered.” Word of mouth means letting every past effort bring in future customers.

## 7.5 Product-Built Virality

![Image 2](/uploads/2026/07/20/chapter-7-scaling-through-replication/ch4_1_1785725155563.jpg)

Good products spread on their own. “Sent from [company] email” in an email signature was one of the earliest examples of self-propagating product design. FDE-delivered systems can also contain “built-in expansion mechanisms,” allowing the system itself to become the salesperson.

Factor one: design for visibility. System outputs are naturally passed around—weekly reports, analyses, and approval flows. Give every output a clear origin: “Generated by [system]” in the report footer, or a link to the handling interface in an anomaly alert. When a polished analysis is forwarded to a director in another department, the natural question is, “What made this?” The essence of visibility design is allowing value to display itself in everyday workflows rather than requiring a dedicated presentation.

Factor two: collaborative access. Design features that require collaboration across roles: a case annotated by an investigator needs a supervisor’s review; an analyst’s report needs confirmation from the business team. Every collaborative action introduces the system naturally to a new user. These users are not “marketed to”; they are brought in by the work itself, and their acceptance is entirely different.

Factor three: a self-serve exploration layer. Outside the core delivery, leave a low-risk sandbox where customer employees can try things such as “let AI analyze this for me.” Use cases that emerge in the sandbox are often the most vital expansion leads. A scenario discovered by an employee experimenting on their own has deeper roots than one sales has pushed ten times. **Let everyone help discover use cases; let FDE handle the hard problems.**

Two new products in 2026 made this factor explicit. In March, Sierra launched Ghostwriter: customers can upload standard operating procedures, historical conversations, even a photo of a whiteboard, or simply describe a goal in plain language, and the system generates a production-ready agent across voice, chat, and email in more than thirty languages. Business users can now “build an Agent themselves,” while forward-deployment teams shift from building every agent by hand to acceptance testing and providing a safety net. Decagon took a similar path earlier with agentic workflows: a customer-service manager can define a process in natural language—“For returns older than 30 days, check membership level first; if the policy allows it, process the return”—without waiting for an engineer. According to reports, Chime achieved a 70% self-service resolution rate, Duolingo routed 80% of issues, and fitness platform ClassPass reduced customer-service costs by 95%. (See Appendix C.) **When customers begin building for themselves, your role changes from construction crew to design firm.** That is factor three in its ultimate form.

Factor four: value evidence that crosses boundaries. Generate a quarterly “value report” automatically and let it flow naturally to the customer’s executive layer. The report is both the renewal work described in Chapter 5 and a door-opener for expansion: every number an executive sees plants the question, “Where else should we use this system?”

The shared principle behind these built-in factors is simple: **if you want people to help spread your product, first make sure they have genuinely experienced its value.** Any design created solely for distribution will be recognized in an enterprise setting as a vendor gimmick and rejected. Enterprise products do not go viral. They spread through a chain reaction of trust—slowly, but solidly at every step.

## 7.6 Navigating Organizational Politics at Scale

The biggest obstacle to scaling has never been technology. It is people’s territory.

When a system expands from one department to ten, you are rewriting the organization’s power map: information monopolies are broken, approval rights are compressed, and professional barriers are flattened. Data once controlled by one department becomes visible across the company; tasks that used to require three days of signatures receive an instant AI response; an expert’s “secret knowledge” is encoded into the system. Every change creates silent opponents.

FDE veterans have distilled three principles for navigating organizational politics.

- **Principle one: expansion must include a local.** Whenever you enter a new department, find the local power broker—the respected senior employee—and invite them into the adaptation process: “What is different about this scenario in your department?” Their answer makes the solution more accurate; their involvement lets it move freely through their territory. **People rarely oppose what they helped build.** It is one of the most reliable levers in organizational behavior.

Harvey’s expansion into top-tier law firms is a classic lesson in organizational politics. Three groups coexist inside a firm: partners, who pay but do not do the work; paralegals, who do the work but do not sign; and knowledge-management lawyers, who belong fully to neither side but can see both sides’ blind spots. A generic survey compresses these three groups into the same dropdown options and produces distorted averages. Harvey’s forward-deployment team instead designed separate interviews and demonstrations: to partners, “this deal makes more money”; to paralegals, “you will work three fewer late nights this week”; to knowledge-management lawyers, “the firm’s hidden experience finally has somewhere to accumulate.” A deployment must make all three groups feel like beneficiaries. Leave out any one of them, and the system will quietly be shelved at the corresponding point in the process. (See Appendix C.)

- **Principle two: give every expansion step a beneficiary.** Before expanding, calculate what each relevant department gains. A department whose data barriers have been breached gains company-wide analytical visibility; a department whose approval rights have been compressed gains the ability to focus on exceptions, while AI handles routine work. Expansion without beneficiaries feels like invasion. Expansion with beneficiaries feels like liberation. The difference is whether you have understood and explained what the other side gets.

- **Principle three: always preserve the dignity of the old order.** A process replaced by the system was once designed by a capable person. Experience that is now encoded was once the life’s work of an expert. In your rollout language, respect for the old order is respect for the people who maintained it: “This process supported the company for ten years. Now we are going to amplify those ten years of experience one hundredfold.” An old world treated well is less likely to sabotage the new one.

## 7.7 Capturing Replication Efficiency in the Playbook

![Image 3](/uploads/2026/07/20/chapter-7-scaling-through-replication/ch4_2_1785725164757.jpg)

At the beginning of this chapter, the playbook was identified as the first level of leverage. This section covers its engineering details because most teams turn their playbooks into document graveyards that die the moment they are written.

- **First property: the playbook must live in the process, not in the knowledge base.** A playbook that can only be found by searching a document system effectively does not exist. The effective approach is to embed it in the workflow: during due diligence for a new project, the system automatically surfaces the checklist for that customer type; during deployment, the checklist becomes a hard gate in the task system; during the postmortem, updating the playbook is a required output. **Knowledge that is not embedded in the process is merely archaeological material.**

- **Second property: organize by scenario, not by function.** Failed playbooks are organized around company structure—“delivery process,” “technical standards.” Successful ones are organized around customer scenarios—“anti-money-laundering playbook for financial services,” “production-scheduling playbook for manufacturing,” “knowledge-base playbook for law firms.” Each scenario playbook contains the same seven elements: typical pain points and fit criteria; a due-diligence checklist with scenario-specific danger signals; known data and integration traps; evaluation and acceptance metric templates; a change-management role map; reference structures for pricing and expansion; and a library of historical lessons. Harvey’s approach for law firms can be replicated at PwC and Kirkland because the experience of its first customer, Allen & Overy, was written into an inheritable scenario asset.

- **Third property: it must stay alive—with an owner, versions, and depreciation.** Each scenario playbook needs an owner, usually the most experienced delivery team. It must be updated after every project and comprehensively inspected every six months, with outdated material removed and duplicates merged. A playbook without an owner will decay into a trap that misleads new hires within a year. That is worse than having no playbook at all.

The relationship between the playbook, the second-level component library, and the third-level platform is this: the playbook records judgment, the component library preserves craft, and the platform codifies capability. With all three in place, a newly assembled FDE squad can reach 80% of a veteran team’s effectiveness within two weeks. That is what replication really means.

## 7.8 Planning and Refining Productization

The final section covers the summit of the third level of leverage: crystallizing field experience into a product. This is the alchemy of the entire FDE model.

Consider the most spectacular success story: Palantir’s Foundry. The platform that now generates billions in annual revenue and supports a company valued in the hundreds of billions had core components born in customer sites from Zurich, Houston, São Paulo, and Toulouse to Baku. Tools built independently by forward-deployed engineers to solve local problems underwent years of natural selection and platform consolidation, eventually becoming a unified product. Barry remembers the process as “completely bottom-up.” In 2014, the company’s product strategy was literally “strong opinions, loosely held”: let a hundred flowers bloom in the field, then bring the survivors into the core.

This was not a pastoral process. It followed a strict internal logic that can be distilled into four productization questions.

- **Question one:** Is this field solution peculiar or general? The test is whether the same problem has appeared independently at three or more customers. The same pain at three customers is a product signal; a special request from one customer may simply be a quirk. Palantir’s rule of thumb is to let repeated reinvention by multiple forward-deployed teams reveal the commonality. When three teams independently build similar things, the platform team knows it is time to bring the capability in.

- **Question two:** Is the cost of generalization smaller than the benefit? McGrew has warned that field code is “fast and rough,” and the cost of generalizing it is “often higher than writing the first version.” Productization decisions must do the math: compare the generalization investment with the customization cost saved across future customers. If the numbers do not work, keep it at the component layer. Do not force it into the platform. Every capability in the platform is a lifetime maintenance commitment.

- **Question three:** Can people who do not write code use it? Field tools are used by engineers; platform capabilities are used by everyone. The hardest part of productization is often interaction design rather than technology: turning an engineer’s script into a configurable feature for business users. Decagon’s agent workflow configuration, which lets operations teams define flows in natural language, is a model for this step. Choose the right abstraction layer and the user base can expand a hundredfold.

- **Question four:** Is there still room for the field after consolidation? This is the most delicate balance. If the platform absorbs too much, field teams degenerate into configurators and the soul of FDE—field creativity—dies. If it absorbs too little, the scaling lever never takes hold. Palantir’s answer is to maintain “aggressive empowerment of the front line over the base”: leadership sets the goal, while the field owns the method. **The platform makes common things easy; the field makes impossible things happen.**

The strongest objection to this flywheel is always gross margin: how can margins be high if you send people into the field? History has offered three answers. ServiceNow went public with a 63.2% gross margin and was criticized for looking too much like a services company. Ten years later, it was at 79%, with a market value near $200 billion. Workday went public at 54.1%; today it is at 76%. Palantir went public at 79% and reached 82% in 2025, better than most “pure software” companies.

Venture firm Insight Partners summarized the pattern precisely: **the companies that invested heavily in implementation and services during platform transitions were the ones that held their ground while everyone else ran in the opposite direction.** The secret is that gross margin climbs year after year. As the platform compounds, customers can perform more of the implementation themselves, with training-camp models moving much of the integration work to the customer side. Service costs are continuously diluted. Ugly first, beautiful later; heavy first, light later. (See Appendix C.)

The final story of this chapter is about betting on the right direction. When ChatGPT appeared at the end of 2022, everyone wondered what Palantir would do. Shankar made a bet that would later be quoted repeatedly: foundation models would commoditize rapidly, and value would gather at the two ends—compute chips on one side, and the ontology on the other, the semantic layer that lets models work safely on enterprise data. He moved most of the company’s engineers onto the AI platform AIP. The result: Palantir’s stock rose from the single digits when he took over as CTO to around $200; U.S. commercial revenue grew by triple digits for multiple consecutive quarters. The logic of this bet mirrors Chapter 1: **the stronger and cheaper models become, the more valuable the engineering that connects models to reality becomes.** (See Appendix C.)

The endpoint of the four productization questions is the conclusion of the FDE business model: **the field is the probe, the platform is the lever, and the product is the vehicle for compounding.** The more real the world detected by the probe, the stronger the capabilities accumulated by the platform. The stronger the platform, the farther the probe can travel. Once this flywheel turns, you are no longer a company that sends people to do work. You are a company that continuously converts the complexity of the world into software assets. That is the highest-margin, deepest-moat species born since the beginning of the software industry.

Next chapter: a complete collection of case studies. We will return to the field where all these methods originated and see how they happened in the first place.
