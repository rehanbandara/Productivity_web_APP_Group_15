import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

import dayjs from "dayjs";

// MUI X pickers
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import useTaskStore from "../../store/taskStore";
import { getTaskAnalysis } from "./utils/priorityUtils";


const UI = {
  layout: {
    radius: 0,
    radiusLg: 0,
    borderWidth: "1px",
    sectionGap: 1.5,
    fieldGap: 3,
    padding: 1,
  },
  typography: {
    titleWeight: 900,
    sectionTitleWeight: 900,
    strongWeight: 900,
  },
  components: {
    buttonRadius: 1,
    chipWeight: 900,
    quadrantMinHeight: 84,
  },
};

const EMPTY_FORM = {
  title: "",
  plannedDate: "", 

  startTime: "", 
  endTime: "", 

  deadlineDate: "", 
  deadlineTime: "", 

  importance: "",
  effort: "",
  category: "",
  notes: "",
};

function toNumberOrNaN(v) {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function toIntOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function formatTimeHHmm(d) {
  if (!d) return "";
  const v = dayjs(d);
  return v.isValid() ? v.format("HH:mm") : "";
}

function parseTimeHHmmToDayjs(timeStr) {
  if (!timeStr) return null;
  const v = dayjs(`2000-01-01T${timeStr}`);
  return v.isValid() ? v : null;
}

function themedTextFieldSx(theme) {
  return {
    "& .MuiInputBase-root": { color: theme.custom.colors.textPrimary },
    "& .MuiInputLabel-root": { color: theme.custom.colors.textSecondary },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.custom.colors.borderDefault },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.custom.colors.borderAccent },
    "& .MuiFormHelperText-root": { color: theme.custom.colors.textSecondary },
  };
}

function SectionTitle({ icon, title, subtitle, rightSlot = null }) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={(theme) => ({ color: theme.custom.colors.borderAccent, display: "flex" })}>
              {icon}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: UI.typography.sectionTitleWeight }}>
              {title}
            </Typography>
          </Stack>
          {subtitle ? (
            <Typography sx={(theme) => ({ mt: 0.25, color: theme.custom.colors.textSecondary })}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {rightSlot ? <Box sx={{ pt: 0.25 }}>{rightSlot}</Box> : null}
      </Stack>
    </Box>
  );
}

function labelForQuadrant(q) {
  switch (q) {
    case "Q1":
      return "Do now";
    case "Q2":
      return "Schedule";
    case "Q3":
      return "Not important + Urgent";
    case "Q4":
      return "Not important + Not urgent";
    default:
      return "Not calculated";
  }
}

function chipMeta(analysis) {
  if (!analysis.isCalculated) return { label: "Not calculated", variant: "outlined" };
  return { label: labelForQuadrant(analysis.matrixQuadrant), variant: "filled" };
}

function chipSxForAnalysis(analysis, theme) {
  if (!analysis.isCalculated) {
    return {
      fontWeight: UI.components.chipWeight,
      color: theme.custom.colors.textPrimary,
      borderColor: theme.custom.colors.borderDefault,
      bgcolor: "transparent",
    };
  }

  const label = theme.custom.colors.label || {};
  const map = {
    Q1: { bgcolor: label.red || theme.custom.colors.danger, color: "#fff" },
    Q2: { bgcolor: label.green || theme.custom.colors.success, color: "#080705" },
    Q3: { bgcolor: label.yellow || theme.custom.colors.warning, color: "#080705" },
    Q4: { bgcolor: label.blue || theme.custom.colors.info, color: "#fff" },
  };

  return { fontWeight: UI.components.chipWeight, ...(map[analysis.matrixQuadrant] || {}) };
}

