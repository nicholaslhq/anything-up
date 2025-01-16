import React, { useEffect } from "react";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "@/components/ui/menubar";
import ThemeSwitcher from "@/components/ThemeSwitcher";

interface NavigationBarProps {
	sortBy: string;
	setSortBy: (sortBy: string) => void;
	timePeriod: string;
	setTimePeriod: (timePeriod: string) => void;
	refreshPosts: boolean;
	setRefreshPosts: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
	sortBy,
	setSortBy,
	timePeriod,
	setTimePeriod,
	refreshPosts,
	setRefreshPosts,
}) => {
	useEffect(() => {
		const storedSortBy = localStorage.getItem('sortBy');
		if (storedSortBy) {
			setSortBy(storedSortBy);
		}
	}, [setSortBy]);

	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "hot" ? "border-2 border-black" : ""}
					onClick={() => {
						if (sortBy === "hot") {
							setRefreshPosts(!refreshPosts);
						} else {
							setSortBy("hot");
							localStorage.setItem('sortBy', 'hot');
						}
					}}
				>
					Hot
				</MenubarTrigger>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "new" ? "border-2 border-black" : ""}
					onClick={() => {
						if (sortBy === "new") {
							setRefreshPosts(!refreshPosts);
						} else {
							setSortBy("new");
							localStorage.setItem('sortBy', 'new');
						}
					}}
				>
					New
				</MenubarTrigger>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "top" ? "border-2 border-black" : ""}
					onClick={() => {
						if (sortBy === "top") {
							setRefreshPosts(!refreshPosts);
						} else {
							setSortBy("top");
							localStorage.setItem('sortBy', 'top');
						}
					}}
				>
					Top
				</MenubarTrigger>
				{sortBy === "top" && (
					<MenubarContent>
						<MenubarItem
							className={
								timePeriod === "day"
									? "border-2 border-black"
									: ""
							}
							onClick={() => setTimePeriod("day")}
						>
							Day
						</MenubarItem>
						<MenubarItem
							className={
								timePeriod === "week"
									? "border-2 border-black"
									: ""
							}
							onClick={() => setTimePeriod("week")}
						>
							Week
						</MenubarItem>
						<MenubarItem
							className={
								timePeriod === "month"
									? "border-2 border-black"
									: ""
							}
							onClick={() => setTimePeriod("month")}
						>
							Month
						</MenubarItem>
					</MenubarContent>
				)}
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>
					<ThemeSwitcher />
				</MenubarTrigger>
			</MenubarMenu>
		</Menubar>
	);
};

export default NavigationBar;
