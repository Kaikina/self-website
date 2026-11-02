---
title: "Peru's Buses Never Sleep: 24 Hours of Intercity Traffic on One Map"
description: "I mapped every intercity bus and train I could find for one Wednesday in Peru: 1,659 bus departures and 37 trains. The busiest hour is 11 p.m., two trips in three touch Lima, and the Andes and the Amazon get less than their share."
pubDate: 2026-11-02
tags: ["Data Visualization", "Open Data", "Python", "Peru", "Side Project"]
cover: ../_assets/peru-24h-bus-map.png
ogImage: ../_assets/peru-24h-bus-map.png
coverAlt: "Dark map of central and southern Peru at 23:00, with 1,035 amber dots for buses along the coast and through the Andes"
translationKey: "peru-24h-bus-map"
draft: false
---

A video went around LinkedIn recently: every train in France over 24 hours, animated on a map. I wanted the same thing for Peru.

Peru doesn't really have passenger trains between cities, though. It has buses. Thousands of them, run by hundreds of companies, and no public timetable that covers them all. So the map below took more digging than drawing.

<figure class="embed">
  <iframe src="/embeds/peru-24h/index.html?embed&amp;lang=en" title="Animated map of one day of intercity buses and trains in Peru" loading="lazy" allow="fullscreen"></iframe>
  <figcaption>One Wednesday, 11 November 2026. Drag to move, Ctrl + scroll (or two fingers) to zoom, hover a dot to see its route. The ⛶ button goes fullscreen.</figcaption>
</figure>

## What the map shows

**What am I looking at?** Each amber dot is a bus, each blue dot a train. They move along the real roads and tracks at the times the operators publish. The clock runs from midnight to midnight, and buses that leave in the evening and arrive the next morning show up at both ends of the day, so the loop reads as a typical day rather than a cold start at 00:00.

There are 1,659 bus departures and 37 train runs in it. I'll get to where they come from at the end. First, what surprised me.

## The country drives at night

**Does the traffic ever stop?** No. I expected the map to go quiet after midnight, the way most transport maps of European countries do. It does the opposite. The fewest buses on the road are at 1 p.m. (412 of them). The most are at 11 p.m. (1,035).

The evening is when Peru leaves. 46% of all departures happen between 6 p.m. and midnight, and the 8 p.m. hour alone has 178. Six trips in ten are still rolling when the clock passes midnight.

It makes sense once you look at the distances. The median trip in the data is 422 km and lasts 8.6 hours. Lima to Arequipa is 1,002 km and about 17 and a half hours. If you leave at 8 p.m. you sleep in the seat, skip a hotel night and arrive with a full day ahead of you. I knew this in theory. Seeing a thousand dots wake up at dusk is something else.

## One long line down the coast

**Where does the traffic actually go?** Mostly along the Panamericana. From Tumbes at the Ecuador border down to Camaná, the coast is one continuous string of buses, and it only turns inland towards Arequipa and Tacna. 87% of the trips touch a coastal town, and half of them never leave the coast at all.

Then there is Lima. 63% of all trips start or end there, and the capital has direct buses to 115 different places. Lima to Trujillo alone has 115 departures on a Wednesday. If you squint at the animation at night you can see it: the coast is a conveyor belt with Lima in the middle.

## The south: far, not forgotten

**Are Tacna and Puno as isolated as they look?** Only half. My first impression was that the south is poorly served: Tacna and Puno look like islands at the bottom of the map. The numbers say something more specific.

Per inhabitant, they get about as many buses as the big northern coastal cities. Tacna has 77 trips a day for roughly 286,000 people, about the same rate as Trujillo. Puno, smaller, has 68. What they lack is a link to Lima. Only 10 buses a day go from Lima to Tacna, and the trip takes 21 hours for 1,224 km. Lima to Puno is 4 buses and more than 23 hours.

Instead, the south runs its own network. Tacna's busiest connections are Arequipa (26 trips) and Ilo (20). Puno's are Cusco (33) and Arequipa (25). Only 13% of Tacna's trips and 6% of Puno's involve Lima at all. They look isolated on the map because their buses spread out over a thousand kilometres of road, not because nobody goes there.

## The Andes and the Amazon get less than their share

**Is the sierra really cut off?** Compare two trips of the same length. Lima to Trujillo, 557 km along the coast: 115 buses. Lima to Ayacucho, 568 km into the mountains: 24.

