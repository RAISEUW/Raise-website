import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const upcomingEvents = await getCollection('events', ({ data }) => data.upcoming);
  const pastEvents = (await getCollection('events', ({ data }) => !data.upcoming))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 20);

  const items = [
    ...articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: a.data.excerpt ?? a.data.title,
      link: `/articles/${a.id}/`,
    })),
    ...[...upcomingEvents, ...pastEvents].map((e) => ({
      title: `${e.data.speaker}: ${e.data.title}`,
      pubDate: e.data.date,
      description: e.data.abstract ?? 'Upcoming talk at RAISE.',
      link: `/events/${e.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'RAISE — Articles & Events',
    description:
      'Latest articles and upcoming talks from the UW Center for Responsibility in AI Systems and Experiences.',
    site: context.site!,
    items,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>en-us</language>
      <atom:link href="${new URL('/rss.xml', context.site).href}" rel="self" type="application/rss+xml" />`,
  });
}
