function stripHtmlTags(html) {
    return html.replace(/<[^>]*>?/gm, '');
}

module.exports = { stripHtmlTags };
