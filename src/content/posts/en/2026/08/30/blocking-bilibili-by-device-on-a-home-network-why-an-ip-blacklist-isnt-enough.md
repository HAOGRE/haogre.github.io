---
author: "HAOGRE"
pubDatetime: 2026-08-30T09:25:48.948Z
title: "Blocking Bilibili by Device on a Home Network: Why an IP Blacklist Isn't Enough"
featured: false
draft: false
lang: en
translationKey: "路由器按设备屏蔽哔哩哔哩：为什么 IP 黑名单不够"
tags:
  - "network"
  - "router"
  - "musings"
description: "How to block Bilibili on specific devices without affecting the entire home network, beyond static IP blacklists."
---

I have a TV box at home. I want it to maintain general internet access and run other apps, but I need to block Bilibili and its TV version, Yunshiting. This restriction must be device-specific; I cannot shut down Bilibili for the entire home network.

By "blocking Bilibili", I don't mean configuring the router to ban the service for all devices. Instead, the home network should function normally, while a targeted restriction is applied only to selected devices—such as a specific TV box, Apple TV, or Android box. Other devices bypass this policy, and other apps on the restricted devices should remain usable.

![Xiaohei chasing constantly changing CDN addresses; static IP blacklists are always one step behind](/uploads/2026/08/30/%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8C%89%E8%AE%BE%E5%A4%87%E5%B1%8F%E8%94%BD%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20IP%20%E9%BB%91%E5%90%8D%E5%8D%95%E4%B8%8D%E5%A4%9F/01-static-ip-pool.png)

_Static IP blacklists seem straightforward, but chasing constantly changing CDN addresses quickly becomes a game of whack-a-mole._

## Why the First Version Worked, Then Failed

The initial approach was to use `dnsmasq` to identify Bilibili-related domains, pool the resolved IP addresses, and then use `iptables` to block access to these IPs only for specific MAC addresses. The rule looked something like this:

```sh
ipset=/bilibili.com/bilibili.tv/bilivideo.com/bilivideo.cn/hdslb.com/biliapi.net/b23.tv/acg.tv/BILI_PROJECTOR
```

Coupled with a device-specific forwarding rule, the connection was rejected only when the TV box's MAC address matched. Regular web browsing and other devices were unaffected by this rule.

It worked initially because the client happened to connect to IPs already on the blacklist. It eventually failed—not because `iptables` broke, but because this strategy relied on a constantly changing intermediate state: the IPs to which the domains currently resolved.

Bilibili operates across numerous domains. Video, image, account, configuration, and telemetry requests may all use different domains. Yunshiting also utilizes its own business domains and CDNs. During troubleshooting, queries for `gtm.yst.aisee.tv`, `data.snm0516.aisee.tv`, and `grpc.snm0516.aisee.tv` appeared from the TV box—none of which were in my original domain list.

Even if we added every IP resolved at a given moment, three problems would persist:

- IPs expire, rendering stale addresses in the pool useless;
- New domains or CDNs would be missed, allowing the client to play videos again;
- CDN IPs might be shared across multiple services. Brute-force IP blocking easily causes collateral damage to other apps.

So the root issue wasn't "missing a few IPs." It was attempting to express a business policy—which should be defined by domains and client scopes—using a pool of IPs. IPs are suitable for connection control, but inadequate for the abstract rule: "This specific device cannot access this specific service."

## DNS Filtering as the Gateway, But Not the Whole Solution

Later, I introduced AdGuard Home. Its role wasn't to automatically take over the entire home network, but to provide a DNS filtering layer that could distinguish clients. DNS requests from target devices are routed to AdGuard Home, while other devices continue using the router's default DNS.

![Xiaohei intercepts Bilibili and Yunshiting requests at the DNS layer, letting other apps pass through](/uploads/2026/08/30/%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8C%89%E8%AE%BE%E5%A4%87%E5%B1%8F%E8%94%BD%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20IP%20%E9%BB%91%E5%90%8D%E5%8D%95%E4%B8%8D%E5%A4%9F/02-dns-filter.png)

