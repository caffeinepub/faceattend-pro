# FaceAttend Pro — Date-Selectable Attendance Marking

## Current State
The Mark Attendance page (`MarkAttendance.tsx`) is hardcoded to mark attendance for today's date only. The year/month are derived from `new Date()` and the date string is always `today`. There is no way for the manager to pick a different date.

## Requested Changes (Diff)

### Add
- A date picker at the top of the Mark Attendance page that defaults to today but lets the manager select any past or future date.
- When the date changes, attendance records shown are loaded for that specific date (using `useAttendanceByMonth` with the selected month/year, then filtered by exact date).
- Manager can mark Present / Absent / Half Day for any employee on the selected date.
- Edit button still works to change an already-marked status for the selected date.

### Modify
- `MarkAttendance.tsx`: replace the hardcoded `today` date with a `selectedDate` state controlled by a date input. Load attendance month data based on `selectedDate`'s year and month. Filter the attendance map by `selectedDate` instead of `today`.

### Remove
- Nothing removed.

## Implementation Plan
1. Add a `<input type="date">` or styled date selector at the top of `MarkAttendance.tsx`, defaulting to today.
2. Derive `year`, `month`, and `dateStr` from `selectedDate` state instead of `new Date()`.
3. Pass `selectedDate`-based year/month to `useAttendanceByMonth`.
4. Filter `todayMap` by `selectedDate` (exact date string).
5. Pass `selectedDate` as the `date` argument to `handleMark` instead of `today`.
6. Show human-readable label for the selected date.
