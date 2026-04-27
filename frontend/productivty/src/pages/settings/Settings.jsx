import React from "react";
import {
    Box,
    Divider,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Button,
} from "@mui/material";

import { useAppTheme } from "../../theme/ThemeController";
import { ACCENTS } from "../../theme/themes";
import Main_NavBar from "../../components/common/Main_NavBar"; 

const UI = {
    layout: {
        maxWidth: 980,
        pagePadding: { xs: 2, md: 3 },
        headerPadding: 2.0,
        cardPadding: 2.0,
        sectionRadius: 2,
        sectionGap: 2,
    },
    typography: {
        titleWeight: 900,
        sectionTitleWeight: 900,
        labelWeight: 900,
    },
    accents: {
        dotSize: 22,
        buttonSize: 44,
    },
};

function AccentDot({ accentKey, active, onClick }) {
    const accent = ACCENTS[accentKey];

    return (
        <Button
            onClick={onClick}
            aria-label={`accent-${accentKey}`}
            sx={(theme) => ({
                minWidth: 0,
                width: UI.accents.buttonSize,
                height: UI.accents.buttonSize,
                borderRadius: 999,
                border: "2px solid",
                borderColor: active ? theme.custom.colors.borderAccent : theme.custom.colors.borderDefault,
                bgcolor: "transparent",
                p: 0,
                "&:hover": {
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                },
            })}
        >
            <Box
                sx={{
                    width: UI.accents.dotSize,
                    height: UI.accents.dotSize,
                    borderRadius: 999,
                    bgcolor: accent.primary,
                    boxShadow: active ? "0 0 0 3px rgba(0,0,0,0.12)" : "none",
                }}
            />
        </Button>
    );
}

function Settings() {
    const { preferences, setMode, setAccent, setFontScale, setRadiusScale } = useAppTheme();

    const toggleGroupSx = {
        "& .MuiToggleButton-root": (theme) => ({
            borderColor: theme.custom.colors.borderDefault,
            color: theme.custom.colors.textPrimary,
            fontWeight: 900,
            textTransform: "none",
            px: 2,
            borderRadius: 2,
        }),
        "& .MuiToggleButton-root.Mui-selected": (theme) => ({
            borderColor: theme.custom.colors.borderAccent,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        }),
    };

    return (
        <Box
            sx={(theme) => ({
                minHeight: "100vh",
                bgcolor: theme.custom.colors.appBg,
                px: UI.layout.pagePadding,
                py: UI.layout.pagePadding,
            })}
        >
            <Box sx={{ maxWidth: UI.layout.maxWidth, mx: "auto" }}>

                <Main_NavBar />

                {/* Header */}
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: UI.layout.headerPadding,
                        borderRadius: UI.layout.sectionRadius,
                        border: "1px solid",
                        borderColor: theme.custom.colors.borderDefault,
                        bgcolor: theme.custom.colors.surface1,
                        color: theme.custom.colors.textPrimary,
                    })}
                >
                    <Typography variant="h6" sx={{ fontWeight: UI.typography.titleWeight }}>
                        Settings
                    </Typography>
                    <Typography sx={(theme) => ({ mt: 0.5, color: theme.custom.colors.textSecondary })}>
                        Appearance options (theme, accent, font size, and radius). Saved automatically.
                    </Typography>
                </Paper>

                {/* Appearance card */}
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        mt: 2,
                        p: UI.layout.cardPadding,
                        borderRadius: UI.layout.sectionRadius,
                        border: "1px solid",
                        borderColor: theme.custom.colors.borderDefault,
                        bgcolor: theme.custom.colors.surface1,
                        color: theme.custom.colors.textPrimary,
                    })}
                >
                    <Typography sx={{ fontWeight: UI.typography.sectionTitleWeight }}>Appearance</Typography>
                    <Typography sx={(theme) => ({ mt: 0.5, color: theme.custom.colors.textSecondary })}>
                        Customize how the whole platform looks without breaking readability.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Theme */}
                    <Stack spacing={0.75}>
                        <Typography sx={{ fontWeight: UI.typography.labelWeight }}>Theme</Typography>
                        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Select your default theme (Dark / System Default / Light).
                        </Typography>

                        <ToggleButtonGroup
                            exclusive
                            value={preferences.mode}
                            onChange={(_, v) => v && setMode(v)}
                            sx={toggleGroupSx}
                        >
                            <ToggleButton value="dark">Dark</ToggleButton>
                            <ToggleButton value="system">System Default</ToggleButton>
                            <ToggleButton value="light">Light</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Accent */}
                    <Stack spacing={0.75}>
                        <Typography sx={{ fontWeight: UI.typography.labelWeight }}>Accent Color</Typography>
                        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Highlight color for borders and main actions (buttons).
                        </Typography>

                        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                            {Object.keys(ACCENTS).map((k) => (
                                <AccentDot
                                    key={k}
                                    accentKey={k}
                                    active={preferences.accent === k}
                                    onClick={() => setAccent(k)}
                                />
                            ))}
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Font size */}
                    <Stack spacing={0.75}>
                        <Typography sx={{ fontWeight: UI.typography.labelWeight }}>Font size</Typography>
                        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Change overall scale (safe range).
                        </Typography>

                        <ToggleButtonGroup
                            exclusive
                            value={preferences.fontScale}
                            onChange={(_, v) => v && setFontScale(v)}
                            sx={toggleGroupSx}
                        >
                            <ToggleButton value={0.9}>Small</ToggleButton>
                            <ToggleButton value={1.0}>Normal</ToggleButton>
                            <ToggleButton value={1.1}>Large</ToggleButton>
                            <ToggleButton value={1.2}>XL</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Radius */}
                    <Stack spacing={0.75}>
                        <Typography sx={{ fontWeight: UI.typography.labelWeight }}>Corner radius</Typography>
                        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
                            Make UI sharper or rounder.
                        </Typography>

                        <ToggleButtonGroup
                            exclusive
                            value={preferences.radiusScale}
                            onChange={(_, v) => v && setRadiusScale(v)}
                            sx={toggleGroupSx}
                        >
                            <ToggleButton value={0.85}>Sharp</ToggleButton>
                            <ToggleButton value={1.0}>Normal</ToggleButton>
                            <ToggleButton value={1.15}>Round</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
}

export default Settings;