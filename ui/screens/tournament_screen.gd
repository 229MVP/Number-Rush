extends ScreenBase
## Daily tournament challenge screen.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "tournament"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "DAILY TOURNAMENT"
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
	col.add_theme_constant_override("separation", 12)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	var challenge := PanelContainer.new()
	challenge.add_theme_stylebox_override("panel", DesignTokens.make_card_style(DesignTokens.ORANGE))
	var cm := MarginContainer.new()
	cm.add_theme_constant_override("margin_left", 16)
	cm.add_theme_constant_override("margin_right", 16)
	cm.add_theme_constant_override("margin_top", 16)
	cm.add_theme_constant_override("margin_bottom", 16)
	challenge.add_child(cm)
	var crow := HBoxContainer.new()
	cm.add_child(crow)
	var cleft := VBoxContainer.new()
	cleft.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	crow.add_child(cleft)
	var cap := Label.new()
	cap.text = "TODAY'S CHALLENGE"
	Fonts.apply(cap, Fonts.rajdhani("Bold"), 10, DesignTokens.ORANGE, 2.0)
	cleft.add_child(cap)
	var name_l := Label.new()
	name_l.text = "BEAT THE TARGET"
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 16, DesignTokens.WHITE)
	cleft.add_child(name_l)
	var desc := Label.new()
	desc.text = "Score as high as you can with 3 strikes."
	Fonts.apply(desc, Fonts.inter(), 12, DesignTokens.MUTED)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	cleft.add_child(desc)
	var time_row := HBoxContainer.new()
	time_row.add_theme_constant_override("separation", 6)
	var dot := ColorRect.new()
	dot.custom_minimum_size = Vector2(6, 6)
	dot.color = DesignTokens.GREEN
	time_row.add_child(dot)
	var tlab := Label.new()
	tlab.text = _remaining()
	Fonts.apply(tlab, Fonts.orbitron("Bold"), 13, DesignTokens.YELLOW)
	time_row.add_child(tlab)
	var rem := Label.new()
	rem.text = "REMAINING"
	Fonts.apply(rem, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
	time_row.add_child(rem)
	cleft.add_child(time_row)
	crow.add_child(IconService.make_texture_rect("target", 52, DesignTokens.with_alpha(DesignTokens.ORANGE, 0.5)))
	col.add_child(challenge)
	var lb_cap := Label.new()
	lb_cap.text = "LEADERBOARD"
	Fonts.apply(lb_cap, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED, 2.0)
	col.add_child(lb_cap)
	var players := [
		{"rank": 1, "name": "NeonMaster", "score": "98,750", "you": false},
		{"rank": 2, "name": "PixelPanda", "score": "87,430", "you": false},
		{"rank": 3, "name": "NumBuster", "score": "75,210", "you": false},
		{"rank": 4, "name": SaveService.username, "score": _fmt(SaveService.high_score), "you": true},
	]
	for p in players:
		col.add_child(_player_row(p))
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
	rh.text = "REWARDS"
	Fonts.apply(rh, Fonts.rajdhani("Bold"), 10, DesignTokens.YELLOW, 2.0)
	rh.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rv.add_child(rh)
	var rr := HBoxContainer.new()
	rr.add_theme_constant_override("separation", 8)
	rv.add_child(rr)
	for r in [{"label": "15K COINS", "icon": "⬡", "color": DesignTokens.YELLOW}, {"label": "200 GEMS", "icon": "◆", "color": DesignTokens.NEON_PINK}, {"label": "MYSTERY", "icon": "?", "color": DesignTokens.PURPLE}]:
		rr.add_child(_reward(r))
	col.add_child(rewards)
	var enter := NeonButton.new()
	enter.configure("ENTER CHALLENGE", DesignTokens.NEON_PINK, NeonButton.ButtonSize.LARGE, "zap", true)
	enter.pressed_nav.connect(func() -> void:
		GameState.start_run(GameState.Mode.DAILY, 21)
		nav("gameplay")
	)
	col.add_child(enter)


func _player_row(p: Dictionary) -> PanelContainer:
	var panel := PanelContainer.new()
	var accent := DesignTokens.ELECTRIC_BLUE if bool(p["you"]) else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13)
	var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.12) if bool(p["you"]) else DesignTokens.CARD, accent if bool(p["you"]) else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13), DesignTokens.RADIUS_COMPACT, 1)
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 12
	sb.content_margin_bottom = 12
	panel.add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)
	var rank := Label.new()
	rank.text = str(int(p["rank"]))
	Fonts.apply(rank, Fonts.orbitron("Bold"), 12, DesignTokens.YELLOW if int(p["rank"]) <= 3 else DesignTokens.MUTED)
	rank.custom_minimum_size = Vector2(22, 0)
	rank.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	row.add_child(rank)
	var avatar := Panel.new()
	avatar.custom_minimum_size = Vector2(32, 32)
	var asb := StyleBoxFlat.new()
	asb.bg_color = DesignTokens.PURPLE
	asb.set_corner_radius_all(16)
	asb.border_width_left = 2
	asb.border_width_top = 2
	asb.border_width_right = 2
	asb.border_width_bottom = 2
	asb.border_color = DesignTokens.ELECTRIC_BLUE if bool(p["you"]) else DesignTokens.PURPLE
	avatar.add_theme_stylebox_override("panel", asb)
	row.add_child(avatar)
	var name_l := Label.new()
	name_l.text = str(p["name"])
	name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(name_l, Fonts.rajdhani("Bold"), 14, DesignTokens.ELECTRIC_BLUE if bool(p["you"]) else DesignTokens.WHITE)
	row.add_child(name_l)
	var score := Label.new()
	score.text = str(p["score"])
	Fonts.apply(score, Fonts.orbitron("Bold"), 13, DesignTokens.CYAN if bool(p["you"]) else DesignTokens.YELLOW)
	row.add_child(score)
	return panel


func _reward(r: Dictionary) -> PanelContainer:
	var p := PanelContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(r["color"], 0.09), DesignTokens.with_alpha(r["color"], 0.27), 10.0, 1)
	sb.content_margin_left = 4
	sb.content_margin_right = 4
	sb.content_margin_top = 9
	sb.content_margin_bottom = 9
	p.add_theme_stylebox_override("panel", sb)
	var v := VBoxContainer.new()
	p.add_child(v)
	var ic := Label.new()
	ic.text = str(r["icon"])
	Fonts.apply(ic, Fonts.rajdhani("Bold"), 18, r["color"])
	ic.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(ic)
	var lab := Label.new()
	lab.text = str(r["label"])
	Fonts.apply(lab, Fonts.rajdhani("Bold"), 9, DesignTokens.MUTED)
	lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(lab)
	return p


func _remaining() -> String:
	var unix := Time.get_unix_time_from_system()
	var left := 86400 - int(unix) % 86400
	var h := left / 3600
	var m := (left % 3600) / 60
	return "%dh %dm" % [h, m]


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
