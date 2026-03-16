import type { Employee2 } from "../backend.d";

// Global faceapi from CDN
declare const faceapi: any;

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

let modelsLoadedPromise: Promise<void> | null = null;
let scriptLoadedPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptLoadedPromise) return scriptLoadedPromise;
  if (typeof faceapi !== "undefined") {
    scriptLoadedPromise = Promise.resolve();
    return scriptLoadedPromise;
  }
  scriptLoadedPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load face-api from CDN"));
    document.head.appendChild(script);
  });
  return scriptLoadedPromise;
}

export async function loadModels(): Promise<void> {
  if (modelsLoadedPromise) return modelsLoadedPromise;
  modelsLoadedPromise = (async () => {
    await loadScript();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  })();
  return modelsLoadedPromise;
}

export async function detectFace(video: HTMLVideoElement): Promise<{
  descriptor: Float32Array;
  box: { x: number; y: number; width: number; height: number };
} | null> {
  if (typeof faceapi === "undefined") return null;
  try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detection) return null;
    return {
      descriptor: detection.descriptor,
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
    };
  } catch {
    return null;
  }
}

export function matchDescriptor(
  descriptor: Float32Array,
  employees: Employee2[],
): { employee: Employee2; distance: number } | null {
  let best: { employee: Employee2; distance: number } | null = null;
  for (const emp of employees) {
    const empAny = emp as any;
    if (!empAny.faceDescriptor) continue;
    try {
      const stored = jsonToDescriptor(empAny.faceDescriptor);
      // Euclidean distance
      let sum = 0;
      for (let i = 0; i < descriptor.length; i++) {
        const diff = descriptor[i] - stored[i];
        sum += diff * diff;
      }
      const distance = Math.sqrt(sum);
      if (!best || distance < best.distance) {
        best = { employee: emp, distance };
      }
    } catch {
      // skip invalid descriptor
    }
  }
  if (best && best.distance < 0.55) return best;
  return null;
}

export function descriptorToJson(d: Float32Array): string {
  return JSON.stringify(Array.from(d));
}

export function jsonToDescriptor(s: string): Float32Array {
  return new Float32Array(JSON.parse(s));
}
