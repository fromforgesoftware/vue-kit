<template>
	<!-- Chips only mode -->
	<template v-if="renderAs === 'chips'">
		<FilterBarChip
			v-for="(d, index) in displayedFilters"
			:key="`${d.filter.columnId}-${index}`"
			data-slot="filter-bar-chip"
			:filter="d.filter"
			:column="getColumnConfig(d.filter.columnId)!"
			:facets="facets"
			:is-required="d.isRequired"
			:is-placeholder="d.isPlaceholder"
			@update:operator="(op) => onChipOperatorUpdate(d, op)"
			@update:values="(vals) => onChipValuesUpdate(d, vals)"
			@remove="onChipRemove(d)"
		/>
		<Button
			v-if="hasFilters"
			variant="ghost"
			size="sm"
			data-slot="filter-bar-clear-all"
			:class="cn(filterBarClearVariants())"
			@click="clearAll"
		>
			<Icon :icon="FilterX" size="xs-sm" />
			<span>Clear</span>
		</Button>
	</template>
	<!-- Trigger only mode -->
	<template v-else-if="renderAs === 'trigger'">
		<DropdownMenu v-model:open="menuOpen" :modal="false">
			<DropdownMenuTrigger>
				<Button
					variant="outline"
					size="icon"
					data-slot="filter-bar-trigger"
					aria-label="Filter"
					:class="cn(filterBarButtonVariants())"
				>
					<Icon :icon="Filter" size="sm" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" :side-offset="4">
				<!--
          DropdownMenuContent has role="menu", whose children may only be
          menuitem(*), separator, group, or none. Free-form widgets like a
          search input violate aria-required-children unless wrapped in one
          of those — we use role="group" with an accessible name.
        -->
				<div class="pb-1" role="group" aria-label="Search">
					<InputSearch
						v-model="columnSearch"
						data-slot="filter-bar-search-input"
						placeholder="Search"
						class="h-8"
					/>
				</div>

				<template v-for="column in filteredColumns" :key="column.id">
					<!-- Disabled column -->
					<div
						v-if="column.disabled"
						class="flex flex-col gap-0.5 px-2 py-1.5 opacity-50 cursor-not-allowed"
					>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Icon v-if="column.icon" :icon="column.icon" size="sm" />
							<span
								>{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								></span
							>
						</div>
						<span v-if="column.disabledReason" class="text-xs text-muted-foreground pl-6">
							{{ column.disabledReason }}
						</span>
					</div>

					<!-- Option / MultiOption: submenu with checkboxes -->
					<DropdownMenuSub v-else-if="column.type === 'option' || column.type === 'multiOption'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
							<DropdownMenuCheckboxItem
								v-for="option in column.options"
								:key="option.value"
								:checked="isOptionChecked(column.id, option.value)"
								class="gap-2"
								@update:checked="(checked) => addFilterWithValue(column, option.value, !!checked)"
							>
								<Icon v-if="option.icon" :icon="option.icon" size="sm" />
								<span class="flex-1">{{ option.label }}</span>
								<span
									v-if="getFacetCount(column.id, option.value) != null"
									class="ml-auto text-xs text-muted-foreground tabular-nums"
								>
									{{ getFacetCount(column.id, option.value) }}
								</span>
							</DropdownMenuCheckboxItem>
							<div
								v-if="!column.options || column.options.length === 0"
								class="px-2 py-3 text-center text-sm text-muted-foreground"
							>
								No results found
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<!-- Single Option: submenu with radio group -->
					<DropdownMenuSub v-else-if="column.type === 'singleOption'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
							<DropdownMenuRadioGroup
								:model-value="getSingleOptionValue(column.id)"
								@update:model-value="(value: string) => setSingleOptionValue(column, value)"
							>
								<DropdownMenuRadioItem
									v-for="option in column.options"
									:key="option.value"
									:value="option.value"
									class="gap-2"
								>
									<Icon v-if="option.icon" :icon="option.icon" size="sm" />
									<span class="flex-1">{{ option.label }}</span>
									<span
										v-if="getFacetCount(column.id, option.value) != null"
										class="ml-auto text-xs text-muted-foreground tabular-nums"
									>
										{{ getFacetCount(column.id, option.value) }}
									</span>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<div
								v-if="!column.options || column.options.length === 0"
								class="px-2 py-3 text-center text-sm text-muted-foreground"
							>
								No results found
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<!-- Text / Number: submenu with input -->
					<DropdownMenuSub v-else-if="column.type === 'text' || column.type === 'number'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-2 min-w-[200px]">
							<!-- DropdownMenuSubContent has role="menu"; wrap free-form input in a group. -->
							<div role="group" :aria-label="column.displayName">
								<input
									:type="column.type === 'number' ? 'number' : 'text'"
									data-slot="filter-bar-text-input"
									:aria-label="column.displayName"
									class="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-1 focus-visible:ring-ring"
									:value="textInputValues[column.id] ?? ''"
									:placeholder="column.type === 'number' ? 'Enter number...' : 'Enter value...'"
									@input="
										(e) => (textInputValues[column.id] = (e.target as HTMLInputElement).value)
									"
									@keydown.enter.prevent="commitTextFilter(column)"
								/>
								<p class="mt-1 text-xs text-muted-foreground">Press Enter to apply</p>
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<!-- Date: submenu with Calendar -->
					<DropdownMenuSub v-else-if="column.type === 'date'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
							<Calendar
								class="border-0 shadow-none rounded-md"
								@update:model-value="(date) => onDateSelect(column, date)"
							/>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<!-- Date Range: submenu with RangeCalendar -->
					<DropdownMenuSub v-else-if="column.type === 'daterange'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
							<DateRangePickerPanel
								:presets="column.presets"
								@select="(range) => onDateRangeSelect(column, range)"
							/>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</template>

				<div
					v-if="filteredColumns.length === 0"
					class="px-2 py-3 text-center text-sm text-muted-foreground"
				>
					No columns found
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	</template>

	<!-- Panel mode: header with trigger + chips below -->
	<div
		v-else-if="variant === 'panel'"
		data-slot="filter-bar"
		:class="cn(filterBarVariants({ variant: 'panel' }), props.class)"
	>
		<!-- Header row -->
		<div class="flex items-center justify-between gap-2 py-2">
			<slot name="header" />
			<DropdownMenu v-model:open="menuOpen" :modal="false">
				<DropdownMenuTrigger>
					<button
						type="button"
						data-slot="filter-bar-trigger"
						aria-label="Filter"
						:class="cn(filterBarButtonVariants())"
					>
						<Icon :icon="Filter" size="sm" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" :side-offset="4">
					<!--
            See note on the variant above — wrap the search in role="group" so
            it's an allowed direct child of role="menu".
          -->
					<div class="px-1.5 pb-1" role="group" aria-label="Search">
						<InputSearch
							v-model="columnSearch"
							data-slot="filter-bar-search-input"
							placeholder="Search"
							class="h-8"
						/>
					</div>
					<template v-for="column in filteredColumns" :key="column.id">
						<!-- Disabled column -->
						<div
							v-if="column.disabled"
							class="flex flex-col gap-0.5 px-2 py-1.5 opacity-50 cursor-not-allowed"
						>
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Icon v-if="column.icon" :icon="column.icon" size="sm" />
								<span
									>{{ column.displayName
									}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
										>*</span
									></span
								>
							</div>
							<span v-if="column.disabledReason" class="text-xs text-muted-foreground pl-6">
								{{ column.disabledReason }}
							</span>
						</div>

						<DropdownMenuSub v-else-if="column.type === 'option' || column.type === 'multiOption'">
							<DropdownMenuSubTrigger>
								<Icon
									v-if="column.icon"
									:icon="column.icon"
									size="sm"
									class="text-muted-foreground"
								/>
								{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
								<DropdownMenuCheckboxItem
									v-for="option in column.options"
									:key="option.value"
									:checked="isOptionChecked(column.id, option.value)"
									class="gap-2"
									@update:checked="(checked) => addFilterWithValue(column, option.value, !!checked)"
								>
									<Icon v-if="option.icon" :icon="option.icon" size="sm" />
									<span class="flex-1">{{ option.label }}</span>
									<span
										v-if="getFacetCount(column.id, option.value) != null"
										class="ml-auto text-xs text-muted-foreground tabular-nums"
										>{{ getFacetCount(column.id, option.value) }}</span
									>
								</DropdownMenuCheckboxItem>
								<div
									v-if="!column.options || column.options.length === 0"
									class="px-2 py-3 text-center text-sm text-muted-foreground"
								>
									No results found
								</div>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub v-else-if="column.type === 'singleOption'">
							<DropdownMenuSubTrigger>
								<Icon
									v-if="column.icon"
									:icon="column.icon"
									size="sm"
									class="text-muted-foreground"
								/>
								{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
								<DropdownMenuRadioGroup
									:model-value="getSingleOptionValue(column.id)"
									@update:model-value="(value: string) => setSingleOptionValue(column, value)"
								>
									<DropdownMenuRadioItem
										v-for="option in column.options"
										:key="option.value"
										:value="option.value"
										class="gap-2"
									>
										<Icon v-if="option.icon" :icon="option.icon" size="sm" />
										<span class="flex-1">{{ option.label }}</span>
										<span
											v-if="getFacetCount(column.id, option.value) != null"
											class="ml-auto text-xs text-muted-foreground tabular-nums"
											>{{ getFacetCount(column.id, option.value) }}</span
										>
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
								<div
									v-if="!column.options || column.options.length === 0"
									class="px-2 py-3 text-center text-sm text-muted-foreground"
								>
									No results found
								</div>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub v-else-if="column.type === 'text' || column.type === 'number'">
							<DropdownMenuSubTrigger>
								<Icon
									v-if="column.icon"
									:icon="column.icon"
									size="sm"
									class="text-muted-foreground"
								/>
								{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-2 min-w-[200px]">
								<input
									:type="column.type === 'number' ? 'number' : 'text'"
									:aria-label="column.displayName"
									class="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									:value="textInputValues[column.id] ?? ''"
									:placeholder="column.type === 'number' ? 'Enter number...' : 'Enter value...'"
									@input="
										(e) => (textInputValues[column.id] = (e.target as HTMLInputElement).value)
									"
									@keydown.enter.prevent="commitTextFilter(column)"
								/>
								<p class="mt-1 text-xs text-muted-foreground">Press Enter to apply</p>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub v-else-if="column.type === 'date'">
							<DropdownMenuSubTrigger>
								<Icon
									v-if="column.icon"
									:icon="column.icon"
									size="sm"
									class="text-muted-foreground"
								/>
								{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
								<Calendar
									class="border-0 shadow-none rounded-md"
									@update:model-value="(date) => onDateSelect(column, date)"
								/>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub v-else-if="column.type === 'daterange'">
							<DropdownMenuSubTrigger>
								<Icon
									v-if="column.icon"
									:icon="column.icon"
									size="sm"
									class="text-muted-foreground"
								/>
								{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
								<DateRangePickerPanel
									:presets="column.presets"
									@select="(range) => onDateRangeSelect(column, range)"
								/>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</template>
					<div
						v-if="filteredColumns.length === 0"
						class="px-2 py-3 text-center text-sm text-muted-foreground"
					>
						No columns found
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>

		<!-- Active filter chips row -->
		<div v-if="displayedFilters.length > 0" class="flex items-center gap-2 flex-wrap py-2">
			<FilterBarChip
				v-for="(d, index) in displayedFilters"
				:key="`${d.filter.columnId}-${index}`"
				data-slot="filter-bar-chip"
				:filter="d.filter"
				:column="getColumnConfig(d.filter.columnId)!"
				:facets="facets"
				:is-required="d.isRequired"
				:is-placeholder="d.isPlaceholder"
				@update:operator="(op) => onChipOperatorUpdate(d, op)"
				@update:values="(vals) => onChipValuesUpdate(d, vals)"
				@remove="onChipRemove(d)"
			/>
			<Button
				v-if="hasFilters"
				variant="ghost"
				size="sm"
				data-slot="filter-bar-clear-all"
				:class="cn(filterBarClearVariants())"
				@click="clearAll"
			>
				<Icon :icon="FilterX" size="xs-sm" />
				<span>Clear</span>
			</Button>
		</div>
	</div>

	<!-- All mode (default) -->
	<div
		v-else
		data-slot="filter-bar"
		:class="cn(filterBarVariants({ variant: 'default' }), props.class)"
	>
		<!-- Add filter dropdown -->
		<DropdownMenu v-model:open="menuOpen" :modal="false">
			<DropdownMenuTrigger>
				<Button
					variant="outline"
					size="icon"
					data-slot="filter-bar-trigger"
					aria-label="Filter"
					:class="cn(filterBarButtonVariants())"
				>
					<Icon :icon="Filter" size="sm" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" :side-offset="4">
				<!-- See note above — wrap free-form input in role="group" for axe. -->
				<div class="px-1.5 pb-1" role="group" aria-label="Search">
					<InputSearch
						v-model="columnSearch"
						data-slot="filter-bar-search-input"
						placeholder="Search"
						class="h-8"
					/>
				</div>
				<template v-for="column in filteredColumns" :key="column.id">
					<!-- Disabled column -->
					<div
						v-if="column.disabled"
						class="flex flex-col gap-0.5 px-2 py-1.5 opacity-50 cursor-not-allowed"
					>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Icon v-if="column.icon" :icon="column.icon" size="sm" />
							<span
								>{{ column.displayName
								}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true"
									>*</span
								></span
							>
						</div>
						<span v-if="column.disabledReason" class="text-xs text-muted-foreground pl-6">
							{{ column.disabledReason }}
						</span>
					</div>

					<DropdownMenuSub v-else-if="column.type === 'option' || column.type === 'multiOption'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
							<DropdownMenuCheckboxItem
								v-for="option in column.options"
								:key="option.value"
								:checked="isOptionChecked(column.id, option.value)"
								class="gap-2"
								@update:checked="(checked) => addFilterWithValue(column, option.value, !!checked)"
							>
								<Icon v-if="option.icon" :icon="option.icon" size="sm" />
								<span class="flex-1">{{ option.label }}</span>
								<span
									v-if="getFacetCount(column.id, option.value) != null"
									class="ml-auto text-xs text-muted-foreground tabular-nums"
									>{{ getFacetCount(column.id, option.value) }}</span
								>
							</DropdownMenuCheckboxItem>
							<div
								v-if="!column.options || column.options.length === 0"
								class="px-2 py-3 text-center text-sm text-muted-foreground"
							>
								No results found
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSub v-else-if="column.type === 'singleOption'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5">
							<DropdownMenuRadioGroup
								:model-value="getSingleOptionValue(column.id)"
								@update:model-value="(value: string) => setSingleOptionValue(column, value)"
							>
								<DropdownMenuRadioItem
									v-for="option in column.options"
									:key="option.value"
									:value="option.value"
									class="gap-2"
								>
									<Icon v-if="option.icon" :icon="option.icon" size="sm" />
									<span class="flex-1">{{ option.label }}</span>
									<span
										v-if="getFacetCount(column.id, option.value) != null"
										class="ml-auto text-xs text-muted-foreground tabular-nums"
										>{{ getFacetCount(column.id, option.value) }}</span
									>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<div
								v-if="!column.options || column.options.length === 0"
								class="px-2 py-3 text-center text-sm text-muted-foreground"
							>
								No results found
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSub v-else-if="column.type === 'text' || column.type === 'number'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-2 min-w-[200px]">
							<!-- DropdownMenuSubContent has role="menu"; wrap free-form input in a group. -->
							<div role="group" :aria-label="column.displayName">
								<input
									:type="column.type === 'number' ? 'number' : 'text'"
									data-slot="filter-bar-text-input"
									:aria-label="column.displayName"
									class="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:ring-1 focus-visible:ring-ring"
									:value="textInputValues[column.id] ?? ''"
									:placeholder="column.type === 'number' ? 'Enter number...' : 'Enter value...'"
									@input="
										(e) => (textInputValues[column.id] = (e.target as HTMLInputElement).value)
									"
									@keydown.enter.prevent="commitTextFilter(column)"
								/>
								<p class="mt-1 text-xs text-muted-foreground">Press Enter to apply</p>
							</div>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSub v-else-if="column.type === 'date'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
							<Calendar
								class="border-0 shadow-none rounded-md"
								@update:model-value="(date) => onDateSelect(column, date)"
							/>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSub v-else-if="column.type === 'daterange'">
						<DropdownMenuSubTrigger>
							<Icon
								v-if="column.icon"
								:icon="column.icon"
								size="sm"
								class="text-muted-foreground"
							/>
							{{ column.displayName
							}}<span v-if="column.required" class="text-warning ml-0.5" aria-hidden="true">*</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent :side-offset="2" :align-offset="-5" class="p-0">
							<DateRangePickerPanel
								:presets="column.presets"
								@select="(range) => onDateRangeSelect(column, range)"
							/>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</template>
				<div
					v-if="filteredColumns.length === 0"
					class="px-2 py-3 text-center text-sm text-muted-foreground"
				>
					No columns found
				</div>
			</DropdownMenuContent>
		</DropdownMenu>

		<!-- Active filter chips (incl. synthetic placeholders for required columns) -->
		<FilterBarChip
			v-for="(d, index) in displayedFilters"
			:key="`${d.filter.columnId}-${index}`"
			data-slot="filter-bar-chip"
			:filter="d.filter"
			:column="getColumnConfig(d.filter.columnId)!"
			:facets="facets"
			:is-required="d.isRequired"
			:is-placeholder="d.isPlaceholder"
			@update:operator="(op) => onChipOperatorUpdate(d, op)"
			@update:values="(vals) => onChipValuesUpdate(d, vals)"
			@remove="onChipRemove(d)"
		/>

		<Button
			v-if="hasFilters"
			variant="ghost"
			size="sm"
			data-slot="filter-bar-clear-all"
			:class="cn(filterBarClearVariants(), 'ml-auto')"
			@click="clearAll"
		>
			<Icon :icon="FilterX" size="xs-sm" />
			<span>Clear</span>
		</Button>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Filter, FilterX } from '@lucide/vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import DropdownMenu from '../../general/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../general/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../general/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuCheckboxItem from '../../general/dropdown-menu/DropdownMenuCheckboxItem.vue';
import DropdownMenuRadioGroup from '../../general/dropdown-menu/DropdownMenuRadioGroup.vue';
import DropdownMenuRadioItem from '../../general/dropdown-menu/DropdownMenuRadioItem.vue';
import DropdownMenuSub from '../../general/dropdown-menu/DropdownMenuSub.vue';
import DropdownMenuSubTrigger from '../../general/dropdown-menu/DropdownMenuSubTrigger.vue';
import DropdownMenuSubContent from '../../general/dropdown-menu/DropdownMenuSubContent.vue';
import InputSearch from '../../form/input-search/InputSearch.vue';
import Calendar from '../../dates/calendar/Calendar.vue';
import DateRangePickerPanel from './DateRangePickerPanel.vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn.js';
import {
	filterBarVariants,
	filterBarButtonVariants,
	filterBarClearVariants,
	getDefaultOperator,
	type FilterBarVariant,
	type ColumnConfig,
	type FiltersState,
	type FilterModel,
	type FilterOperator,
	type FacetedValues,
} from './filter-bar.js';
import FilterBarChip from './FilterBarChip.vue';

interface FilterBarProps {
	columns: ColumnConfig[];
	modelValue: FiltersState;
	facets?: FacetedValues;
	class?: string;
	renderAs?: 'all' | 'trigger' | 'chips';
	/** Visual variant: 'default' = inline row, 'panel' = trigger in a header row with chips stacked below */
	variant?: FilterBarVariant;
}

const props = withDefaults(defineProps<FilterBarProps>(), {
	facets: undefined,
	renderAs: 'all',
	variant: 'default',
});

const emit = defineEmits<{
	'update:modelValue': [value: FiltersState];
	clear: [];
}>();

const menuOpen = ref(false);
const columnSearch = ref('');
const textInputValues = ref<Record<string, string>>({});

const modelFilters = computed(() => props.modelValue);
const hasFilters = computed(() => modelFilters.value.length > 0);

function emitFilters(filters: FilterModel[]) {
	emit('update:modelValue', filters);
}

const filteredColumns = computed(() => {
	if (!columnSearch.value) return props.columns;
	const q = columnSearch.value.toLowerCase();
	return props.columns.filter((col) => col.displayName.toLowerCase().includes(q));
});

function getColumnConfig(columnId: string): ColumnConfig | undefined {
	return props.columns.find((c) => c.id === columnId);
}

interface DisplayedFilter {
	filter: FilterModel;
	isRequired: boolean;
	isPlaceholder: boolean;
	/** Index in modelValue, or -1 when this is a synthetic placeholder. */
	modelIndex: number;
}

// Synthesises empty chips for required columns so the user always sees them.
const displayedFilters = computed<DisplayedFilter[]>(() => {
	const real: DisplayedFilter[] = modelFilters.value.map((filter, modelIndex) => {
		const col = props.columns.find((c) => c.id === filter.columnId);
		const isRequired = !!col?.required;
		return {
			filter,
			isRequired,
			isPlaceholder: false,
			modelIndex,
		};
	});

	const placeholders: DisplayedFilter[] = [];
	for (const col of props.columns) {
		if (!col.required) continue;
		const exists = modelFilters.value.some((f) => f.columnId === col.id);
		if (exists) continue;
		placeholders.push({
			filter: {
				columnId: col.id,
				type: col.type,
				operator: col.defaultOperator ?? getDefaultOperator(col.type),
				values: [],
			},
			isRequired: true,
			isPlaceholder: true,
			modelIndex: -1,
		});
	}

	return [
		...placeholders,
		...real.filter((d) => d.isRequired),
		...real.filter((d) => !d.isRequired),
	];
});

function newFilter(column: ColumnConfig, values: string[]): FilterModel {
	return {
		columnId: column.id,
		type: column.type,
		operator: column.defaultOperator ?? getDefaultOperator(column.type),
		values,
	};
}

function addFilterWithValue(column: ColumnConfig, value: string, checked: boolean) {
	const existingIndex = modelFilters.value.findIndex((f) => f.columnId === column.id);

	if (existingIndex >= 0) {
		const existing = modelFilters.value[existingIndex];
		const updated = [...modelFilters.value];
		const values = checked
			? [...existing.values, value]
			: existing.values.filter((v) => v !== value);
		if (values.length === 0) {
			emitFilters(updated.filter((_, i) => i !== existingIndex));
		} else {
			updated[existingIndex] = { ...existing, values };
			emitFilters(updated);
		}
	} else if (checked) {
		emitFilters([...modelFilters.value, newFilter(column, [value])]);
	}
}

function setSingleOptionValue(column: ColumnConfig, value: string) {
	const existingIndex = modelFilters.value.findIndex((f) => f.columnId === column.id);

	if (existingIndex >= 0) {
		const existing = modelFilters.value[existingIndex];
		if (existing.values[0] === value) {
			if (column.required) return;
			emitFilters(modelFilters.value.filter((_, i) => i !== existingIndex));
		} else {
			const updated = [...modelFilters.value];
			updated[existingIndex] = { ...existing, values: [value] };
			emitFilters(updated);
		}
	} else {
		emitFilters([...modelFilters.value, newFilter(column, [value])]);
	}
}

function getSingleOptionValue(columnId: string): string {
	const filter = modelFilters.value.find((f) => f.columnId === columnId);
	return filter?.values[0] ?? '';
}

function isOptionChecked(columnId: string, value: string): boolean {
	const filter = modelFilters.value.find((f) => f.columnId === columnId);
	return filter?.values.includes(value) ?? false;
}

function getFacetCount(columnId: string, value: string): number | undefined {
	return props.facets?.[columnId]?.get(value);
}

function commitTextFilter(column: ColumnConfig) {
	const value = textInputValues.value[column.id]?.trim();
	if (!value) return;

	const existingIndex = modelFilters.value.findIndex((f) => f.columnId === column.id);
	if (existingIndex >= 0) {
		const updated = [...modelFilters.value];
		updated[existingIndex] = { ...updated[existingIndex], values: [value] };
		emitFilters(updated);
	} else {
		emitFilters([...modelFilters.value, newFilter(column, [value])]);
	}

	textInputValues.value[column.id] = '';
	menuOpen.value = false;
}

function onDateSelect(column: ColumnConfig, date: ForgeDate) {
	const value = date.toISODate();
	const existingIndex = modelFilters.value.findIndex((f) => f.columnId === column.id);

	if (existingIndex >= 0) {
		const updated = [...modelFilters.value];
		updated[existingIndex] = { ...updated[existingIndex], values: [value] };
		emitFilters(updated);
	} else {
		emitFilters([...modelFilters.value, newFilter(column, [value])]);
	}
	menuOpen.value = false;
}

function onDateRangeSelect(column: ColumnConfig, range: { start: ForgeDate; end: ForgeDate }) {
	const values = [range.start.toISODate(), range.end.toISODate()];
	const existingIndex = modelFilters.value.findIndex((f) => f.columnId === column.id);

	if (existingIndex >= 0) {
		const updated = [...modelFilters.value];
		updated[existingIndex] = { ...updated[existingIndex], values };
		emitFilters(updated);
	} else {
		emitFilters([...modelFilters.value, newFilter(column, values)]);
	}
	menuOpen.value = false;
}

function onChipOperatorUpdate(d: DisplayedFilter, operator: FilterOperator) {
	if (d.isPlaceholder) return;
	const updated = [...modelFilters.value];
	updated[d.modelIndex] = { ...updated[d.modelIndex], operator };
	emitFilters(updated);
}

function onChipValuesUpdate(d: DisplayedFilter, values: string[]) {
	if (d.isPlaceholder) {
		if (values.length === 0) return;
		emitFilters([...modelFilters.value, { ...d.filter, values }]);
		return;
	}
	const updated = [...modelFilters.value];
	updated[d.modelIndex] = { ...updated[d.modelIndex], values };
	emitFilters(updated);
}

function onChipRemove(d: DisplayedFilter) {
	if (d.isRequired || d.isPlaceholder) return;
	emitFilters(modelFilters.value.filter((_, i) => i !== d.modelIndex));
}

function clearAll() {
	emitFilters([]);
	emit('clear');
}
</script>
