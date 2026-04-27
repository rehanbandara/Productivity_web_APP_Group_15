import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import {
    DEFAULT_PREFERENCES,
    buildTokens,
    resolveMode,
    getAccentByName,
    ACCENTS,
} from "./themes";


const STORAGE_KEY = "productivty.theme.preferences";

function safeParse(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function clampFontScale(v) {
    const allowed = [0.9, 1.0, 1.1, 1.2];
    return allowed.includes(v) ? v : 1.0;
}

function clampRadiusScale(v) {
    const allowed = [0.85, 1.0, 1.15];
    return allowed.includes(v) ? v : 1.0;
}

function sanitizePreferences(prefs) {
    const mode = prefs?.mode === "dark" || prefs?.mode === "light" || prefs?.mode === "system"
        ? prefs.mode
        : DEFAULT_PREFERENCES.mode;

    const accent = ACCENTS[prefs?.accent] ? prefs.accent : DEFAULT_PREFERENCES.accent;

    return {
        mode,
        accent,
        fontScale: clampFontScale(Number(prefs?.fontScale)),
        radiusScale: clampRadiusScale(Number(prefs?.radiusScale)),
    };
}

function buildMuiTheme(tokens) {
    const muiTheme = createTheme({
        palette: {
            mode: tokens.mode,

            background: {
                default: tokens.colors.appBg,
                paper: tokens.colors.surface1,
            },

            text: {
                primary: tokens.colors.textPrimary,
                secondary: tokens.colors.textSecondary,
            },

            primary: {
                main: tokens.colors.primaryBtnBg,
                contrastText: tokens.colors.primaryBtnText,
            },

            divider: tokens.colors.divider,

            error: { main: tokens.colors.danger },
            warning: { main: tokens.colors.warning },
            success: { main: tokens.colors.success },
            info: { main: tokens.colors.info },
        },

        shape: {
            borderRadius: tokens.radius.md,
        },

        typography: {
            fontFamily: tokens.typography.fontFamily,
            fontSize: Math.round(14 * tokens.typography.fontScale),
            button: { textTransform: "none", fontWeight: tokens.typography.weight.strong },
            h5: { fontWeight: tokens.typography.weight.heavy },
            h6: { fontWeight: tokens.typography.weight.heavy },
            subtitle1: { fontWeight: tokens.typography.weight.strong },
            subtitle2: { fontWeight: tokens.typography.weight.heavy },
        },

        components: {
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: "none" },
                },
            },

            MuiDivider: {
                styleOverrides: {
                    root: {
                        borderColor: tokens.colors.divider,
                    },
                },
            },

            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: tokens.radius.md,
                    },
                },
            },

            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: tokens.radius.lg,
                    },
                },
            },

            // Make inputs readable in dark/light automatically
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: { borderColor: tokens.colors.borderDefault },
                    root: {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: tokens.colors.borderAccent,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: tokens.colors.borderAccent,
                        },
                    },
                    input: { color: tokens.colors.textPrimary },
                },
            },

            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: tokens.colors.textSecondary,
                        "&.Mui-focused": { color: tokens.colors.textSecondary },
                    },
                },
            },
        },
    });

    // Attach app tokens so sx can access theme.custom.*
    muiTheme.custom = {
        colors: tokens.colors,
        radius: tokens.radius,
        typography: tokens.typography,
        accent: {
            name: tokens.accent,
            ...getAccentByName(tokens.accent),
        },
    };

    return muiTheme;
}

const ThemeContext = createContext(null);

export function ThemeController({ children }) {
    // For "system" mode
    const systemPrefersDark = useMemo(() => {
        if (typeof window === "undefined" || !window.matchMedia) return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }, []);

    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

    // Load preferences
    useEffect(() => {
        try {
            const savedRaw = localStorage.getItem(STORAGE_KEY);
            if (!savedRaw) return;
            const parsed = safeParse(savedRaw);
            if (!parsed) return;
            setPreferences(sanitizePreferences(parsed));
        } catch {
            // ignore
        }
    }, []);

    // Persist preferences
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch {
            // ignore
        }
    }, [preferences]);

    const effectiveMode = useMemo(
        () => resolveMode(preferences.mode, systemPrefersDark),
        [preferences.mode, systemPrefersDark]
    );

    const tokens = useMemo(
        () =>
            buildTokens({
                effectiveMode,
                accentName: preferences.accent,
                fontScale: preferences.fontScale,
                radiusScale: preferences.radiusScale,
            }),
        [effectiveMode, preferences.accent, preferences.fontScale, preferences.radiusScale]
    );

    const muiTheme = useMemo(() => buildMuiTheme(tokens), [tokens]);

    const api = useMemo(
        () => ({
            preferences,
            setPreferences,

            // convenience helpers for Settings UI
            setMode: (mode) => setPreferences((p) => sanitizePreferences({ ...p, mode })),
            setAccent: (accent) => setPreferences((p) => sanitizePreferences({ ...p, accent })),
            setFontScale: (fontScale) => setPreferences((p) => sanitizePreferences({ ...p, fontScale })),
            setRadiusScale: (radiusScale) => setPreferences((p) => sanitizePreferences({ ...p, radiusScale })),

            effectiveMode,
            tokens,
            muiTheme,
        }),
        [preferences, effectiveMode, tokens, muiTheme]
    );

    return (
        <ThemeContext.Provider value={api}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useAppTheme must be used inside <ThemeController>");
    return ctx;
}