_The DNS layer can identify "what domain is being accessed" and apply rules exclusively to designated clients._

This layer solved the core problem of static IP blacklists: rules are now written for service domains, not a batch of IP addresses that might expire in a few days. In practice, AdGuard Home applies its built-in Bilibili service rule to the target clients, supplemented by the `aisee.tv` domain rule actually used by Yunshiting:

```text
||aisee.tv^
```

This rule is enabled only for selected clients, not the whole house. Even if domains like `ptqy.gitv.tv` appear in the logs, they shouldn't be added to the Bilibili blacklist based on a single observation, as they might belong to shared video or TV infrastructure. Without proof that a domain is exclusive to Bilibili, the blocking scope shouldn't be expanded.

However, DNS is not a silver bullet. Clients might use old IPs from their cache, rely on hardcoded IPs, or try to bypass standard DNS using DNS-over-TLS (port 853). Therefore, the final solution didn't stop at "DNS returning 0.0.0.0." It combined DNS identification with dynamic connection control on the target device.

## The Final Solution: Device-based DNS Routing + Dynamic Connection Blocking

The current traffic flow can be summarized as follows:

```text
Selected TV Box
  ├─ UDP/TCP 53 → Forwarded only to AdGuard Home
  ├─ UDP/TCP 853 → Rejected only for this device to prevent DNS bypass
  └─ Target Service Connections → Dynamically blocked based on current DNS resolution

Other Devices & Other Apps on Target Box → Continue using standard network paths
```

This is implemented in four layers:

1. **Fixed Device Identity**: Assign a static DHCP lease to the target device and match it by MAC address. Adding a new device later simply means adding a new MAC/IP mapping.
2. **Device-based DNS Forwarding**: The router only DNATs UDP/TCP 53 requests from this specific device to AdGuard Home's dedicated port. Other devices bypass this forwarding rule.
3. **Domain Recognition**: AdGuard Home applies Bilibili service rules and Yunshiting domain rules to this client; normal domains resolve as usual.
4. **Dynamic Connection Fallback**: A script periodically resolves the configured service domains, keeps only the currently active IPs, and rebuilds an `iptables` chain dedicated to the target device. Stale IPs are replaced, not endlessly appended to an ever-growing IP list.

![Xiaohei replaces old addresses with current CDN IPs; the rule replaces, rather than infinitely accumulates](/uploads/2026/08/30/%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8C%89%E8%AE%BE%E5%A4%87%E5%B1%8F%E8%94%BD%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20IP%20%E9%BB%91%E5%90%8D%E5%8D%95%E4%B8%8D%E5%A4%9F/03-dynamic-refresh.png)

_The goal of dynamic rules isn't to accumulate all historical IPs, but to maintain only the addresses relevant to current connections._

The implementation files on the router each serve a distinct purpose:

```text
/jffs/configs/bili-projector-domains.conf  # Domain suffixes for dynamic resolution
/jffs/scripts/bili-projector-refresh       # Resolves domains and rebuilds active connection rules
/jffs/scripts/firewall-start               # Mounts device-based DNS, port 853, and dynamic rules on boot
```

The current domain configuration covers suffixes like `bilibili.com`, `bilibili.tv`, `bilivideo.com`, `bilivideo.cn`, `bilicdn1.com`, `hdslb.com`, `biliapi.net`, `b23.tv`, `acg.tv`, and `aisee.tv`. This isn't a claim to have "listed every Bilibili domain." Instead, it hands verified business entry points over to the DNS rules, and uses dynamic connection rules to handle the IPs currently resolved from these domains.

