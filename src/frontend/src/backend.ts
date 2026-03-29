/* eslint-disable */
// @ts-nocheck
// Regenerated to match current main.mo

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export class ExternalBlob {
  _blob?: Uint8Array<ArrayBuffer> | null;
  directURL: string;
  onProgress?: (percentage: number) => void = undefined;
  private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
    if (blob) this._blob = blob;
    this.directURL = directURL;
  }
  static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
  static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
    const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
    return new ExternalBlob(url, blob);
  }
  public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this._blob) return this._blob;
    const response = await fetch(this.directURL);
    const blob = await response.blob();
    this._blob = new Uint8Array(await blob.arrayBuffer());
    return this._blob;
  }
  public getDirectURL(): string { return this.directURL; }
  public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.onProgress = onProgress;
    return this;
  }
}

export interface _CaffeineStorageRefillInformation { proposed_top_up_amount?: bigint; }
export interface _CaffeineStorageRefillResult { success?: boolean; topped_up_amount?: bigint; }
export interface _CaffeineStorageCreateCertificateResult { method: string; blob_hash: string; }

export interface Employee {
  id: string;
  name: string;
  department: string;
  phone: string;
  monthlySalary: bigint;
  joinDate: string;
  isActive: boolean;
}
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  markedAt: bigint;
}
export interface Holiday {
  id: string;
  date: string;
  reason: string;
  createdAt: bigint;
}
export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: bigint;
  note: string;
  paidAt: bigint;
}
export enum UserRole { admin = "admin", user = "user", guest = "guest" }

export interface backendInterface {
  _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
  _caffeineStorageBlobsToDelete(): Promise<Array<Uint8Array>>;
  _caffeineStorageConfirmBlobDeletion(blobs: Array<Uint8Array>): Promise<void>;
  _caffeineStorageCreateCertificate(blobHash: string): Promise<_CaffeineStorageCreateCertificateResult>;
  _caffeineStorageRefillCashier(info: _CaffeineStorageRefillInformation | null): Promise<_CaffeineStorageRefillResult>;
  _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
  _initializeAccessControlWithSecret(secret: string): Promise<void>;
  // Employee
  registerEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint, joinDate: string, isActive: boolean): Promise<Employee>;
  updateEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint): Promise<boolean>;
  deleteEmployee(id: string): Promise<boolean>;
  getEmployees(): Promise<Array<Employee>>;
  getEmployee(id: string): Promise<Employee | null>;
  // Attendance
  markAttendance(id: string, employeeId: string, date: string, status: string, markedAt: bigint): Promise<AttendanceRecord>;
  getAttendanceByEmployee(employeeId: string): Promise<Array<AttendanceRecord>>;
  getAttendanceByMonth(year: string, month: string): Promise<Array<AttendanceRecord>>;
  // Holidays
  addHoliday(id: string, date: string, reason: string, createdAt: bigint): Promise<Holiday>;
  getHolidays(): Promise<Array<Holiday>>;
  removeHoliday(id: string): Promise<boolean>;
  // Payments
  recordPayment(id: string, employeeId: string, amount: bigint, note: string, paidAt: bigint): Promise<SalaryPayment>;
  getPaymentsByEmployee(employeeId: string): Promise<Array<SalaryPayment>>;
  getAllPayments(): Promise<Array<SalaryPayment>>;
  // Auth
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  isCallerAdmin(): Promise<boolean>;
}

export interface CreateActorOptions {
  agent?: Agent;
  agentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  processError?: (error: unknown) => never;
}

function userRoleToCandid(role: UserRole): { admin: null } | { user: null } | { guest: null } {
  if (role === UserRole.admin) return { admin: null };
  if (role === UserRole.user) return { user: null };
  return { guest: null };
}
function userRoleFromCandid(v: { admin: null } | { user: null } | { guest: null }): UserRole {
  if ('admin' in v) return UserRole.admin;
  if ('user' in v) return UserRole.user;
  return UserRole.guest;
}

