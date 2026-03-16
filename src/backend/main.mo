import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----------------------------------------------------------------
  // Migration compat (old types kept for stable memory)
  // ----------------------------------------------------------------
  type _OldUserProfile = { name : Text; employeeId : ?Text };
  type _OldEmployee = { id : Text; name : Text; department : Text; position : Text; employeeCode : Text; baseSalary : Nat; joinDate : Text; isActive : Bool };
  type _OldAttendanceStatus = { #present; #absent; #late; #halfdDay };
  type _OldAttendance = { id : Text; employeeId : Text; date : Int; checkInTime : Nat; checkOutTime : ?Nat; status : _OldAttendanceStatus; photoUrl : Text; notes : Text };
  type _OldLeaveType = { #sick; #casual; #annual; #unpaid };
  type _OldLeaveStatus = { #pending; #approved; #rejected };
  type _OldLeave = { id : Text; employeeId : Text; leaveType : _OldLeaveType; startDate : Int; endDate : Int; reason : Text; status : _OldLeaveStatus; approvedBy : Text };
  type _OldHoliday = { id : Text; name : Text; date : Int; description : Text };

  let userProfiles = Map.empty<Principal, _OldUserProfile>();
  let employees = Map.empty<Text, _OldEmployee>();
  let attendanceRecords = Map.empty<Text, _OldAttendance>();
  let leaves = Map.empty<Text, _OldLeave>();
  let holidays = Map.empty<Text, _OldHoliday>();
  let employeePhotos = Map.empty<Text, Blob>();

  type _OldLabor = { id : Text; name : Text; phone : Text; salaryType : Text; dailyRate : Nat; overtimeRate : Nat };
  type _OldAttendanceRecord = { laborId : Text; date : Text; status : Text; multiplierX10 : Nat; checkIn : Text; checkOut : Text; notes : Text };
  type _OldAdvancePayment = { id : Text; laborId : Text; amount : Nat; date : Text; note : Text };

  let labors = Map.empty<Text, _OldLabor>();
  let attendance = Map.empty<Text, _OldAttendanceRecord>();
  let advances = Map.empty<Text, _OldAdvancePayment>();

  // ----------------------------------------------------------------
  // Previous Employee2 shape (without faceDescriptor) — for migration
  // ----------------------------------------------------------------
  type _Employee2V1 = {
    id : Text;
    name : Text;
    department : Text;
    phone : Text;
    dailyRate : Nat;
    faceImageKey : Text;
    createdAt : Int;
  };

  // ----------------------------------------------------------------
  // Current types
  // ----------------------------------------------------------------

  public type Employee2 = {
    id : Text;
    name : Text;
    department : Text;
    phone : Text;
    dailyRate : Nat;
    faceImageKey : Text;
    faceDescriptor : Text;
    createdAt : Int;
  };

  public type AttendanceRecord2 = {
    id : Text;
    employeeId : Text;
    date : Text;
    status : Text;
    markedAt : Int;
  };

  public type Holiday2 = {
    id : Text;
    date : Text;
    reason : Text;
    createdAt : Int;
  };

  public type SalaryPayment = {
    id : Text;
    employeeId : Text;
    amount : Nat;
    note : Text;
    paidAt : Int;
  };

  // ----------------------------------------------------------------
  // Storage — employeeStore uses migration-compatible V1 type
  // We store as _Employee2V1 in stable memory and migrate on read
  // ----------------------------------------------------------------

  let employeeStore = Map.empty<Text, _Employee2V1>();
  let attendanceStore = Map.empty<Text, AttendanceRecord2>();
  let holidayStore = Map.empty<Text, Holiday2>();
  let paymentStore = Map.empty<Text, SalaryPayment>();

  // Helper to upgrade V1 -> current Employee2
  func upgradeEmployee(e : _Employee2V1) : Employee2 = {
    id = e.id;
    name = e.name;
    department = e.department;
    phone = e.phone;
    dailyRate = e.dailyRate;
    faceImageKey = e.faceImageKey;
    faceDescriptor = "";
    createdAt = e.createdAt;
  };

  // ----------------------------------------------------------------
  // Employee APIs
  // ----------------------------------------------------------------

  public shared func registerEmployee(id : Text, name : Text, department : Text, phone : Text, dailyRate : Nat, faceImageKey : Text, faceDescriptor : Text, createdAt : Int) : async Employee2 {
    // Store without faceDescriptor in stable map (migration compat), keep descriptor in a separate map
    let v1 : _Employee2V1 = { id; name; department; phone; dailyRate; faceImageKey; createdAt };
    employeeStore.add(id, v1);
    descriptorStore.add(id, faceDescriptor);
    { id; name; department; phone; dailyRate; faceImageKey; faceDescriptor; createdAt };
  };

  public shared func updateEmployeeFace(employeeId : Text, faceImageKey : Text, faceDescriptor : Text) : async Bool {
    switch (employeeStore.get(employeeId)) {
      case null { false };
      case (?emp) {
        let updated : _Employee2V1 = {
          id = emp.id;
          name = emp.name;
          department = emp.department;
          phone = emp.phone;
          dailyRate = emp.dailyRate;
          faceImageKey = faceImageKey;
          createdAt = emp.createdAt;
        };
        employeeStore.add(employeeId, updated);
        descriptorStore.add(employeeId, faceDescriptor);
        true;
      };
    };
  };

  public query func getEmployees() : async [Employee2] {
    employeeStore.values().toArray().map(
      func(e : _Employee2V1) : Employee2 {
        let desc = switch (descriptorStore.get(e.id)) { case null { "" }; case (?d) { d } };
        { id = e.id; name = e.name; department = e.department; phone = e.phone; dailyRate = e.dailyRate; faceImageKey = e.faceImageKey; faceDescriptor = desc; createdAt = e.createdAt };
      }
    );
  };

  public query func getEmployee(employeeId : Text) : async ?Employee2 {
    switch (employeeStore.get(employeeId)) {
      case null { null };
      case (?e) {
        let desc = switch (descriptorStore.get(e.id)) { case null { "" }; case (?d) { d } };
        ?{ id = e.id; name = e.name; department = e.department; phone = e.phone; dailyRate = e.dailyRate; faceImageKey = e.faceImageKey; faceDescriptor = desc; createdAt = e.createdAt };
      };
    };
  };

  public shared func deleteEmployee(employeeId : Text) : async Bool {
    switch (employeeStore.get(employeeId)) {
      case null { false };
      case (?_) {
        employeeStore.remove(employeeId);
        descriptorStore.remove(employeeId);
        true;
      };
    };
  };

  // Separate stable map for face descriptors (avoids breaking Employee2 stable type)
  let descriptorStore = Map.empty<Text, Text>();

  // ----------------------------------------------------------------
  // Attendance APIs
  // ----------------------------------------------------------------

  public shared func markAttendance2(id : Text, employeeId : Text, date : Text, status : Text, markedAt : Int) : async AttendanceRecord2 {
    let record : AttendanceRecord2 = { id; employeeId; date; status; markedAt };
    let key = employeeId # "_" # date;
    attendanceStore.add(key, record);
    record;
  };

  public query func getAttendanceByEmployee(employeeId : Text) : async [AttendanceRecord2] {
    attendanceStore.values().toArray().filter(
      func(r : AttendanceRecord2) : Bool { r.employeeId == employeeId }
    );
  };

  public query func getAttendanceByMonth(year : Text, month : Text) : async [AttendanceRecord2] {
    let prefix = year # "-" # month;
    attendanceStore.values().toArray().filter(
      func(r : AttendanceRecord2) : Bool {
        r.date.startsWith(#text prefix)
      }
    );
  };

  // ----------------------------------------------------------------
  // Holiday APIs
  // ----------------------------------------------------------------

  public shared func addHoliday2(id : Text, date : Text, reason : Text, createdAt : Int) : async Holiday2 {
    let h : Holiday2 = { id; date; reason; createdAt };
    holidayStore.add(id, h);
    h;
  };

  public query func getHolidays() : async [Holiday2] {
    holidayStore.values().toArray();
  };

  public shared func removeHoliday(holidayId : Text) : async Bool {
    switch (holidayStore.get(holidayId)) {
      case null { false };
      case (?_) { holidayStore.remove(holidayId); true };
    };
  };

  // ----------------------------------------------------------------
  // Salary Payment APIs
  // ----------------------------------------------------------------

  public shared func recordPayment(id : Text, employeeId : Text, amount : Nat, note : Text, paidAt : Int) : async SalaryPayment {
    let payment : SalaryPayment = { id; employeeId; amount; note; paidAt };
    paymentStore.add(id, payment);
    payment;
  };

  public query func getPaymentsByEmployee(employeeId : Text) : async [SalaryPayment] {
    paymentStore.values().toArray().filter(
      func(p : SalaryPayment) : Bool { p.employeeId == employeeId }
    );
  };

  public query func getAllPayments() : async [SalaryPayment] {
    paymentStore.values().toArray();
  };
};
