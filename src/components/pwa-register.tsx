"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Hanya jalankan di browser (client-side) dan di production
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      console.log("🔍 PWA Register: Checking service worker support...");
      console.log("🔍 PWA Register: Current URL:", window.location.href);
      console.log("🔍 PWA Register: Is production?", process.env.NODE_ENV === "production");

      const registerSW = () => {
        const swPath = "/sw.js";
        console.log(`🔍 PWA Register: Attempting to register service worker at ${swPath}`);
        
        navigator.serviceWorker
          .register(swPath)
          .then((registration) => {
            console.log("✅ Service Worker registered successfully:", registration);
            console.log("📋 Service Worker scope:", registration.scope);
            console.log("📋 Service Worker state:", registration.active?.state || registration.installing?.state || registration.waiting?.state);
            
            // Check initial state
            if (registration.installing) {
              console.log("⏳ Service Worker is installing...");
              registration.installing.addEventListener("statechange", (e) => {
                const sw = e.target as ServiceWorker;
                console.log(`🔄 Service Worker state changed: ${sw.state}`);
                if (sw.state === "activated") {
                  console.log("✅ Service Worker activated and is running!");
                }
              });
            } else if (registration.waiting) {
              console.log("⏸️ Service Worker is waiting...");
            } else if (registration.active) {
              console.log("✅ Service Worker is active!");
            }
            
            // Check for updates
            registration.addEventListener("updatefound", () => {
              console.log("🔄 Service Worker update found!");
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  console.log(`🔄 New service worker state: ${newWorker.state}`);
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("🆕 New service worker available and ready!");
                  }
                });
              }
            });

            // Periodic update check
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
            console.error("❌ Error details:", {
              message: error.message,
              name: error.name,
              stack: error.stack,
            });
            
            // Check if file exists
            fetch(swPath, { method: "HEAD" })
              .then((response) => {
                if (response.ok) {
                  console.log("✅ Service worker file exists but registration failed");
                } else {
                  console.error(`❌ Service worker file not found (${response.status})`);
                }
              })
              .catch((fetchError) => {
                console.error("❌ Failed to check service worker file:", fetchError);
              });
          });
      };

      // Register immediately, don't wait for load event
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("🔄 Service Worker controller changed");
        if (!refreshing) {
          refreshing = true;
          console.log("🔄 Reloading page to activate new service worker...");
          window.location.reload();
        }
      });

      // Log current service worker
      if (navigator.serviceWorker.controller) {
        console.log("✅ Service Worker controller already exists:", navigator.serviceWorker.controller);
      } else {
        console.log("⏳ No service worker controller yet, waiting for registration...");
      }
    } else {
      console.warn("⚠️ Service Worker not supported in this browser");
    }
  }, []);

  return null; // Komponen ini tidak render apapun
}

