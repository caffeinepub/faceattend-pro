import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddHoliday,
  useHolidays,
  useRemoveHoliday,
} from "../../hooks/useQueries";

export default function HolidayManager() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const { data: holidays = [], isLoading } = useHolidays();
  const addMut = useAddHoliday();
  const removeMut = useRemoveHoliday();

  const handleAdd = async () => {
    if (!date || !reason.trim()) {
      toast.error("Please select a date and enter a reason");
      return;
    }
    try {
      await addMut.mutateAsync({ date, reason });
      toast.success("Holiday added");
      setDate("");
      setReason("");
    } catch {
      toast.error("Failed to add holiday");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this holiday?")) return;
    try {
      await removeMut.mutateAsync(id);
      toast.success("Holiday removed");
    } catch {
      toast.error("Failed to remove holiday");
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="w-4 h-4 text-primary" /> Add Holiday
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                data-ocid="holiday.date_input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Reason *</Label>
              <Input
                data-ocid="holiday.reason_input"
                placeholder="Holiday reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <Button
            data-ocid="holiday.add_button"
            onClick={handleAdd}
            disabled={addMut.isPending}
            className="w-full"
          >
            {addMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Holiday
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Holiday List ({holidays.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading...
            </p>
          ) : holidays.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="holiday.empty_state"
            >
              No holidays added yet
            </p>
          ) : (
            <div className="space-y-2">
              {holidays
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((h, i) => (
                  <div
                    key={h.id}
                    data-ocid={`holiday.item.${i + 1}`}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        {h.reason}
                      </p>
                      <p className="text-xs text-blue-600">
                        {new Date(h.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(h.id)}
                      data-ocid={`holiday.delete_button.${i + 1}`}
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
