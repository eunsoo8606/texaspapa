/**
 * 사이트맵 XML 생성
 * @param {Array} urls - URL 객체 배열 { loc, lastmod, changefreq, priority }
 * @returns {string} XML 문자열
 */
function generateSitemapXml(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${url.loc}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
}

/**
 * RSS XML 생성
 * @param {Object} channel - 채널 정보 { title, link, description, lastBuildDate, items }
 * @returns {string} XML 문자열
 */
function generateRssXml(channel) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
    xml += '  <channel>\n';
    xml += `    <title>${channel.title}</title>\n`;
    xml += `    <link>${channel.link}</link>\n`;
    xml += `    <description>${channel.description}</description>\n`;
    xml += `    <language>ko</language>\n`;
    xml += `    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>\n`;
    xml += `    <atom:link href="${channel.link}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

    channel.items.forEach(item => {
        xml += '    <item>\n';
        xml += `      <title><![CDATA[${item.title}]]></title>\n`;
        xml += `      <link>${item.link}</link>\n`;
        xml += `      <description><![CDATA[${item.description}]]></description>\n`;
        xml += `      <pubDate>${item.pubDate}</pubDate>\n`;
        xml += `      <guid>${item.guid}</guid>\n`;
        xml += '    </item>\n';
    });

    xml += '  </channel>\n';
    xml += '</rss>';
    return xml;
}

module.exports = {
    generateSitemapXml,
    generateRssXml
};
