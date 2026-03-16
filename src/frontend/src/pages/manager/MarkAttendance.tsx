import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, ScanFace, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import type { Employee2 } from "../../backend.d";
import FaceScanOverlay from "../../components/FaceScanOverlay";
import {
  detectFace,
  loadModels,
  matchDescriptor,
} from "../../hooks/useFaceRecognition";
import {
  useAttendanceByMonth,
  useEmployees,
  useMarkAttendance,
} from "../../hooks/useQueries";

type ScanStatus =
  | "idle"
  | "scanning"
  | "detected"
  | "matching"
  | "matched"
  | "not_recognized";

export default function MarkAttendance() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [detectionBox, setDetectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [matchedEmployee, setMatchedEmployee] = useState<Employee2 | null>(
    null,
  );
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [markingDone, setMarkingDone] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstDetectTimeRef = useRef<number | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const year = String(today.getFullYear());
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const { data: employees = [] } = useEmployees();
  const markMut = useMarkAttendance();
  const { data: todayAttendance = [] } = useAttendanceByMonth(year, month);

  const todayRecords = todayAttendance.filter((a) => a.date === todayStr);
  const markedIds = new Set(todayRecords.map((r) => r.employeeId));

  const employeesWithFace = employees.filter((e) => (e as any).faceDescriptor);

  const stopLoop = () => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  };

  const stopCamera = () => {
    stopLoop();
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startScanLoop = () => {
    setScanStatus("scanning");
    firstDetectTimeRef.current = null;

    loopRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const result = await detectFace(video);
      if (!result) {
        // Reset timer if face lost
        firstDetectTimeRef.current = null;
        return;
      }

      setDetectionBox(result.box);
      setScanStatus("detected");

      if (!firstDetectTimeRef.current) {
        firstDetectTimeRef.current = Date.now();
      }

      setScanStatus("matching");
      const match = matchDescriptor(result.descriptor, employees);

      if (match) {
        stopLoop();
        setScanStatus("matched");
        setMatchedEmployee(match.employee);
        stopCamera();

        // Auto-mark attendance
        if (!markedIds.has(match.employee.id)) {
          try {
            await markMut.mutateAsync({
              employeeId: match.employee.id,
              date: todayStr,
              status: "present",
            });
            setMarkingDone(true);
            toast.success(`Attendance marked for ${match.employee.name}`);
          } catch {
            toast.error("Failed to mark attendance");
          }
        } else {
          setMarkingDone(true);
        }
        return;
      }

      // If 5 seconds passed with detections but no match
      if (
        firstDetectTimeRef.current &&
        Date.now() - firstDetectTimeRef.current > 5000
      ) {
        stopLoop();
        stopCamera();
        setScanStatus("not_recognized");
      }
    }, 600);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanStatus("idle");
    setDetectionBox(null);
    setMatchedEmployee(null);
    setMarkingDone(false);
    firstDetectTimeRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startScanLoop();
    } catch (e: any) {
      setCameraError(e?.message ?? "Camera access denied");
      toast.error("Camera access denied. Please allow camera access.");
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadModels();
        if (!cancelled) {
          setModelsReady(true);
          if (employeesWithFace.length > 0) {
            await startCamera();
          }
        }
      } catch {
        if (!cancelled)
          setCameraError("Failed to load face recognition models");
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  // Start camera once models ready and employees available
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep subset
  useEffect(() => {
    if (
      modelsReady &&
      employeesWithFace.length > 0 &&
      scanStatus === "idle" &&
      !matchedEmployee
    ) {
      startCamera();
    }
  }, [modelsReady, employeesWithFace.length]);

  const handleScanNext = async () => {
    await startCamera();
  };

  const handleTryAgain = async () => {
    await startCamera();
  };

  return (
    <div className="space-y-5">
      {/* Face Recognition Camera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanFace className="w-4 h-4 text-primary" /> Automatic Face
            Recognition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!modelsReady && (
            <div
              className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground"
              data-ocid="attendance.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">
                Loading face recognition engine...
              </p>
            </div>
          )}

          {modelsReady && employeesWithFace.length === 0 && (
            <div
              className="flex flex-col items-center justify-center gap-3 py-12 text-center"
              data-ocid="attendance.empty_state"
            >
              <ScanFace className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-semibold">No face data available</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                No registered employees with face data. Please register
                employees first.
              </p>
            </div>
          )}

          {modelsReady && employeesWithFace.length > 0 && (
            <>
              {/* Matched Employee Card */}
              {matchedEmployee ? (
                <div
                  className="rounded-xl overflow-hidden border-2 border-green-400 bg-green-50"
                  data-ocid="attendance.success_state"
                >
                  <div className="flex items-center gap-4 p-5">
                    {matchedEmployee.faceImageKey ? (
                      <img
                        src={ExternalBlob.fromURL(
                          matchedEmployee.faceImageKey,
                        ).getDirectURL()}
                        alt={matchedEmployee.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-green-300 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                        <ScanFace className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-green-700 font-bold text-base">
                          {matchedEmployee.name}
                        </span>
                      </div>
                      <p className="text-sm text-green-600">
                        {matchedEmployee.id} · {matchedEmployee.department}
                      </p>
                      {markingDone && (
                        <Badge className="mt-2 bg-green-500 hover:bg-green-500 text-white">
                          {markedIds.has(matchedEmployee.id) && !markingDone
                            ? "Already Marked Today"
                            : "Attendance Marked ✓"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-green-200 px-5 py-3">
                    <Button
                      className="w-full"
                      onClick={handleScanNext}
                      data-ocid="attendance.scan_next_button"
                    >
                      <ScanFace className="w-4 h-4 mr-2" /> Scan Next Person
                    </Button>
                  </div>
                </div>
              ) : scanStatus === "not_recognized" ? (
                <div
                  className="rounded-xl border-2 border-red-300 bg-red-50 p-6 text-center"
                  data-ocid="attendance.error_state"
                >
                  <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="font-semibold text-red-700">
                    Face Not Recognized
                  </p>
                  <p className="text-xs text-red-500 mb-4">
                    The scanned face doesn't match any registered employee.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleTryAgain}
                    data-ocid="attendance.try_again_button"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div
                  className="bg-black rounded-xl overflow-hidden relative"
                  style={{ height: 280 }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <FaceScanOverlay
                    videoRef={videoRef}
                    status={scanStatus}
                    detectionBox={detectionBox}
                    matchedName={
                      matchedEmployee
                        ? (matchedEmployee as Employee2).name
                        : undefined
                    }
                  />
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
                      <p className="text-red-400 text-sm text-center px-4">
                        {cameraError}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleTryAgain}
                      >
                        Retry Camera
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full">
                      Position your face in front of the camera
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today's Attendance — {todayStr}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayRecords.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-4"
              data-ocid="attendance.list.empty_state"
            >
              No attendance marked today
            </p>
          ) : (
            <div className="space-y-2">
              {todayRecords.map((rec, i) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                return (
                  <div
                    key={rec.id}
                    data-ocid={`attendance.item.${i + 1}`}
                    className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {emp?.name ?? rec.employeeId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.employeeId}
                      </p>
                    </div>
                    {rec.status === "present" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Present
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Absent
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
