---
author: "HAOGRE"
pubDatetime: 2026-09-10T14:33:34.285Z
title: "PPPoE Connected but No Internet: Diagnosing and Fixing a “Phantom Online” ASUS Router"
featured: false
draft: false
lang: en
translationKey: "pppoe-false-online"
tags:
  - "networking"
  - "router"
  - "programming"
description: "Diagnosing phantom PPPoE sessions with layered checks, evidence capture, and targeted automatic recovery."
---

I had seen the same failure several times on my home network: the optical modem appeared normal, but the router reported no internet connection, and every device lost access to the outside world. Unplugging and reconnecting the Ethernet cable between the modem and router—or rebooting the router—would bring everything back.

Both actions solve the immediate problem, but they also reset the PPPoE session, routes, NAT state, and policy rules. In doing so, they destroy the most valuable evidence. The real questions were not how to reboot faster, but why the router failed to recover by itself and how to preserve enough evidence before it recovered the next time.

The investigation eventually narrowed the problem to a more specific scenario: PPPoE had disconnected abnormally and then reconnected at the authentication layer, but there was no evidence that the WAN data plane had been fully restored. At the same time, PPP keepalives, the network watchdog, and DNS probing were all disabled. The router had likely entered a state where the session appeared to exist while actual traffic could no longer pass.

## Separating Log Facts from On-Site Observations

One of the easiest mistakes in troubleshooting is to treat two events that happen close together as cause and effect.

The system log showed this timeline:

```text
20:47:28  pppd: Modem hangup
20:47:28  pppd: Connection terminated
20:47:30  WAN: Failed to authenticate ourselves to peer
20:47:38  pppd: Connected via WAN interface
20:47:39  pppd: CHAP authentication succeeded
20:47:39  pppd: received IP address, PPP peer, and DNS

21:28:55  HTTPD: Web login succeeded (LAN management device)
21:30:54  WAN Ethernet: Link is Down
21:30:56  WAN Ethernet: Link is Up at 1 Gbps
21:31:07  WAN Ethernet: Link is Up at 2.5 Gbps
21:31:14  WAN: restored
```

At first glance, the repeated `Link is Down` event and speed renegotiation after 21:30 made the optical modem, Ethernet cable, or 2.5G port look suspicious. But the physical link loss after 21:30 was caused by me manually unplugging the cable. The network was already unusable, and I had already logged in to inspect the router before taking action.

The Ethernet events at 21:30 therefore describe the recovery attempt, not the original failure. The router UI showing “no internet” was an on-site observation. The log confirms that someone signed in at 21:28:55, but it cannot reconstruct every field shown on the page at that moment. Keeping those two kinds of evidence separate prevents a manual intervention from being mistaken for the root cause.

## Successful CHAP Authentication Does Not Mean the Internet Is Back

The `CHAP authentication succeeded` message at 20:47:39 confirms only that the username, password, and PPPoE access authentication succeeded. It does not prove that all of the following were working:

- PPP data packets could continue passing through the ISP access equipment;
- the default route pointed to the new PPP session;
- NAT and connection-tracking state had been updated correctly;
- custom policy-routing and transparent-proxy rules had been reloaded;
- DNS requests could reach the upstream servers.

This router also runs Xray and custom firewall rules. A normal, complete WAN startup triggers `wan-start`, `nat-start`, `firewall-start`, and several routing updates in sequence. None of those recovery actions appeared in the log after the 20:47 reauthentication, nor did `WAN was restored`.

The sequence after manually reconnecting the cable was very different. The router received an explicit physical-link change, recreated the PPP process, ran its WAN, NAT, firewall, and policy-routing scripts, and finally logged `WAN was restored`. Internet access returned immediately afterward.

This does not completely rule out an ISP data-plane problem, because disconnecting the cable also forces the ISP to release the old PPPoE session and create a new one. Still, the difference between the two recovery paths makes an incomplete WAN data-plane rebuild after the internal PPPoE reconnection the stronger initial suspect.

## Why the Router Did Not Dial Again Automatically

The runtime PPP configuration contained:

```text
persist
holdoff 10
maxfail 0
```

These settings tell the PPP process to keep redialing after it explicitly detects a terminated session, with no retry limit and an interval of roughly ten seconds. The events at 20:47 show that automatic redialing did in fact work.

The problem is that redialing depends on detecting a disconnection first. At the time, the relevant settings were:

```text
wan_ppp_echo=0
wandog_enable=0
dns_probe=0
```

PPP Echo, the network watchdog, and DNS probing were all disabled. If Ethernet carrier remained present and the PPP process still retained its interface and address, the router might not classify the situation as a PPP disconnection—even if the ISP stopped forwarding data or the NAT, routing, and proxy state failed to recover. Applications would see repeated timeouts, while the PPP layer received no termination event capable of triggering `persist`.

This also explains why failed connections did not necessarily leave behind `DROP` or `REJECT` entries. During an internet outage, many packets simply leave and receive no response. The router's firewall was not configured to log every dropped packet, and its existing counters were cumulative and had no timestamps. They could not reveal what happened to a specific device during a specific minute.

## First Layer of the Fix: Let PPP Detect a Dead Session

I first enabled the firmware's built-in PPP Echo mechanism while keeping its existing detection parameters:

```text
wan_ppp_echo=1
wan_ppp_echo_interval=6
wan_ppp_echo_failure=10
```

