extends ScreenBase
## Game over results using live GameState summary.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "gameover"
	_build(GameState.get_run_summary())


func _build(summary: Dictionary) -> void:
	for c in get_children():
		c.queue_free()
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(bg)
	var grid := GridBackground.new()
	grid.opacity = 0.05
	root.add_child(grid)
	var glow := ColorRect.new()
	glow.color = DesignTokens.with_alpha(DesignTokens.RED, 0.09)
	glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(glow)
	var scroll := ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root.add_child(scroll)
	var pad := MarginContainer.new()
	pad.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_theme_constant_override("margin_left", 16)
	pad.add_theme_constant_override("margin_right", 16)
	pad.add_theme_constant_override("margin_top", 16)
	pad.add_theme_constant_override("margin_bottom", 16)
	scroll.add_child(pad)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 16)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	var title := Label.new()
	title.text = "RUN OVER"
	Fonts.apply(title, Fonts.orbitron("Black"), 40, DesignTokens.RED, 3.0)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	var hearts := HBoxContainer.new()
	hearts.alignment = BoxContainer.ALIGNMENT_CENTER
	hearts.add_theme_constant_override("separation", 5)
	for i in 3:
		hearts.add_child(IconService.make_texture_rect("heart", 20, DesignTokens.with_alpha(DesignTokens.RED, 0.4)))
	col.add_child(hearts)
	var scores := HBoxContainer.new()
	scores.add_theme_constant_override("separation", 10)
	col.add_child(scores)
	scores.add_child(_score_card("FINAL SCORE", _fmt(int(summary.get("score", 0))), DesignTokens.MUTED, DesignTokens.WHITE))
	scores.add_child(_score_card("BEST SCORE", _fmt(int(summary.get("high_score", 0))), DesignTokens.YELLOW, DesignTokens.YELLOW))
	var stats := HBoxContainer.new()
	stats.add_theme_constant_override("separation", 10)
	col.add_child(stats)
	stats.add_child(_mini("x%d" % int(summary.get("max_combo", 1)), "MAX COMBO", DesignTokens.CYAN))
	stats.add_child(_mini(str(int(summary.get("perfect_tiles", 0))), "PERFECT TILES", DesignTokens.GREEN))
	stats.add_child(_mini("3", "STRIKES", DesignTokens.RED))
	var again := NeonButton.new()
	again.configure("PLAY AGAIN", DesignTokens.NEON_PINK, NeonButton.ButtonSize.LARGE, "restart", true)
	again.pressed_nav.connect(func() -> void:
		GameState.start_run(GameState.Mode.CLASSIC, 21)
		nav("gameplay")
	)
	col.add_child(again)
	var menu := SecondaryButton.new()
	menu.configure("MAIN MENU", "home")
	menu.pressed_nav.connect(func() -> void: nav("menu"))
	col.add_child(menu)
	var pgrid := PerspectiveGrid.new()
	pgrid.custom_minimum_size = Vector2(0, 120)
	col.add_child(pgrid)


func _score_card(caption: String, value: String, accent: Color, value_color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(accent))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 14)
	m.add_theme_constant_override("margin_bottom", 14)
	p.add_child(m)
	var v := VBoxContainer.new()
	m.add_child(v)
	var c := Label.new()
	c.text = caption
	Fonts.apply(c, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
	c.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(c)
	var val := Label.new()
	val.text = value
	Fonts.apply(val, Fonts.orbitron("ExtraBold"), 20, value_color)
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(val)
	return p


func _mini(value: String, label: String, color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 6)
	m.add_theme_constant_override("margin_right", 6)
	m.add_theme_constant_override("margin_top", 12)
	m.add_theme_constant_override("margin_bottom", 12)
	p.add_child(m)
	var v := VBoxContainer.new()
	m.add_child(v)
	var val := Label.new()
	val.text = value
	Fonts.apply(val, Fonts.orbitron("ExtraBold"), 22, color)
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(val)
	var lab := Label.new()
	lab.text = label
	Fonts.apply(lab, Fonts.rajdhani("Bold"), 9, DesignTokens.MUTED)
	lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(lab)
	return p


func _fmt(n: int) -> String:
	var s := str(n)
	var out := ""
	var count := 0
	for i in range(s.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "," + out
		out = s[i] + out
		count += 1
	return out
