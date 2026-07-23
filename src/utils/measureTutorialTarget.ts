import type { RefObject } from 'react';
import { View } from 'react-native';

export type TutorialTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WindowRect = TutorialTargetRect;

function measurePage(view: View): Promise<WindowRect> {
  return new Promise((resolve) => {
    // measure() 5th/6th args are pageX/pageY (window coordinates).
    view.measure((_fx, _fy, width, height, pageX, pageY) => {
      resolve({
        x: pageX || 0,
        y: pageY || 0,
        width: width || 0,
        height: height || 0,
      });
    });
  });
}

/**
 * Measure a target View relative to the Gameplay root.
 * relativeX/Y = targetPage - rootPage (accounts for safe-area / browser chrome).
 */
export async function measureTutorialTarget(
  rootRef: RefObject<View | null>,
  targetRef: RefObject<View | null>,
): Promise<TutorialTargetRect | null> {
  const root = rootRef.current;
  const target = targetRef.current;
  if (!root || !target) return null;

  try {
    const [rootRect, targetRect] = await Promise.all([
      measurePage(root),
      measurePage(target),
    ]);

    if (targetRect.width <= 0 || targetRect.height <= 0) {
      return null;
    }

    return {
      x: targetRect.x - rootRect.x,
      y: targetRect.y - rootRect.y,
      width: targetRect.width,
      height: targetRect.height,
    };
  } catch {
    return null;
  }
}

export function expandRect(
  rect: TutorialTargetRect,
  padding: number,
  bounds: { width: number; height: number },
): TutorialTargetRect {
  const x = Math.max(0, rect.x - padding);
  const y = Math.max(0, rect.y - padding);
  const right = Math.min(bounds.width, rect.x + rect.width + padding);
  const bottom = Math.min(bounds.height, rect.y + rect.height + padding);
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}