After applying the settings and restarting only the WAN connection, the generated PPP configuration included:

```text
lcp-echo-interval 6
lcp-echo-failure 10
lcp-echo-adaptive
```

This makes the PPP session send LCP Echo requests when there is no useful traffic. If ten consecutive requests receive no response, the peer is treated as dead. With the current interval, the theoretical detection time is about one minute. This addresses phantom connectivity at the PPP control layer without redialing because of a single lost public ICMP packet.

## Second Layer of the Fix: Test the Real Internet Path

LCP Echo still cannot cover every failure. The PPP peer might respond even when the ISP's public routing is broken. Alternatively, the router itself might reach the internet while NAT, policy routing, or the proxy fails along the client path. I therefore added a WAN health monitor that runs once per minute.

It checks the following in order:

1. whether the WAN Ethernet port has carrier, along with its negotiated speed and error counters;
2. whether `ppp0` has a public address and a default route;
3. whether the PPP peer is reachable;
4. whether at least one of two public probe addresses on different networks is reachable;
5. whether a real lookup succeeds through the currently configured upstream DNS.

A single failure triggers no action. An incident record is created only after the same failure occurs three times in a row. This filters out transient packet loss, brief DNS timeouts, and occasional failures by a public probe target.

The core classification logic can be summarized as follows:

```sh
if [ "$carrier" != 1 ]; then
    failure_class=physical-link-down
elif [ -z "$ppp_ip" ] || [ -z "$ppp_default" ]; then
    failure_class=pppoe-or-route-missing
elif both_public_targets_failed; then
    if ppp_peer_failed; then
        failure_class=pppoe-data-stale
    else
        failure_class=isp-upstream-unreachable
    fi
elif dns_lookup_failed; then
    failure_class=dns-failure
else
    failure_class=healthy
fi
```

The classification is more useful than a simple online-or-offline result. When the problem happens again, it will show where the evidence stops:

| Observed state                                  | Primary suspect                               |
| ----------------------------------------------- | --------------------------------------------- |
| WAN `carrier=0`                                 | Ethernet cable, port, or upstream device link |
| `carrier=1`, but no `ppp0`                      | PPPoE dialing or authentication               |
| `ppp0` exists, but the PPP peer is unreachable  | Stale PPP session or ISP access layer         |
| PPP peer responds, but both public targets fail | ISP upstream routing or data plane            |
| Public IP works, but DNS fails                  | DNS service or the UDP/TCP 53 path            |
| Router works, but clients fail                  | NAT, firewall, policy routing, or Xray        |

## Preserve the Scene Before Recovery

The monitor does not redial as soon as it detects a problem. After three consecutive failures, it first writes an incident snapshot to JFFS containing:

- the time, failure classification, and consecutive failure count;
- WAN and PPP interface state, speeds, and error counters;
- PPP addresses, peer details, and processes;
- all routes and policy rules;
- DNS configuration and layered probe results;
- NAT, filter, and mangle rules and counters;
- the conntrack count;
- key processes such as Xray, dnsmasq, and wanduck;
- the latest three hundred system log entries.

Only after preserving the evidence does it run the recovery action:

```sh
service "restart_wan_if 0"
```

This command rebuilds only the WAN connection. It does not reboot the router or interrupt access to the LAN management interface. If only DNS fails, the monitor restarts only the DNS service. If the physical Ethernet link is down, it records the event without attempting a pointless software redial. Recovery also has a ten-minute cooldown to prevent a redial storm during an extended ISP outage.

During normal operation, the monitor writes its latest state only to `/tmp`, rather than writing to flash every minute. JFFS stores only state transitions and incident snapshots. It retains at most twenty incident files and rotates the event log after it reaches 1 MiB. This preserves useful evidence without adding significant flash wear for the sake of diagnostics.

## Persistence and Verification

The monitor script lives under `/jffs/scripts/`. At startup, `services-start` registers it as a scheduled task that runs once per minute. I preserved the original startup script before deployment and restricted the diagnostics directory to administrator-only access so that LAN addresses, routes, and device information would not be exposed to other users.

After deployment, I performed four checks:

1. the PPP Echo settings appeared in the generated pppd parameters rather than remaining only in NVRAM;
2. restarting only the WAN connection created a new PPPoE session and restored public internet access;
3. the complete `nat-start`, `wan-start`, and `WAN was restored` sequence appeared in the log;
4. the scheduled task ran automatically during the next minute, and the PPP peer, both public targets, and DNS all passed.

I also saved a healthy baseline. The next incident snapshot can be compared with it field by field, instead of relying on vague conclusions such as “it was probably the modem” or “a reboot fixed it.”

## The Real Goal Is Not Automatic Rebooting

Automatic reboots can create a false sense of stability: the problem disappears quickly, but its cause remains unknown. Reliable home-network operations should meet three conditions at once: monitoring must cover the real data path, recovery should have the smallest practical scope, and evidence must be preserved before recovery begins.

Instead of enabling a black-box watchdog that only knows how to reboot the entire router, this setup lets PPP detect its own dead sessions and uses an independent monitor to distinguish physical-link, PPPoE, ISP uplink, DNS, and client-forwarding failures. Even when the network recovers automatically, it will leave enough evidence to continue investigating the root cause.

Unplugging the cable remains a useful emergency measure, but it is no longer the only response—and no longer the end of the investigation.
