---
author: "HAOGRE"
pubDatetime: 2026-09-02T08:44:10.972Z
title: "Three Times the Price of a Can of Cola: How I Priced Albumscape by Region"
featured: false
draft: false
lang: en
translationKey: "albumscape-cola-pricing-2026-09-02"
tags:
  - "ai"
  - "programming"
  - "business"
description: "How a can of local cola became a simple, repeatable pricing rule for Albumscape."
---

Pricing a young indie Mac app can be as simple as picking a number and copying it everywhere. That wasn’t the approach I took with Albumscape.

I wanted a baseline simple enough to explain: take the price of a common local 330ml can of cola, use three times that amount as Albumscape Pro’s reference price, and round down to the highest Apple App Store price tier that is actually available.

As of September 2, 2026, this rule has been written into the production prices in App Store Connect. The prices are $8 in the US, ¥9.90 in China, £5.59 in the UK, and ¥520 in Japan. These are not the result of converting a US dollar price into local currencies; each one was calculated from local input.

## Put the rule in one sentence

The target price for each region is:

```text
target price = local single-can cola price × 3
actual price = highest Apple price tier not above the target price
```

For example, China’s input price is ¥3.30074. Multiplied by three, that gives ¥9.90222, which lands on Apple’s ¥9.90 tier. Japan’s input price is ¥174.168622, producing a target of ¥522.505866 and an actual price of ¥520. In the US, the calculation is 2.67 × 3 = 8.01, which lands on $8.

Rounding down to a tier matters. If the target is $8.01 and I round up to $8.99, I’ve changed the rule and made users pay for the pricing error. Rounding down ensures that the result never exceeds three times the input baseline, while Apple’s price tiers ensure that the final amount is a standard value supported by the store.

![A mother weighs a 330ml can of cola and presses the price card down to the highest available tier below the target](/uploads/2026/09/02/%E4%B8%80%E7%BD%90%E5%8F%AF%E4%B9%90%E7%9A%84%E4%B8%89%E5%80%8D%EF%BC%9A%E6%88%91%E6%80%8E%E6%A0%B7%E7%BB%99%20Albumscape%20%E5%81%9A%E5%8C%BA%E5%9F%9F%E5%AE%9A%E4%BB%B7/01-cola-price-tier.png)

<small>Illustration: Turning three times the local can price into a store-supported tier</small>

## What makes it fun: pricing as a small game

The fun is not only in multiplying the price by three. It is in turning an abstract global pricing problem into something you can hold in your hand: a can of cola. Currency conversion answers “what should this be in local money?” A cola baseline adds another question: “what price will feel reasonable in this place?” Both methods produce a number, but the second one has a little more life in it.

The more playful part is that the final answer is not a continuous decimal. It is one of Apple’s price steps. Each region gets its own target-price line, and the rule looks for the last square on the staircase that does not cross it. Two target prices can differ by a few cents and land on the same tier. Or one can cross a step and jump to the next price. A world of decimals becomes a handful of clear landing points, like a small game with simple rules: the cola is the ruler, three times is the rule, and Apple’s price tiers are the board.

That also makes the price easy to explain. If someone asks why China is ¥9.90, I can lay out the input, the calculation, and the landing point: 3.30074 × 3 = 9.90222, then round down to ¥9.90. It is not a number picked by instinct, and it is not a shadow left by converting a US price. It is the result of this rule on the China level.

This is not a precise economic model of willingness to pay. For an indie product still in its early stage, I care more about having a ruler that is transparent, reviewable, and repeatable. Once real sales data accumulates, this little game can grow into a more precise model.

## Cola prices are not a precise measure of willingness to pay

This dataset has a clear timestamp and clear limitations.

Forty-six regions use the median price of a 330ml cola from World Price Atlas. Another 50 use Numbeo’s restaurant soft-drink price for 0.33L as a proxy. The latter is not necessarily the price of a canned cola on a retail shelf, so I recorded it as proxy data instead of presenting it as an exact retail price.

