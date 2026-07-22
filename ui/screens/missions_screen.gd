extends ScreenBase
## Daily / weekly missions.

var _tab: int = 0


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "missions"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "MISSIONS"
	top.show_back = false
	root.add_child(top)
	var tabs_m := MarginContainer.new()
	tabs_m.add_theme_constant_override("margin_left", 16)
	tabs_m.add_theme_constant_override("margin_right", 16)
	tabs_m.add_theme_constant_override("margin_top", 10)
	root.add_child(tabs_m)
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 8)
	tabs_m.add_child(tabs)
	for i in 2:
		var name := "DAILY" if i == 0 else "WEEKLY"
		var b := Button.new()
		b.text = name
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_override("font", Fonts.orbitron("Bold"))
		b.add_theme_font_size_override("font_size", 10)
		var on := i == _tab
		var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.13) if on else DesignTokens.CARD, DesignTokens.NEON_PINK if on else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13), 10.0, 1)
		sb.content_margin_top = 9
		sb.content_margin_bottom = 9
		b.add_theme_stylebox_override("normal", sb)
		b.add_theme_stylebox_override("hover", sb)
		b.add_theme_stylebox_override("pressed", sb)
		b.add_theme_color_override("font_color", DesignTokens.NEON_PINK if on else DesignTokens.MUTED)
		var idx := i
		b.pressed.connect(func() -> void:
			_tab = idx
			_build()
		)
		tabs.add_child(b)
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
	pad.add_theme_constant_override("margin_top", 12)
	pad.add_theme_constant_override("margin_bottom", 12)
	scroll.add_child(pad)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	var items: Array = _daily() if _tab == 0 else _weekly()
	for m in items:
		col.add_child(_card(m))
	var nav_bar := BottomNavigation.new()
	nav_bar.set_active("missions")
	nav_bar.navigate.connect(func(id: String) -> void: nav(id))
	root.add_child(nav_bar)


func _daily() -> Array:
	return [
		{"text": "Play 5 games", "prog": mini(SaveService.games_played, 5), "total": 5, "reward": "200 coins", "done": SaveService.games_played >= 5, "color": DesignTokens.ELECTRIC_BLUE, "coins": 200, "gems": 0},
		{"text": "Hit 3 perfect lanes", "prog": 3, "total": 3, "reward": "50 gems", "done": true, "color": DesignTokens.GREEN, "coins": 0, "gems": 50},
		{"text": "Score 10,000 points", "prog": mini(SaveService.high_score, 10000), "total": 10000, "reward": "150 coins", "done": SaveService.high_score >= 10000, "color": DesignTokens.ORANGE, "coins": 150, "gems": 0},
	]


func _weekly() -> Array:
	return [
		{"text": "Win 10 ranked matches", "prog": mini(SaveService.total_wins, 10), "total": 10, "reward": "1,000 coins", "done": false, "color": DesignTokens.PURPLE, "coins": 1000, "gems": 0},
		{"text": "Reach a 5x combo", "prog": mini(SaveService.best_streak, 5), "total": 5, "reward": "300 gems", "done": SaveService.best_streak >= 5, "color": DesignTokens.CYAN, "coins": 0, "gems": 300},
		{"text": "Play 30 games", "prog": mini(SaveService.games_played, 30), "total": 30, "reward": "500 coins", "done": SaveService.games_played >= 30, "color": DesignTokens.NEON_PINK, "coins": 500, "gems": 0},
	]


func _card(m: Dictionary) -> PanelContainer:
	var done: bool = bool(m["done"])
	var color: Color = DesignTokens.GREEN if done else m["color"]
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 14)
	margin.add_theme_constant_override("margin_right", 14)
	margin.add_theme_constant_override("margin_top", 14)
	margin.add_theme_constant_override("margin_bottom", 14)
	p.add_child(margin)
	var v := VBoxContainer.new()
	margin.add_child(v)
	var row := HBoxContainer.new()
	v.add_child(row)
	var t := Label.new()
	t.text = str(m["text"])
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(t, Fonts.rajdhani("Bold"), 13, DesignTokens.GREEN if done else DesignTokens.WHITE)
	row.add_child(t)
	if done:
		var claim := Button.new()
		claim.text = "CLAIM"
		claim.add_theme_font_override("font", Fonts.orbitron("Bold"))
		claim.add_theme_font_size_override("font_size", 9)
		claim.add_theme_color_override("font_color", DesignTokens.GREEN)
		var csb := DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.GREEN, 0.16), DesignTokens.GREEN, 8.0, 1)
		csb.content_margin_left = 10
		csb.content_margin_right = 10
		csb.content_margin_top = 3
		csb.content_margin_bottom = 3
		claim.add_theme_stylebox_override("normal", csb)
		claim.add_theme_stylebox_override("hover", csb)
		claim.add_theme_stylebox_override("pressed", csb)
		claim.pressed.connect(func() -> void:
			SaveService.add_coins(int(m.get("coins", 0)))
			SaveService.add_gems(int(m.get("gems", 0)))
			claim.disabled = true
			claim.text = "CLAIMED"
		)
		row.add_child(claim)
	else:
		var badge := PanelContainer.new()
		var bsb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.13), DesignTokens.with_alpha(color, 0.33), DesignTokens.RADIUS_SMALL, 1)
		bsb.content_margin_left = 7
		bsb.content_margin_right = 7
		bsb.content_margin_top = 2
		bsb.content_margin_bottom = 2
		badge.add_theme_stylebox_override("panel", bsb)
		var bl := Label.new()
		bl.text = str(m["reward"])
		Fonts.apply(bl, Fonts.rajdhani("Bold"), 10, color)
		badge.add_child(bl)
		row.add_child(badge)
	if done:
		var done_l := Label.new()
		done_l.text = "✓ COMPLETED"
		Fonts.apply(done_l, Fonts.rajdhani("Bold"), 10, DesignTokens.GREEN)
		v.add_child(done_l)
	else:
		var prog := Label.new()
		prog.text = "%s / %s" % [_fmt(int(m["prog"])), _fmt(int(m["total"]))]
		Fonts.apply(prog, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
		v.add_child(prog)
		var bar := NeonProgressBar.new()
		bar.set_fill(color)
		bar.set_pct((float(m["prog"]) / float(maxi(1, int(m["total"])))) * 100.0)
		v.add_child(bar)
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
