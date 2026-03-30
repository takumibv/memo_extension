/**
 * Get a unique XPath for a DOM element.
 * Uses tag names and positional predicates (e.g., /html/body/div[2]/p[1]).
 */
export const getXPathForElement = (element: Element): string => {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    if (current === document.body) {
      parts.unshift('/html/body');
      break;
    }

    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(`/${current.tagName.toLowerCase()}`);
      break;
    }

    const tagName = current.tagName;
    // Use lowercase for HTML elements (XPath standard), preserve case for SVG/MathML
    const isHTML = current.namespaceURI === 'http://www.w3.org/1999/xhtml';
    const xpathTag = isHTML ? tagName.toLowerCase() : tagName;

    const siblings = Array.from(parent.children).filter((child: Element) => child.tagName === tagName);

    if (siblings.length === 1) {
      parts.unshift(`/${xpathTag}`);
    } else {
      const index = siblings.indexOf(current) + 1;
      parts.unshift(`/${xpathTag}[${index}]`);
    }

    current = parent;
  }

  // If element is <html> itself
  if (parts.length === 0) {
    return '/html';
  }

  return parts.join('');
};

/**
 * Resolve an XPath string back to a DOM element.
 * Returns null if the element cannot be found.
 */
export const resolveElementByXPath = (xpath: string): Element | null => {
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue as Element | null;
  } catch {
    return null;
  }
};
