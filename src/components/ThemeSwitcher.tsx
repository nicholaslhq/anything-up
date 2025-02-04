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
	const getInitialTheme = (): "light" | "dark" => {
		if (typeof window !== "undefined") {
			// First, check localStorage
			const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
			if (storedTheme) return storedTheme;

			// Otherwise, check system preference
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				return "dark";
			}
		}
		return "light"; // Default to light if no match
	};

	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		setTheme(getInitialTheme());
	}, []);

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
