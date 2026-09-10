import { useEffect, useRef } from "react";

export function useAdminModalLock(isOpen: boolean, closeAll: () => void) {
  const closeAllRef = useRef(closeAll);

  useEffect(() => {
    closeAllRef.current = closeAll;
  }, [closeAll]);

  useEffect(() => {
    if (!isOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAllRef.current();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);
}
