extends ScreenBase
## Ranked divisions screen.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "ranked"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "RANKED"
	top.back_pressed.connect(func() -> void: nav("menu"))
	root.add_child(top)
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
	var pts: int = SaveService.season_points if SaveService.season_points > 0 else 850
	var div := _division_for(pts)
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", DesignTokens.make_card_style(DesignTokens.YELLOW))
	var cm := MarginContainer.new()
	cm.add_theme_constant_override("margin_left", 20)
	cm.add_theme_constant_override("margin_right", 20)
	cm.add_theme_constant_override("margin_top", 20)
	cm.add_theme_constant_override("margin_bottom", 20)
	card.add_child(cm)
	var cv := VBoxContainer.new()
	cv.add_theme_constant_override("separation", 8)
	cm.add_child(cv)
	var emoji := Label.new()
	emoji.text = "🏆"
	emoji.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(emoji, Fonts.rajdhani("Bold"), 40, DesignTokens.YELLOW)
	cv.add_child(emoji)
	var title := Label.new()
	title.text = str(div["name"])
	Fonts.apply(title, Fonts.orbitron("Black"), 28, DesignTokens.YELLOW, 3.0)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cv.add_child(title)
	var next_max: int = int(div["max"])
	var prog_label := Label.new()
	prog_label.text = "SEASON POINTS: %d / %d" % [pts, next_max]
	Fonts.apply(prog_label, Fonts.rajdhani("Bold"), 12, DesignTokens.MUTED)
	prog_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cv.add_child(prog_label)
	var bar := NeonProgressBar.new()
	bar.set_fill(DesignTokens.ORANGE)
	bar.set_pct((float(pts) / float(maxi(1, next_max))) * 100.0)
	cv.add_child(bar)
	col.add_child(card)
	var play := NeonButton.new()
	play.configure("PLAY RANKED", DesignTokens.ELECTRIC_BLUE, NeonButton.ButtonSize.LARGE, "trophy", true)
	play.pressed_nav.connect(func() -> void:
		GameState.start_run(GameState.Mode.RANKED, 21)
		nav("gameplay")
	)
	col.add_child(play)
	var cap := Label.new()
	cap.text = "DIVISIONS"
	Fonts.apply(cap, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED, 2.0)
	col.add_child(cap)
	for d in _all_divs():
		col.add_child(_div_row(d, str(d["name"]) == str(div["name"])))


func _all_divs() -> Array:
	return [
		{"name": "BRONZE", "range": "0 – 299", "min": 0, "max": 299, "color": Color("#CD7F32"), "emoji": "🥉"},
		{"name": "SILVER", "range": "300 – 699", "min": 300, "max": 699, "color": Color("#C0C0C0"), "emoji": "🥈"},
		{"name": "GOLD", "range": "700 – 1,299", "min": 700, "max": 1299, "color": DesignTokens.YELLOW, "emoji": "🥇"},
		{"name": "PLATINUM", "range": "1,300 – 1,999", "min": 1300, "max": 1999, "color": DesignTokens.CYAN, "emoji": "💎"},
		{"name": "DIAMOND", "range": "2,000 – 2,999", "min": 2000, "max": 2999, "color": DesignTokens.ELECTRIC_BLUE, "emoji": "🔷"},
		{"name": "BLAZE", "range": "3,000+", "min": 3000, "max": 99999, "color": DesignTokens.ORANGE, "emoji": "🔥"},
	]


func _division_for(pts: int) -> Dictionary:
	var cur: Dictionary = _all_divs()[0]
	for d in _all_divs():
		if pts >= int(d["min"]):
			cur = d
	return cur


func _div_row(d: Dictionary, current: bool) -> PanelContainer:
	var p := PanelContainer.new()
	var color: Color = d["color"]
	var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.09) if current else DesignTokens.CARD, color if current else DesignTokens.with_alpha(color, 0.2), DesignTokens.RADIUS_COMPACT, 1)
	sb.content_margin_left = 14
	sb.content_margin_right = 14
	sb.content_margin_top = 14
	sb.content_margin_bottom = 14
	if current:
		sb.shadow_color = DesignTokens.with_alpha(color, 0.35)
		sb.shadow_size = 10
	p.add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	p.add_child(row)
	var em := Label.new()
	em.text = str(d["emoji"])
	em.custom_minimum_size = Vector2(36, 0)
	em.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(em, Fonts.rajdhani("Bold"), 22, color)
	row.add_child(em)
	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var name_l := Label.new()
	name_l.text = str(d["name"])
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 13, color, 0.5)
	text.add_child(name_l)
	var rng := Label.new()
	rng.text = "%s pts" % str(d["range"])
	Fonts.apply(rng, Fonts.rajdhani("Bold"), 11, DesignTokens.MUTED)
	text.add_child(rng)
	row.add_child(text)
	if current:
		var badge := PanelContainer.new()
		var bsb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.2), color, DesignTokens.RADIUS_SMALL, 1)
		bsb.content_margin_left = 8
		bsb.content_margin_right = 8
		bsb.content_margin_top = 3
		bsb.content_margin_bottom = 3
		badge.add_theme_stylebox_override("panel", bsb)
		var bl := Label.new()
		bl.text = "CURRENT"
		Fonts.apply(bl, Fonts.rajdhani("Bold"), 9, color, 1.0)
		badge.add_child(bl)
		row.add_child(badge)
	return p
