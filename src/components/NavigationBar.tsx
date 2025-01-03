import React from "react";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from "./ui/menubar";
import ThemeSwitcher from "./ThemeSwitcher";
import { Plus } from "lucide-react";

interface NavigationBarProps {
	sortBy: string;
	setSortBy: (sortBy: string) => void;
	timePeriod: string;
	setTimePeriod: (timePeriod: string) => void;
	setIsFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
	sortBy,
	setSortBy,
	timePeriod,
	setTimePeriod,
	setIsFormVisible,
}) => {
	return (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger onClick={() => setIsFormVisible(true)}>
					<Plus />
				</MenubarTrigger>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "hot" ? "border-2 border-black" : ""}
					onClick={() => setSortBy("hot")}
				>
					Hot
				</MenubarTrigger>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "new" ? "border-2 border-black" : ""}
					onClick={() => setSortBy("new")}
				>
					New
				</MenubarTrigger>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger
					className={sortBy === "top" ? "border-2 border-black" : ""}
					onClick={() => setSortBy("top")}
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
