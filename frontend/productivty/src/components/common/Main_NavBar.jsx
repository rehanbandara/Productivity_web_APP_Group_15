import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";

/* =========================================================
   UI CUSTOMIZATION (Main_NavBar)
   - Layout knobs stay here (safe)
   - Colors come from theme tokens (theme.custom.colors)
   ========================================================= */
const LAYOUT = {
    borderRadius: 0.9,
    borderWidth: "1px",
    py: 1.25,
    px: { xs: 2, md: 2.5 },
    gapBetweenBrandAndLinks: 2,
    gapBetweenLinks: 0.5,
    linkPx: 1.25,
};

const TYPO = {
    brandFontWeight: 1000,
    brandLetterSpacing: 0.3,
    linkFontWeight: 900,
    linkTextTransform: "none",
};

function Main_NavBar({ brand = "Productivity", rightSlot = null }) {
    const location = useLocation();

    const links = [
        { label: "Task Management", to: "/planner" },
        { label: "NotePad", to: "/notepad" }, // (route not created yet; you can add later)
        { label: "Focus&Wellness", to: "/f" },
        { label: "Files", to: "/f" },
        { label: "Settings", to: "/settings" },
    ];

    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                mb: 2,
                px: LAYOUT.px,
                py: LAYOUT.py,
                borderRadius: LAYOUT.borderRadius,
                border: `${LAYOUT.borderWidth} solid`,
                borderColor: theme.custom.colors.borderAccent,
                bgcolor: theme.custom.colors.appBg,
                color: theme.custom.colors.textPrimary,
            })}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                {/* Left: Brand + Links */}
                <Stack direction="row" spacing={LAYOUT.gapBetweenBrandAndLinks} alignItems="center">
                    <Typography
                        sx={(theme) => ({
                            fontWeight: TYPO.brandFontWeight,
                            letterSpacing: TYPO.brandLetterSpacing,
                            color: theme.custom.colors.textPrimary,
                        })}
                    >
                        {brand}
                    </Typography>

                    <Stack direction="row" spacing={LAYOUT.gapBetweenLinks} alignItems="center">
                        {links.map((l) => {
                            const isActive =
                                l.to === "/planner"
                                    ? location.pathname.startsWith("/planner")
                                    : location.pathname === l.to;

                            return (
                                <Button
                                    key={l.to}
                                    component={RouterNavLink}
                                    to={l.to}
                                    variant="text"
                                    sx={(theme) => ({
                                        color: isActive
                                            ? theme.custom.colors.success // active link color
                                            : theme.custom.colors.textSecondary,
                                        fontWeight: TYPO.linkFontWeight,
                                        textTransform: TYPO.linkTextTransform,
                                        px: LAYOUT.linkPx,
                                        borderRadius: theme.custom.radius.md,
                                        "&:hover": {
                                            bgcolor:
                                                theme.palette.mode === "dark"
                                                    ? "rgba(255,255,255,0.08)"
                                                    : "rgba(0,0,0,0.06)",
                                        },
                                    })}
                                >
                                    {l.label}
                                </Button>
                            );
                        })}
                    </Stack>
                </Stack>

                {/* Right slot */}
                <Box>{rightSlot}</Box>
            </Stack>
        </Paper>
    );
}

export default Main_NavBar;