import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../../backend.d";
import {
  useDeleteEmployee,
  useEmployees,
  useRegisterEmployee,
  useUpdateEmployee,
} from "../../hooks/useQueries";

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const EMPTY_FORM = {
  id: "",
  name: "",
  department: "",
  phone: "",
  monthlySalary: "",
};

export default function EmployeeList() {
  const { data: employees = [], isLoading } = useEmployees();
  const registerMut = useRegisterEmployee();
  const updateMut = useUpdateEmployee();
  const deleteMut = useDeleteEmployee();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingEmp(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setForm({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      phone: emp.phone,
      monthlySalary: String(Number(emp.monthlySalary)),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.name || !form.department || !form.monthlySalary) {
      toast.error("Please fill all required fields");
      return;
    }
    const salary = Number.parseFloat(form.monthlySalary);
    if (Number.isNaN(salary) || salary <= 0) {
      toast.error("Enter a valid monthly salary");
      return;
    }
    try {
      if (editingEmp) {
        await updateMut.mutateAsync({
          id: form.id,
          name: form.name,
          department: form.department,
          phone: form.phone,
          monthlySalary: salary,
        });
        toast.success("Employee updated");
      } else {
        await registerMut.mutateAsync({
          id: form.id,
          name: form.name,
          department: form.department,
          phone: form.phone,
          monthlySalary: salary,
          joinDate: new Date().toISOString().slice(0, 10),
        });
        toast.success("Employee registered");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success("Employee removed");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete");
    }
  };

  const isSaving = registerMut.isPending || updateMut.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {employees.length} registered employees
          </p>
        </div>
        <Button data-ocid="employees.add_button" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Employee
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-ocid="employees.search_input"
          placeholder="Search by name, department, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="employees.loading_state">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-14 text-muted-foreground"
              data-ocid="employees.empty_state"
            >
              <p className="text-sm">
                {search
                  ? "No employees match your search"
                  : "No employees yet - add your first employee"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                      Employee
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                      Dept
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Monthly
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                      Daily
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, idx) => (
                    <tr
                      key={emp.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`employees.item.${idx + 1}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {emp.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {emp.department}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {emp.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {fmtCurrency(Number(emp.monthlySalary))}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                        {fmtCurrency(
                          Math.round(Number(emp.monthlySalary) / 26),
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            data-ocid={`employees.edit_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(emp)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            data-ocid={`employees.delete_button.${idx + 1}`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(emp)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="employees.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingEmp ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Employee ID *</Label>
                <Input
                  data-ocid="employees.id.input"
                  placeholder="Employee ID"
                  value={form.id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id: e.target.value }))
                  }
                  disabled={!!editingEmp}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  data-ocid="employees.name.input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select
                  value={form.department}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, department: val }))
                  }
                >
                  <SelectTrigger data-ocid="employees.department.input">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  data-ocid="employees.phone.input"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Salary (₹) *</Label>
              <Input
                data-ocid="employees.salary.input"
                placeholder="Amount"
                type="number"
                value={form.monthlySalary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlySalary: e.target.value }))
                }
              />
            </div>
            {form.monthlySalary &&
              !Number.isNaN(Number.parseFloat(form.monthlySalary)) && (
                <p className="text-xs text-muted-foreground">
                  Daily rate:{" "}
                  {fmtCurrency(
                    Math.round(Number.parseFloat(form.monthlySalary) / 26),
                  )}{" "}
                  (monthly ÷ 26 working days)
                </p>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="employees.dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="employees.dialog.submit_button"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingEmp ? "Save Changes" : "Register Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="employees.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>{" "}
              and all their records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="employees.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
