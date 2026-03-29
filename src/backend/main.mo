import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----------------------------------------------------------------
  // Old stable variables kept for migration compatibility (M0169)
  // ----------------------------------------------------------------
  type _OldUserProfile = { name : Text; employeeId : ?Text };
  type _OldEmployee = { id : Text; name : Text; department : Text; position : Text; employeeCode : Text; baseSalary : Nat; joinDate : Text; isActive : Bool };
  type _OldAttendanceStatus = { #present; #absent; #late; #halfdDay };
  type _OldAttendance = { id : Text; employeeId : Text; date : Int; checkInTime : Nat; checkOutTime : ?Nat; status : _OldAttendanceStatus; photoUrl : Text; notes : Text };
  type _OldLeaveType = { #sick; #casual; #annual; #unpaid };
  type _OldLeaveStatus = { #pending; #approved; #rejected };
  type _OldLeave = { id : Text; employeeId : Text; leaveType : _OldLeaveType; startDate : Int; endDate : Int; reason : Text; status : _OldLeaveStatus; approvedBy : Text };
  type _OldHoliday = { id : Text; name : Text; date : Int; description : Text };
  type _OldLabor = { id : Text; name : Text; phone : Text; salaryType : Text; dailyRate : Nat; overtimeRate : Nat };
  type _OldAttendanceRecord = { laborId : Text; date : Text; status : Text; multiplierX10 : Nat; checkIn : Text; checkOut : Text; notes : Text };
  type _OldAdvancePayment = { id : Text; laborId : Text; amount : Nat; date : Text; note : Text };

  // These must be kept to avoid M0169 compatibility errors
  let userProfiles = Map.empty<Principal, _OldUserProfile>();
  let employees = Map.empty<Text, _OldEmployee>();
  let attendanceRecords = Map.empty<Text, _OldAttendance>();
  let leaves = Map.empty<Text, _OldLeave>();
  let holidays = Map.empty<Text, _OldHoliday>();
  let employeePhotos = Map.empty<Text, Blob>();
  let labors = Map.empty<Text, _OldLabor>();
  let attendance = Map.empty<Text, _OldAttendanceRecord>();
  let advances = Map.empty<Text, _OldAdvancePayment>();
  let descriptorStore = Map.empty<Text, Text>();

  // ----------------------------------------------------------------
  // Employee storage — reuses _Employee2V1 shape for stable compat.
  // We repurpose fields:
  //   dailyRate   -> stores monthlySalary
  //   faceImageKey -> stores joinDate
  //   createdAt   -> stores isActive as 1 (true) or 0 (false)
  // ----------------------------------------------------------------
  type _Employee2V1 = {
    id : Text;
    name : Text;
    department : Text;
    phone : Text;
    dailyRate : Nat;      // repurposed: stores monthlySalary
    faceImageKey : Text;  // repurposed: stores joinDate
    createdAt : Int;      // repurposed: stores isActive (1=true, 0=false)
  };

  public type Employee = {
    id : Text;
    name : Text;
    department : Text;
    phone : Text;
    monthlySalary : Nat;
    joinDate : Text;
    isActive : Bool;
  };

  public type AttendanceRecord = {
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

  let employeeStore = Map.empty<Text, _Employee2V1>();
  let attendanceStore = Map.empty<Text, AttendanceRecord>();
  let holidayStore = Map.empty<Text, Holiday2>();
  let paymentStore = Map.empty<Text, SalaryPayment>();

  func v1ToEmployee(e : _Employee2V1) : Employee = {
    id = e.id;
    name = e.name;
    department = e.department;
    phone = e.phone;
    monthlySalary = e.dailyRate;
    joinDate = e.faceImageKey;
    isActive = e.createdAt == 1;
  };

  func employeeToV1(emp : Employee) : _Employee2V1 = {
    id = emp.id;
    name = emp.name;
    department = emp.department;
    phone = emp.phone;
    dailyRate = emp.monthlySalary;
    faceImageKey = emp.joinDate;
    createdAt = if (emp.isActive) 1 else 0;
  };

  // ----------------------------------------------------------------
  // Employee APIs
  // ----------------------------------------------------------------

  public shared func registerEmployee(id : Text, name : Text, department : Text, phone : Text, monthlySalary : Nat, joinDate : Text, isActive : Bool) : async Employee {
    let emp : Employee = { id; name; department; phone; monthlySalary; joinDate; isActive };
    employeeStore.add(id, employeeToV1(emp));
    emp;
  };

  public shared func updateEmployee(id : Text, name : Text, department : Text, phone : Text, monthlySalary : Nat) : async Bool {
    switch (employeeStore.get(id)) {
      case null { false };
      case (?e) {
        let updated : _Employee2V1 = {
          id = e.id;
          name;
          department;
          phone;
          dailyRate = monthlySalary;
          faceImageKey = e.faceImageKey;
          createdAt = e.createdAt;
        };
        employeeStore.add(id, updated);
        true;
      };
    };
  };

  public shared func deleteEmployee(id : Text) : async Bool {
    switch (employeeStore.get(id)) {
      case null { false };
      case (?_) { employeeStore.remove(id); true };
    };
  };

  public query func getEmployees() : async [Employee] {
    employeeStore.values().toArray().map(v1ToEmployee);
  };

  public query func getEmployee(id : Text) : async ?Employee {
    switch (employeeStore.get(id)) {
      case null { null };
      case (?e) { ?v1ToEmployee(e) };
    };
  };

  // ----------------------------------------------------------------
  // Attendance APIs
  // ----------------------------------------------------------------

  public shared func markAttendance(id : Text, employeeId : Text, date : Text, status : Text, markedAt : Int) : async AttendanceRecord {
    let record : AttendanceRecord = { id; employeeId; date; status; markedAt };
    let key = employeeId # "_" # date;
    attendanceStore.add(key, record);
    record;
  };

  public query func getAttendanceByEmployee(employeeId : Text) : async [AttendanceRecord] {
    attendanceStore.values().toArray().filter(
      func(r : AttendanceRecord) : Bool { r.employeeId == employeeId }
    );
  };

  public query func getAttendanceByMonth(year : Text, month : Text) : async [AttendanceRecord] {
    let prefix = year # "-" # month;
    attendanceStore.values().toArray().filter(
      func(r : AttendanceRecord) : Bool { r.date.startsWith(#text prefix) }
    );
  };

  // ----------------------------------------------------------------
  // Holiday APIs
  // ----------------------------------------------------------------

  public shared func addHoliday(id : Text, date : Text, reason : Text, createdAt : Int) : async Holiday2 {
    let h : Holiday2 = { id; date; reason; createdAt };
    holidayStore.add(id, h);
    h;
  };

  public query func getHolidays() : async [Holiday2] {
    holidayStore.values().toArray();
  };

  public shared func removeHoliday(id : Text) : async Bool {
    switch (holidayStore.get(id)) {
      case null { false };
      case (?_) { holidayStore.remove(id); true };
    };
  };

  // ----------------------------------------------------------------
  // Salary Payment APIs
  // ----------------------------------------------------------------

  public shared func recordPayment(id : Text, employeeId : Text, amount : Nat, note : Text, paidAt : Int) : async SalaryPayment {
    let p : SalaryPayment = { id; employeeId; amount; note; paidAt };
    paymentStore.add(id, p);
    p;
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
