export const elementCanScroll = (element: HTMLElement) => {
  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = element;

  return scrollHeight > clientHeight || scrollWidth > clientWidth;
};

export interface IsElementVisibleOptions {
  /**
   * The element to check if it is visible inside a container.
   */
  element?: HTMLElement | null;

  /**
   * The container to check if the element is visible inside.
   * @default document.documentElement
   */
  container?: HTMLElement | null;
}

export interface CurrentElementVisibility {
  /**
   * Whether the element is visible in the inline direction.
   */
  inline: boolean;

  /**
   * Whether the element is visible in the block direction.
   */
  block: boolean;
}

export const isElementVisible = (options: IsElementVisibleOptions): CurrentElementVisibility | null => {
  let { container } = options;
  const { element } = options;

  if (!element || container === null) {
    return null;
  }

  container ||= document.documentElement;

  const canScroll = elementCanScroll(container);

  if (!canScroll) {
    return { inline: true, block: true };
  }

  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const elementInlineStart = elementRect.left;
  const elementBlockStart = elementRect.top;

  const containerInlineStart = containerRect.left;
  const containerBlockStart = containerRect.top;

  const elementInlineEnd = elementInlineStart + elementRect.width;
  const elementBlockEnd = elementBlockStart + elementRect.height;

  const containerInlineEnd = containerInlineStart + containerRect.width;
  const containerBlockEnd = containerBlockStart + containerRect.height;

  const isElementInlineVisible = elementInlineStart >= containerInlineStart && elementInlineEnd <= containerInlineEnd;
  const isElementBlockVisible = elementBlockStart >= containerBlockStart && elementBlockEnd <= containerBlockEnd;

  return { inline: isElementInlineVisible, block: isElementBlockVisible };
};

export interface ScrollToElementOptions {
  /**
   * The element to scroll to.
   */
  element?: HTMLElement | null;

  /**
   * The scroll container to scroll to the element in.
   * @default document.documentElement
   */
  container?: HTMLElement | null;

  /**
   * The direction to scroll in.
   * @default 'both'
   */
  direction?: 'inline' | 'block' | 'both';

  /**
   * The origin of the element to scroll to.
   * @default 'nearest'
   */
  origin?: 'start' | 'end' | 'center' | 'nearest';

  /**
   * The scroll behavior.
   * @default 'smooth'
   */
  behavior?: ScrollBehavior;
}

export const scrollToElement = (options: ScrollToElementOptions) => {
  let { container } = options;
  const { element, direction, behavior = 'smooth', origin = 'nearest' } = options;

  if (!element || container === null) {
    return;
  }

  container ||= document.documentElement;

  const canScroll = elementCanScroll(container);

  if (!canScroll) {
    return;
  }

  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const elementInlineSize = elementRect.width;
  const elementBlockSize = elementRect.height;

  const containerInlineSize = containerRect.width;
  const containerBlockSize = containerRect.height;

  const elementInlineStart = elementRect.left;
  const elementBlockStart = elementRect.top;

  const containerInlineStart = containerRect.left;
  const containerBlockStart = containerRect.top;

  const elementInlineEnd = elementInlineStart + elementInlineSize;
  const elementBlockEnd = elementBlockStart + elementBlockSize;

  const containerInlineEnd = containerInlineStart + containerInlineSize;
  const containerBlockEnd = containerBlockStart + containerBlockSize;

  const elementInlineCenter = elementInlineStart + elementInlineSize / 2;
  const elementBlockCenter = elementBlockStart + elementBlockSize / 2;

  const containerInlineCenter = containerInlineStart + containerInlineSize / 2;
  const containerBlockCenter = containerBlockStart + containerBlockSize / 2;

  const elementInlineOrigin =
    origin === 'center' ? elementInlineCenter : origin === 'end' ? elementInlineEnd : elementInlineStart;
  const elementBlockOrigin =
    origin === 'center' ? elementBlockCenter : origin === 'end' ? elementBlockEnd : elementBlockStart;

  const containerInlineOrigin =
    origin === 'center' ? containerInlineCenter : origin === 'end' ? containerInlineEnd : containerInlineStart;
  const containerBlockOrigin =
    origin === 'center' ? containerBlockCenter : origin === 'end' ? containerBlockEnd : containerBlockStart;

  const inlineOffset = elementInlineOrigin - containerInlineOrigin;
  const blockOffset = elementBlockOrigin - containerBlockOrigin;

  let inlineScroll: number | undefined = direction === 'block' ? undefined : inlineOffset;
  let blockScroll: number | undefined = direction === 'inline' ? undefined : blockOffset;

  if (origin === 'nearest') {
    const elVisible = isElementVisible({ element, container });

    if (elVisible?.inline && elVisible?.block) {
      return;
    }

    if (elVisible?.inline) {
      inlineScroll = undefined;
    }

    if (elVisible?.block) {
      blockScroll = undefined;
    }
  }

  container.scrollTo({
    left: inlineScroll,
    top: blockScroll,
    behavior,
  });
};
