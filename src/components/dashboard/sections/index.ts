/**
 * REFACTORED: Dashboard Sections - Index Export
 * 
 * File: src/components/dashboard/sections/index.ts
 * 
 * SEARCHABLE COMMENTS:
 * - REFACTORED_DASHBOARD_EXPORT: Export semua komponen dashboard section
 * - DASHBOARD_SECTIONS_INDEX: Centralized export untuk komponen dashboard
 * 
 * FUNGSI:
 * - Centralized export untuk semua komponen dashboard section
 * - Memudahkan import di file lain
 * - Organisasi komponen dashboard
 */

// REFACTORED_DASHBOARD_EXPORT: Export semua komponen dashboard section
export { SectionLatestMagang, latestMagangDummy } from './latest-magang'
export { SectionLatestLogbook, latestLogbookDummy } from './latest-logbook'
export { SectionMagangCards, type MagangStats } from './magang-cards'
export { SectionLogbookCards, type LogbookStats } from './logbook-cards'
export { SectionDudiAktif, type DudiItem } from './dudi-aktif'
export { MagangManagementCards, type MagangManagementItem } from './magang-management-cards'
