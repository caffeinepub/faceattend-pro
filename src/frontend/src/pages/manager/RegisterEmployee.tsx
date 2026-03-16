import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Loader2,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import FaceScanOverlay from "../../components/FaceScanOverlay";
import {
  descriptorToJson,
  detectFace,
  loadModels,
} from "../../hooks/useFaceRecognition";
import {
  useDeleteEmployee,
  useEmployees,
  useRegisterEmployee,
} from "../../hooks/useQueries";

type ScanStatus = "idle" | "scanning" | "detected" | "matching";

export default function RegisterEmployee() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    department: "",
    phone: "",
    monthlySalary: "",
  });
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] =
    useState<Float32Array | null>(null);
  const [detectionBox, setDetectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [modelsReady, setModelsReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const registerMut = useRegisterEmployee();
  const deleteMut = useDeleteEmployee();

  const computedDailyRate = form.monthlySalary
    ? Number(form.monthlySalary) / 26
    : 0;

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

  const autoCaptureFrame = (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return Promise.resolve(null);
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(video, 0, 0);
    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], "face.jpg", { type: "image/jpeg" }));
        else resolve(null);
      }, "image/jpeg");
    });
  };

  const startScanLoop = () => {
    setScanStatus("scanning");
    loopRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const result = await detectFace(video);
      if (result) {
        setScanStatus("detected");
        setDetectionBox(result.box);
        stopLoop();
        // Wait 1s then auto-capture
        setTimeout(async () => {
          const file = await autoCaptureFrame();
          if (file) {
            setCapturedFile(file);
            setCapturedUrl(URL.createObjectURL(file));
          }
          setCapturedDescriptor(result.descriptor);
          stopCamera();
        }, 1000);
      }
    }, 800);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanStatus("idle");
    setDetectionBox(null);
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

  const handleRetake = async () => {
    setCapturedUrl(null);
    setCapturedFile(null);
    setCapturedDescriptor(null);
    setDetectionBox(null);
    await startCamera();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadModels();
        if (!cancelled) {
          setModelsReady(true);
          await startCamera();
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

  const handleSubmit = async () => {
    if (
      !form.id ||
      !form.name ||
      !form.department ||
      !form.phone ||
      !form.monthlySalary
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (!capturedFile) {
      toast.error("Please wait for face to be captured");
      return;
    }

    setUploading(true);
    try {
      const bytes = new Uint8Array(await capturedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const faceImageKey = blob.getDirectURL();
      const dailyRate = Number(form.monthlySalary) / 26;
      const faceDescriptor = capturedDescriptor
        ? descriptorToJson(capturedDescriptor)
        : "";
      await registerMut.mutateAsync({
        id: form.id,
        name: form.name,
        department: form.department,
        phone: form.phone,
        dailyRate,
        faceImageKey,
        faceDescriptor,
      });
      toast.success(`${form.name} registered successfully!`);
      setForm({
        id: "",
        name: "",
        department: "",
        phone: "",
        monthlySalary: "",
      });
      setCapturedUrl(null);
      setCapturedFile(null);
      setCapturedDescriptor(null);
      // Restart camera for next employee
      await startCamera();
    } catch {
      toast.error("Failed to register employee");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete employee ${name}?`)) return;
    await deleteMut.mutateAsync(id);
    toast.success("Employee deleted");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4 text-primary" /> Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="emp-id">Employee ID *</Label>
              <Input
                id="emp-id"
                data-ocid="register.id_input"
                placeholder="Employee ID"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emp-name">Full Name *</Label>
              <Input
                id="emp-name"
                data-ocid="register.name_input"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emp-dept">Department *</Label>
              <Input
                id="emp-dept"
                data-ocid="register.department_input"
                placeholder="Department"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emp-phone">Phone *</Label>
              <Input
                id="emp-phone"
                data-ocid="register.phone_input"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="emp-salary">Monthly Salary (₹) *</Label>
              <Input
                id="emp-salary"
                data-ocid="register.monthly_salary_input"
                type="number"
                placeholder="Monthly Salary"
                value={form.monthlySalary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlySalary: e.target.value }))
                }
              />
              {form.monthlySalary && Number(form.monthlySalary) > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary/60" />
                  Daily Rate:{" "}
                  <span className="font-semibold text-primary">
                    ₹{computedDailyRate.toFixed(2)}/day
                  </span>
                  <span className="text-muted-foreground/70">
                    (Monthly ÷ 26)
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Face Scan Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Face Scan
              {!modelsReady && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading face
                  recognition engine...
                </span>
              )}
            </Label>
            <div
              className="bg-black rounded-xl overflow-hidden relative"
              style={{ minHeight: 260 }}
            >
              {capturedUrl ? (
                <div className="relative">
                  <img
                    src={capturedUrl}
                    alt="Captured face"
                    className="w-full object-cover"
                    style={{ height: 260 }}
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full px-3 py-1 text-xs flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Face captured
                    automatically
                  </div>
                  {capturedDescriptor && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                      Descriptor ready
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-2 right-2 bg-white/90"
                    onClick={handleRetake}
                    data-ocid="register.retake_button"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Retake
                  </Button>
                </div>
              ) : (
                <div className="relative" style={{ height: 260 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <FaceScanOverlay
                    videoRef={videoRef}
                    status={modelsReady ? scanStatus : "idle"}
                    detectionBox={detectionBox}
                  />
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
                      <p className="text-red-400 text-sm text-center px-4">
                        {cameraError}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetake}
                      >
                        Retry Camera
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <Button
            data-ocid="register.submit_button"
            onClick={handleSubmit}
            disabled={registerMut.isPending || uploading || !capturedFile}
            className="w-full"
          >
            {registerMut.isPending || uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Employee
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Registered Employees ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {empLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="register.empty_state"
            >
              No employees registered yet
            </p>
          ) : (
            <div className="space-y-2">
              {employees.map((emp, i) => (
                <div
                  key={emp.id}
                  data-ocid={`register.employee.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
                >
                  {emp.faceImageKey ? (
                    <img
                      src={ExternalBlob.fromURL(
                        emp.faceImageKey,
                      ).getDirectURL()}
                      alt={emp.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.id} · {emp.department}
                    </p>
                    <p className="text-xs text-primary">
                      ₹{(Number(emp.dailyRate) * 26).toLocaleString()}/month
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp.id, emp.name)}
                    data-ocid={`register.employee.delete_button.${i + 1}`}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
