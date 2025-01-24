"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeContext = createContext<{
	theme: "light" | "dark";
	toggleTheme: () => void;
}>({
	theme: "light",
	toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const initialTheme = () => {
		const storedTheme = localStorage.getItem("theme");
		if (storedTheme) {
			return storedTheme as "light" | "dark";
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return "dark";
		} else {
			return "light";
		}
	};

	const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

	useEffect(() => {
		localStorage.setItem("theme", theme);
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);

const ThemeSwitcher: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<div onClick={toggleTheme} className="cursor-pointer">
			{theme === "light" ? <Moon /> : <Sun />}
		</div>
	);
};

export default ThemeSwitcher;