export class Backend implements backendInterface {
  constructor(
    private actor: ActorSubclass<_SERVICE>,
    private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    private processError?: (error: unknown) => never,
  ) {}

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.processError) {
      try { return await fn(); } catch (e) { this.processError(e); throw new Error('unreachable'); }
    }
    return fn();
  }

  async _caffeineStorageBlobIsLive(hash: Uint8Array) { return this.call(() => this.actor._caffeineStorageBlobIsLive(hash)); }
  async _caffeineStorageBlobsToDelete() { return this.call(() => this.actor._caffeineStorageBlobsToDelete()); }
  async _caffeineStorageConfirmBlobDeletion(blobs: Array<Uint8Array>) { return this.call(() => this.actor._caffeineStorageConfirmBlobDeletion(blobs)); }
  async _caffeineStorageCreateCertificate(blobHash: string) { return this.call(() => this.actor._caffeineStorageCreateCertificate(blobHash)); }
  async _caffeineStorageRefillCashier(info: _CaffeineStorageRefillInformation | null) {
    const arg = info === null ? [] : [{ proposed_top_up_amount: info.proposed_top_up_amount !== undefined ? [info.proposed_top_up_amount] : [] }];
    const result = await this.call(() => this.actor._caffeineStorageRefillCashier(arg as any));
    return { success: (result as any).success?.[0] ?? undefined, topped_up_amount: (result as any).topped_up_amount?.[0] ?? undefined };
  }
  async _caffeineStorageUpdateGatewayPrincipals() { return this.call(() => this.actor._caffeineStorageUpdateGatewayPrincipals()); }
  async _initializeAccessControlWithSecret(secret: string) { return this.call(() => this.actor._initializeAccessControlWithSecret(secret)); }

  // Employee
  async registerEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint, joinDate: string, isActive: boolean): Promise<Employee> {
    return this.call(() => this.actor.registerEmployee(id, name, department, phone, monthlySalary, joinDate, isActive));
  }
  async updateEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint): Promise<boolean> {
    return this.call(() => this.actor.updateEmployee(id, name, department, phone, monthlySalary));
  }
  async deleteEmployee(id: string): Promise<boolean> {
    return this.call(() => this.actor.deleteEmployee(id));
  }
  async getEmployees(): Promise<Array<Employee>> {
    return this.call(() => this.actor.getEmployees());
  }
  async getEmployee(id: string): Promise<Employee | null> {
    const result = await this.call(() => this.actor.getEmployee(id));
    return (result as any).length === 0 ? null : (result as any)[0];
  }

  // Attendance
  async markAttendance(id: string, employeeId: string, date: string, status: string, markedAt: bigint): Promise<AttendanceRecord> {
    return this.call(() => this.actor.markAttendance(id, employeeId, date, status, markedAt));
  }
  async getAttendanceByEmployee(employeeId: string): Promise<Array<AttendanceRecord>> {
    return this.call(() => this.actor.getAttendanceByEmployee(employeeId));
  }
  async getAttendanceByMonth(year: string, month: string): Promise<Array<AttendanceRecord>> {
    return this.call(() => this.actor.getAttendanceByMonth(year, month));
  }

  // Holidays
  async addHoliday(id: string, date: string, reason: string, createdAt: bigint): Promise<Holiday> {
    return this.call(() => this.actor.addHoliday(id, date, reason, createdAt));
  }
  async getHolidays(): Promise<Array<Holiday>> {
    return this.call(() => this.actor.getHolidays());
  }
  async removeHoliday(id: string): Promise<boolean> {
    return this.call(() => this.actor.removeHoliday(id));
  }

  // Payments
  async recordPayment(id: string, employeeId: string, amount: bigint, note: string, paidAt: bigint): Promise<SalaryPayment> {
    return this.call(() => this.actor.recordPayment(id, employeeId, amount, note, paidAt));
  }
  async getPaymentsByEmployee(employeeId: string): Promise<Array<SalaryPayment>> {
    return this.call(() => this.actor.getPaymentsByEmployee(employeeId));
  }
  async getAllPayments(): Promise<Array<SalaryPayment>> {
    return this.call(() => this.actor.getAllPayments());
  }

  // Auth
  async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
    return this.call(() => this.actor.assignCallerUserRole(user, userRoleToCandid(role)));
  }
  async getCallerUserRole(): Promise<UserRole> {
    const result = await this.call(() => this.actor.getCallerUserRole());
    return userRoleFromCandid(result as any);
  }
  async isCallerAdmin(): Promise<boolean> {
    return this.call(() => this.actor.isCallerAdmin());
  }
}

export function createActor(
  canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
  options: CreateActorOptions = {},
): Backend {
  const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn('Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.');
  }
  const actor = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
