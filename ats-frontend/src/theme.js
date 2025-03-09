import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2", // Customize your primary color
        },
        secondary: {
            main: "#f50057",
        },
    },
    typography: {
        fontFamily: "Arial, sans-serif",
    },
});

export default theme;
