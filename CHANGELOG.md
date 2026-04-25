# Changelog

All notable changes to this project are documented in this file.

## [1.1.0] - 2026-04-21

### Changed
- Comprehensive sleek UI pass: reduced all button and card radii to sharp, flat-edge styling.
- Sidebar blocks changed from bordered cards to hairline-separator sections for a minimal look.
- Note items and filter buttons now borderless with only a background highlight on hover/active.
- Active note item highlighted with a left accent bar instead of a border box.
- Task/notice/calendar cards changed to left-stripe style with no enclosing border.
- Marker chips, inputs, and textareas use tighter, flatter radii.
- Priority pills flattened to small rectangular labels.
- Save Note and Analyze buttons given tighter padding and consistent 6px radius.

## [1.0.9] - 2026-04-21

### Added
- Collapsible right detail panel toggle in the editor layout, with default state set to collapsed.

### Changed
- Applied a sleek style pass by reducing bubble-heavy radii across cards, buttons, inputs, chips, and status pills.
- Rounded the visible app shell and titlebar frame for a cleaner desktop-window presentation.
- Enabled thicker frameless window frame handling so rounded window edges are preserved more consistently on Windows.

## [1.0.8] - 2026-04-21

### Changed
- Kept Windows build compatibility and patched `Notative.exe` icon resource during packaging so the installed app/taskbar icon uses `assets/notative.ico`.
- Kept explicit app/window icon wiring to ensure runtime taskbar identity stays consistent.
- Updated the Windows dist pipeline to patch the icon automatically for future installer builds.

## [1.0.7] - 2026-04-21

### Changed
- Set the Electron window icon explicitly to `assets/notative.ico` so Windows taskbar uses the Notative app icon.
- Added a Windows `AppUserModelID` (`com.notative.app`) to improve taskbar identity and icon consistency.

## [1.0.6] - 2026-04-21

### Added
- Greyscale logo variant for future UI extensions.

### Changed
- Enabled rounded window corners for a more modern, polished appearance.
- Deepened default dark-mode palette to pure charcoal and near-black surfaces for enhanced contrast.
- Suppressed heuristic fallback notification to reduce UI noise when OpenAI API is unavailable.

## [1.0.5] - 2026-04-21

### Changed
- Retuned default dark mode from bluish tones to deeper charcoal and near-black surfaces.
- Kept green accent colors intact for buttons, highlights, and brand identity.
- Darkened shell and custom titlebar backgrounds to improve app-like dark-mode consistency.

## [1.0.4] - 2026-04-21

### Changed
- Updated `Notes` and `Active Note` heading typography to use Nunito for consistency with the rest of the interface.
- Removed the `New Note` button-specific heading override from the previous release.

## [1.0.3] - 2026-04-21

### Changed
- Updated `New Note` button typography to use the same Fraunces heading style for visual consistency in the top row.

## [1.0.2] - 2026-04-21

### Added
- Custom top title bar with dedicated minimize, maximize/restore, and close buttons for frameless mode.

### Changed
- Window dragging moved to a dedicated top drag region so movement is predictable.
- Restored expected desktop-window behavior after frameless conversion.

## [1.0.1] - 2026-04-21

### Added
- Custom Windows app icon sourced from `assets/notative.ico` for app, installer, and uninstaller builds.
- Dedicated changelog tracking for ongoing release updates.

### Changed
- Window shell moved to a more app-like presentation with frameless behavior and draggable rail region.
- Layout sizing updated to reduce page-level overflow and eliminate the outer right scrollbar.
- Installer packaging flow updated so 1.0.1 can be installed as an in-place upgrade.

## [1.0.0] - 2026-04-21

### Added
- Initial Electron desktop app release.
- Notes editor with marker support and task extraction workflow.
- OpenAI-backed task extraction with local heuristic fallback.
- Windows packaging via `electron-builder` with NSIS installer output.

### Changed
- UI theme updated to a dark green brand direction with enlarged logo and rounded typography.
