extends ScreenBase
## Leaderboard with daily/weekly/global/friends tabs.

var _tab: int = 0


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "leaderboard"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "LEADERBOARD"
	top.show_back = false
	root.add_child(top)
	var tabs_m := MarginContainer.new()
	tabs_m.add_theme_constant_override("margin_left", 16)
	tabs_m.add_theme_constant_override("margin_right", 16)
	tabs_m.add_theme_constant_override("margin_top", 10)
	root.add_child(tabs_m)
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 6)
	tabs_m.add_child(tabs)
	var names := ["DAILY", "WEEKLY", "GLOBAL", "FRIENDS"]
	for i in names.size():
		var b := Button.new()
		b.text = names[i]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_override("font", Fonts.rajdhani("Bold"))
		b.add_theme_font_size_override("font_size", 9)
		var on := i == _tab
		var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.13) if on else DesignTokens.CARD, DesignTokens.NEON_PINK if on else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13), DesignTokens.RADIUS_TAB, 1)
		sb.content_margin_top = 7
		sb.content_margin_bottom = 7
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
	col.add_theme_constant_override("separation", 8)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	for p in _players():
		col.add_child(_row(p))
	var nav_bar := BottomNavigation.new()
	nav_bar.set_active("leaderboard")
	nav_bar.navigate.connect(func(id: String) -> void: nav(id))
	root.add_child(nav_bar)


func _players() -> Array:
	return [
		{"rank": 1, "name": "NeonMaster", "div": "BLAZE", "score": "98,750", "color": DesignTokens.YELLOW, "you": false},
		{"rank": 2, "name": "PixelPanda", "div": "DIAMOND", "score": "87,430", "color": Color("#C0C0C0"), "you": false},
		{"rank": 3, "name": "NumBuster", "div": "PLATINUM", "score": "75,210", "color": DesignTokens.ORANGE, "you": false},
		{"rank": 4, "name": "ArcadeKing", "div": "GOLD", "score": "61,100", "color": DesignTokens.YELLOW, "you": false},
		{"rank": 5, "name": SaveService.username, "div": "GOLD", "score": _fmt(maxi(SaveService.high_score, 0)), "color": DesignTokens.ELECTRIC_BLUE, "you": true},
		{"rank": 6, "name": "StarRider", "div": "SILVER", "score": "28,400", "color": Color("#C0C0C0"), "you": false},
		{"rank": 7, "name": "TilePusher", "div": "SILVER", "score": "19,880", "color": Color("#C0C0C0"), "you": false},
	]


func _row(p: Dictionary) -> PanelContainer:
	var you: bool = bool(p["you"])
	var color: Color = p["color"]
	var panel := PanelContainer.new()
	var sb := DesignTokens.make_panel_style(
		DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.12) if you else DesignTokens.CARD,
		DesignTokens.ELECTRIC_BLUE if you else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.1),
		DesignTokens.RADIUS_COMPACT,
		1
	)
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 12
	sb.content_margin_bottom = 12
	if you:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.3)
		sb.shadow_size = 8
	panel.add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)
	var rank := Label.new()
	rank.text = str(int(p["rank"]))
	rank.custom_minimum_size = Vector2(24, 0)
	rank.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(rank, Fonts.orbitron("ExtraBold"), 14, color if int(p["rank"]) <= 3 else DesignTokens.MUTED)
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
	asb.border_color = DesignTokens.ELECTRIC_BLUE if you else color
	avatar.add_theme_stylebox_override("panel", asb)
	row.add_child(avatar)
	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(info)
	var name_l := Label.new()
	name_l.text = str(p["name"])
	Fonts.apply(name_l, Fonts.rajdhani("Bold"), 13, DesignTokens.ELECTRIC_BLUE if you else DesignTokens.WHITE)
	info.add_child(name_l)
	var div := Label.new()
	div.text = str(p["div"])
	Fonts.apply(div, Fonts.rajdhani("Bold"), 9, color)
	info.add_child(div)
	var score := Label.new()
	score.text = str(p["score"])
	Fonts.apply(score, Fonts.orbitron("Bold"), 12, DesignTokens.CYAN if you else DesignTokens.YELLOW)
	row.add_child(score)
	return panel


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
