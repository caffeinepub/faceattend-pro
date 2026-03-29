/* eslint-disable */
// @ts-nocheck
// Regenerated to match current main.mo

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Employee {
  'id': string;
  'name': string;
  'department': string;
  'phone': string;
  'monthlySalary': bigint;
  'joinDate': string;
  'isActive': boolean;
}
export interface AttendanceRecord {
  'id': string;
  'employeeId': string;
  'date': string;
  'status': string;
  'markedAt': bigint;
}
export interface Holiday2 {
  'id': string;
  'date': string;
  'reason': string;
  'createdAt': bigint;
}
export interface SalaryPayment {
  'id': string;
  'employeeId': string;
  'amount': bigint;
  'note': string;
  'paidAt': bigint;
}
export type UserRole = { 'admin': null } | { 'user': null } | { 'guest': null };
export interface _CaffeineStorageCreateCertificateResult { 'method': string; 'blob_hash': string; }
export interface _CaffeineStorageRefillInformation { 'proposed_top_up_amount': [] | [bigint]; }
export interface _CaffeineStorageRefillResult { 'success': [] | [boolean]; 'topped_up_amount': [] | [bigint]; }

export interface _SERVICE {
  '_caffeineStorageBlobIsLive'          : ActorMethod<[Uint8Array], boolean>;
  '_caffeineStorageBlobsToDelete'       : ActorMethod<[], Array<Uint8Array>>;
  '_caffeineStorageConfirmBlobDeletion' : ActorMethod<[Array<Uint8Array>], undefined>;
  '_caffeineStorageCreateCertificate'  : ActorMethod<[string], _CaffeineStorageCreateCertificateResult>;
  '_caffeineStorageRefillCashier'       : ActorMethod<[[] | [_CaffeineStorageRefillInformation]], _CaffeineStorageRefillResult>;
  '_caffeineStorageUpdateGatewayPrincipals' : ActorMethod<[], undefined>;
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>;
  'registerEmployee'  : ActorMethod<[string, string, string, string, bigint, string, boolean], Employee>;
  'updateEmployee'    : ActorMethod<[string, string, string, string, bigint], boolean>;
  'deleteEmployee'    : ActorMethod<[string], boolean>;
  'getEmployees'      : ActorMethod<[], Array<Employee>>;
  'getEmployee'       : ActorMethod<[string], [] | [Employee]>;
  'markAttendance'          : ActorMethod<[string, string, string, string, bigint], AttendanceRecord>;
  'getAttendanceByEmployee' : ActorMethod<[string], Array<AttendanceRecord>>;
  'getAttendanceByMonth'    : ActorMethod<[string, string], Array<AttendanceRecord>>;
  'addHoliday'    : ActorMethod<[string, string, string, bigint], Holiday2>;
  'getHolidays'   : ActorMethod<[], Array<Holiday2>>;
  'removeHoliday' : ActorMethod<[string], boolean>;
  'recordPayment'          : ActorMethod<[string, string, bigint, string, bigint], SalaryPayment>;
  'getPaymentsByEmployee'  : ActorMethod<[string], Array<SalaryPayment>>;
  'getAllPayments'          : ActorMethod<[], Array<SalaryPayment>>;
  'assignCallerUserRole'   : ActorMethod<[Principal, UserRole], undefined>;
  'getCallerUserRole'      : ActorMethod<[], UserRole>;
  'isCallerAdmin'          : ActorMethod<[], boolean>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
