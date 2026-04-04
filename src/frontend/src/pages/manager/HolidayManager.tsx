import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX2, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddHoliday,
  useHolidays,
  useRemoveHoliday,
} from "../../hooks/useQueries";

export default function HolidayManager() {
  const { data: holidays = [], isLoading } = useHolidays();
  const addMut = useAddHoliday();
  const removeMut = useRemoveHoliday();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async () => {
    if (!date || !reason.trim()) {
      toast.error("Please select a date and enter a reason");
      return;
    }
    try {
      await addMut.mutateAsync({ date, reason: reason.trim() });
      toast.success("Holiday added");
      setDate("");
      setReason("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add holiday");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMut.mutateAsync(id);
      toast.success("Holiday removed");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove");
    }
  };

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-bold text-2xl">Holiday Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add and manage company holidays
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Holiday</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="space-y-1.5 flex-1">
                <Label>Date</Label>
                <Input
                  data-ocid="holidays.date.input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label>Reason</Label>
                <Input
                  data-ocid="holidays.reason.input"
                  placeholder="e.g. Diwali, Republic Day"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div className="flex items-end">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    data-ocid="holidays.add_button"
                    onClick={handleAdd}
                    disabled={addMut.isPending}
                    className="w-full"
                  >
                    {addMut.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1.5" />
                    )}{" "}
                    Add Holiday
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="rounded-xl">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <CalendarX2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">
              Holidays ({holidays.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3" data-ocid="holidays.loading_state">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
            ) : sorted.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="holidays.empty_state"
              >
                <CalendarX2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No holidays added yet</p>
              </div>
            ) : (
              <div className="divide-y">
                <AnimatePresence>
                  {sorted.map((h, idx) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16, height: 0 }}
                      transition={{ duration: 0.28, delay: idx * 0.05 }}
                      className="flex items-center justify-between px-5 py-3"
                      data-ocid={`holidays.item.${idx + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center"
                        >
                          <CalendarX2 className="w-4 h-4 text-warning-foreground" />
                        </motion.div>
                        <div>
                          <div className="font-medium text-sm">{h.reason}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(`${h.date}T00:00:00`).toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          data-ocid={`holidays.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(h.id)}
                          disabled={removeMut.isPending}
                        >
                          {removeMut.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
