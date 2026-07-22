extends ScreenBase
## Victory results using live GameState summary.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "victory"
	var summary: Dictionary = GameState.get_run_summary()
	_build(summary)


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
	glow.color = DesignTokens.with_alpha(DesignTokens.GREEN, 0.09)
	glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(glow)
	_confetti(root)
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
	title.text = "VICTORY!"
	Fonts.apply(title, Fonts.orbitron("Black"), 46, DesignTokens.GREEN, 4.0)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	if bool(summary.get("is_best", false)):
		var best := Label.new()
		best.text = "★ NEW BEST SCORE! ★"
		Fonts.apply(best, Fonts.rajdhani("Bold"), 12, DesignTokens.YELLOW, 2.0)
		best.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		col.add_child(best)
	var score := Label.new()
	score.text = _fmt(int(summary.get("score", 0)))
	Fonts.apply(score, Fonts.orbitron("Black"), 38, DesignTokens.WHITE)
	score.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(score)
	var stats := HBoxContainer.new()
	stats.add_theme_constant_override("separation", 10)
	col.add_child(stats)
	stats.add_child(_stat("x%d" % int(summary.get("max_combo", 1)), "MAX COMBO", DesignTokens.CYAN))
	stats.add_child(_stat(str(int(summary.get("perfect_tiles", 0))), "PERFECT TILES", DesignTokens.GREEN))
	stats.add_child(_stat(str(int(summary.get("best_streak", 0))), "BEST STREAK", DesignTokens.ORANGE))
	var rewards := PanelContainer.new()
	rewards.add_theme_stylebox_override("panel", DesignTokens.make_card_style(DesignTokens.YELLOW))
	var rm := MarginContainer.new()
	rm.add_theme_constant_override("margin_left", 14)
	rm.add_theme_constant_override("margin_right", 14)
	rm.add_theme_constant_override("margin_top", 14)
	rm.add_theme_constant_override("margin_bottom", 14)
	rewards.add_child(rm)
	var rv := VBoxContainer.new()
	rm.add_child(rv)
	var rh := Label.new()
	rh.text = "REWARDS EARNED"
	Fonts.apply(rh, Fonts.rajdhani("Bold"), 10, DesignTokens.YELLOW, 2.0)
	rh.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rv.add_child(rh)
	var rr := HBoxContainer.new()
	rr.add_theme_constant_override("separation", 8)
	rv.add_child(rr)
	rr.add_child(_reward("⬡", "%d COINS" % int(summary.get("coins", 0)), DesignTokens.YELLOW))
	rr.add_child(_reward("◆", "%d GEMS" % int(summary.get("gems", 0)), DesignTokens.NEON_PINK))
	rr.add_child(_reward("★", "%d XP" % int(summary.get("xp", 0)), DesignTokens.PURPLE))
	col.add_child(rewards)
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


func _stat(value: String, label: String, color: Color) -> PanelContainer:
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


func _reward(icon: String, label: String, color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.09), DesignTokens.with_alpha(color, 0.27), 10.0, 1)
	sb.content_margin_left = 4
	sb.content_margin_right = 4
	sb.content_margin_top = 10
	sb.content_margin_bottom = 10
	p.add_theme_stylebox_override("panel", sb)
	var v := VBoxContainer.new()
	p.add_child(v)
	var ic := Label.new()
	ic.text = icon
	Fonts.apply(ic, Fonts.rajdhani("Bold"), 20, color)
	ic.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(ic)
	var lab := Label.new()
	lab.text = label
	Fonts.apply(lab, Fonts.rajdhani("Bold"), 9, DesignTokens.MUTED)
	lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(lab)
	return p


func _confetti(root: Control) -> void:
	var colors := [DesignTokens.NEON_PINK, DesignTokens.ELECTRIC_BLUE, DesignTokens.YELLOW, DesignTokens.ORANGE, DesignTokens.PURPLE, DesignTokens.CYAN, DesignTokens.GREEN]
	for i in 22:
		var d := ColorRect.new()
		d.color = colors[i % colors.size()]
		var sz := 2 + (i % 3)
		d.custom_minimum_size = Vector2(sz, sz)
		d.mouse_filter = Control.MOUSE_FILTER_IGNORE
		d.set_anchors_preset(Control.PRESET_TOP_LEFT)
		d.anchor_left = (4.0 + fmod(i * 4.3, 92.0)) / 100.0
		d.anchor_top = (3.0 + fmod(i * 7.1, 55.0)) / 100.0
		d.offset_right = sz
		d.offset_bottom = sz
		root.add_child(d)


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
