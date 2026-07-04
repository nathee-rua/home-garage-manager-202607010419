"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SettingsTabObserver() {
  const router = useRouter();

  useEffect(() => {
    // Find the radix tabs container
    const tabsList = document.querySelector('[role="tablist"]');
    if (!tabsList) return;

    const handleTabChange = () => {
      // Radix tabs store value in value or data-value attribute
      const activeTab = document.querySelector('[role="tab"][data-state="active"]');
      if (activeTab) {
        const val = activeTab.getAttribute('value') || activeTab.getAttribute('data-value');
        if (val) {
          const params = new URLSearchParams(window.location.search);
          if (params.get("tab") !== val) {
            params.set("tab", val);
            router.replace(`/settings?${params.toString()}`, { scroll: false });
          }
        }
      }
    };

    // Observe active attribute changes on tabs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-state") {
          handleTabChange();
        }
      });
    });

    const tabs = tabsList.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      observer.observe(tab, { attributes: true });
    });

    // Run once initially to sync state
    handleTabChange();

    return () => observer.disconnect();
  }, [router]);

  return null;
}
