function findFirstImageSrc(content: any) {
  if (!content) return null;

  content = JSON.parse(`${content}`);

  for (let c of content.content) {
    if (c.attrs && c.type == "image") return c.attrs.src;
  }

  return null;
}

export { findFirstImageSrc };