function quadrantCardSx({ active, quadrant, theme }) {
  const base = {
    p: 1.5,
    borderRadius: UI.layout.radius,
    border: `${UI.layout.borderWidth} solid`,
    borderColor: theme.custom.colors.borderDefault,
    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    minHeight: UI.components.quadrantMinHeight,
    transition: "all 120ms ease",
    color: theme.custom.colors.textPrimary,
  };

  if (!active) return base;

  const label = theme.custom.colors.label || {};
  const map = {
    Q1: {
      borderColor: label.red || theme.custom.colors.danger,
      bgcolor: theme.palette.mode === "dark" ? "rgba(217,30,54,0.14)" : "rgba(217,30,54,0.10)",
    },
    Q2: {
      borderColor: label.green || theme.custom.colors.success,
      bgcolor: theme.palette.mode === "dark" ? "rgba(22,163,74,0.14)" : "rgba(22,163,74,0.10)",
    },
    Q3: {
      borderColor: label.yellow || theme.custom.colors.warning,
      bgcolor: theme.palette.mode === "dark" ? "rgba(245,158,11,0.14)" : "rgba(245,158,11,0.10)",
    },
    Q4: {
      borderColor: label.blue || theme.custom.colors.info,
      bgcolor: theme.palette.mode === "dark" ? "rgba(24,143,167,0.14)" : "rgba(24,143,167,0.10)",
    },
  };

  return { ...base, ...(map[quadrant] || {}), boxShadow: 1 };
}

function QuadrantCard({ title, subtitle, active, quadrant }) {
  return (
    <Box sx={(theme) => quadrantCardSx({ active, quadrant, theme })}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
        {subtitle}
      </Typography>
    </Box>
  );
}

