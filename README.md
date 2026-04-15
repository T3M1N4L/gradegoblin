<p align="center">
  <img src="./public/pwa-512.png" alt="GradeGoblin logo" width="120" />
</p>

<h1 align="center">GradeGoblin</h1>

<p align="center">
  A cleaner StudentVUE dashboard for grades, assignments, attendance, documents, tests, and grade planning.
</p>

<p align="center">
  Built with Astro, Svelte, and Tailwind CSS.
</p>

## Overview

GradeGoblin is a student-focused dashboard that makes school data easier to scan and actually useful. It pulls from StudentVUE and reshapes that information into a faster and nicer interface for checking grades, reviewing assignments, tracking attendance, downloading documents, viewing test history, and experimenting with what-if grade changes. I built this project because I wanted a final grade calculator for finals, but for some classes it was more complex and it meddled with weights and such, so I integrated it directly!

<samp>StudentVUE® is a registered trademark of Edupoint Educational Systems, LLC. This project is not affiliated with Edupoint or Synergy.</samp>



## Features

- Home dashboard with quick academic summary cards
- Grades page with course snapshots and reporting period support
- Assignment browser with search
- Attendance charts and history
- Documents page with direct downloads
- Test history tables
- School details and staff directory
- Grade simulation workbench for what-if planning
- Theme support and local UI preferences
- Responsive desktop and mobile layouts

## Getting Started

### Install dependencies

```bash
npm install
```

Or with Bun:

```bash
bun install
```

### Start the dev server

```bash
bun run dev
```

### Build for production

```bash
bun run build
```

### Preview the production build

```bash
bun run preview
```

## Main Routes

- `/` home dashboard
- `/grades` grade overview
- `/assignments` assignment list
- `/attendance` attendance history and summary
- `/documents` student documents
- `/tests` test history
- `/school` school and staff info
- `/settings` local preferences
- `/period/[index]` period-specific course view

## Project Structure

```text
src/
  layouts/       Shared app shell
  lib/
    components/  Sidebar, workbench, UI pieces
    js/          Parsing and grade math helpers
    server/      Dashboard loading and StudentVUE helpers
  pages/         Routes and API handlers
  styles/        Global styles
public/          App icons and logo
static/          Fonts, themes, and static assets
```

## Notes

- The app uses server-side StudentVUE requests through the authenticated session stored in cookies.
- UI preferences such as theme are stored locally in the browser.
- Dashboard data is cached briefly in memory for faster navigation.
- Many thanks to [StudentVue.js](https://github.com/StudentVue/StudentVue.js) as this couldn't have been created without it!

## License

See [LICENSE](./LICENSE).
