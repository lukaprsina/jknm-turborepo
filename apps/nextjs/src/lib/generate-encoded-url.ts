export function generate_encoded_url({
  url,
  id,
}: {
  url: string;
  id: number;
}): string {
  const new_url = `${url}-${id}`;
  const encoded = encodeURIComponent(new_url);
  return encoded;
}
