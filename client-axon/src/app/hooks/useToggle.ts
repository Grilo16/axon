import { useState, useCallback, useRef, useEffect } from "react";
import type { SyntheticEvent } from "react";

// 1. Define flexible Event types (React or Native)
type ToggleEvent = SyntheticEvent | Event;

export interface UseToggleOptions {
  initialOpen?: boolean;
  initialLocked?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  onOpen?: (e?: ToggleEvent) => void;
  onClose?: (e?: ToggleEvent) => void;
  onLock?: (e?: ToggleEvent) => void;
  onUnlock?: (e?: ToggleEvent) => void;
}

export interface UseToggleResult {
  isOpen: boolean;
  isLocked: boolean;
  open: (e?: ToggleEvent) => void;
  close: (e?: ToggleEvent) => void;
  toggle: (e?: ToggleEvent) => void;
  lock: (e?: ToggleEvent) => void;
  unlock: (e?: ToggleEvent) => void;
  toggleLock: (e?: ToggleEvent) => void;
  // Bonus: Expose raw setters for edge cases where you don't have an event
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useToggle = ({
  initialOpen = false,
  initialLocked = false,
  preventDefault = false,
  stopPropagation = false,
  onOpen,
  onClose,
  onLock,
  onUnlock,
}: UseToggleOptions = {}): UseToggleResult => {
  const [isOpen, setOpen] = useState(initialOpen);
  const [isLocked, setLocked] = useState(initialLocked);

  // 2. The Ref Pattern: Keep callbacks fresh without breaking memoization
  // This allows the user to pass inline functions like onOpen={() => console.log('hi')}
  // without causing the 'open', 'close', etc. functions to be recreated on every render.
  const callbacksRef = useRef({ onOpen, onClose, onLock, onUnlock });

  useEffect(() => {
    callbacksRef.current = { onOpen, onClose, onLock, onUnlock };
  });

  // 3. Helper to handle event modifiers
  const handleEvent = useCallback(
    (e?: ToggleEvent) => {
      if (!e) return;
      if (preventDefault && 'preventDefault' in e) e.preventDefault();
      if (stopPropagation && 'stopPropagation' in e) e.stopPropagation();
    },
    [preventDefault, stopPropagation]
  );

  const open = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      if (!isLocked) {
        setOpen(true);
        callbacksRef.current.onOpen?.(e);
      }
    },
    [isLocked, handleEvent]
  );

  const close = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      if (!isLocked) {
        setOpen(false);
        callbacksRef.current.onClose?.(e);
      }
    },
    [isLocked, handleEvent]
  );

  const toggle = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      if (isLocked) return;

      setOpen((prev) => {
        const newState = !prev;
        if (newState) {
          callbacksRef.current.onOpen?.(e);
        } else {
          callbacksRef.current.onClose?.(e);
        }
        return newState;
      });
    },
    [isLocked, handleEvent]
  );

  const lock = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      setLocked(true);
      callbacksRef.current.onLock?.(e);
    },
    [handleEvent]
  );

  const unlock = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      setLocked(false);
      callbacksRef.current.onUnlock?.(e);
    },
    [handleEvent]
  );

  const toggleLock = useCallback(
    (e?: ToggleEvent) => {
      handleEvent(e);
      setLocked((prev) => {
        const newState = !prev;
        if (newState) {
          callbacksRef.current.onLock?.(e);
        } else {
          callbacksRef.current.onUnlock?.(e);
        }
        return newState;
      });
    },
    [handleEvent]
  );

  return {
    isOpen,
    isLocked,
    open,
    close,
    toggle,
    lock,
    unlock,
    toggleLock,
    setOpen,
    setLocked,
  };
};