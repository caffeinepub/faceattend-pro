declare module "camera/useCamera" {
  import type { RefObject } from "react";

  export interface CameraConfig {
    facingMode?: "user" | "environment";
    width?: number;
    height?: number;
    quality?: number;
    format?: "image/jpeg" | "image/png" | "image/webp";
  }

  export interface CameraError {
    type: "permission" | "not-supported" | "not-found" | "unknown" | "timeout";
    message: string;
  }

  export interface UseCameraReturn {
    isActive: boolean;
    isSupported: boolean | null;
    error: CameraError | null;
    isLoading: boolean;
    currentFacingMode: "user" | "environment";
    startCamera: () => Promise<boolean>;
    stopCamera: () => Promise<void>;
    capturePhoto: () => Promise<File | null>;
    switchCamera: (newFacingMode?: "user" | "environment") => Promise<boolean>;
    retry: () => Promise<boolean>;
    videoRef: RefObject<HTMLVideoElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
  }

  export function useCamera(config?: CameraConfig): UseCameraReturn;
}

declare module "blob-storage/ExternalBlob" {
  export class ExternalBlob {
    static fromBytes(bytes: Uint8Array): ExternalBlob;
    static fromURL(url: string): ExternalBlob;
    getDirectURL(): string;
    withUploadProgress(onProgress: (progress: number) => void): ExternalBlob;
  }
}
