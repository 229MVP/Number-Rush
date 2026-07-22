extends ScreenBase
## Profile with stats, themes, missions preview.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "profile"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var header := HBoxContainer.new()
	var hm := MarginContainer.new()
	hm.add_theme_constant_override("margin_left", 16)
	hm.add_theme_constant_override("margin_right", 16)
	hm.add_theme_constant_override("margin_top", 14)
	hm.add_child(header)
	root.add_child(hm)
	var title := Label.new()
	title.text = "PROFILE"
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(title, Fonts.orbitron("Bold"), 14, DesignTokens.WHITE, 2.0)
	header.add_child(title)
	header.add_child(CurrencyChip.new())
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
	col.add_theme_constant_override("separation", 12)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	col.add_child(_avatar_card())
	var stats := GridContainer.new()
	stats.columns = 2
	stats.add_theme_constant_override("h_separation", 10)
	stats.add_theme_constant_override("v_separation", 10)
	col.add_child(stats)
	stats.add_child(_stat("Highest Score", _fmt(SaveService.high_score), DesignTokens.YELLOW))
	stats.add_child(_stat("Games Played", str(SaveService.games_played), DesignTokens.ELECTRIC_BLUE))
	stats.add_child(_stat("Best Streak", str(SaveService.best_streak), DesignTokens.ORANGE))
	stats.add_child(_stat("Total Wins", str(SaveService.total_wins), DesignTokens.GREEN))
	var themes_cap := Label.new()
	themes_cap.text = "UNLOCKED THEMES"
	Fonts.apply(themes_cap, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED, 2.0)
	col.add_child(themes_cap)
	var themes := HBoxContainer.new()
	themes.add_theme_constant_override("separation", 8)
	col.add_child(themes)
	var theme_colors := [DesignTokens.NEON_PINK, DesignTokens.ELECTRIC_BLUE, DesignTokens.PURPLE, DesignTokens.ORANGE, DesignTokens.CYAN, DesignTokens.GREEN]
	var active := [true, false, false, true, false, false]
	for i in theme_colors.size():
		var t := PanelContainer.new()
		t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		t.custom_minimum_size = Vector2(0, 38)
		var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(theme_colors[i], 0.27), DesignTokens.with_alpha(theme_colors[i], 0.33), 10.0, 1)
		if active[i]:
			sb.shadow_color = DesignTokens.with_alpha(theme_colors[i], 0.35)
			sb.shadow_size = 6
		t.add_theme_stylebox_override("panel", sb)
		if active[i]:
			var c := CenterContainer.new()
			t.add_child(c)
			c.add_child(IconService.make_texture_rect("check", 11, theme_colors[i]))
		themes.add_child(t)
	var missions_cap := Label.new()
	missions_cap.text = "ACTIVE MISSIONS"
	Fonts.apply(missions_cap, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED, 2.0)
	col.add_child(missions_cap)
	col.add_child(_mission("Play 3 Ranked Matches", 2, 3, "100 coins", DesignTokens.ELECTRIC_BLUE))
	col.add_child(_mission("Score 50,000 in a single run", mini(SaveService.high_score, 50000), 50000, "150 gems", DesignTokens.PURPLE))
	var nav_bar := BottomNavigation.new()
	nav_bar.set_active("profile")
	nav_bar.navigate.connect(func(id: String) -> void: nav(id))
	root.add_child(nav_bar)


func _avatar_card() -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(DesignTokens.NEON_PINK))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 18)
	m.add_theme_constant_override("margin_right", 18)
	m.add_theme_constant_override("margin_top", 18)
	m.add_theme_constant_override("margin_bottom", 18)
	p.add_child(m)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	m.add_child(row)
	var avatar := Panel.new()
	avatar.custom_minimum_size = Vector2(68, 68)
	var asb := StyleBoxFlat.new()
	asb.bg_color = DesignTokens.PURPLE
	asb.set_corner_radius_all(34)
	asb.border_width_left = 3
	asb.border_width_top = 3
	asb.border_width_right = 3
	asb.border_width_bottom = 3
	asb.border_color = DesignTokens.NEON_PINK
	asb.shadow_color = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.4)
	asb.shadow_size = 10
	avatar.add_theme_stylebox_override("panel", asb)
	row.add_child(avatar)
	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(info)
	var name_l := Label.new()
	name_l.text = SaveService.username
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 16, DesignTokens.NEON_PINK, 0.5)
	info.add_child(name_l)
	var rank := Label.new()
	rank.text = SaveService.rank_title
	Fonts.apply(rank, Fonts.rajdhani("Bold"), 12, DesignTokens.MUTED)
	info.add_child(rank)
	var xp_need := SaveService.level * 500
	var xp_lab := Label.new()
	xp_lab.text = "%d / %d XP" % [SaveService.xp, xp_need]
	Fonts.apply(xp_lab, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
	info.add_child(xp_lab)
	var bar := NeonProgressBar.new()
	bar.set_fill(DesignTokens.NEON_PINK)
	bar.set_pct((float(SaveService.xp) / float(maxi(1, xp_need))) * 100.0)
	info.add_child(bar)
	return p


func _stat(label: String, value: String, color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 12)
	m.add_theme_constant_override("margin_right", 12)
	m.add_theme_constant_override("margin_top", 12)
	m.add_theme_constant_override("margin_bottom", 12)
	p.add_child(m)
	var v := VBoxContainer.new()
	m.add_child(v)
	var lab := Label.new()
	lab.text = label
	Fonts.apply(lab, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
	v.add_child(lab)
	var val := Label.new()
	val.text = value
	Fonts.apply(val, Fonts.orbitron("ExtraBold"), 18, color)
	v.add_child(val)
	return p


func _mission(text: String, prog: int, total: int, reward: String, color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 12)
	m.add_theme_constant_override("margin_right", 12)
	m.add_theme_constant_override("margin_top", 12)
	m.add_theme_constant_override("margin_bottom", 12)
	p.add_child(m)
	var v := VBoxContainer.new()
	m.add_child(v)
	var row := HBoxContainer.new()
	v.add_child(row)
	var t := Label.new()
	t.text = text
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(t, Fonts.rajdhani("SemiBold"), 12, DesignTokens.WHITE)
	row.add_child(t)
	var badge := PanelContainer.new()
	var bsb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.13), DesignTokens.with_alpha(color, 0.33), DesignTokens.RADIUS_SMALL, 1)
	bsb.content_margin_left = 7
	bsb.content_margin_right = 7
	bsb.content_margin_top = 2
	bsb.content_margin_bottom = 2
	badge.add_theme_stylebox_override("panel", bsb)
	var bl := Label.new()
	bl.text = reward
	Fonts.apply(bl, Fonts.rajdhani("Bold"), 10, color)
	badge.add_child(bl)
	row.add_child(badge)
	var prog_l := Label.new()
	prog_l.text = "%s / %s" % [_fmt(prog), _fmt(total)]
	Fonts.apply(prog_l, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED)
	v.add_child(prog_l)
	var bar := NeonProgressBar.new()
	bar.set_fill(color)
	bar.set_pct((float(prog) / float(maxi(1, total))) * 100.0)
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
