---
author: "HAOGRE"
pubDatetime: 2026-07-02T11:45:00.000Z
title: "Chapter 4: Activating Deployment"
featured: false
draft: false
lang: en
translationKey: "04-第4章-激活部署"
tags:
  - "AI"
  - "business"
  - "miscellaneous"
description: "Deployment is only the beginning: real delivery builds lasting usage habits and helps organizations move forward."
---

> “The model is usually the cleanest part. The hard part is finding the workflow nobody wrote down.”
> — A frontline FDE
>
> “No matter how technology evolves, the human dynamics and battles over ownership inside an organization remain more complicated than the technology itself.”
> — Shen Yue, frontline FDE practitioner
>
> ## 4.1 Going Live Is Not Activation: The Enterprise Deployment “Day One Curse”
>
> Let’s define this chapter’s central concept. In consumer internet products, “activation” means that a new user completes a key action and experiences the product’s “aha moment.” In enterprise deployment, activation means that **the target user group develops a stable habit of using the system in its daily work**. It is not applause at a demo. It is a system still being used frequently three months later, without anyone having to remind people.
>
> Put differently: going live is an administrative event; activation is a behavioral event. You can celebrate the former. The latter is what counts.
>
> One set of numbers from that MIT report is worth putting on the table again: only around four in ten companies provide employees with official AI-tool subscriptions, while as many as nine in ten employees regularly use personal, consumer-grade AI tools for work. The real state of many companies is therefore a “dual-track system”: the official system sits idle while shadow AI flourishes. The system went live. Activation never happened.
>
> Why do enterprise deployments so often die at activation? Because they must clear three hurdles that are completely different from those in consumer products. Consumer products die because they are “not fun.” Enterprise deployments die in users’ hands: users find them awkward—add one step to an old habit and nobody uses them; users find them untrustworthy—one mistake can wipe out trust; users feel the system has nothing to do with them—then nobody will touch it. None of these hurdles can be solved at headquarters. You have to clear them in the client’s meeting rooms, workshops, and workstations. That is why activation is the FDE’s home ground, and why it differs so fundamentally from traditional implementation, where “delivery” means leaving after sign-off. Traditional implementation treats the acceptance form as the finish line. FDE treats changed customer behavior as the finish line.
>
> The seven sections in this chapter correspond to seven weapons of activation.
>
> ## 4.2 Rapid Iteration: A “Hotfix” Culture During Deployment
>
> Internet products iterate through data-driven experiments, using small, fast steps to approach an optimum. Strict experiments are rarely possible in enterprise deployments—the samples are too small and the interference too great—but their spirit remains: fast, incremental, evidence-based iteration. During deployment, that spirit becomes a way of working: respond to every small user complaint as quickly as you would repair a production incident. I call this “hotfixing.”
>
> Consumer products measure iteration in versions: weekly or biweekly releases. FDE deployment measures it in days, sometimes hours. A business user says in the morning, “This output is missing the vendor-code field,” and the field is added that afternoon. A workshop manager says today, “I can’t hit this interface accurately while wearing gloves,” and the buttons are twice as large tomorrow. To users, this speed matters far more than the feature itself: **every overnight fix is a recharge to user trust**. Within the first month, users form a judgment: “This team is serious,” or “Here is another team that delivers and disappears.”
>
> A hotfix culture has three operating principles.
>
> First, feedback must go directly to the people writing the code. There can be no telephone game in between. In the old model, feedback passed through customer success, product management, and a roadmap before reaching engineering. Half the context was lost at every handoff; by the time the work was scheduled, a week had passed and the user’s patience had cooled. In the FDE model, feedback goes straight to the coder—ideally, the coder is sitting beside the user. This is precisely the loop Palantir shortened: frontline deployment engineers can build, test, learn, and feed knowledge back on site without waiting for a formal product request to complete its journey.
>
> Second, prioritize iteration by “usage blockage,” not “feature importance.” Deployment requires the opposite trade-off logic from product development. Product teams rank requests by strategic value; deployment teams ask, “What is blocking tomorrow’s usage?” If a color choice makes workshop workers feel that the system is “for office white-collar workers,” it becomes the highest priority. A powerful forecasting feature that users cannot use yet can wait until activation is complete. Win usage first, then depth.
>
> Third, ask at the end of every day: what moment tomorrow will be smoother because of today’s change? This turns the team from merely responding to requests into actively removing every point of friction between the user and the system. A fix is not just defect removal. Every fix is a deliberate activation design: another friction point dismantled. The list is hidden in the process map from the initial discovery work and in daily observation.
>
> ![Image 1](/Users/haogre/.gemini/antigravity-cli/brain/d4dffd42-6b6d-4063-b3a3-ad5b7fc7e2fe/ch5_1_1785725248635.jpg)
>
> OpenAI’s FDE working method has a corresponding rhythm: early co-creation, with on-site whiteboard alignment; validation, through an evaluation system; and delivery, through several days of on-site building. Notice that delivery is still organized around “multiple days on site.” The speed comes from having people stay close to the problem.
>
> ## 4.3 Iterating in the Customer’s Environment: Quality Improvement Driven by Evaluation
>
> If 4.2 was about the speed of iteration, this section is about its sense of direction. In AI deployment, that direction is carried by a practice that only became mainstream after 2024: **an evaluation system**—a set of standard cases used to continuously score system outputs.
>
> Traditional software quality has two states: right or wrong, tested or failed. AI-system quality is continuous, probabilistic, and context-dependent. The same answer can be impressive in a demo and disastrous in a specific business context. More importantly, the business side—not engineering—owns the definition of “good.” A model may consider an answer perfect while a domain expert immediately sees that it was written by an outsider. Without an evaluation yardstick, AI deployment iterates blindly: you think you are optimizing, but you may simply be drifting randomly.
>
> Leading teams have settled on three steps.
>
> First, grow the evaluation set from real cases. Engineers cannot invent it in isolation; it must come from the customer’s actual business material. The essence is making domain experts’ tacit judgment explicit and executable.
>
> Second, make the business side the judge. An evaluation system is not an engineering toy; business representatives must be part of the review. The best format lets experts participate directly: side-by-side output comparisons, simple better-or-worse labels, and regular review sessions. The benefit is twofold: the evaluation set becomes more accurate, and the business side develops a deeper understanding of the system. They watch it perform better and better on their own cases. Trust is accumulated through firsthand experience, not through reporting.
>
> Third, connect evaluation to the production loop. Going live is not the end of evaluation. Continuously collect real inputs and outputs in production, evaluate samples regularly, and trigger alerts when scores decline. This turns quality from a one-time pre-launch acceptance check into continuous lifecycle care. Users are less sensitive to average quality than to stability. One mistake can collapse trust; it may take ten correct answers to rebuild it.
>
> John Deere’s partnership is one of the most complete public examples of an evaluation-first approach. The company was addressing herbicide waste: conventional sprayers cover entire fields, while its “See & Spray” technology uses 36 cameras and machine vision to spray only weeds while traveling at 12 to 15 miles per hour—covering an area the size of three football fields per minute. The ambition of precision agriculture is enormous: the United States plants 12 trillion corn and soybean plants each year; the best fields produce 200 bushels per acre, while top growers reach 600. “If every plant could be cared for individually, the yields could be transformed.” Those are the words of John Deere technology executive Justin Rose.
>
> But farmers do not want technology. They want trustworthy recommendations. OpenAI’s frontline deployment engineers flew to Iowa and worked in the fields alongside agronomists. They first reviewed hundreds of real operating cases with experts and built a customized evaluation system, then rapidly iterated on the model. They also had to meet the agricultural calendar: miss the planting season and you miss an entire year. The result: chemical use fell by as much as 70%, while farmer interaction frequency increased sixfold. Notice the order of those numbers: **the evaluation system defined “good” before the model could deliver “good.”** (See Appendix C for the source.)
>
> The deeper meaning of an evaluation system is simple: it turns the veteran’s instinctive answer to “What counts as good?” into a scoring standard the system can execute every day. That is the FDE model in miniature. The customer’s knowledge is no longer just text in a requirements document; it becomes a living yardstick inside the system.
>
> ## 4.4 Find Another Path: Lowering the Barrier to Use
>
> Getting users to value with the fewest possible actions is basic product design. But in enterprise systems, the barrier is often outside the system itself. Four deployment tactics for lowering it have been repeatedly validated.
>
> First: live inside interfaces users already have. Wherever users do their real work, your system should appear. If they work in spreadsheets, build a spreadsheet plug-in. If they approve requests by email, let them approve in email. If they work in a ticketing system, embed AI suggestions in the ticket card. Asking users to log into a new system adds a wall they must climb every day. OpenAI entered BBVA through the ChatGPT interface already familiar to its 120,000 employees; Anthropic uses open protocols to bring models into customers’ existing workflow tools. The logic is the same: **every additional login costs activation.**
>
> BBVA is a strong example of entering an organization through existing habits. It began working with OpenAI in May 2024 and initially distributed only 3,300 ChatGPT Enterprise accounts—not a company-wide campaign, but a chance for seed users to experiment. Employees soon created more than 20,000 custom GPTs, around 4,000 of which were used frequently. Management did not ban “shadow AI”; it went the other way: “We give everyone a safe platform so they can experiment with confidence.” Structured training accompanied the rollout: 250 executives, including the chair, took the first courses; the bank built an AI Pioneer Network and developed advanced users known internally as “AI geeks.” After more than a year, employees were saving about three hours per week on average, and 83% were active weekly users. In December 2025, the two companies announced a bank-wide rollout across 25 countries and 120,000 employees, along with an end-to-end transformation roadmap called “Eight Things.” Expansion moved from 3,300 to 11,000 to 120,000 only after usage data from the previous stage had been made visible. That is what it means to let habits walk on their own. (See Appendix C for the source.)
>
> Second: activation is hidden in defaults. A new user facing a blank system immediately asks, “What now?” Most drop-off happens in those three seconds. The FDE solution is to pre-build the first use: preloaded templates, prefilled examples based on the customer’s own data, and guided onboarding with a personal task waiting when the user opens the system for the first time. On day one, the system should understand what the user is likely to do better than the user does. The things observed during those first days of shadowing now become useful.
>
> ![Image 2](/Users/haogre/.gemini/antigravity-cli/brain/d4dffd42-6b6d-4063-b3a3-ad5b7fc7e2fe/fde_rise_1_1785725003312.jpg)
>
> Third: translate “ask AI” into “click a button.” Enterprise users’ comfort with conversing with AI varies far more than people imagine. Asking users to formulate their own prompts transfers engineering work to the people least equipped to carry it. Mature implementations package frequent scenarios into one-click actions: “Generate last week’s exception report,” “Check this batch of invoices,” or “Draft this customer letter.” Behind each button is a complete, evaluated prompt and workflow. Conversational interaction is for exploration; buttons are for daily work.
>
> Fourth: start with a copilot before discussing autopilot. For high-risk, high-resistance processes, do not push straight to automation. Let the system begin as an advisor: AI drafts and humans confirm; AI labels and humans decide. Through repeated confirmation, users calibrate their trust in the system’s judgment. Automation comes later, once approval rates are high enough. John Deere’s solution still gives agronomists final decision rights; intelligent agents in financial compliance generally retain human oversight. The copilot strategy is not timid. It is the optimal path between activation and risk.
>
> ## 4.5 The Long Integration War
>
> Every FDE veteran carries scars from the same war: integrating with customers’ “legacy systems”—the old systems that have run inside enterprises for years and that nobody dares to touch.
>
> The brutality is beyond the imagination of anyone who has not worked on the frontline. a16z describes the problem precisely: the context AI applications need—historical records, business logic, and permissions—is locked inside enterprise databases, interfaces, and workflows. Connecting it all “is never optional; it is mandatory.” Mainframes in finance, heterogeneous systems across hundreds of healthcare clinics, and dozens of independently run shop-floor systems in manufacturing share the same traits: outdated documentation, incomplete interfaces, and experts who are already halfway to retirement.
>
> This war has four strategic principles.
>
> - **Treat integration as a campaign, not clerical work.** In most project plans, integration appears as one line—“system connection: two weeks”—then expands to four months during execution. The root mistake is treating integration as technical housekeeping. It is technical archaeology, organizational politics, and data governance all at once: a genuine hard battle. The right approach is to map systems during initial discovery, classify and schedule integration risks, and attack the hardest parts first. Integration has the greatest uncertainty; start one day late and the entire project schedule runs exposed for one more day.
>
> - **Second, solve data problems before model problems.** A widely cited insight from the report is that the underlying cause of many failed AI projects is “garbage in, garbage out.” AI connects to ungoverned data sources; one of ten versions of the same document is retrieved at random; the output is naturally untrustworthy. Palantir’s solution is an ontology: first model the enterprise’s data assets in a layer with business semantics, clarifying which field is authoritative, which version is valid, and who can see what. AI runs on that foundation. The general lesson is clear: **data governance is not preparatory work for an AI project; it is the AI project itself.**
>
> The U.S. Navy’s “shipbuilding operating system” is the most dramatic illustration. In December 2025, the Secretary of the Navy and Palantir’s CEO announced a $448 million contract, initially covering two major shipyards, three naval shipyards, and 100 suppliers. Shipbuilding’s data environment was a textbook disaster: ERP systems, databases decades old, and paper drawings coexisted. Yet two pilot numbers silenced everyone: at General Dynamics Electric Boat, the submarine scheduling plan fell from 160 person-hours to under ten minutes; at Portsmouth Naval Shipyard, material review time fell from several weeks to under an hour.
>
> The Secretary of the Navy emphasized: “This is not a concept, not a pilot, not a study—it is happening.” (See Appendix C.) The sequence matters: the efficiency miracle became possible only after extensive work connected the data into a unified semantic layer—not the other way around.
>
> The same logic appears in three entirely different industries. Fast-food chain Wendy’s used a data platform to produce a solution for syrup shortages across 6,450 North American stores in five minutes, instead of having 15 employees spend an entire day investigating. Mortgage giant Fannie Mae used AI to identify mortgage fraud, achieving a detection rate above 99%, far exceeding its old rule-based system. Citibank reduced customer credit approval from hours to minutes by having AI read credit histories, transaction habits, industry risks, and affiliated companies in one pass. Three industries, one prerequisite: scattered data must first be organized into a semantic layer machines can understand. Only then does intelligence have somewhere to land. (See Appendix C.)
>
> - **Third, use AI to fight the AI integration war.** One important variable after 2025 is that integration work itself is beginning to be automated by AI. The scenario a16z envisioned is partly real: browser agents simulate people retrieving data from systems with no interfaces; models handle much of the field mapping, format conversion, and API-document interpretation. Leading teams set themselves a demanding standard: “Automate the integration process as much as possible—process mining, data pipelines, system connections, and API-document analysis. That speed advantage compounds.” Using AI to do the work of AI deployment may be the most satisfying part of the job.
>
> - **Fourth, know when to bypass rather than conquer.** Not every legacy system deserves a direct integration. Some are best handled through “shadow reads”—read-only snapshots or overnight synchronization. Some require “manual ferrying” during a transition period. Others should simply be isolated, with the customer clearly told that the workflow’s data is outside the project scope. An engineer’s pride wants to conquer every fortress. An FDE’s judgment lies in choosing the battlefield. The goal is not total technical victory; it is the customer’s result.
>
> ## 4.6 Change Management: Getting the Customer’s Organization on Your Side
>
> This section deals with activation’s greatest soft resistance: the organization. Of the report’s five major obstacles, employee resistance and change management together account for nearly half. Engineers can put technology live. Behavior change requires the whole organization.
>
> In the FDE context, change management centers on three groups of people.
>
> ![Image 3](/Users/haogre/.gemini/antigravity-cli/brain/d4dffd42-6b6d-4063-b3a3-ad5b7fc7e2fe/fde_rise_2_1785725012734.jpg)
>
> - **Champions | Your internal allies:** Behind every successful deployment is a customer-side champion who genuinely believes in the work and is willing to stake their reputation on clearing the path. David Wakeling, head of market innovation at A&O Shearman, is a typical example: he was Harvey’s internal counterpart, advocate, and shield. The principles are simple: give the champion material they can tell as a story, give them wins that turn their foresight into a career highlight, and give them safety by standing in front when things fail. One well-supported champion is worth more than ten product presentations.
>
> - **Influencers | Informal opinion leaders:** Every organization has uncrowned kings: senior analysts, veteran workshop workers, and the person everyone asks when they need to know how something really works. They may lack formal authority, but they hold trust. Their “This thing actually works” outweighs three all-company emails from management. Their “It’s just decoration” can quietly kill a system at the frontline. During activation, deliberately cultivate these people: invite them to try the system first, take every complaint seriously, and make their contributions visible—“This field was added at Master Wang’s suggestion.” Turning influencers into co-authors is the shortest path past the feeling that “I don’t use things I didn’t help make.”
>
> - **The affected | Groups whose interests are touched by the solution:** Automation inevitably redistributes work, and redistributing work inevitably creates people who feel diminished: approval staff whose role is compressed, departments whose information walls are breached, and veteran employees whose special craft is being replaced. Ignore them and they become the system’s most persistent underground resistance—passive noncooperation, stories about every incident, and opposition votes at acceptance. Mature change management designs an exit path in advance: direct released capacity toward higher-value work, publicly commit to no layoffs, and turn gatekeepers into coaches whose experience trains the system. People need to see where they fit in the future. This is humane, but also practical: the cost of resistance is far higher than the cost of reassurance.
>
> The partnership between ticketing platform Vivid Seats and Sierra shows what full customer-side mobilization during activation looks like. After deciding to introduce an agent, the company committed its product, customer-experience, and engineering teams: “Once we made the decision, we went all in and retested everything.” The result: launch took less than four weeks; after launch, self-service resolution rose 40% and customer satisfaction rose 35%.
>
> The follow-on change was even more valuable. Once the agent handled routine questions, the customer-experience team moved from queue-based firefighting to fixing root causes, with enough capacity for fan-focused projects such as “surprise upgrades.” Conversation data also began feeding product development: “If 10,000 people ask about the same feature in a month, we can immediately prioritize it. The best moment is when a product improvement based on a pattern means users no longer need to ask for help.” (See Appendix C.) **The highest form of activation is making the system unnecessary.** This case also foreshadows Chapter 7’s idea of frontline feedback flowing back into the product.
>
> A corresponding example is emerging in China. Ren Xiliang, head of efficiency engineering at e-commerce company Dewu, breaks AI transformation in a company of tens of thousands into three steps. First, build consensus with everyone and lower the tool barrier so people start using it. Second, divide enterprise scenarios into four quadrants according to tolerance for error, giving AI the more forgiving scenarios—such as business analysis—first. Third, create a dedicated knowledge-operations group that works inside business teams and moves experts’ tacit experience from individual minds into AI-visible spaces. Consensus, scenarios, knowledge: the order matters. First get people willing to use AI, then choose the right places, and only then give AI the material it needs. (See Appendix C.)
>
> Change management has one ultimate test: **after your team leaves, is the system still being used?** If everything is hot while you are there and quickly cools after you leave, that is not activation. It is choreography. A truly activated organization moves forward on its own.
>
> ## 4.7 I, Robot: Automating the Delivery Work Itself
>
> Delivering automation to customers is the product. Automating your own delivery work is efficiency. This section is about the latter: it is the first lever an FDE team can pull to escape linear growth in which revenue rises only with headcount.
>
> A surprising share of daily FDE work is repeatable labor that can be templated: initializing a new customer’s deployment environment, standard data-ingestion pipelines, answering security-review questionnaires, pre-launch checklists, and recurring customer reports. Every action you perform for the second time should trigger the question: “Can this become a script, template, or checklist?”
>
> Leading teams have consolidated the practice into four asset classes.
>
> - **Deployment templates:** Package environment setup, permission configuration, and monitoring connections as one-click infrastructure code. When a new customer arrives, a standardized environment can be brought up in its cloud environment on day one instead of being configured from scratch for a week. Decagon can compress deployment for simple scenarios to 15 days because of a highly templated integration layer. (See Appendix C.)
>
> - **Integration component libraries:** Connectors for mainstream enterprise systems—prebuilt system integrations—written once and reused everywhere. Palantir’s ontology model takes this logic to its extreme: the output of data integration is not a one-off pipeline, but reusable data assets with business meaning.
>
> - **A checklist culture:** Security-review checklists, launch-readiness checklists, and handoff checklists for leaving the site. Checklists are humanity’s oldest tool for fighting complexity, and the foundation of consistent FDE quality. They turn dependence on personal experience into dependence on organizational memory.
>
> - **Automated reporting:** Weekly customer reports and frontline intelligence for the company should both be generated semi-automatically. An FDE’s time is too expensive to spend copying and pasting—and “forgetting to report” must not sever the frontline-to-product loop discussed in Chapter 7.
>
> The compounding effect of automation can be seen from one angle: a16z lists “building or buying tools to automate service delivery” as a key recommendation for forming a frontline deployment team. It argues that this is a crucial variable allowing this generation of AI companies to move faster and sell at lower contract thresholds than the previous generation of enterprise software companies. Sierra’s fastest publicly reported launch took four weeks; Palantir compressed sales cycles from nine months to several weeks. Neither result came from engineers working overtime. They came from turning yesterday’s delivery into today’s scaffolding.
>
> This section also answers the most common objection: “Isn’t FDE just a people-heavy strategy?” The essence of a people-heavy strategy is not having many people. It is having every person perform one-off labor that cannot be reused. **When every delivery by an FDE team clears a path for the next delivery, the team is no longer an army of people. It is a machine accelerating itself.**
>
> That concludes the seven weapons of activation deployment: the speed of hotfixes, the direction of evaluation, the craft of lowering barriers, the patience of integration warfare, the soft power of change management, and the leverage of automation. The system is alive, and the people are moving. But enterprise business is unforgiving: activation keeps you alive; renewal is survival. Next chapter: protecting the renewal.
