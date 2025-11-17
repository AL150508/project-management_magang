"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Hanya jalankan di browser (client-side) dan di production
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      console.log("🔍 PWA Register: Checking service worker support...");
      console.log("🔍 PWA Register: Current URL:", window.location.href);
      console.log("🔍 PWA Register: Is production?", process.env.NODE_ENV === "production");

      const registerSW = async () => {
        console.log("🔍 PWA Register: Detecting available service worker files...");
        
        // Daftar kemungkinan path service worker
        const possibleSWPaths = [
          "/sw.js", // Default next-pwa path
          "/swe-worker.js", // Alternative naming
        ];
        
        // Fungsi untuk mencari file dengan pattern swe-worker-*.js
        const findSweWorkerFile = async (): Promise<string | null> => {
          try {
            // Coba fetch manifest atau file list (jika ada)
            // Alternatif: coba beberapa kemungkinan hash yang umum
            const commonHashes = [
              "5c72df51bb1f6ee0", // Hash yang ditemukan di diagnosis
              "latest",
              "main",
            ];
            
            for (const hash of commonHashes) {
              const testPath = `/swe-worker-${hash}.js`;
              try {
                const response = await fetch(testPath, { method: "HEAD" });
                if (response.ok) {
                  console.log(`✅ Found service worker file: ${testPath}`);
                  return testPath;
                }
              } catch {
                // Continue to next hash
              }
            }
            return null;
          } catch {
            return null;
          }
        };
        
        // Deteksi service worker yang tersedia
        let swPath: string | null = null;
        
        // 1. Cek path standar terlebih dahulu
        for (const path of possibleSWPaths) {
          try {
            const response = await fetch(path, { method: "HEAD" });
            if (response.ok) {
              swPath = path;
              console.log(`✅ Found service worker at standard path: ${path}`);
              break;
            }
          } catch {
            // Continue to next path
          }
        }
        
        // 2. Jika tidak ada, cari file dengan pattern swe-worker-*.js
        if (!swPath) {
          console.log("🔍 Standard paths not found, searching for swe-worker-*.js files...");
          swPath = await findSweWorkerFile();
        }
        
        // 3. Jika masih tidak ada, cek apakah PWA disabled di development
        if (!swPath) {
          if (process.env.NODE_ENV === "development") {
            console.info("ℹ️ PWA Register: Service worker not found. This is normal in development mode if PWA is disabled.");
            console.info("ℹ️ PWA Register: To test PWA features, run 'npm run build && npm run start'");
            return;
          } else {
            console.warn("⚠️ PWA Register: No service worker file found. PWA features will not be available.");
            console.warn("⚠️ PWA Register: Expected files: /sw.js or /swe-worker-*.js");
            return;
          }
        }
        
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
            
            // Check if file exists (swPath is guaranteed to be string here)
            if (swPath) {
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
            }
          });
      };

      // Register immediately, don't wait for load event
      if (document.readyState === "complete") {
        registerSW().catch((error) => {
          console.error("❌ PWA Register: Failed to register service worker:", error);
        });
      } else {
        window.addEventListener("load", () => {
          registerSW().catch((error) => {
            console.error("❌ PWA Register: Failed to register service worker:", error);
          });
        });
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

