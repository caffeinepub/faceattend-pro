/* eslint-disable */
// @ts-nocheck
// Regenerated to match current main.mo — DO NOT hand-edit.

import { IDL } from '@icp-sdk/core/candid';

export const _CaffeineStorageCreateCertificateResult = IDL.Record({
  'method' : IDL.Text,
  'blob_hash' : IDL.Text,
});
export const _CaffeineStorageRefillInformation = IDL.Record({
  'proposed_top_up_amount' : IDL.Opt(IDL.Nat),
});
export const _CaffeineStorageRefillResult = IDL.Record({
  'success' : IDL.Opt(IDL.Bool),
  'topped_up_amount' : IDL.Opt(IDL.Nat),
});
export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user'  : IDL.Null,
  'guest' : IDL.Null,
});
export const Employee = IDL.Record({
  'id'            : IDL.Text,
  'name'          : IDL.Text,
  'department'    : IDL.Text,
  'phone'         : IDL.Text,
  'monthlySalary' : IDL.Nat,
  'joinDate'      : IDL.Text,
  'isActive'      : IDL.Bool,
});
export const AttendanceRecord = IDL.Record({
  'id'         : IDL.Text,
  'employeeId' : IDL.Text,
  'date'       : IDL.Text,
  'status'     : IDL.Text,
  'markedAt'   : IDL.Int,
});
export const Holiday2 = IDL.Record({
  'id'        : IDL.Text,
  'date'      : IDL.Text,
  'reason'    : IDL.Text,
  'createdAt' : IDL.Int,
});
export const SalaryPayment = IDL.Record({
  'id'         : IDL.Text,
  'employeeId' : IDL.Text,
  'amount'     : IDL.Nat,
  'note'       : IDL.Text,
  'paidAt'     : IDL.Int,
});

const serviceEntries = {
  '_caffeineStorageBlobIsLive'           : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
  '_caffeineStorageBlobsToDelete'        : IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
  '_caffeineStorageConfirmBlobDeletion'  : IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
  '_caffeineStorageCreateCertificate'   : IDL.Func([IDL.Text], [_CaffeineStorageCreateCertificateResult], []),
  '_caffeineStorageRefillCashier'        : IDL.Func([IDL.Opt(_CaffeineStorageRefillInformation)], [_CaffeineStorageRefillResult], []),
  '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
  '_initializeAccessControlWithSecret'  : IDL.Func([IDL.Text], [], []),
  // Employee
  'registerEmployee'  : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Bool], [Employee], []),
  'updateEmployee'    : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
  'deleteEmployee'    : IDL.Func([IDL.Text], [IDL.Bool], []),
  'getEmployees'      : IDL.Func([], [IDL.Vec(Employee)], ['query']),
  'getEmployee'       : IDL.Func([IDL.Text], [IDL.Opt(Employee)], ['query']),
  // Attendance
  'markAttendance'           : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Int], [AttendanceRecord], []),
  'getAttendanceByEmployee'  : IDL.Func([IDL.Text], [IDL.Vec(AttendanceRecord)], ['query']),
  'getAttendanceByMonth'     : IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(AttendanceRecord)], ['query']),
  // Holidays
  'addHoliday'    : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Int], [Holiday2], []),
  'getHolidays'   : IDL.Func([], [IDL.Vec(Holiday2)], ['query']),
  'removeHoliday' : IDL.Func([IDL.Text], [IDL.Bool], []),
  // Salary payments
  'recordPayment'           : IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Int], [SalaryPayment], []),
  'getPaymentsByEmployee'   : IDL.Func([IDL.Text], [IDL.Vec(SalaryPayment)], ['query']),
  'getAllPayments'           : IDL.Func([], [IDL.Vec(SalaryPayment)], ['query']),
  // Reset
  'clearAllData'    : IDL.Func([], [IDL.Bool], []),
  // Auth
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'getCallerUserRole'    : IDL.Func([], [UserRole], ['query']),
  'isCallerAdmin'        : IDL.Func([], [IDL.Bool], ['query']),
};

export const idlService = IDL.Service(serviceEntries);
export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const _CaffeineStorageCreateCertificateResult = IDL.Record({ 'method': IDL.Text, 'blob_hash': IDL.Text });
  const _CaffeineStorageRefillInformation = IDL.Record({ 'proposed_top_up_amount': IDL.Opt(IDL.Nat) });
  const _CaffeineStorageRefillResult = IDL.Record({ 'success': IDL.Opt(IDL.Bool), 'topped_up_amount': IDL.Opt(IDL.Nat) });
  const UserRole = IDL.Variant({ 'admin': IDL.Null, 'user': IDL.Null, 'guest': IDL.Null });
  const Employee = IDL.Record({ 'id': IDL.Text, 'name': IDL.Text, 'department': IDL.Text, 'phone': IDL.Text, 'monthlySalary': IDL.Nat, 'joinDate': IDL.Text, 'isActive': IDL.Bool });
  const AttendanceRecord = IDL.Record({ 'id': IDL.Text, 'employeeId': IDL.Text, 'date': IDL.Text, 'status': IDL.Text, 'markedAt': IDL.Int });
  const Holiday2 = IDL.Record({ 'id': IDL.Text, 'date': IDL.Text, 'reason': IDL.Text, 'createdAt': IDL.Int });
  const SalaryPayment = IDL.Record({ 'id': IDL.Text, 'employeeId': IDL.Text, 'amount': IDL.Nat, 'note': IDL.Text, 'paidAt': IDL.Int });
  return IDL.Service({
    '_caffeineStorageBlobIsLive'           : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
    '_caffeineStorageBlobsToDelete'        : IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
    '_caffeineStorageConfirmBlobDeletion'  : IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
    '_caffeineStorageCreateCertificate'   : IDL.Func([IDL.Text], [_CaffeineStorageCreateCertificateResult], []),
    '_caffeineStorageRefillCashier'        : IDL.Func([IDL.Opt(_CaffeineStorageRefillInformation)], [_CaffeineStorageRefillResult], []),
    '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
    '_initializeAccessControlWithSecret'  : IDL.Func([IDL.Text], [], []),
    'registerEmployee'  : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Bool], [Employee], []),
    'updateEmployee'    : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
    'deleteEmployee'    : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getEmployees'      : IDL.Func([], [IDL.Vec(Employee)], ['query']),
    'getEmployee'       : IDL.Func([IDL.Text], [IDL.Opt(Employee)], ['query']),
    'markAttendance'           : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Int], [AttendanceRecord], []),
    'getAttendanceByEmployee'  : IDL.Func([IDL.Text], [IDL.Vec(AttendanceRecord)], ['query']),
    'getAttendanceByMonth'     : IDL.Func([IDL.Text, IDL.Text], [IDL.Vec(AttendanceRecord)], ['query']),
    'addHoliday'    : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Int], [Holiday2], []),
    'getHolidays'   : IDL.Func([], [IDL.Vec(Holiday2)], ['query']),
    'removeHoliday' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'recordPayment'           : IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Int], [SalaryPayment], []),
    'getPaymentsByEmployee'   : IDL.Func([IDL.Text], [IDL.Vec(SalaryPayment)], ['query']),
    'getAllPayments'           : IDL.Func([], [IDL.Vec(SalaryPayment)], ['query']),
    'clearAllData'    : IDL.Func([], [IDL.Bool], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'getCallerUserRole'    : IDL.Func([], [UserRole], ['query']),
    'isCallerAdmin'        : IDL.Func([], [IDL.Bool], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
