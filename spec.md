# FaceAttend Pro

## Current State
- RegisterEmployee: Camera must be manually started and manually captured via button clicks
- MarkAttendance: Camera must be manually started and captured; after capture, manager manually clicks "Mark Present" for each employee
- Multiple input fields have example placeholder text (e.g. EMP001, John Doe, Engineering, 9876543210, 13000)
- Holiday reason input has placeholder text
- Employee portal login input has placeholder with example ID

## Requested Changes (Diff)

### Add
- face-api.js dependency for in-browser face detection and 128-d face descriptor matching
- `useFaceDetection` hook that wraps face-api.js: loads TinyFaceDetector + FaceLandmark68Net + FaceRecognitionNet models from CDN (jsdelivr), runs continuous detection on a video element, returns detected face descriptors
- Auto-scanning overlay component: animated scanning line + face outline box drawn on canvas overlaid on the video, showing "Scanning..." / "Face Detected" status
- In RegisterEmployee: camera auto-starts on mount via useEffect; scanning overlay runs; when a face is detected and stable for 1.5s, auto-captures and stores face descriptor as part of the employee record
- In MarkAttendance: camera auto-starts on mount; scanning overlay runs; when a face is detected, compute face descriptor and compare against all registered employee descriptors (euclidean distance < 0.55 threshold = match); if match found, auto-mark attendance and show matched employee card with name/photo; if no match, show "Face not recognized" with option to retry
- Store face descriptors alongside employees: add `faceDescriptor` field (JSON stringified Float32Array) to backend Employee2 type and registerEmployee API

### Modify
- RegisterEmployee: Remove Start Camera button; camera auto-starts and auto-captures; show scanning animation; after auto-capture show preview with option to retake
- MarkAttendance: Remove Start Camera and Capture Face buttons; camera auto-runs; auto-identifies employee and shows result; remove manual attendance section entirely (replaced by auto face scan)
- All input placeholders: Remove example values. Use only descriptive labels (e.g. "Employee ID", "Full Name", "Department", "Phone Number", "Monthly Salary", "Holiday Reason")
- EmployeePortal login input placeholder: change to just "Enter your Employee ID"

### Remove
- Manual "Start Camera" and "Capture" buttons in both RegisterEmployee and MarkAttendance
- Manual attendance section (Select employee + Status dropdown + Mark button) from MarkAttendance
- All example placeholder values from every input field

## Implementation Plan
1. Install face-api.js npm package
2. Create `src/frontend/src/hooks/useFaceDetection.ts` — loads models from CDN on first call, runs detection loop on video element, returns `{ isReady, scanning, detectedDescriptor, detectionBox }`
3. Create `src/frontend/src/components/FaceScanOverlay.tsx` — canvas overlay drawn over video showing animated scan line, face bounding box, and status text
4. Update backend `main.mo` to add `faceDescriptor` (Text) field to Employee2 and registerEmployee
5. Update `RegisterEmployee.tsx`: auto-start on mount, use useFaceDetection, show overlay, auto-capture on stable face, save descriptor
6. Update `MarkAttendance.tsx`: auto-start on mount, continuous scan, compare descriptors, auto-mark on match
7. Remove all example placeholder text from all pages
