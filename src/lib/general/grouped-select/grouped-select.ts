export interface GroupedItem {
	id: string;
	label: string;
	panelLabel?: string;
	description?: string;
	category: string;
	displayOrder?: number;
}

export interface GroupedCategory {
	id: string;
	label: string;
	section?: string;
}