All inputs are dated September 1, 2026, and were converted into Apple’s settlement currencies using a USD exchange-rate snapshot saved on the same day. For the 79 Apple regions without a source I could currently verify, I didn’t invent a number; I left Apple’s automatic pricing in place.

That gives the first version of the rule a clear boundary: manual prices for 96 regions, and automatic prices for 79. If new local data becomes available, I only need to add the corresponding inputs and rerun the preview, rather than manually maintaining a table covering all 175 regions.

## The time-consuming part was connecting the rule to the store

If all I had to do was calculate a few numbers in a spreadsheet, the work would be over quickly. The tricky part is that App Store Connect prices aren’t arbitrary amounts you can write anywhere; each region has a set of Apple-provided price points.

I added a Swift command-line tool to the Albumscape repository. It uses the system-provided CryptoKit and URLSession to generate JWTs, read products and regions, fetch available price points, generate previews, and write production prices after explicit confirmation. The commands I use most often are:

```sh
swift scripts/app_store_connect.swift price-preview \
  --input release/pricing/cola-single-can.json

swift scripts/app_store_connect.swift price-apply \
  --input release/pricing/cola-single-can.json \
  --confirm
```

During the preview stage, the tool writes each region’s single-can price, three-times target price, selected Apple price point, and source to JSON. After writing to production, it reads the pricing schedule back from App Store Connect and checks both the price-point ID and displayed amount, rather than merely checking whether the command returned successfully.

This workflow also explains why I want to minimize browser dependence for future operations. A browser is useful for creating an API key for the first time and handling account-level agreements and tax settings; routine product lookups, regional price previews, and production writes can all be handled by the project script. The private key stays in `release/credentials/` on my machine and out of Git; pricing inputs, source snapshots, and final previews go into the repository, so I can later trace how any number was derived.

## What does price adjustment have to do with the product itself?

Albumscape is a local-first macOS desktop art app, described as **A Living Album Wall for Mac**. It reads playback state and metadata from Apple Music, Spotify, QQ Music, and NetEase Cloud Music, puts the current album in the center of the screen, and fills out a slowly changing wall with recently played artwork. It doesn’t control playback, and the wall doesn’t cover Finder icons or ordinary app windows.

![A father fits the currently playing album cover into the album wall while four player records arrive along orange paths](/uploads/2026/09/02/%E4%B8%80%E7%BD%90%E5%8F%AF%E4%B9%90%E7%9A%84%E4%B8%89%E5%80%8D%EF%BC%9A%E6%88%91%E6%80%8E%E6%A0%B7%E7%BB%99%20Albumscape%20%E5%81%9A%E5%8C%BA%E5%9F%9F%E5%AE%9A%E4%BB%B7/02-album-wall.png)

<small>Illustration: Turning playback state into a quiet album wall on the desktop</small>

The free version already includes the basic album wall, four players, standard card flips, regional breathing, Artwork caching, and nine animated menu bar icons. Pro is a one-time purchase. It mainly adds Living Album animations, multi-display support, a screensaver, custom slot sizes, clean screenshots, and custom menu bar assets.

If you use a Mac to play music, you can see the product details on the [Albumscape website](https://albumscape.haogre.com/) or open the [Mac App Store listing](https://apps.apple.com/us/app/albumscape/id6802280605). The complete implementation and pricing script are available in the [Albumscape GitHub repository](https://github.com/HAOGRE/Albumscape).

## This method will keep changing

Three times the price of a cola is not a universally correct economic model. It’s more like a ruler for an early-stage product: intuitive enough to explain, applicable across regions, and stable to implement through price tiers. Once real sales data exists, prices can be adjusted based on conversion, refunds, and user feedback. Until then, at least every number has a source, a date, and a calculation behind it.

This adjustment leaves behind more than new prices for 96 regions. It also leaves a pricing workflow that can be run again. Whether I change the reference item, change the multiplier, or add data for more regions, I can inspect the inputs and preview first, then decide whether to write to production. Pricing no longer has to be maintained from memory.
