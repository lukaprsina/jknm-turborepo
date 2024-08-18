export function generate_encoded_url({
  url,
  id,
}: {
  url: string;
  id: number;
}): string {
  if (isNaN(id)) {
    throw new Error("ID is not a number: " + url);
  }

  const new_url = `${url}-${id}`;
  const encoded = encodeURIComponent(new_url);
  return encoded;
}