There is also a potentially misleading name here: `BILI_PROJECTOR` or `BILI_PROJECTOR_IPS` is not a magic toggle built into the system. It's simply the name of the `iptables` chain created by the script to centralize "the Bilibili connection rules for this projector/box." What it actually does is determined by the rules in `firewall-start` and the refresh script. When copying a line, you should copy the complete device configuration, not just the name.

## Why Restrict Only One Device?

Matching by MAC address establishes the boundary of this solution. It ensures rules only apply to connections initiated by the target device, leaving phones, computers, and other TVs free to access the network normally. The target box itself isn't completely disconnected either: only connections matching Bilibili-related domains or current target IPs are processed; other apps continue using their original outbound paths.

![Xiaohei only closes the projector's door to Yunshiting, keeping other apps and XGIMI management online](/uploads/2026/08/30/%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8C%89%E8%AE%BE%E5%A4%87%E5%B1%8F%E8%94%BD%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20IP%20%E9%BB%91%E5%90%8D%E5%8D%95%E4%B8%8D%E5%A4%9F/04-device-isolation.png)

_The minimum scope of this restriction policy is "a specific device + a specific service", rather than the entire local network._

When adding another device, the management process remains straightforward:

1. Create a static DHCP lease for it to ensure its IP and MAC remain unchanged;
2. Add this client in the AdGuard Home dashboard and enable only Bilibili-related rules for it;
3. Add a MAC/IP line in the router's device configuration;
4. Reload the firewall or wait for the next dynamic refresh, then physically open the app on the device to verify.

To remove a device, simply reverse the process: delete the AdGuard Home client and the corresponding line in the router. Do not delete the DNS rule while leaving the MAC-based dynamic connection rule, and do not manually delete IPs from the script. The source of truth for the configuration should always be "device identity + domain policy," not manually managing a pile of legacy addresses.

## What is AdGuard Home Actually Doing Here?

Its role in this setup is to "identify domains and execute DNS policies per client." It is not a whole-house ad blocker, nor a proxy, and it certainly does not involve Xray. Restricting Bilibili doesn't rely on Xray; while the router may have existing Xray configurations for other purposes, these Bilibili rules do not route traffic through it.

If you switched the DNS for all devices to AdGuard Home, you could indeed perform network-wide ad filtering, but that's a different operational decision: it expands the rule volume, false positives, logs, and blast radius of failures. The choice to route per device here is because the goal is strictly to limit a few TV boxes without altering the network behavior of everything else.

This deployment also offers a practical reliability benefit: if AdGuard Home goes down, non-selected devices still use the router's original DNS, so the home network doesn't lose resolution entirely. The tradeoff is that the selected devices might temporarily fail to resolve domains. If you want to make AdGuard Home a long-term home infrastructure piece, you should add service monitoring, configuration backups, and clear recovery procedures, rather than unconditionally tying all devices to a single DNS instance.

## How Far Does This Solution Go?

It solves the problem of "restricting Bilibili on specified devices while preserving network access for other apps and devices." It doesn't rely on an IP list that never expires, it doesn't drag Xray into the mix, and it won't broaden the block to the entire home network just because a shared domain appeared in the logs once.

It still has limits. If a client uses true hardcoded IPs, hides domains via DNS-over-HTTPS, or hosts target content on indistinguishable shared CDNs, it's very difficult for a router to achieve 100% blocking with 0% collateral damage. Dynamic resolution and device-based connection control keep maintenance costs and impact scopes reasonable, but they can't turn a standard home router into an application firewall that understands internal app protocols.

When verifying, don't just check "if the client can open the homepage." You must also verify: Are target domains blocked in AdGuard Home's query logs? Are the dynamic chain's counters incrementing? Can other apps on the TV box still connect? Are phones and computers unaffected by this rule? Only when all four criteria are met has the true goal of this requirement been achieved.

For AdGuard Home's client settings and custom filtering rules, see its [official technical documentation](https://github.com/AdguardTeam/AdGuardHome/blob/master/AGHTechDoc.md).
