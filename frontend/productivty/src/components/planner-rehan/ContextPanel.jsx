import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import dayjs from "dayjs";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const UI = {
    layout: {
        radius: 2,
        padding: 2,
        sectionGap: 2,
        buttonRadius: 999,
        dividerMb: 1.5,
    },

    typography: {
        titleWeight: 900,
        labelWeight: 800,
    },
};

function getGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function ContextPanel({ onOpenModal, selectedDate, setSelectedDate }) {
    const greeting = useMemo(() => getGreeting(new Date()), []);

    const [now, setNow] = useState(() => dayjs());
    useEffect(() => {
        const t = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(t);
    }, []);

    const today = useMemo(() => dayjs(), [now]); 
    const isTodaySelected = Boolean(selectedDate) && selectedDate.isSame(today, "day");

    // Include YEAR
    const todayLabel = now.format("dddd, MMM D, YYYY");
    const currentTimeLabel = now.format("hh:mm:ss A");

    const selectedLabel = selectedDate ? selectedDate.format("dddd, MMM D, YYYY") : "—";

    const paperSx = (theme) => ({
        p: UI.layout.padding,
        borderRadius: UI.layout.radius,
        border: "1px solid",
        borderColor: theme.custom.colors.borderDefault,
        bgcolor: theme.custom.colors.surface1,
        color: theme.custom.colors.textPrimary,
    });

    return (
        <Stack spacing={UI.layout.sectionGap}>
            {/* Section A: Today + current time */}
            <Paper elevation={0} sx={paperSx}>
                <Typography variant="subtitle1" sx={{ fontWeight: UI.typography.titleWeight, mb: 1 }}>
                    {greeting}
                </Typography>

                <Divider sx={(theme) => ({ mb: UI.layout.dividerMb, borderColor: theme.custom.colors.divider })} />

                <Stack spacing={0.75}>
                    <Box sx={{ display: "flex",  gap: 2 }}>
                        <Typography variant="body2" sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Today is
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: UI.typography.labelWeight }}>
                            {todayLabel}
                        </Typography>

                        <Typography variant="body2" sx={{ fontWeight: UI.typography.labelWeight }}>
                            {currentTimeLabel}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex",  gap: 2, alignItems: "center" }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            
                            
                        </Stack>

                    </Box>

                    <Box sx={{ display: "flex",  gap: 2 }}>
                        <Typography variant="body2" sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Selected Date :
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: UI.typography.labelWeight }}>
                            {selectedLabel}
                        </Typography>
                    </Box>

                    <Button
                        variant={isTodaySelected ? "outlined" : "contained"}
                        startIcon={<TodayOutlinedIcon />}
                        onClick={() => setSelectedDate(today)}
                        sx={(theme) => ({
                            mt: 1,
                            borderRadius: UI.layout.buttonRadius,
                            fontWeight: 900,
                            ...(isTodaySelected
                                ? {
                                    color: theme.custom.colors.textPrimary,
                                    borderColor: theme.custom.colors.borderDefault,
                                    "&:hover": {
                                        borderColor: theme.custom.colors.borderAccent,
                                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                    },
                                }
                                : {
                                    bgcolor: theme.custom.colors.primaryBtnBg,
                                    color: theme.custom.colors.primaryBtnText,
                                    "&:hover": { bgcolor: theme.custom.colors.primaryBtnHoverBg },
                                }),
                        })}
                        fullWidth
                    >
                        Go to today
                    </Button>
                </Stack>
            </Paper>

            {/* Section B: Calendar */}
            <Paper elevation={0} sx={paperSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarMonthOutlinedIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: UI.typography.titleWeight }}>
                        Calendar
                    </Typography>
                </Box>

               

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <DatePicker
                            label="Select date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{
                                textField: { fullWidth: true, size: "small" },
                            }}
                        />

                        <Typography variant="caption" sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            
                        </Typography>
                    </Box>
                </LocalizationProvider>
            </Paper>

            {/* Section C: Actions */}
            <Paper elevation={0} sx={paperSx}>
                
                

                <Stack spacing={1.25}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onOpenModal}
                        sx={(theme) => ({
                            borderRadius: UI.layout.buttonRadius,
                            fontWeight: 900,
                            bgcolor: theme.custom.colors.primaryBtnBg,
                            color: theme.custom.colors.primaryBtnText,
                            "&:hover": { bgcolor: theme.custom.colors.primaryBtnHoverBg },
                        })}
                    >
                        Add Task
                    </Button>

                   
                </Stack>
            </Paper>
        </Stack>
    );
}

export default ContextPanel;