# Changelog

All notable changes to this project are documented in this file.

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
