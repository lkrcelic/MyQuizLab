"use client";

import { useState, useEffect } from "react";
import { isLocalStorageAvailable } from "@/lib/progress-store";

export default function StorageWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="mx-4 mb-4 px-4 py-3 bg-error-muted border border-error/20 rounded-xl text-sm text-error animate-fade-in">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 mt-0.5">⚠️</span>
        <div>
          <p className="font-medium">Storage unavailable</p>
          <p className="text-error/70 text-xs mt-0.5">
            Your progress won&apos;t be saved. Try enabling cookies or using a different browser.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="flex-shrink-0 ml-auto text-error/50 hover:text-error text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
