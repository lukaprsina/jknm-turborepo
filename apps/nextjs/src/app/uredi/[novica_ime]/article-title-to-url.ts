export function article_title_to_url(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}
