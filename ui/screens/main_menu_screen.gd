extends ScreenBase
## Main menu with PLAY / Tournament / Ranked / Shop + bottom nav.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "menu"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)
	var bg_layer := Control.new()
	bg_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	# Top bar
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 8)
	var top_margin := MarginContainer.new()
	top_margin.add_theme_constant_override("margin_left", 16)
	top_margin.add_theme_constant_override("margin_right", 16)
	top_margin.add_theme_constant_override("margin_top", 16)
	top_margin.add_child(top)
	root.add_child(top_margin)
	top.add_child(CurrencyChip.new())
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top.add_child(spacer)
	var settings := NeonIconButton.new()
	settings.configure("settings", DesignTokens.MUTED)
	settings.pressed_nav.connect(func() -> void: nav("settings"))
	top.add_child(settings)
	# Content
	var content := Control.new()
	content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(content)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content.add_child(bg)
	var grid := GridBackground.new()
	grid.opacity = 0.05
	content.add_child(grid)
	var glow := ColorRect.new()
	glow.color = DesignTokens.with_alpha(DesignTokens.PURPLE, 0.1)
	glow.set_anchors_preset(Control.PRESET_CENTER_TOP)
	glow.anchor_left = 0.2
	glow.anchor_right = 0.8
	glow.anchor_top = 0.0
	glow.anchor_bottom = 0.4
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(glow)
	var pgrid := PerspectiveGrid.new()
	pgrid.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	pgrid.offset_top = -180
	content.add_child(pgrid)
	var col := VBoxContainer.new()
	col.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	col.add_theme_constant_override("separation", 12)
	var pad := MarginContainer.new()
	pad.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pad.add_theme_constant_override("margin_left", 16)
	pad.add_theme_constant_override("margin_right", 16)
	pad.add_theme_constant_override("margin_top", 10)
	pad.add_theme_constant_override("margin_bottom", 10)
	content.add_child(pad)
	pad.add_child(col)
	var logo := NumberRushLogo.new()
	logo.set_logo_scale(0.84)
	var logo_wrap := CenterContainer.new()
	logo_wrap.add_child(logo)
	var logo_margin := MarginContainer.new()
	logo_margin.add_theme_constant_override("margin_bottom", 14)
	logo_margin.add_child(logo_wrap)
	col.add_child(logo_margin)
	var btns := [
		{"label": "PLAY", "color": DesignTokens.NEON_PINK, "icon": "play", "to": "gameplay"},
		{"label": "DAILY TOURNAMENT", "color": DesignTokens.ORANGE, "icon": "star", "to": "tournament"},
		{"label": "RANKED", "color": DesignTokens.ELECTRIC_BLUE, "icon": "trophy", "to": "ranked"},
		{"label": "SHOP", "color": DesignTokens.PURPLE, "icon": "shopping-bag", "to": "shop"},
	]
	for b in btns:
		var btn := NeonButton.new()
		btn.configure(str(b["label"]), b["color"], NeonButton.ButtonSize.LARGE, str(b["icon"]), true)
		var dest: String = str(b["to"])
		btn.pressed_nav.connect(func() -> void:
			if dest == "gameplay":
				GameState.start_run(GameState.Mode.CLASSIC, 21)
			nav(dest)
		)
		col.add_child(btn)
	var nav_bar := BottomNavigation.new()
	nav_bar.set_active("menu")
	nav_bar.navigate.connect(func(id: String) -> void: nav(id))
	root.add_child(nav_bar)
