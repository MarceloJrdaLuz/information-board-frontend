import React from "react";

// touchSwipeHandler.ts
export function handleTouchSwipe(
  touchStartX: number | null,
  pageNumber: number,
  numPages: number | null,
  direction: 'left' | 'right',
  event: React.TouchEvent<HTMLDivElement>
): number {
  if (!touchStartX || !numPages) {
    return pageNumber;
  }

  const touchEndX = event.changedTouches[0].clientX;

  if (touchEndX < touchStartX) {
    // Swipe to the left
    if (pageNumber < numPages && direction === 'left') {
      return pageNumber + 1;
    }
  } else if (touchEndX > touchStartX) {
    // Swipe to the right
    if (pageNumber > 1 && direction === 'right') {
      return pageNumber - 1;
    }
  }

  return pageNumber;
}