function formatDelta(target, now = dayjs()) {
  if (!target || !target.isValid()) return "";

  const diffMs = target.diff(now);
  const absMs = Math.abs(diffMs);

  const totalMinutes = Math.floor(absMs / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const mins = totalMinutes - days * 60 * 24 - hours * 60;

  const parts = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (!days && !hours) parts.push(`${mins} min${mins === 1 ? "" : "s"}`);
  else if (mins) parts.push(`${mins} min${mins === 1 ? "" : "s"}`);

  if (diffMs >= 0) return `in ${parts.join(" ")}`;
  return `passed (${parts.join(" ")} ago)`;
}

function AddTaskModal({ open, onClose, task, selectedDate }) {
  const { addTask, updateTask, tasks } = useTaskStore();
  const isEditMode = Boolean(task);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const todayLocal = dayjs().format("YYYY-MM-DD");

  const selectedPlannedDate = useMemo(() => {
    const d = selectedDate ? dayjs(selectedDate) : dayjs();
    return d.isValid() ? d.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
  }, [selectedDate]);

  const hasTimeSlot = Boolean(formData.startTime && formData.endTime);

  const plannedStartDateTime = useMemo(() => {
    if (!formData.plannedDate || !formData.startTime) return null;
    const dt = dayjs(`${formData.plannedDate}T${formData.startTime}`);
    return dt.isValid() ? dt : null;
  }, [formData.plannedDate, formData.startTime]);

  const deadlineDateTime = useMemo(() => {
    if (!formData.deadlineDate) return null;

    const time = formData.deadlineTime || "23:59";
    const dt = dayjs(`${formData.deadlineDate}T${time}`);
    return dt.isValid() ? dt : null;
  }, [formData.deadlineDate, formData.deadlineTime]);

  const workloadHours = useMemo(() => {
    const planned = formData.plannedDate || selectedPlannedDate;
    if (!planned) return 0;

    return (tasks || [])
      .filter((t) => t.status !== "done" && t.plannedDate === planned)
      .reduce((sum, t) => sum + (Number(t.effort) || 0), 0);
  }, [tasks, formData.plannedDate, selectedPlannedDate]);

  useEffect(() => {
    if (!open) return;

    if (task) {
      const oldDeadline = task.deadline ?? "";

      setFormData({
        title: task.title ?? "",
        plannedDate: task.plannedDate ?? selectedPlannedDate,

        startTime: task.startTime ?? "",
        endTime: task.endTime ?? "",

        deadlineDate: task.deadlineDate ?? oldDeadline ?? "",
        deadlineTime: task.deadlineTime ?? "",

        importance: task.importance ?? "",
        effort: task.effort ?? "",
        category: task.category ?? "",
        notes: task.notes ?? "",
      });
      setErrors({});
      setSubmitAttempted(false);
    } else {
      setFormData({
        ...EMPTY_FORM,
        plannedDate: selectedPlannedDate,
      });
      setErrors({});
      setSubmitAttempted(false);
    }
  }, [open, task, selectedPlannedDate]);

  const analysis = useMemo(() => {
    return getTaskAnalysis({
      importance: formData.importance,
      effortHours: formData.effort,
      deadline: formData.deadlineDate, 
      workloadHours,
      today: todayLocal,
      dailyCapacityHours: 5,
    });
  }, [formData.deadlineDate, formData.effort, formData.importance, workloadHours, todayLocal]);

  const resultChip = useMemo(() => {
    if (hasTimeSlot) return { label: "Scheduled Task", variant: "filled", scheduled: true };
    return { ...chipMeta(analysis), scheduled: false };
  }, [analysis, hasTimeSlot]);

  const setField = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const clearPlannedSchedule = () => {
    setFormData((p) => ({ ...p, startTime: "", endTime: "" }));
    setErrors((p) => ({ ...p, startTime: undefined, endTime: undefined }));
  };

  const clearDeadline = () => {
    setFormData((p) => ({ ...p, deadlineDate: "", deadlineTime: "" }));
    setErrors((p) => ({ ...p, deadlineDate: undefined, deadlineTime: undefined }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const validate = () => {
    const newErrors = {};


    if (!formData.title.trim()) newErrors.title = "Task title is required";
    if (!formData.plannedDate) newErrors.plannedDate = "Planned date is required";

    if (formData.startTime && !formData.endTime) newErrors.endTime = "End time is required if start time is set";
    if (!formData.startTime && formData.endTime) newErrors.startTime = "Start time is required if end time is set";
    if (formData.startTime && formData.endTime) {
      const s = parseTimeHHmmToDayjs(formData.startTime);
      const e = parseTimeHHmmToDayjs(formData.endTime);
      if (!s || !e) newErrors.startTime = "Invalid time format";
      else if (e.isSame(s) || e.isBefore(s)) newErrors.endTime = "End time must be after start time";
    }

 
    if (formData.deadlineTime && !formData.deadlineDate) {
      newErrors.deadlineDate = "Deadline date is required if deadline time is set";
    }
    if (formData.deadlineDate && formData.deadlineDate < todayLocal) {
      newErrors.deadlineDate = "Deadline date cannot be in the past";
    }


    if (formData.importance !== "" && formData.importance !== null) {
      const n = toNumberOrNaN(formData.importance);
      if (!Number.isFinite(n)) newErrors.importance = "Importance must be a number (1–10)";
      else if (!Number.isInteger(n)) newErrors.importance = "Importance must be a whole number (integer)";
      else if (n < 1 || n > 10) newErrors.importance = "Importance must be 1–10 (1 = highest)";
    }

    if (formData.effort !== "" && formData.effort !== null) {
      const n = toNumberOrNaN(formData.effort);
      if (!Number.isFinite(n)) newErrors.effort = "Effort must be a number (hours)";
      else if (n <= 0) newErrors.effort = "Effort must be a positive number (hours)";
      else if (n > 24) newErrors.effort = "Effort is too high (max 24 hours)";
    }

    if (formData.category && formData.category.length > 30) {
      newErrors.category = "Category is too long (max 30 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  setSubmitAttempted(true);
  if (!validate()) return;

  const intelligenceFields = analysis.isCalculated
    ? {
        isImportant: analysis.isImportant,
        isUrgent: analysis.isUrgent,
        isFeasibleToday: analysis.isFeasibleToday,
        matrixQuadrant: analysis.matrixQuadrant,
        matrixLabel: analysis.matrixLabel,
        matrixSortRank: analysis.matrixSortRank,
        priorityScore: analysis.priorityScore,
        recommendedAction: analysis.recommendedAction,
        reason: analysis.reason,
      }
    : {
        isImportant: null,
        isUrgent: null,
        isFeasibleToday: null,
        matrixQuadrant: null,
        matrixLabel: "Not calculated",
        matrixSortRank: 999,
        priorityScore: null,
        recommendedAction: "",
        reason: "",
      };

  const payload = {
    title: formData.title.trim(),

    plannedDate: formData.plannedDate,

    startTime: formData.startTime || "",
    endTime: formData.endTime || "",

    deadlineDate: formData.deadlineDate || "",
    deadlineTime: formData.deadlineTime || "",

    deadline: formData.deadlineDate || "",

    category: (formData.category || "").trim(),
    notes: formData.notes || "",

    effort: toIntOrNull(formData.effort),
    importance: toIntOrNull(formData.importance),

    priority: task?.priority || "normal",
    status: task?.status || "todo",

    ...intelligenceFields,
  };

  try {
    if (isEditMode) {
      await updateTask({ ...task, ...payload });
    } else {
      await addTask(payload); 
    }

    setFormData(EMPTY_FORM);
    setErrors({});
    setSubmitAttempted(false);
    onClose();
  } catch (e) {
    console.error(e);
  }
};

  const handleClose = () => {
    setErrors({});
    setSubmitAttempted(false);
    onClose();
  };

  const showValidationAlert = submitAttempted && Object.keys(errors).length > 0;

  const plannedCountdownText = useMemo(() => {
    if (!hasTimeSlot || !plannedStartDateTime) return "";
    return formatDelta(plannedStartDateTime, dayjs());
  }, [hasTimeSlot, plannedStartDateTime]);

  const deadlineCountdownText = useMemo(() => {
    if (!deadlineDateTime) return "";
    return formatDelta(deadlineDateTime, dayjs());
  }, [deadlineDateTime]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: (theme) => ({
            borderRadius: UI.layout.radiusLg,
            border: `${UI.layout.borderWidth} solid`,
            borderColor: theme.custom.colors.borderAccent,
            bgcolor: theme.custom.colors.appBg,
            color: theme.custom.colors.textPrimary,
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            fontWeight: UI.typography.titleWeight,
            bgcolor: theme.custom.colors.surface1,
            borderBottom: `${UI.layout.borderWidth} solid ${theme.custom.colors.divider}`,
          })}
        >
          {isEditMode ? "Edit task" : "Add task"}
        </DialogTitle>

        <DialogContent
          dividers
          sx={(theme) => ({
            bgcolor: theme.custom.colors.appBg,
            borderColor: theme.custom.colors.divider,
          })}
        >
          <Stack spacing={UI.layout.sectionGap}>
            {showValidationAlert ? (
              <Alert
                severity="warning"
                icon={<WarningAmberOutlinedIcon fontSize="inherit" />}
                sx={(theme) => ({
                  border: "1px solid",
                  borderColor: theme.custom.colors.warning,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
                  color: theme.custom.colors.textPrimary,
                  "& .MuiAlert-message": { color: theme.custom.colors.textPrimary },
                })}
              >
                Please fill the highlighted fields and try again.
              </Alert>
            ) : null}

           

            <Stack direction={{ xs: "column", md: "row" }} spacing={UI.layout.fieldGap}>
              <TextField
                label="Task title *"
                fullWidth
                name="title"
                value={formData.title}
                onChange={(e) => setField("title", e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                autoFocus
                sx={(theme) => themedTextFieldSx(theme)}
                InputProps={{
                  startAdornment: (
                    <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                      <TitleOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />

              <TextField
                label="Category / Tag"
                placeholder="e.g., #Study"
                fullWidth
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={Boolean(errors.category)}
                helperText={errors.category}
                sx={(theme) => themedTextFieldSx(theme)}
                InputProps={{
                  startAdornment: (
                    <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                      <LocalOfferOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Stack>

            <SectionTitle
              icon={<EventAvailableOutlinedIcon fontSize="small" />}
              title="Planned schedule"
              rightSlot={
                <Button
                  size="small"
                  variant="outlined"
                  onClick={clearPlannedSchedule}
                  startIcon={<RestartAltOutlinedIcon fontSize="small" />}
                  sx={(theme) => ({
                    borderRadius: 2,
                    fontWeight: 900,
                    borderColor: theme.custom.colors.borderDefault,
                    color: theme.custom.colors.textPrimary,
                    "&:hover": {
                      borderColor: theme.custom.colors.borderAccent,
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    },
                  })}
                >
                  Clear time slot
                </Button>
              }
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={UI.layout.fieldGap}>
              <DatePicker
                label="Planned for *"
                value={formData.plannedDate ? dayjs(formData.plannedDate) : null}
                onChange={(newValue) => {
                  const v = newValue && dayjs(newValue).isValid() ? dayjs(newValue).format("YYYY-MM-DD") : "";
                  setField("plannedDate", v);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.plannedDate),
                    helperText: errors.plannedDate || "",
                    sx: (theme) => themedTextFieldSx(theme),
                    onClick: (e) => e.currentTarget.querySelector("input")?.focus(),
                    InputProps: {
                      startAdornment: (
                        <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                          <EventOutlinedIcon fontSize="small" />
                        </Box>
                      ),
                    },
                  },
                }}
              />

              <TimePicker
                label="Start time (optional)"
                value={parseTimeHHmmToDayjs(formData.startTime)}
                onChange={(newValue) => setField("startTime", formatTimeHHmm(newValue))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.startTime),
                    helperText: errors.startTime || "",
                    sx: (theme) => themedTextFieldSx(theme),
                    onClick: (e) => e.currentTarget.querySelector("input")?.focus(),
                    InputProps: {
                      startAdornment: (
                        <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                          <AccessTimeOutlinedIcon fontSize="small" />
                        </Box>
                      ),
                    },
                  },
                }}
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={UI.layout.fieldGap}>
              <TimePicker
                label="End time (optional)"
                value={parseTimeHHmmToDayjs(formData.endTime)}
                onChange={(newValue) => setField("endTime", formatTimeHHmm(newValue))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.endTime),
                    helperText: errors.endTime || "",
                    sx: (theme) => themedTextFieldSx(theme),
                    onClick: (e) => e.currentTarget.querySelector("input")?.focus(),
                    InputProps: {
                      startAdornment: (
                        <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                          <AccessTimeOutlinedIcon fontSize="small" />
                        </Box>
                      ),
                    },
                  },
                }}
              />

              <Box />
            </Stack>

            {hasTimeSlot && plannedCountdownText ? (
              <Alert
                severity="info"
                sx={(theme) => ({
                  border: "1px solid",
                  borderColor: theme.custom.colors.info,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(24,143,167,0.10)" : "rgba(24,143,167,0.08)",
                  color: theme.custom.colors.textPrimary,
                })}
              >
                <Typography sx={{ fontWeight: 900 }}>Time until start</Typography>
                <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, mt: 0.25 })}>
                  {plannedCountdownText}
                </Typography>
              </Alert>
            ) : null}

            <Divider sx={(theme) => ({ borderColor: theme.custom.colors.divider })} />

            {/* Deadline */}
            <SectionTitle
              icon={<EventBusyOutlinedIcon fontSize="small" />}
              title="Deadline"
              subtitle=""
              rightSlot={
                <Button
                  size="small"
                  variant="outlined"
                  onClick={clearDeadline}
                  startIcon={<RestartAltOutlinedIcon fontSize="small" />}
                  sx={(theme) => ({
                    borderRadius: 2,
                    fontWeight: 900,
                    borderColor: theme.custom.colors.borderDefault,
                    color: theme.custom.colors.textPrimary,
                    "&:hover": {
                      borderColor: theme.custom.colors.borderAccent,
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    },
                  })}
                >
                  Clear deadline
                </Button>
              }
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={UI.layout.fieldGap}>
              <DatePicker
                label="Deadline date (optional)"
                value={formData.deadlineDate ? dayjs(formData.deadlineDate) : null}
                onChange={(newValue) => {
                  const v = newValue && dayjs(newValue).isValid() ? dayjs(newValue).format("YYYY-MM-DD") : "";
                  setField("deadlineDate", v);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.deadlineDate),
                    helperText: errors.deadlineDate || "",
                    sx: (theme) => themedTextFieldSx(theme),
                    onClick: (e) => e.currentTarget.querySelector("input")?.focus(),
                    InputProps: {
                      startAdornment: (
                        <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                          <EventBusyOutlinedIcon fontSize="small" />
                        </Box>
                      ),
                    },
                  },
                  field: { clearable: true },
                }}
              />

              <TimePicker
                label="Deadline time (optional)"
                value={parseTimeHHmmToDayjs(formData.deadlineTime)}
                onChange={(newValue) => setField("deadlineTime", formatTimeHHmm(newValue))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.deadlineTime),
                    helperText: errors.deadlineTime || "",
                    sx: (theme) => themedTextFieldSx(theme),
                    onClick: (e) => e.currentTarget.querySelector("input")?.focus(),
                    InputProps: {
                      startAdornment: (
                        <Box sx={(theme) => ({ mr: 1, color: theme.custom.colors.textSecondary })}>
                          <AccessTimeOutlinedIcon fontSize="small" />
                        </Box>
                      ),
                    },
                  },
                  field: { clearable: true },
                }}
              />
            </Stack>

            {deadlineDateTime && deadlineCountdownText ? (
              <Alert
                severity={deadlineDateTime.isBefore(dayjs()) ? "error" : "warning"}
                sx={(theme) => ({
                  border: "1px solid",
                  borderColor: deadlineDateTime.isBefore(dayjs())
                    ? theme.custom.colors.danger
                    : theme.custom.colors.warning,
                  bgcolor: deadlineDateTime.isBefore(dayjs())
                    ? theme.palette.mode === "dark"
                      ? "rgba(217,30,54,0.12)"
                      : "rgba(217,30,54,0.10)"
                    : theme.palette.mode === "dark"
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(245,158,11,0.10)",
                  color: theme.custom.colors.textPrimary,
                })}
              >
                <Typography sx={{ fontWeight: 900 }}>Time until deadline</Typography>
                <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, mt: 0.25 })}>
                  {deadlineCountdownText}
                </Typography>
              </Alert>
            ) : null}

            <Divider sx={(theme) => ({ borderColor: theme.custom.colors.divider })} />

            {/* Priority inputs (optional) */}
            <SectionTitle
              icon={<InsightsOutlinedIcon fontSize="small" />}
              title="Priority inputs (optional)"
              subtitle="1 = Highest priority  |  10 = Lowest priority "
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={UI.layout.fieldGap}>
              <TextField
                label="Importance (1–10)"
                type="number"
                fullWidth
                name="importance"
                value={formData.importance}
                onChange={handleChange}
                error={Boolean(errors.importance)}
                helperText={errors.importance}
                inputProps={{ min: 1, max: 10, step: 1 }}
                sx={(theme) => themedTextFieldSx(theme)}
              />

              <TextField
                label="Effort (hours)"
                type="number"
                fullWidth
                name="effort"
                value={formData.effort}
                onChange={handleChange}
                error={Boolean(errors.effort)}
                helperText={errors.effort}
                inputProps={{ min: 0.25, step: 0.25, max: 24 }}
                sx={(theme) => themedTextFieldSx(theme)}
              />
            </Stack>

            {/* Result + matrix */}
            <Paper
              elevation={0}
              sx={(theme) => ({
                p: UI.layout.padding,
                borderRadius: UI.layout.radius,
                border: `${UI.layout.borderWidth} solid`,
                borderColor: theme.custom.colors.borderDefault,
                bgcolor: theme.custom.colors.surface1,
                color: theme.custom.colors.textPrimary,
              })}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  
                  </Typography>

                  {hasTimeSlot ? (
                    <Typography sx={(theme) => ({ mt: 0.25, color: theme.custom.colors.textSecondary })}>
                      
                    </Typography>
                  ) : (
                    <Typography sx={(theme) => ({ mt: 0.25, color: theme.custom.colors.textSecondary })}>
                      {analysis.reason}
                    </Typography>
                  )}

                  {!hasTimeSlot && analysis.isCalculated ? (
                    <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 800 }}>
                      Recommended: {analysis.recommendedAction}
                    </Typography>
                  ) : null}

                  {!hasTimeSlot && !analysis.isCalculated ? (
                    <Typography
                      variant="body2"
                      sx={(theme) => ({ mt: 0.75, color: theme.custom.colors.textSecondary })}
                    >
                      Fill Importance + Effort + Deadline date to calculate the matrix...
                    </Typography>
                  ) : null}
                </Box>

                <Stack alignItems="flex-end" spacing={1}>
                  <Chip
                    label={resultChip.label}
                    variant={resultChip.variant}
                    sx={(theme) => {
                      if (resultChip.scheduled) {
                        return {
                          fontWeight: UI.components.chipWeight,
                          bgcolor: theme.custom.colors.info,
                          color: "#fff",
                        };
                      }
                      return chipSxForAnalysis(analysis, theme);
                    }}
                  />
                  {analysis.isCalculated ? (
                    <Typography
                      variant="caption"
                      sx={(theme) => ({ fontWeight: 700, color: theme.custom.colors.textSecondary })}
                    >
                      Score: {analysis.priorityScore}/100
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>

              {analysis.isCalculated ? (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25,
                  }}
                >
                  <QuadrantCard
                    quadrant="Q1"
                    active={analysis.matrixQuadrant === "Q1"}
                    title="Do now"
                    subtitle="Important + Urgent"
                  />
                  <QuadrantCard
                    quadrant="Q2"
                    active={analysis.matrixQuadrant === "Q2"}
                    title="Schedule"
                    subtitle="Important + Not urgent"
                  />
                  <QuadrantCard
                    quadrant="Q3"
                    active={analysis.matrixQuadrant === "Q3"}
                    title="Not important + Urgent"
                    subtitle=""
                  />
                  <QuadrantCard
                    quadrant="Q4"
                    active={analysis.matrixQuadrant === "Q4"}
                    title="Not important + Not urgent"
                    subtitle=""
                  />
                </Box>
              ) : null}
            </Paper>

            <Divider sx={(theme) => ({ borderColor: theme.custom.colors.divider })} />

            {/* Notes */}
            <SectionTitle icon={<NotesOutlinedIcon fontSize="small" />} title="Notes (optional)" subtitle="" />
            <TextField
              label="Notes"
              placeholder=""
              fullWidth
              multiline
              minRows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              sx={(theme) => themedTextFieldSx(theme)}
              InputProps={{
                startAdornment: (
                  <Box sx={(theme) => ({ mr: 1, mt: 0.5, color: theme.custom.colors.textSecondary })}>
                    <NotesOutlinedIcon fontSize="small" />
                  </Box>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            p: UI.layout.padding,
            bgcolor: theme.custom.colors.appBg,
            borderTop: `${UI.layout.borderWidth} solid ${theme.custom.colors.divider}`,
          })}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={(theme) => ({
              borderRadius: UI.components.buttonRadius,
              color: theme.custom.colors.textPrimary,
              borderColor: theme.custom.colors.borderDefault,
              "&:hover": {
                borderColor: theme.custom.colors.borderAccent,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              },
            })}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={(theme) => ({
              borderRadius: UI.components.buttonRadius,
              fontWeight: 900,
              bgcolor: theme.custom.colors.primaryBtnBg,
              color: theme.custom.colors.primaryBtnText,
              "&:hover": { bgcolor: theme.custom.colors.primaryBtnHoverBg },
            })}
          >
            {isEditMode ? "Save changes" : "Add task"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default AddTaskModal;