extends ScreenBase
## Power-ups inventory screen.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "powerups"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "POWER-UPS"
	top.back_pressed.connect(func() -> void: nav("gameplay"))
	root.add_child(top)
	var right := HBoxContainer.new()
	right.add_theme_constant_override("separation", 6)
	right.add_child(CurrencyChip.new())
	var plus := NeonIconButton.new()
	plus.configure("plus", DesignTokens.NEON_PINK)
	plus.pressed_nav.connect(func() -> void: nav("shop"))
	right.add_child(plus)
	top.set_right(right)
	var body := Control.new()
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(body)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	body.add_child(bg)
	var grid := GridBackground.new()
	grid.opacity = 0.04
	body.add_child(grid)
	var scroll := ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	body.add_child(scroll)
	var pad := MarginContainer.new()
	pad.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_theme_constant_override("margin_left", 16)
	pad.add_theme_constant_override("margin_right", 16)
	pad.add_theme_constant_override("margin_top", 14)
	pad.add_theme_constant_override("margin_bottom", 14)
	scroll.add_child(pad)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	var items := [
		{"key": "multiplier", "name": "MULTIPLIER", "desc": "Multiply your next tile value.", "icon": "zap", "color": DesignTokens.ORANGE},
		{"key": "bomb", "name": "BOMB TILE", "desc": "Clear a lane of your choice.", "icon": "zap", "color": DesignTokens.RED},
		{"key": "freeze", "name": "FREEZE CARD", "desc": "Freeze the target for 1 turn.", "icon": "snowflake", "color": DesignTokens.CYAN},
		{"key": "shield", "name": "SHIELD", "desc": "Protect from a strike.", "icon": "shield", "color": DesignTokens.ELECTRIC_BLUE},
		{"key": "wild", "name": "WILD TILE", "desc": "Acts as any value you need.", "icon": "help-circle", "color": DesignTokens.PURPLE},
	]
	for item in items:
		col.add_child(_card(item))


func _card(item: Dictionary) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(item["color"]))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 14)
	m.add_theme_constant_override("margin_bottom", 14)
	p.add_child(m)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	m.add_child(row)
	var icon_box := PanelContainer.new()
	icon_box.custom_minimum_size = Vector2(52, 52)
	var isb := DesignTokens.make_panel_style(DesignTokens.with_alpha(item["color"], 0.12), DesignTokens.with_alpha(item["color"], 0.4), DesignTokens.RADIUS_COMPACT, 1)
	icon_box.add_theme_stylebox_override("panel", isb)
	var ic := CenterContainer.new()
	icon_box.add_child(ic)
	ic.add_child(IconService.make_texture_rect(str(item["icon"]), 22, item["color"]))
	row.add_child(icon_box)
	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var name_l := Label.new()
	name_l.text = str(item["name"])
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 12, item["color"], 0.5)
	text.add_child(name_l)
	var desc := Label.new()
	desc.text = str(item["desc"])
	Fonts.apply(desc, Fonts.inter(), 12, DesignTokens.MUTED)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.add_child(desc)
	row.add_child(text)
	var qty_box := VBoxContainer.new()
	var qty := Label.new()
	qty.text = str(int(SaveService.inventory.get(str(item["key"]), 0)))
	Fonts.apply(qty, Fonts.orbitron("ExtraBold"), 22, DesignTokens.WHITE)
	qty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	qty_box.add_child(qty)
	var owned := Label.new()
	owned.text = "OWNED"
	Fonts.apply(owned, Fonts.rajdhani("Bold"), 9, DesignTokens.MUTED)
	owned.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	qty_box.add_child(owned)
	row.add_child(qty_box)
	return p