To go further I tagged every town in the data by natural region: sierra above 2,000 m, then coast or jungle depending on which side of the Andes it sits (Arequipa, at 2,300 m, counts as sierra). The 2017 census puts 58% of Peruvians on the coast, 28% in the sierra and 14% in the selva. The trip ends in my data split 69%, 24% and 7%.

The sierra is a bit below its weight. The jungle gets half of it. And mountain towns mostly hang off the capital rather than off each other: 73% of Ayacucho's trips go to or from Lima, 70% of Huaraz's, 65% of Huancayo's. There are 437 coast–sierra trips in the data and only 156 that link two Andean towns.

The selva is worse. Pucallpa, one of the largest cities in the Amazon, has 10 buses a day, 9 of them to Lima, and they take 17 hours for 768 km. That's 45 km/h on average. Iquitos doesn't appear on the map at all: no road reaches it. You fly, or you spend days on a river boat, and I left flights and boats out on purpose.

So my first impression holds for the mountains and the jungle, with one caveat that deserves its own section.

## What the map doesn't see

**How far should you trust these numbers?** Further for the coast than for the rest. The big operators I could read timetables from are coast-heavy: 624 of their trips go to coastal towns, 155 to the sierra and 45 to the jungle. Everyone else comes from government permits, which undercount (more on that below). On top of that, a lot of Andean and Amazonian travel happens in vans, shared taxis and small local companies that publish nothing. Juliaca shows only 10 trips, which is clearly wrong for a city that size: many buses to Puno stop there, but I only record where a trip starts and ends.

Civa, one of the big national operators, isn't scraped either because its site blocks automated access. It only appears through its permits.

All of that pushes in the same direction: the real sierra and selva are busier than the map. Part of the gap is my data. I can't say how much.

## How it was built

**Where do you even get bus timetables for Peru?** There's no GTFS feed for intercity buses in Peru and no open dataset of routes. What exists is paperwork. Every company needs a route permit from the Ministry of Transport (MTC), and those permits are published as PDFs on gob.pe. Each one lists the itinerary, the days of the week and the authorised departure times.

So step one was a scraper for the gob.pe listing (1,649 documents), then `pdftotext` and a parser for the two templates the ministry has used over the years. 1,146 permits came out with a usable schedule. 181 were scanned images, and I skipped those rather than OCR them.

Step two came after a bad surprise. The permits list what a company is *allowed* to run, and the big operators run far more. Cruz del Sur had 6 Wednesday departures in its permits and 199 on its own website. So for eight large operators (Cruz del Sur, Oltursa, Movil Bus, Ittsa, Emtrafesa, Transportes Línea, Flores and PerúBus) I read their public ticket search pages for Wednesday 11 November instead. One bus is often sold as several tickets, one per city pair and per Lima terminal, so those listings had to be merged back into single buses by trip number or departure time. That gave 824 buses. The permits of every other company added 835.

The rest is plumbing. The 759 towns are geocoded offline with GeoNames. Roads come from OpenStreetMap, routed with a local OSRM server, and when an operator doesn't publish an arrival time the trip gets the car time × 1.20, the median ratio I measured on 654 trips that have both. The trains are the PeruRail timetable typed in by hand and drawn on the OpenStreetMap rail tracks. The map itself is deck.gl on top of MapLibre with a CARTO basemap, and the video version is rendered frame by frame in headless Chromium and stitched together with ffmpeg.

One mistake worth mentioning: the first version asked the router for *simplified* road shapes, about one point every 30 km. On the coast nobody would notice. In the Andes the dots cut straight across the switchbacks, and the drawn lines were on average 11% shorter than the real roads (Lima–Huancayo was drawn at 270 km for a 304 km road). Full geometry fixed it.

I built most of this over a few sessions with Claude Code, which did a lot of the scraping and parsing grunt work while I decided what to look at. The widget above is a static page served from this site with its own content security policy, so nothing loads from anywhere except the map tiles.

## Takeaways

**What did a day of buses teach me?**

1. **Peru's intercity network is busiest at night.** The low point is lunchtime, and even then 400 buses are on the road.
2. **It's a coast with Lima in the middle.** Two trips in three touch the capital, and the Panamericana carries most of the rest.
3. **Distance isn't isolation.** Tacna and Puno are far from Lima but well tied to Arequipa and Cusco. The places that are really underserved are in the mountains and the jungle.
4. **Official data tells you what's allowed, not what happens.** The permits missed 97% of Cruz del Sur's buses. Without the operators' own sites, this map would show a much emptier country.

If you know Peru's roads and something here looks wrong to you, I'd like to hear it. The dots are only as good as the timetables behind them.
